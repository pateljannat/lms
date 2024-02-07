import {
	d as x,
	j as v,
	k as c,
	y as b,
	C as e,
	G as o,
	H as t,
	I as s,
	x as k,
	a6 as f,
} from "./frappe-ui-20hnMCM8.js";
import { a as r, B as C } from "./index-Vx7mSx23.js";
import { B as L } from "./book-open-check-j9IEQjWh.js";
/**
 * @license lucide-vue-next v0.309.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const S = r("FileCheck2Icon", [
	[
		"path",
		{
			d: "M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4",
			key: "702lig",
		},
	],
	["polyline", { points: "14 2 14 8 20 8", key: "1ew0cm" }],
	["path", { d: "m3 15 2 2 4-4", key: "1lhrkk" }],
]);
/**
 * @license lucide-vue-next v0.309.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const w = r("FileCheckIcon", [
	[
		"path",
		{
			d: "M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z",
			key: "1nnpy2",
		},
	],
	["polyline", { points: "14 2 14 8 20 8", key: "1ew0cm" }],
	["path", { d: "m9 15 2 2 4-4", key: "1grp1n" }],
]);
/**
 * @license lucide-vue-next v0.309.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const B = r("LogInIcon", [
		[
			"path",
			{ d: "M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4", key: "u53s6r" },
		],
		["polyline", { points: "10 17 15 12 10 7", key: "1ail0h" }],
		["line", { x1: "15", x2: "3", y1: "12", y2: "12", key: "v6grx8" }],
	]),
	I = { class: "h-screen text-base" },
	M = {
		class: "sticky top-0 z-10 flex items-center justify-between border-b bg-white px-3 py-2.5 sm:px-5",
	},
	j = { class: "p-5" },
	E = { class: "grid grid-cols-5 gap-5" },
	F = { class: "flex items-center border py-2 px-3 rounded-md" },
	V = { class: "p-2 rounded-md bg-gray-100 mr-3" },
	H = { class: "text-xl font-semibold mb-1" },
	z = { class: "text-gray-700" },
	N = { class: "flex items-center border py-2 px-3 rounded-md" },
	O = { class: "p-2 rounded-md bg-gray-100 mr-3" },
	P = { class: "text-xl font-semibold mb-1" },
	U = { class: "text-gray-700" },
	D = { class: "flex items-center border py-2 px-3 rounded-md" },
	G = { class: "p-2 rounded-md bg-gray-100 mr-3" },
	R = { class: "text-xl font-semibold mb-1" },
	T = { class: "text-gray-700" },
	$ = { class: "flex items-center border py-2 px-3 rounded-md" },
	q = { class: "p-2 rounded-md bg-gray-100 mr-3" },
	A = { class: "text-xl font-semibold mb-1" },
	J = { class: "text-gray-700" },
	K = { class: "flex items-center border py-2 px-3 rounded-md" },
	Q = { class: "p-2 rounded-md bg-gray-100 mr-3" },
	W = { class: "text-xl font-semibold mb-1" },
	X = { class: "text-gray-700" },
	oe = {
		__name: "Statistics",
		setup(Y) {
			x("dayjs");
			const _ = v(() => [
					{ label: "Statistics", route: { name: "Statistics" } },
				]),
				u = c({
					url: "frappe.client.get_count",
					params: { doctype: "LMS Enrollment" },
					auto: !0,
					cache: ["enrollment_count"],
				}),
				m = c({
					url: "frappe.client.get_count",
					params: {
						doctype: "LMS Course",
						filters: { published: 1, upcoming: 0 },
					},
					auto: !0,
					cache: ["course_count"],
				}),
				h = c({
					url: "frappe.client.get_count",
					params: { doctype: "User", filters: { enabled: 1 } },
					auto: !0,
					cache: ["user_count"],
				}),
				y = c({
					url: "frappe.client.get_count",
					params: {
						doctype: "LMS Enrollment",
						filters: { progress: ["like", "%100%"] },
					},
					auto: !0,
					cache: ["courses_completed"],
				}),
				g = c({
					url: "frappe.client.get_count",
					params: { doctype: "LMS Course Progress" },
					auto: !0,
					cache: ["lessons_completed"],
				});
			return (a, Z) => {
				var d, n, l, i, p;
				return (
					k(),
					b("div", I, [
						e("header", M, [
							o(t(f), { class: "h-7", items: _.value }, null, 8, [
								"items",
							]),
						]),
						e("div", j, [
							e("div", E, [
								e("div", F, [
									e("div", V, [
										o(t(C), {
											class: "w-18 h-18 stroke-1.5 text-gray-700",
										}),
									]),
									e("div", null, [
										e(
											"div",
											H,
											s(
												(d = t(m).data) == null
													? void 0
													: d.toLocaleString()
											),
											1
										),
										e(
											"div",
											z,
											s(a.__("Published Courses")),
											1
										),
									]),
								]),
								e("div", N, [
									e("div", O, [
										o(t(B), {
											class: "w-18 h-18 stroke-1.5 text-gray-700",
										}),
									]),
									e("div", null, [
										e(
											"div",
											P,
											s(
												(n = t(h).data) == null
													? void 0
													: n.toLocaleString()
											),
											1
										),
										e(
											"div",
											U,
											s(a.__("Total Signups")),
											1
										),
									]),
								]),
								e("div", D, [
									e("div", G, [
										o(t(L), {
											class: "w-18 h-18 stroke-1.5 text-gray-700",
										}),
									]),
									e("div", null, [
										e(
											"div",
											R,
											s(
												(l = t(u).data) == null
													? void 0
													: l.toLocaleString()
											),
											1
										),
										e(
											"div",
											T,
											s(a.__("Enrolled Users")),
											1
										),
									]),
								]),
								e("div", $, [
									e("div", q, [
										o(t(w), {
											class: "w-18 h-18 stroke-1.5 text-gray-700",
										}),
									]),
									e("div", null, [
										e(
											"div",
											A,
											s(
												(i = t(y).data) == null
													? void 0
													: i.toLocaleString()
											),
											1
										),
										e(
											"div",
											J,
											s(a.__("Courses Completed")),
											1
										),
									]),
								]),
								e("div", K, [
									e("div", Q, [
										o(t(S), {
											class: "w-18 h-18 stroke-1.5 text-gray-700",
										}),
									]),
									e("div", null, [
										e(
											"div",
											W,
											s(
												(p = t(g).data) == null
													? void 0
													: p.toLocaleString()
											),
											1
										),
										e(
											"div",
											X,
											s(a.__("Lessons Completed")),
											1
										),
									]),
								]),
							]),
						]),
					])
				);
			};
		},
	};
export { oe as default };
//# sourceMappingURL=Statistics-BSeqj912.js.map