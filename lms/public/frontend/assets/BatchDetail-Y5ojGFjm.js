import {
	d as x,
	j as C,
	x as n,
	y as h,
	A as b,
	B as u,
	U as N,
	I as s,
	H as t,
	a8 as Y,
	J as d,
	C as e,
	G as r,
	a7 as w,
	X as D,
	L as H,
	k as $,
	Q as S,
	R as O,
	a6 as R,
} from "./frappe-ui-20hnMCM8.js";
import { b as V, B as j, f as M } from "./index-Vx7mSx23.js";
import { C as L, a as T } from "./clock-blcPmEdF.js";
import { _ as E } from "./CourseCard--twQpeIf.js";
import "./UserAvatar-yrWInUTi.js";
import "./star-ypmGZNF0.js";
const A = { key: 0, class: "shadow rounded-md p-5", style: { width: "300px" } },
	I = { key: 2, class: "text-lg font-semibold mb-3" },
	q = { class: "flex items-center mb-3" },
	z = { class: "flex items-center mb-3" },
	F = { class: "flex items-center" },
	G = {
		__name: "BatchOverlay",
		props: { batch: { type: Object, default: null } },
		setup(c) {
			const f = x("$dayjs"),
				p = x("$user"),
				y = c,
				i = C(() => {
					var a, v, _, l;
					return (a = y.batch.data) != null && a.seat_count
						? ((v = y.batch.data) == null ? void 0 : v.seat_count) -
								((l =
									(_ = y.batch.data) == null
										? void 0
										: _.students) == null
									? void 0
									: l.length)
						: null;
				});
			return (a, v) => {
				var l, m, o, g;
				const _ = D("router-link");
				return c.batch.data
					? (n(),
					  h("div", A, [
							c.batch.data.seat_count && i.value > 0
								? (n(),
								  b(
										t(Y),
										{
											key: 0,
											theme: "green",
											class: "self-start mb-2 float-right",
										},
										{
											default: u(() => [
												N(
													s(i.value) +
														" " +
														s(a.__("Seat Left")),
													1
												),
											]),
											_: 1,
										}
								  ))
								: c.batch.data.seat_count && i.value <= 0
								? (n(),
								  b(
										t(Y),
										{
											key: 1,
											theme: "red",
											class: "self-start mb-2 float-right",
										},
										{
											default: u(() => [
												N(s(a.__("Sold Out")), 1),
											]),
											_: 1,
										}
								  ))
								: d("", !0),
							c.batch.data.amount
								? (n(),
								  h(
										"div",
										I,
										s(
											t(V)(
												c.batch.data.amount,
												c.batch.data.currency
											)
										),
										1
								  ))
								: d("", !0),
							e("div", q, [
								r(t(j), {
									class: "h-4 w-4 stroke-1.5 mr-2 text-gray-700",
								}),
								e(
									"span",
									null,
									s(c.batch.data.courses.length) +
										" " +
										s(a.__("Courses")),
									1
								),
							]),
							e("div", z, [
								r(t(L), {
									class: "h-4 w-4 stroke-1.5 mr-2 text-gray-700",
								}),
								e(
									"span",
									null,
									s(
										t(f)(c.batch.data.start_date).format(
											"DD MMM YYYY"
										)
									) +
										" - " +
										s(
											t(f)(c.batch.data.end_date).format(
												"DD MMM YYYY"
											)
										),
									1
								),
							]),
							e("div", F, [
								r(t(T), {
									class: "h-4 w-4 stroke-1.5 mr-2 text-gray-700",
								}),
								e(
									"span",
									null,
									s(t(M)(c.batch.data.start_time)) +
										" - " +
										s(t(M)(c.batch.data.end_time)),
									1
								),
							]),
							(m = (l = t(p)) == null ? void 0 : l.data) !=
								null && m.is_moderator
								? (n(),
								  b(
										_,
										{
											key: 3,
											to: {
												name: "Batch",
												params: {
													batchName:
														c.batch.data.name,
												},
											},
										},
										{
											default: u(() => [
												r(
													t(w),
													{
														variant: "solid",
														class: "w-full mt-4",
													},
													{
														default: u(() => [
															e(
																"span",
																null,
																s(
																	a.__(
																		"Manage Batch"
																	)
																),
																1
															),
														]),
														_: 1,
													}
												),
											]),
											_: 1,
										},
										8,
										["to"]
								  ))
								: c.batch.data.paid_batch
								? (n(),
								  b(
										_,
										{
											key: 4,
											to: {
												name: "Billing",
												params: {
													type: "batch",
													name: c.batch.data.name,
												},
											},
										},
										{
											default: u(() => [
												r(
													t(w),
													{
														class: "w-full mt-4",
														variant: "solid",
													},
													{
														default: u(() => [
															e(
																"span",
																null,
																s(
																	a.__(
																		"Register Now"
																	)
																),
																1
															),
														]),
														_: 1,
													}
												),
											]),
											_: 1,
										},
										8,
										["to"]
								  ))
								: c.batch.data.allow_self_enrollment
								? (n(),
								  b(
										t(w),
										{
											key: 5,
											variant: "solid",
											class: "w-full mt-2",
										},
										{
											default: u(() => [
												N(s(a.__("Enroll Now")), 1),
											]),
											_: 1,
										}
								  ))
								: d("", !0),
							(g = (o = t(p)) == null ? void 0 : o.data) !=
								null && g.is_moderator
								? (n(),
								  b(
										t(w),
										{ key: 6, class: "w-full mt-2" },
										{
											default: u(() => [
												e(
													"span",
													null,
													s(a.__("Edit")),
													1
												),
											]),
											_: 1,
										}
								  ))
								: d("", !0),
					  ]))
					: d("", !0);
			};
		},
	},
	J = { key: 0, class: "h-screen text-base" },
	Q = { class: "sticky top-0 z-10 border-b bg-white px-3 py-2.5 sm:px-5" },
	U = { class: "m-5 pb-10" },
	X = { class: "text-3xl font-semibold" },
	K = { class: "my-3" },
	P = { class: "flex items-center justify-between w-1/2" },
	W = { class: "flex items-center" },
	Z = { key: 0 },
	tt = { class: "flex items-center" },
	at = { key: 1 },
	et = { class: "flex items-center" },
	st = { class: "grid grid-cols-[60%,20%] gap-20 mt-10" },
	ct = { class: "" },
	nt = ["innerHTML"],
	lt = { class: "text-2xl font-semibold" },
	rt = { class: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-5" },
	ot = { key: 0 },
	dt = ["innerHTML"],
	ft = {
		__name: "BatchDetail",
		props: { batchName: { type: String, required: !0 } },
		setup(c) {
			const f = x("$dayjs"),
				p = x("$user"),
				y = H(),
				i = c,
				a = $({
					url: "lms.lms.utils.get_batch_details",
					cache: ["batch", i.batchName],
					params: { batch: i.batchName },
					auto: !0,
					onSuccess(l) {
						var m, o;
						(o = l.students) != null &&
							o.includes(
								(m = p.data) == null ? void 0 : m.name
							) &&
							y.push({
								name: "Batch",
								params: { batchName: i.batchName },
							});
					},
				}),
				v = $({
					url: "lms.lms.utils.get_batch_courses",
					params: { batch: i.batchName },
					cache: ["batchCourses", i.batchName],
					auto: !0,
				}),
				_ = C(() => {
					var m, o;
					let l = [
						{ label: "All Batches", route: { name: "Batches" } },
					];
					return (
						l.push({
							label:
								(m = a == null ? void 0 : a.data) == null
									? void 0
									: m.title,
							route: {
								name: "BatchDetail",
								params: {
									batchName:
										(o = a == null ? void 0 : a.data) ==
										null
											? void 0
											: o.name,
								},
							},
						}),
						l
					);
				});
			return (l, m) => {
				var g, B;
				const o = D("router-link");
				return t(a).data
					? (n(),
					  h("div", J, [
							e("header", Q, [
								r(t(R), { items: _.value }, null, 8, ["items"]),
							]),
							e("div", U, [
								e("div", null, [
									e("div", X, s(t(a).data.title), 1),
									e("div", K, s(t(a).data.description), 1),
									e("div", P, [
										e("div", W, [
											r(t(j), {
												class: "h-4 w-4 text-gray-700 mr-2",
											}),
											e(
												"span",
												null,
												s(
													(B =
														(g = t(a).data) == null
															? void 0
															: g.courses) == null
														? void 0
														: B.length
												) +
													" " +
													s(l.__("Courses")),
												1
											),
										]),
										t(a).data.courses
											? (n(), h("span", Z, "·"))
											: d("", !0),
										e("div", tt, [
											r(t(L), {
												class: "h-4 w-4 text-gray-700 mr-2",
											}),
											e(
												"span",
												null,
												s(
													t(f)(
														t(a).data.start_date
													).format("DD MMM YYYY")
												) +
													" - " +
													s(
														t(f)(
															t(a).data.end_date
														).format("DD MMM YYYY")
													),
												1
											),
										]),
										t(a).data.start_date
											? (n(), h("span", at, "·"))
											: d("", !0),
										e("div", et, [
											r(t(T), {
												class: "h-4 w-4 text-gray-700 mr-2",
											}),
											e(
												"span",
												null,
												s(t(M)(t(a).data.start_time)) +
													" - " +
													s(t(M)(t(a).data.end_time)),
												1
											),
										]),
									]),
								]),
								e("div", st, [
									e("div", ct, [
										e(
											"div",
											{
												innerHTML:
													t(a).data.batch_details,
												class: "batch-description",
											},
											null,
											8,
											nt
										),
									]),
									e("div", null, [
										r(G, { batch: t(a) }, null, 8, [
											"batch",
										]),
									]),
								]),
								e("div", null, [
									e("div", lt, s(l.__("Courses")), 1),
									e("div", rt, [
										t(a).data.courses
											? (n(!0),
											  h(
													S,
													{ key: 0 },
													O(
														t(v).data,
														(k) => (
															n(),
															h(
																"div",
																{
																	key: k.course,
																},
																[
																	r(
																		o,
																		{
																			to: {
																				name: "CourseDetail",
																				params: {
																					courseName:
																						k.name,
																				},
																			},
																		},
																		{
																			default:
																				u(
																					() => [
																						(n(),
																						b(
																							E,
																							{
																								course: k,
																								key: k.name,
																							},
																							null,
																							8,
																							[
																								"course",
																							]
																						)),
																					]
																				),
																			_: 2,
																		},
																		1032,
																		["to"]
																	),
																]
															)
														)
													),
													128
											  ))
											: d("", !0),
									]),
									t(a).data.batch_details_raw
										? (n(),
										  h("div", ot, [
												e(
													"div",
													{
														innerHTML:
															t(a).data
																.batch_details_raw,
														class: "batch-description",
													},
													null,
													8,
													dt
												),
										  ]))
										: d("", !0),
								]),
							]),
					  ]))
					: d("", !0);
			};
		},
	};
export { ft as default };
//# sourceMappingURL=BatchDetail-Y5ojGFjm.js.map