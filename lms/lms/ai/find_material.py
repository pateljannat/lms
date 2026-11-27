"""Finding web pages to teach a skill from: the admin searches, picks, and adds what they pick."""

from concurrent.futures import ThreadPoolExecutor
from urllib.parse import urlparse

import frappe
from frappe import _

from lms.lms.ai import material, setup

FOUND = "lms_goal_found_material:{session}"
MAX_PAGES = 8
# A page that opens for everyone answers within this, or the admin is not offered it.
CHECK_SECONDS = 5
LOGIN_WORDS = ("login", "signin", "sign-in", "signup", "sign-up", "auth", "subscribe")


def search(goal_name: str, query: str | None = None) -> dict:
	"""Ask the finder for pages. Returns the Flow Session it works in and what it searches for."""
	from frappe.flow.lib.session import new_session

	from lms.lms.ai.goals import UNTITLED

	goal = frappe.get_doc("LMS Goal", goal_name)
	title = goal.title if goal.title != UNTITLED else ""
	query = (query or "").strip() or default_query(goal)
	if not query:
		frappe.throw(
			_("Say what people should be able to do first, so the search knows what to look for."),
			title=_("Nothing to Search For"),
		)
	setup.ensure_agents()
	session = new_session(
		setup.MATERIAL_FINDER,
		title=_("Material for {0}").format(title or goal.name),
		approval_mode="Auto-approve",
	)
	added = [source["title"] for source in material.goal_sources(goal.name)]
	session.chat(
		"\n".join(
			[
				f"Goal: {goal.name}",
				f"Title: {title or 'Not set'}",
				f"What people should be able to do: {(goal.outcome or '').strip() or 'Not written yet'}",
				f"Search for: {query}",
				f"Already added: {', '.join(added) or 'Nothing yet'}",
			]
		)
	)
	return {"session": session.name, "query": query}


def default_query(goal) -> str:
	"""What to search for when the admin has not said: the outcome's first sentence, else the title."""
	from lms.lms.ai.goals import UNTITLED

	outcome = (goal.outcome or "").strip()
	if outcome:
		return outcome.split(".")[0].strip()[:160]
	return "" if goal.title == UNTITLED else (goal.title or "")


def offer(goal_name: str, session: str, pages: list[dict]) -> None:
	"""Keep the pages for the admin's page to show, each marked whether it can be read."""
	added = set(material.source_urls(goal_name).values())
	seen, kept = set(), []
	for page in pages:
		url = (page.get("url") or "").strip()
		if not url or url in added or url in seen:
			continue
		seen.add(url)
		kept.append(
			{
				"title": (page.get("title") or "").strip() or _site(url),
				"url": url,
				"site": _site(url),
				"why": (page.get("why") or "").strip(),
			}
		)
	kept = kept[:MAX_PAGES]
	# The checks run side by side in threads, which have no site context, so they return a
	# code and the reason is written here.
	with ThreadPoolExecutor(max_workers=MAX_PAGES) as pool:
		codes = list(pool.map(_problem, [page["url"] for page in kept]))
	for page, code in zip(kept, codes, strict=True):
		page["readable"] = not code
		page["problem"] = _reason(code)
	# The pages that can be added come first; the finder's order stays within each group.
	kept.sort(key=lambda page: not page["readable"])
	frappe.cache.set_value(
		FOUND.format(session=session), {"goal": goal_name, "pages": kept}, expires_in_sec=60 * 60
	)


def unreadable_reason(url: str) -> str:
	"""Why a page can't be read, in a few words, or "" when it opens for everyone."""
	return _reason(_problem(url))


def _reason(code: str) -> str:
	return {
		"": "",
		"login": _("Needs a login, so it can't be read"),
		"blocked": _("The site doesn't let Lumi read it"),
		"private": _("Not a public web page"),
	}.get(code, _("Didn't open, so it can't be read"))


def _problem(url: str) -> str:
	"""What stops the page from being read: "", login, blocked, private or closed."""
	import requests

	try:
		# Each redirect is checked to stay on the public internet, as when the page is added.
		final = material._final_address(url)
		response = requests.get(
			final,
			timeout=CHECK_SECONDS,
			allow_redirects=False,
			stream=True,
			headers={"User-Agent": "Flow-Knowledge/1.0"},
		)
		response.close()
	except frappe.ValidationError:
		return "private"
	except Exception:
		# A page that can't be reached is not offered, whatever went wrong on the way.
		return "closed"
	if response.status_code == 401 or _asks_to_log_in(final):
		return "login"
	if response.status_code in (402, 403):
		return "blocked"
	if response.status_code >= 400:
		return "closed"
	return ""


def _asks_to_log_in(url: str) -> bool:
	path = urlparse(url).path.lower()
	return any(word in path for word in LOGIN_WORDS)


def _site(url: str) -> str:
	host = (urlparse(url).hostname or url).lower()
	return host.removeprefix("www.")


def state(session: str) -> dict:
	"""Whether the search is still running, and the pages or a plain error once it ends."""
	from frappe.flow.lib.session import sync_with_retry

	from lms.lms.ai.goals import friendly_error

	found = frappe.cache.get_value(FOUND.format(session=session))
	if found:
		return {
			"running": False,
			"pages": found["pages"],
			"error": None if found["pages"] else _("No pages fit this search. Try other words."),
		}
	sync_with_retry(frappe.get_doc("Flow Session", session))
	run = frappe.db.get_value(
		"Flow Run",
		{"session": session},
		["status", "error", "output"],
		as_dict=True,
		order_by="creation desc",
	)
	if not run or run.status not in ("Completed", "Failed", "Denied"):
		return {"running": True, "pages": [], "error": None}
	reason = (run.output or "").strip() if run.status == "Completed" else ""
	return {
		"running": False,
		"pages": [],
		"error": friendly_error(run.error) or reason or _("The search didn't finish. Try again."),
	}
