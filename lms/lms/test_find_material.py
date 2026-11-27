from unittest.mock import MagicMock, patch

import frappe
import requests
from frappe.tests import IntegrationTestCase

from lms.lms.ai import find_material


def _page(n: int, **extra) -> dict:
	return {"title": f"Page {n}", "url": f"https://site{n}.example.org/guide", "why": "Covers it", **extra}


class TestOfferedPages(IntegrationTestCase):
	"""What the finder offers is cleaned, capped and checked before the admin sees it."""

	session = "find-material-test-session"

	def tearDown(self):
		frappe.cache.delete_value(find_material.FOUND.format(session=self.session))

	def _offer(self, pages: list[dict], added: dict | None = None, problems: dict | None = None):
		problems = problems or {}
		with (
			patch.object(find_material.material, "source_urls", return_value=added or {}),
			patch.object(find_material, "_problem", side_effect=lambda url: problems.get(url, "")),
		):
			find_material.offer("goal-x", self.session, pages)
		return find_material.state(self.session)

	def test_drops_pages_already_added_and_repeats(self):
		result = self._offer(
			[_page(1), _page(1), _page(2)], added={"Page 2": "https://site2.example.org/guide"}
		)
		self.assertEqual([page["url"] for page in result["pages"]], ["https://site1.example.org/guide"])

	def test_keeps_at_most_eight(self):
		result = self._offer([_page(n) for n in range(12)])
		self.assertEqual(len(result["pages"]), find_material.MAX_PAGES)

	def test_marks_a_page_that_needs_a_login(self):
		login = "https://site1.example.org/guide"
		result = self._offer([_page(1), _page(2)], problems={login: "login"})
		readable, locked = result["pages"]
		self.assertTrue(readable["readable"])
		self.assertEqual(readable["site"], "site2.example.org")
		# A page that can't be added goes after the ones that can.
		self.assertFalse(locked["readable"])
		self.assertEqual(locked["problem"], "Needs a login, so it can't be read")

	def test_nothing_offered_reads_as_a_plain_error(self):
		result = self._offer([])
		self.assertFalse(result["running"])
		self.assertEqual(result["pages"], [])
		self.assertTrue(result["error"])


class TestReadablePage(IntegrationTestCase):
	"""A page is offered for ticking only when it opens for everyone."""

	def _reason(self, status: int = 200, final: str = "https://example.org/guide", error=None) -> str:
		response = MagicMock(status_code=status)
		with (
			patch.object(find_material.material, "_final_address", return_value=final),
			patch("requests.get", side_effect=error, return_value=response),
		):
			return find_material.unreadable_reason("https://example.org/guide")

	def test_open_page_is_readable(self):
		self.assertEqual(self._reason(), "")

	def test_page_behind_a_login_needs_a_login(self):
		self.assertIn("login", self._reason(status=401))

	def test_site_that_blocks_readers_says_so(self):
		self.assertIn("doesn't let", self._reason(status=403))

	def test_redirect_to_a_login_page_needs_a_login(self):
		self.assertIn("login", self._reason(final="https://example.org/account/login?next=/guide"))

	def test_page_that_does_not_answer_cannot_be_read(self):
		self.assertIn("open", self._reason(error=requests.ConnectionError()))

	def test_missing_page_cannot_be_read(self):
		self.assertIn("open", self._reason(status=404))


class TestDefaultSearch(IntegrationTestCase):
	"""With nothing typed, the search comes from what the skill says people should be able to do."""

	def test_uses_the_first_sentence_of_the_outcome(self):
		goal = frappe._dict(title="Fire safety", outcome="Leave calmly when the alarm sounds. Then wait.")
		self.assertEqual(find_material.default_query(goal), "Leave calmly when the alarm sounds")

	def test_falls_back_to_the_title(self):
		goal = frappe._dict(title="Fire safety", outcome="")
		self.assertEqual(find_material.default_query(goal), "Fire safety")
