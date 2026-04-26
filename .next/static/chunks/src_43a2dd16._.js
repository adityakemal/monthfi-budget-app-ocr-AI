(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/types/index.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_CATEGORIES",
    ()=>DEFAULT_CATEGORIES,
    "MONTHS_ID",
    ()=>MONTHS_ID,
    "toMonthKey",
    ()=>toMonthKey
]);
const DEFAULT_CATEGORIES = [
    "Makanan",
    "Transport",
    "Belanja",
    "Hiburan",
    "Tagihan"
];
const MONTHS_ID = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember"
];
function toMonthKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    return "".concat(y, "-").concat(m);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/store/budget.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useBudgetStore",
    ()=>useBudgetStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/middleware.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/types/index.ts [app-client] (ecmascript)");
;
;
;
const useBudgetStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])()((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["persist"])((set, get)=>({
        defaultBudget: 0,
        monthlyBudgets: [],
        transactions: [],
        categories: [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEFAULT_CATEGORIES"]
        ],
        initStore: async ()=>{
            try {
                const res = await fetch('/api/state');
                if (!res.ok) {
                    const errText = await res.text();
                    console.error("Failed to fetch state:", res.status, errText);
                    return;
                }
                const data = await res.json();
                const localState = get();
                // If SQLite is empty but we have local data, bulk upload!
                if (data.transactions.length === 0 && localState.transactions.length > 0) {
                    await fetch('/api/state', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(localState)
                    });
                    // Re-fetch after sync
                    const res2 = await fetch('/api/state');
                    const data2 = await res2.json();
                    set({
                        transactions: data2.transactions,
                        categories: data2.categories,
                        defaultBudget: data2.defaultBudget,
                        monthlyBudgets: data2.monthlyBudgets
                    });
                } else {
                    // SQLite has data, so we use it as source of truth
                    set({
                        transactions: data.transactions,
                        categories: data.categories,
                        defaultBudget: data.defaultBudget,
                        monthlyBudgets: data.monthlyBudgets
                    });
                }
            } catch (err) {
                console.error("Failed to init store from API", err);
            }
        },
        importData: async (transactions)=>{
            // Send to bulk state API
            await fetch('/api/state', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    transactions
                })
            });
            get().initStore();
        },
        setDefaultBudget: (amount)=>{
            set({
                defaultBudget: amount
            });
            fetch('/api/budget', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: 'default',
                    amount
                })
            });
        },
        setMonthlyBudget: (month, amount)=>{
            set((s)=>{
                const existing = s.monthlyBudgets.findIndex((b)=>b.month === month);
                if (existing >= 0) {
                    const updated = [
                        ...s.monthlyBudgets
                    ];
                    updated[existing] = {
                        month,
                        amount
                    };
                    return {
                        monthlyBudgets: updated
                    };
                }
                return {
                    monthlyBudgets: [
                        ...s.monthlyBudgets,
                        {
                            month,
                            amount
                        }
                    ]
                };
            });
            fetch('/api/budget', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: 'monthly',
                    month,
                    amount
                })
            });
        },
        getBudgetForMonth: (month)=>{
            const state = get();
            const specific = state.monthlyBudgets.find((b)=>b.month === month);
            return specific ? specific.amount : state.defaultBudget;
        },
        addTransaction: (t)=>{
            const newTx = {
                ...t,
                id: crypto.randomUUID(),
                date: t.date || new Date().toISOString(),
                source: t.source || 'Web'
            };
            set((s)=>({
                    transactions: [
                        ...s.transactions,
                        newTx
                    ]
                }));
            fetch('/api/transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newTx)
            });
        },
        updateTransaction: (id, updates)=>{
            set((s)=>({
                    transactions: s.transactions.map((t)=>t.id === id ? {
                            ...t,
                            ...updates
                        } : t)
                }));
            const tx = get().transactions.find((t)=>t.id === id);
            if (tx) {
                fetch("/api/transactions/".concat(id), {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(tx)
                });
            }
        },
        deleteTransaction: (id)=>{
            set((s)=>({
                    transactions: s.transactions.filter((t)=>t.id !== id)
                }));
            fetch("/api/transactions/".concat(id), {
                method: 'DELETE'
            });
        },
        addCategory: (category)=>{
            const trimmed = category.trim();
            if (!trimmed) return;
            set((s)=>{
                const exists = s.categories.some((c)=>c.toLowerCase() === trimmed.toLowerCase());
                if (exists) return s;
                return {
                    categories: [
                        ...s.categories,
                        trimmed
                    ]
                };
            });
            fetch('/api/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: trimmed
                })
            });
        },
        removeCategory: (category)=>{
            set((s)=>({
                    categories: s.categories.filter((c)=>c !== category)
                }));
            fetch("/api/categories?name=".concat(encodeURIComponent(category)), {
                method: 'DELETE'
            });
        }
    }), {
    name: 'monthfi-store'
}));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/DatePicker.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DayPicker",
    ()=>DayPicker,
    "MonthPicker",
    ()=>MonthPicker
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dayjs$2f$dayjs$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/dayjs/dayjs.min.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
function MonthPicker(param) {
    let { selectedDate, onChange } = param;
    _s();
    const [open, setOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [viewYear, setViewYear] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dayjs$2f$dayjs$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(selectedDate).year());
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const today = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dayjs$2f$dayjs$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])();
    const selectedMonth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dayjs$2f$dayjs$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(selectedDate);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MonthPicker.useEffect": ()=>{
            const handler = {
                "MonthPicker.useEffect.handler": (e)=>{
                    if (containerRef.current && !containerRef.current.contains(e.target)) {
                        setOpen(false);
                    }
                }
            }["MonthPicker.useEffect.handler"];
            if (open) document.addEventListener("mousedown", handler);
            return ({
                "MonthPicker.useEffect": ()=>document.removeEventListener("mousedown", handler)
            })["MonthPicker.useEffect"];
        }
    }["MonthPicker.useEffect"], [
        open
    ]);
    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "Mei",
        "Jun",
        "Jul",
        "Agu",
        "Sep",
        "Okt",
        "Nov",
        "Des"
    ];
    const handleSelectMonth = (monthIndex)=>{
        const selected = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dayjs$2f$dayjs$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])().year(viewYear).month(monthIndex).startOf("month");
        onChange(selected.toDate());
        setOpen(false);
    };
    const handleThisMonth = ()=>{
        onChange((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dayjs$2f$dayjs$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])().startOf("month").toDate());
        setViewYear((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dayjs$2f$dayjs$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])().year());
        setOpen(false);
    };
    const displayText = selectedMonth.format("MMM YYYY");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: containerRef,
        className: "relative",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>{
                    setOpen(!open);
                    setViewYear(selectedMonth.year());
                },
                className: "h-10 px-3 text-[13px] rounded-lg flex items-center gap-2",
                style: {
                    border: "1px solid var(--border-visible)",
                    color: "var(--text-primary)",
                    background: "var(--surface)"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: displayText
                    }, void 0, false, {
                        fileName: "[project]/src/components/DatePicker.tsx",
                        lineNumber: 75,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                        width: "10",
                        height: "10",
                        viewBox: "0 0 10 10",
                        fill: "none",
                        style: {
                            transform: open ? "rotate(180deg)" : "rotate(0)",
                            transition: "transform 0.2s"
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            d: "M1.5 3.5L5 7L8.5 3.5",
                            stroke: "currentColor",
                            strokeWidth: "1.2",
                            strokeLinecap: "round",
                            strokeLinejoin: "round"
                        }, void 0, false, {
                            fileName: "[project]/src/components/DatePicker.tsx",
                            lineNumber: 86,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/DatePicker.tsx",
                        lineNumber: 76,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/DatePicker.tsx",
                lineNumber: 63,
                columnNumber: 7
            }, this),
            open && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute right-0 z-50 mt-2 w-64 rounded-xl overflow-hidden",
                style: {
                    border: "1px solid var(--border-visible)",
                    background: "var(--surface)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.4)"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between px-3 py-2.5",
                        style: {
                            borderBottom: "1px solid var(--border)"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setViewYear(viewYear - 1),
                                className: "w-7 h-7 flex items-center justify-center rounded text-[16px]",
                                style: {
                                    color: "var(--text-secondary)",
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer"
                                },
                                children: "‹"
                            }, void 0, false, {
                                fileName: "[project]/src/components/DatePicker.tsx",
                                lineNumber: 110,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[14px] font-semibold",
                                style: {
                                    color: "var(--text-display)"
                                },
                                children: viewYear
                            }, void 0, false, {
                                fileName: "[project]/src/components/DatePicker.tsx",
                                lineNumber: 122,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>viewYear < today.year() && setViewYear(viewYear + 1),
                                className: "w-7 h-7 flex items-center justify-center rounded text-[16px]",
                                style: {
                                    color: viewYear >= today.year() ? "var(--text-disabled)" : "var(--text-secondary)",
                                    background: "none",
                                    border: "none",
                                    cursor: viewYear >= today.year() ? "not-allowed" : "pointer"
                                },
                                children: "›"
                            }, void 0, false, {
                                fileName: "[project]/src/components/DatePicker.tsx",
                                lineNumber: 128,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/DatePicker.tsx",
                        lineNumber: 106,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-3 gap-1 p-2.5",
                        children: months.map((m, i)=>{
                            const isFuture = viewYear > today.year() || viewYear === today.year() && i > today.month();
                            const isSelected = viewYear === selectedMonth.year() && i === selectedMonth.month();
                            const isCurrent = viewYear === today.year() && i === today.month();
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>!isFuture && handleSelectMonth(i),
                                disabled: isFuture,
                                className: "h-9 rounded-lg text-[13px] transition-colors",
                                style: {
                                    background: isSelected ? "var(--accent)" : "transparent",
                                    color: isSelected ? "white" : isFuture ? "var(--text-disabled)" : isCurrent ? "var(--accent)" : "var(--text-primary)",
                                    border: isCurrent && !isSelected ? "1px solid var(--accent)" : "1px solid transparent",
                                    cursor: isFuture ? "not-allowed" : "pointer",
                                    fontWeight: isSelected || isCurrent ? 600 : 400
                                },
                                children: m
                            }, m, false, {
                                fileName: "[project]/src/components/DatePicker.tsx",
                                lineNumber: 160,
                                columnNumber: 17
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/src/components/DatePicker.tsx",
                        lineNumber: 148,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1.5 px-2.5 pb-2.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setOpen(false),
                                className: "h-8 px-3 text-[11px] font-mono rounded-lg",
                                style: {
                                    border: "1px solid var(--border-visible)",
                                    color: "var(--text-secondary)",
                                    background: "transparent",
                                    cursor: "pointer"
                                },
                                children: "Tutup"
                            }, void 0, false, {
                                fileName: "[project]/src/components/DatePicker.tsx",
                                lineNumber: 190,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleThisMonth,
                                className: "flex-1 h-8 text-[11px] font-mono font-medium rounded-lg",
                                style: {
                                    background: "var(--accent)",
                                    color: "white",
                                    border: "none",
                                    cursor: "pointer"
                                },
                                children: "Bulan Ini"
                            }, void 0, false, {
                                fileName: "[project]/src/components/DatePicker.tsx",
                                lineNumber: 202,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/DatePicker.tsx",
                        lineNumber: 189,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/DatePicker.tsx",
                lineNumber: 97,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/DatePicker.tsx",
        lineNumber: 62,
        columnNumber: 5
    }, this);
}
_s(MonthPicker, "XTA5SFD6P7mA9LPBKDIQSdM/eWw=");
_c = MonthPicker;
function DayPicker(param) {
    let { date, onChange, className, style } = param;
    _s1();
    const [open, setOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [viewDate, setViewDate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dayjs$2f$dayjs$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(date));
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DayPicker.useEffect": ()=>{
            const handler = {
                "DayPicker.useEffect.handler": (e)=>{
                    if (containerRef.current && !containerRef.current.contains(e.target)) {
                        setOpen(false);
                    }
                }
            }["DayPicker.useEffect.handler"];
            if (open) document.addEventListener("mousedown", handler);
            return ({
                "DayPicker.useEffect": ()=>document.removeEventListener("mousedown", handler)
            })["DayPicker.useEffect"];
        }
    }["DayPicker.useEffect"], [
        open
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DayPicker.useEffect": ()=>{
            if (open) {
                setViewDate((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dayjs$2f$dayjs$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(date));
            }
        }
    }["DayPicker.useEffect"], [
        open,
        date
    ]);
    const selectedDay = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dayjs$2f$dayjs$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(date);
    const startOfMonth = viewDate.startOf("month");
    const daysInMonth = viewDate.daysInMonth();
    const startDay = startOfMonth.day(); // 0 is Sunday
    const days = [];
    for(let i = 0; i < startDay; i++)days.push(null);
    for(let i = 1; i <= daysInMonth; i++)days.push(i);
    const handlePrevMonth = (e)=>{
        e.preventDefault();
        setViewDate(viewDate.subtract(1, "month"));
    };
    const handleNextMonth = (e)=>{
        e.preventDefault();
        setViewDate(viewDate.add(1, "month"));
    };
    const handleSelectDay = (day)=>{
        const newDate = viewDate.date(day).format("YYYY-MM-DD");
        onChange(newDate);
        setOpen(false);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: containerRef,
        className: "relative ".concat(className || ""),
        style: style,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: ()=>setOpen(!open),
                className: "w-full h-full px-3 flex items-center justify-between gap-2 rounded-lg cursor-pointer",
                style: {
                    border: "1px solid var(--border-visible)",
                    color: "var(--text-primary)",
                    background: "var(--black)"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "truncate text-[13px]",
                        children: selectedDay.format("DD MMM YYYY")
                    }, void 0, false, {
                        fileName: "[project]/src/components/DatePicker.tsx",
                        lineNumber: 298,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                        width: "10",
                        height: "10",
                        viewBox: "0 0 10 10",
                        fill: "none",
                        style: {
                            flexShrink: 0,
                            transform: open ? "rotate(180deg)" : "rotate(0)",
                            transition: "transform 0.2s"
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            d: "M1.5 3.5L5 7L8.5 3.5",
                            stroke: "currentColor",
                            strokeWidth: "1.2",
                            strokeLinecap: "round",
                            strokeLinejoin: "round"
                        }, void 0, false, {
                            fileName: "[project]/src/components/DatePicker.tsx",
                            lineNumber: 312,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/DatePicker.tsx",
                        lineNumber: 301,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/DatePicker.tsx",
                lineNumber: 288,
                columnNumber: 7
            }, this),
            open && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute z-50 mt-1 w-[260px] rounded-xl overflow-hidden",
                style: {
                    border: "1px solid var(--border-visible)",
                    background: "var(--black)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                    // bottom: "100%", // Open upwards to avoid clipping, or adjust as needed. Let's do top: 100%
                    top: "calc(100% + 4px)",
                    bottom: "auto"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between px-3 py-2",
                        style: {
                            borderBottom: "1px solid var(--border)"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handlePrevMonth,
                                className: "w-7 h-7 flex items-center justify-center rounded text-[16px] hover:bg-white/5 transition-colors",
                                style: {
                                    color: "var(--text-secondary)",
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer"
                                },
                                children: "‹"
                            }, void 0, false, {
                                fileName: "[project]/src/components/DatePicker.tsx",
                                lineNumber: 338,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[13px] font-semibold",
                                style: {
                                    color: "var(--text-display)"
                                },
                                children: viewDate.format("MMMM YYYY")
                            }, void 0, false, {
                                fileName: "[project]/src/components/DatePicker.tsx",
                                lineNumber: 350,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleNextMonth,
                                className: "w-7 h-7 flex items-center justify-center rounded text-[16px] hover:bg-white/5 transition-colors",
                                style: {
                                    color: "var(--text-secondary)",
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer"
                                },
                                children: "›"
                            }, void 0, false, {
                                fileName: "[project]/src/components/DatePicker.tsx",
                                lineNumber: 356,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/DatePicker.tsx",
                        lineNumber: 334,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-7 gap-1 mb-1",
                                children: [
                                    "M",
                                    "S",
                                    "S",
                                    "R",
                                    "K",
                                    "J",
                                    "S"
                                ].map((d, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-center text-[10px] font-bold",
                                        style: {
                                            color: "var(--text-disabled)"
                                        },
                                        children: d
                                    }, i, false, {
                                        fileName: "[project]/src/components/DatePicker.tsx",
                                        lineNumber: 373,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/components/DatePicker.tsx",
                                lineNumber: 371,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-7 gap-1",
                                children: days.map((d, i)=>{
                                    if (d === null) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {}, i, false, {
                                        fileName: "[project]/src/components/DatePicker.tsx",
                                        lineNumber: 384,
                                        columnNumber: 40
                                    }, this);
                                    const isSelected = selectedDay.isSame(viewDate.date(d), "day");
                                    const isToday = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dayjs$2f$dayjs$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])().isSame(viewDate.date(d), "day");
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>handleSelectDay(d),
                                        className: "h-8 rounded flex items-center justify-center text-[12px] transition-colors",
                                        style: {
                                            background: isSelected ? "var(--accent)" : "transparent",
                                            color: isSelected ? "white" : isToday ? "var(--accent)" : "var(--text-primary)",
                                            border: isToday && !isSelected ? "1px solid var(--accent)" : "none",
                                            fontWeight: isSelected || isToday ? 600 : 400,
                                            cursor: "pointer"
                                        },
                                        children: d
                                    }, i, false, {
                                        fileName: "[project]/src/components/DatePicker.tsx",
                                        lineNumber: 389,
                                        columnNumber: 19
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/src/components/DatePicker.tsx",
                                lineNumber: 382,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/DatePicker.tsx",
                        lineNumber: 370,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1.5 px-2.5 pb-2.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setOpen(false),
                                className: "h-8 px-3 text-[11px] font-mono rounded-lg",
                                style: {
                                    border: "1px solid var(--border-visible)",
                                    color: "var(--text-secondary)",
                                    background: "transparent",
                                    cursor: "pointer"
                                },
                                children: "Tutup"
                            }, void 0, false, {
                                fileName: "[project]/src/components/DatePicker.tsx",
                                lineNumber: 416,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>{
                                    setViewDate((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dayjs$2f$dayjs$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])());
                                    onChange((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dayjs$2f$dayjs$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])().format("YYYY-MM-DD"));
                                    setOpen(false);
                                },
                                className: "flex-1 h-8 text-[11px] font-mono font-medium rounded-lg",
                                style: {
                                    background: "var(--accent)",
                                    color: "white",
                                    border: "none",
                                    cursor: "pointer"
                                },
                                children: "Hari Ini"
                            }, void 0, false, {
                                fileName: "[project]/src/components/DatePicker.tsx",
                                lineNumber: 428,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/DatePicker.tsx",
                        lineNumber: 415,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/DatePicker.tsx",
                lineNumber: 323,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/DatePicker.tsx",
        lineNumber: 283,
        columnNumber: 5
    }, this);
}
_s1(DayPicker, "7xgZ41n5EU55ubg7EK+Pkk/rg6o=");
_c1 = DayPicker;
var _c, _c1;
__turbopack_context__.k.register(_c, "MonthPicker");
__turbopack_context__.k.register(_c1, "DayPicker");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/TransactionForm.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TransactionForm",
    ()=>TransactionForm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$fuse$2e$js$2f$dist$2f$fuse$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/fuse.js/dist/fuse.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dayjs$2f$dayjs$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/dayjs/dayjs.min.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$budget$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/budget.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$DatePicker$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/DatePicker.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
function formatNumber(value) {
    const num = value.replace(/[^0-9]/g, "");
    if (!num) return "";
    return new Intl.NumberFormat("id-ID").format(parseInt(num, 10));
}
function TransactionForm() {
    _s();
    const { categories, addCategory, addTransaction, transactions } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$budget$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useBudgetStore"])();
    const [nominal, setNominal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [name, setName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [kategori, setKategori] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(categories[0] || "");
    const [keterangan, setKeterangan] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [date, setDate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "TransactionForm.useState": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dayjs$2f$dayjs$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])().format("YYYY-MM-DD")
    }["TransactionForm.useState"]);
    const [dropdownOpen, setDropdownOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [newCategory, setNewCategory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [suggestions, setSuggestions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [showSuggestions, setShowSuggestions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const dropdownRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const suggestionsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Fuse.js — build from recent 2 months of transaction names
    const fuse = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "TransactionForm.useMemo[fuse]": ()=>{
            const cutoff = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dayjs$2f$dayjs$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])().subtract(2, "month").toISOString();
            const recentNames = [
                ...new Set(transactions.filter({
                    "TransactionForm.useMemo[fuse]": (t)=>t.date >= cutoff && t.name
                }["TransactionForm.useMemo[fuse]"]).map({
                    "TransactionForm.useMemo[fuse]": (t)=>t.name
                }["TransactionForm.useMemo[fuse]"]))
            ];
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$fuse$2e$js$2f$dist$2f$fuse$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"](recentNames.map({
                "TransactionForm.useMemo[fuse]": (n)=>({
                        name: n
                    })
            }["TransactionForm.useMemo[fuse]"]), {
                keys: [
                    "name"
                ],
                threshold: 0.4
            });
        }
    }["TransactionForm.useMemo[fuse]"], [
        transactions
    ]);
    const handleNominalChange = (e)=>{
        const raw = e.target.value.replace(/[^0-9]/g, "");
        setNominal(formatNumber(raw));
    };
    const handleNameChange = (e)=>{
        const val = e.target.value;
        setName(val);
        if (val.trim().length >= 2) {
            const results = fuse.search(val).slice(0, 5).map((r)=>r.item.name);
            setSuggestions(results);
            setShowSuggestions(results.length > 0);
        } else {
            setShowSuggestions(false);
        }
    };
    const handleSelectSuggestion = (suggestion)=>{
        setName(suggestion);
        setShowSuggestions(false);
    };
    const handleAddTransaction = ()=>{
        const val = parseInt(nominal.replace(/[^0-9]/g, ""), 10);
        if (val > 0 && kategori && name.trim()) {
            addTransaction({
                name: name.trim(),
                nominal: val,
                kategori,
                keterangan,
                date: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dayjs$2f$dayjs$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(date).toISOString()
            });
            setNominal("");
            setName("");
            setKeterangan("");
            setDate((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dayjs$2f$dayjs$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])().format("YYYY-MM-DD"));
        }
    };
    const handleKeyDown = (e)=>{
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddTransaction();
        }
    };
    const handleSelectCategory = (cat)=>{
        setKategori(cat);
        setDropdownOpen(false);
    };
    const handleAddCategory = ()=>{
        const trimmed = newCategory.trim();
        if (!trimmed) return;
        addCategory(trimmed);
        setKategori(trimmed);
        setNewCategory("");
        setDropdownOpen(false);
    };
    const handleNewCatKeyDown = (e)=>{
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddCategory();
        }
    };
    // Close dropdown on outside click
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TransactionForm.useEffect": ()=>{
            const handler = {
                "TransactionForm.useEffect.handler": (e)=>{
                    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                        setDropdownOpen(false);
                    }
                    if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
                        setShowSuggestions(false);
                    }
                }
            }["TransactionForm.useEffect.handler"];
            document.addEventListener("mousedown", handler);
            return ({
                "TransactionForm.useEffect": ()=>document.removeEventListener("mousedown", handler)
            })["TransactionForm.useEffect"];
        }
    }["TransactionForm.useEffect"], []);
    // Sync kategori if categories change
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TransactionForm.useEffect": ()=>{
            if (categories.length > 0 && !categories.includes(kategori)) {
                setKategori(categories[0]);
            }
        }
    }["TransactionForm.useEffect"], [
        categories,
        kategori
    ]);
    const canSubmit = nominal && kategori && name.trim();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative flex-1",
                        ref: suggestionsRef,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "text",
                                placeholder: "Nama item (misal: Popok)",
                                value: name,
                                onChange: handleNameChange,
                                onKeyDown: handleKeyDown,
                                onFocus: ()=>{
                                    if (suggestions.length > 0 && name.trim().length >= 2) setShowSuggestions(true);
                                },
                                className: "w-full h-12 px-3 text-[14px] rounded-lg",
                                style: {
                                    border: "1px solid var(--border-visible)",
                                    background: "var(--black)",
                                    color: "var(--text-primary)"
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/components/TransactionForm.tsx",
                                lineNumber: 153,
                                columnNumber: 11
                            }, this),
                            showSuggestions && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute z-40 w-full mt-1 rounded-lg overflow-hidden",
                                style: {
                                    border: "1px solid var(--border-visible)",
                                    background: "var(--black)",
                                    boxShadow: "0 4px 16px rgba(0,0,0,0.3)"
                                },
                                children: suggestions.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>handleSelectSuggestion(s),
                                        className: "w-full px-3 py-2 text-[13px] text-left",
                                        style: {
                                            background: "transparent",
                                            color: "var(--text-primary)",
                                            borderBottom: "1px solid var(--border)",
                                            border: "none",
                                            borderBlockEnd: "1px solid var(--border)",
                                            cursor: "pointer"
                                        },
                                        children: s
                                    }, s, false, {
                                        fileName: "[project]/src/components/TransactionForm.tsx",
                                        lineNumber: 180,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/components/TransactionForm.tsx",
                                lineNumber: 171,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/TransactionForm.tsx",
                        lineNumber: 152,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative w-[40%] sm:w-[40%]",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-medium text-[var(--text-disabled)] pointer-events-none",
                                children: "Rp"
                            }, void 0, false, {
                                fileName: "[project]/src/components/TransactionForm.tsx",
                                lineNumber: 202,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "text",
                                inputMode: "numeric",
                                placeholder: "0",
                                value: nominal,
                                onChange: handleNominalChange,
                                onKeyDown: handleKeyDown,
                                className: "w-full h-12 pl-8 pr-3 text-[16px] font-bold text-right rounded-lg",
                                style: {
                                    border: nominal ? "2px solid var(--accent)" : "1px solid var(--border-visible)",
                                    background: "var(--black)",
                                    color: nominal ? "var(--accent)" : "var(--text-display)"
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/components/TransactionForm.tsx",
                                lineNumber: 205,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/TransactionForm.tsx",
                        lineNumber: 201,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/TransactionForm.tsx",
                lineNumber: 151,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative flex-1",
                        ref: dropdownRef,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>setDropdownOpen(!dropdownOpen),
                                className: "w-full h-12 px-3 text-[14px] cursor-pointer rounded-lg flex items-center justify-between gap-2",
                                style: {
                                    border: "1px solid var(--border-visible)",
                                    background: "var(--black)",
                                    color: "var(--text-primary)"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "truncate",
                                        children: kategori
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/TransactionForm.tsx",
                                        lineNumber: 238,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        width: "12",
                                        height: "12",
                                        viewBox: "0 0 12 12",
                                        fill: "none",
                                        style: {
                                            flexShrink: 0,
                                            transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                                            transition: "transform 0.2s ease"
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            d: "M2 4L6 8L10 4",
                                            stroke: "currentColor",
                                            strokeWidth: "1.5",
                                            strokeLinecap: "round",
                                            strokeLinejoin: "round"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/TransactionForm.tsx",
                                            lineNumber: 250,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/TransactionForm.tsx",
                                        lineNumber: 239,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/TransactionForm.tsx",
                                lineNumber: 228,
                                columnNumber: 11
                            }, this),
                            dropdownOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute z-50 w-full mt-1 rounded-lg overflow-hidden",
                                style: {
                                    border: "1px solid var(--border-visible)",
                                    background: "var(--black)",
                                    boxShadow: "0 8px 24px rgba(0,0,0,0.4)"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            maxHeight: "180px",
                                            overflowY: "auto"
                                        },
                                        children: categories.map((k)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: ()=>handleSelectCategory(k),
                                                className: "w-full px-3 py-2.5 text-[13px] text-left cursor-pointer flex items-center gap-2",
                                                style: {
                                                    background: kategori === k ? "var(--surface)" : "transparent",
                                                    color: kategori === k ? "var(--accent)" : "var(--text-primary)",
                                                    borderBottom: "1px solid var(--border)",
                                                    fontWeight: kategori === k ? 600 : 400
                                                },
                                                children: [
                                                    kategori === k && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                        width: "10",
                                                        height: "10",
                                                        viewBox: "0 0 10 10",
                                                        fill: "none",
                                                        style: {
                                                            flexShrink: 0
                                                        },
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                            d: "M1 5.5L3.5 8L9 2",
                                                            stroke: "var(--accent)",
                                                            strokeWidth: "1.5",
                                                            strokeLinecap: "round",
                                                            strokeLinejoin: "round"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/TransactionForm.tsx",
                                                            lineNumber: 295,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/TransactionForm.tsx",
                                                        lineNumber: 288,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "truncate",
                                                        children: k
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/TransactionForm.tsx",
                                                        lineNumber: 304,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, k, true, {
                                                fileName: "[project]/src/components/TransactionForm.tsx",
                                                lineNumber: 271,
                                                columnNumber: 19
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/TransactionForm.tsx",
                                        lineNumber: 269,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-1.5 p-2",
                                        style: {
                                            borderTop: "1px solid var(--border-visible)",
                                            background: "var(--surface)"
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "text",
                                                placeholder: "Kategori baru...",
                                                value: newCategory,
                                                onChange: (e)=>setNewCategory(e.target.value),
                                                onKeyDown: handleNewCatKeyDown,
                                                className: "flex-1 h-8 px-2.5 text-[12px] rounded-md",
                                                style: {
                                                    border: "1px solid var(--border-visible)",
                                                    background: "var(--black)",
                                                    color: "var(--text-primary)",
                                                    outline: "none",
                                                    minWidth: 0
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/TransactionForm.tsx",
                                                lineNumber: 316,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: handleAddCategory,
                                                className: "h-8 px-2.5 text-[11px] font-mono font-bold rounded-md",
                                                style: {
                                                    background: newCategory.trim() ? "var(--accent)" : "var(--border)",
                                                    color: newCategory.trim() ? "white" : "var(--text-secondary)",
                                                    border: "none",
                                                    cursor: newCategory.trim() ? "pointer" : "default",
                                                    whiteSpace: "nowrap"
                                                },
                                                children: "+ Add"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/TransactionForm.tsx",
                                                lineNumber: 331,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/TransactionForm.tsx",
                                        lineNumber: 309,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/TransactionForm.tsx",
                                lineNumber: 261,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/TransactionForm.tsx",
                        lineNumber: 227,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$DatePicker$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DayPicker"], {
                        date: date,
                        onChange: setDate,
                        className: "flex-1 h-12"
                    }, void 0, false, {
                        fileName: "[project]/src/components/TransactionForm.tsx",
                        lineNumber: 355,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/TransactionForm.tsx",
                lineNumber: 225,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "text",
                        placeholder: "Catatan (opsional)",
                        value: keterangan,
                        onChange: (e)=>setKeterangan(e.target.value),
                        onKeyDown: handleKeyDown,
                        className: "!w-[40%] h-12 px-3 text-[13px] rounded-lg",
                        style: {
                            border: "1px solid var(--border-visible)",
                            background: "var(--black)",
                            color: "var(--text-primary)"
                        }
                    }, void 0, false, {
                        fileName: "[project]/src/components/TransactionForm.tsx",
                        lineNumber: 360,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleAddTransaction,
                        disabled: !canSubmit,
                        className: "flex-1 h-12 font-mono text-[13px] font-bold uppercase rounded-lg transition-opacity",
                        style: {
                            background: canSubmit ? "var(--accent)" : "var(--border)",
                            color: canSubmit ? "white" : "var(--text-disabled)",
                            border: "none",
                            cursor: canSubmit ? "pointer" : "default"
                        },
                        children: "Tambah Transaksi"
                    }, void 0, false, {
                        fileName: "[project]/src/components/TransactionForm.tsx",
                        lineNumber: 373,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/TransactionForm.tsx",
                lineNumber: 359,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/TransactionForm.tsx",
        lineNumber: 149,
        columnNumber: 5
    }, this);
}
_s(TransactionForm, "c1xircEZ/Cz7ojvOJMivrv8ws8w=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$budget$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useBudgetStore"]
    ];
});
_c = TransactionForm;
var _c;
__turbopack_context__.k.register(_c, "TransactionForm");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/utils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn,
    "formatCurrency",
    ()=>formatCurrency
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/clsx/dist/clsx.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-client] (ecmascript)");
;
;
function cn() {
    for(var _len = arguments.length, inputs = new Array(_len), _key = 0; _key < _len; _key++){
        inputs[_key] = arguments[_key];
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
function formatCurrency(value) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(value);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/utils/index.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/TransactionList.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TransactionList",
    ()=>TransactionList
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dayjs$2f$dayjs$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/dayjs/dayjs.min.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/utils/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$budget$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/budget.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$DatePicker$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/DatePicker.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
function TransactionList(param) {
    let { transactions } = param;
    _s();
    const { deleteTransaction, updateTransaction, categories, addCategory } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$budget$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useBudgetStore"])();
    const [sortField, setSortField] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("date");
    const [sortOrder, setSortOrder] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("desc");
    const [editingTx, setEditingTx] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [deletingTx, setDeletingTx] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [actionMenuOpen, setActionMenuOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    if (transactions.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-center py-10",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-[14px]",
                style: {
                    color: "var(--text-disabled)"
                },
                children: "Belum ada transaksi"
            }, void 0, false, {
                fileName: "[project]/src/components/TransactionList.tsx",
                lineNumber: 29,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/TransactionList.tsx",
            lineNumber: 28,
            columnNumber: 7
        }, this);
    }
    const handleSort = (field)=>{
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder(field === "name" ? "asc" : "desc");
        }
    };
    const sortedTransactions = [
        ...transactions
    ].sort((a, b)=>{
        let valA = a[sortField];
        let valB = b[sortField];
        if (sortField === "name") {
            valA = (a.name || "").toLowerCase();
            valB = (b.name || "").toLowerCase();
        }
        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
    });
    const SortIcon = (param)=>{
        let { field } = param;
        if (sortField !== field) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "opacity-30",
            children: "↕"
        }, void 0, false, {
            fileName: "[project]/src/components/TransactionList.tsx",
            lineNumber: 60,
            columnNumber: 37
        }, this);
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            children: sortOrder === "asc" ? "↑" : "↓"
        }, void 0, false, {
            fileName: "[project]/src/components/TransactionList.tsx",
            lineNumber: 61,
            columnNumber: 12
        }, this);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "overflow-x-auto rounded-lg",
                style: {
                    border: "1px solid var(--border)"
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                    className: "w-full text-left border-collapse",
                    style: {
                        minWidth: "500px"
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                style: {
                                    background: "var(--surface-raised)",
                                    borderBottom: "1px solid var(--border)"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "p-3 text-[12px] font-medium cursor-pointer hover:bg-white/5 transition-colors w-[80px]",
                                        style: {
                                            color: "var(--text-secondary)"
                                        },
                                        onClick: ()=>handleSort("date"),
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-1",
                                            children: [
                                                "Tanggal ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SortIcon, {
                                                    field: "date"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/TransactionList.tsx",
                                                    lineNumber: 87,
                                                    columnNumber: 27
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/TransactionList.tsx",
                                            lineNumber: 86,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/TransactionList.tsx",
                                        lineNumber: 81,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "p-3 text-[12px] font-medium cursor-pointer hover:bg-white/5 transition-colors",
                                        style: {
                                            color: "var(--text-secondary)"
                                        },
                                        onClick: ()=>handleSort("name"),
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-1",
                                            children: [
                                                "Name ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SortIcon, {
                                                    field: "name"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/TransactionList.tsx",
                                                    lineNumber: 96,
                                                    columnNumber: 24
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/TransactionList.tsx",
                                            lineNumber: 95,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/TransactionList.tsx",
                                        lineNumber: 90,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "p-3 text-[12px] font-medium cursor-pointer hover:bg-white/5 transition-colors",
                                        style: {
                                            color: "var(--text-secondary)"
                                        },
                                        onClick: ()=>handleSort("kategori"),
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-1",
                                            children: [
                                                "Kategori ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SortIcon, {
                                                    field: "kategori"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/TransactionList.tsx",
                                                    lineNumber: 105,
                                                    columnNumber: 28
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/TransactionList.tsx",
                                            lineNumber: 104,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/TransactionList.tsx",
                                        lineNumber: 99,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "p-3 text-[12px] font-medium cursor-pointer hover:bg-white/5 transition-colors",
                                        style: {
                                            color: "var(--text-secondary)"
                                        },
                                        onClick: ()=>handleSort("source"),
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-1 whitespace-nowrap",
                                            children: [
                                                "Added By ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SortIcon, {
                                                    field: "source"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/TransactionList.tsx",
                                                    lineNumber: 114,
                                                    columnNumber: 28
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/TransactionList.tsx",
                                            lineNumber: 113,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/TransactionList.tsx",
                                        lineNumber: 108,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "p-3 text-[12px] font-medium cursor-pointer hover:bg-white/5 transition-colors text-right",
                                        style: {
                                            color: "var(--text-secondary)"
                                        },
                                        onClick: ()=>handleSort("nominal"),
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-end gap-1",
                                            children: [
                                                "Nominal ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SortIcon, {
                                                    field: "nominal"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/TransactionList.tsx",
                                                    lineNumber: 123,
                                                    columnNumber: 27
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/TransactionList.tsx",
                                            lineNumber: 122,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/TransactionList.tsx",
                                        lineNumber: 117,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "p-3 text-[12px] font-medium text-center w-[50px]",
                                        style: {
                                            color: "var(--text-secondary)"
                                        },
                                        children: "Aksi"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/TransactionList.tsx",
                                        lineNumber: 126,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/TransactionList.tsx",
                                lineNumber: 75,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/TransactionList.tsx",
                            lineNumber: 74,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                            children: sortedTransactions.map((t, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    className: "group",
                                    style: {
                                        borderBottom: idx < sortedTransactions.length - 1 ? "1px solid var(--border)" : "none",
                                        background: "var(--black)"
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "p-3 whitespace-nowrap",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-col",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "font-medium text-[11px]",
                                                    style: {
                                                        color: "var(--text-secondary)"
                                                    },
                                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dayjs$2f$dayjs$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(t.date).format("DD/MM/YY")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/TransactionList.tsx",
                                                    lineNumber: 149,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/TransactionList.tsx",
                                                lineNumber: 148,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/TransactionList.tsx",
                                            lineNumber: 147,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "p-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-[14px] font-medium",
                                                    style: {
                                                        color: "var(--text-display)"
                                                    },
                                                    children: t.name || "—"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/TransactionList.tsx",
                                                    lineNumber: 158,
                                                    columnNumber: 19
                                                }, this),
                                                t.keterangan && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-[11px] truncate max-w-[150px] mt-0.5",
                                                    style: {
                                                        color: "var(--text-disabled)"
                                                    },
                                                    children: t.keterangan
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/TransactionList.tsx",
                                                    lineNumber: 165,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/TransactionList.tsx",
                                            lineNumber: 157,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "p-3",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "px-1.5 py-px rounded text-[10px] font-mono",
                                                style: {
                                                    background: "var(--surface)",
                                                    color: "var(--text-secondary)"
                                                },
                                                children: t.kategori
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/TransactionList.tsx",
                                                lineNumber: 174,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/TransactionList.tsx",
                                            lineNumber: 173,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "p-3",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase",
                                                style: {
                                                    background: t.source === "AI" ? "rgba(91,155,246,0.15)" : "rgba(74,158,92,0.15)",
                                                    color: t.source === "AI" ? "rgba(91,155,246,0.9)" : "rgba(74,158,92,0.9)"
                                                },
                                                children: t.source || "Web"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/TransactionList.tsx",
                                                lineNumber: 185,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/TransactionList.tsx",
                                            lineNumber: 184,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "p-3 text-right",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[13px] font-mono font-bold",
                                                style: {
                                                    color: "var(--accent)"
                                                },
                                                children: [
                                                    "-",
                                                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(t.nominal)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/TransactionList.tsx",
                                                lineNumber: 202,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/TransactionList.tsx",
                                            lineNumber: 201,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "p-3 relative",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center justify-center",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>setActionMenuOpen(actionMenuOpen === t.id ? null : t.id),
                                                        className: "w-7 h-7 flex items-center justify-center rounded transition-colors hover:bg-white/10",
                                                        style: {
                                                            background: "none",
                                                            border: "none",
                                                            color: "var(--text-secondary)",
                                                            cursor: "pointer"
                                                        },
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                            width: "16",
                                                            height: "16",
                                                            viewBox: "0 0 16 16",
                                                            fill: "currentColor",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                                                    cx: "8",
                                                                    cy: "4",
                                                                    r: "1.5"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/TransactionList.tsx",
                                                                    lineNumber: 229,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                                                    cx: "8",
                                                                    cy: "8",
                                                                    r: "1.5"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/TransactionList.tsx",
                                                                    lineNumber: 230,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                                                    cx: "8",
                                                                    cy: "12",
                                                                    r: "1.5"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/TransactionList.tsx",
                                                                    lineNumber: 231,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/TransactionList.tsx",
                                                            lineNumber: 223,
                                                            columnNumber: 23
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/TransactionList.tsx",
                                                        lineNumber: 211,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/TransactionList.tsx",
                                                    lineNumber: 210,
                                                    columnNumber: 19
                                                }, this),
                                                actionMenuOpen === t.id && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "fixed inset-0 z-40",
                                                            onClick: ()=>setActionMenuOpen(null)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/TransactionList.tsx",
                                                            lineNumber: 237,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "absolute right-8 top-1/2 -translate-y-1/2 w-28 rounded-lg shadow-xl z-50 overflow-hidden",
                                                            style: {
                                                                background: "var(--surface-raised)",
                                                                border: "1px solid var(--border-visible)"
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    onClick: ()=>{
                                                                        setEditingTx(t);
                                                                        setActionMenuOpen(null);
                                                                    },
                                                                    className: "w-full px-3 py-2 text-left text-[12px] font-medium transition-colors hover:bg-white/5",
                                                                    style: {
                                                                        color: "var(--text-primary)",
                                                                        borderBottom: "1px solid var(--border)"
                                                                    },
                                                                    children: "Edit"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/TransactionList.tsx",
                                                                    lineNumber: 248,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    onClick: ()=>{
                                                                        setDeletingTx(t.id);
                                                                        setActionMenuOpen(null);
                                                                    },
                                                                    className: "w-full px-3 py-2 text-left text-[12px] font-bold transition-colors hover:bg-white/5",
                                                                    style: {
                                                                        color: "var(--accent)"
                                                                    },
                                                                    children: "Hapus"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/TransactionList.tsx",
                                                                    lineNumber: 261,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/TransactionList.tsx",
                                                            lineNumber: 241,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/TransactionList.tsx",
                                            lineNumber: 209,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, t.id, true, {
                                    fileName: "[project]/src/components/TransactionList.tsx",
                                    lineNumber: 136,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/components/TransactionList.tsx",
                            lineNumber: 134,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/TransactionList.tsx",
                    lineNumber: 70,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/TransactionList.tsx",
                lineNumber: 66,
                columnNumber: 7
            }, this),
            editingTx && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(EditModal, {
                transaction: editingTx,
                categories: categories,
                addCategory: addCategory,
                onSave: (updates)=>{
                    updateTransaction(editingTx.id, updates);
                    setEditingTx(null);
                },
                onClose: ()=>setEditingTx(null)
            }, void 0, false, {
                fileName: "[project]/src/components/TransactionList.tsx",
                lineNumber: 282,
                columnNumber: 9
            }, this),
            deletingTx && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DeleteConfirmModal, {
                onConfirm: ()=>{
                    deleteTransaction(deletingTx);
                    setDeletingTx(null);
                },
                onClose: ()=>setDeletingTx(null)
            }, void 0, false, {
                fileName: "[project]/src/components/TransactionList.tsx",
                lineNumber: 295,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/TransactionList.tsx",
        lineNumber: 65,
        columnNumber: 5
    }, this);
}
_s(TransactionList, "PV6SyKL03pkUMIb83QjrZvMbNuk=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$budget$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useBudgetStore"]
    ];
});
_c = TransactionList;
function DeleteConfirmModal(param) {
    let { onConfirm, onClose } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-50 flex items-center justify-center p-4",
        style: {
            background: "rgba(0,0,0,0.6)"
        },
        onClick: (e)=>e.target === e.currentTarget && onClose(),
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-full max-w-sm rounded-xl",
            style: {
                background: "var(--surface)",
                border: "1px solid var(--border-visible)"
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-4",
                    style: {
                        borderBottom: "1px solid var(--border)"
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-[16px] font-semibold text-center",
                        style: {
                            color: "var(--text-display)"
                        },
                        children: "Hapus Transaksi"
                    }, void 0, false, {
                        fileName: "[project]/src/components/TransactionList.tsx",
                        lineNumber: 331,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/TransactionList.tsx",
                    lineNumber: 327,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-5 text-center",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-[14px]",
                        style: {
                            color: "var(--text-secondary)"
                        },
                        children: "Yakin ingin menghapus transaksi ini? Data yang dihapus tidak dapat dikembalikan."
                    }, void 0, false, {
                        fileName: "[project]/src/components/TransactionList.tsx",
                        lineNumber: 340,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/TransactionList.tsx",
                    lineNumber: 339,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-4 flex gap-3",
                    style: {
                        borderTop: "1px solid var(--border)"
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onConfirm,
                            className: "flex-1 h-10 text-[13px] font-bold rounded-lg",
                            style: {
                                background: "var(--accent)",
                                color: "white",
                                border: "none"
                            },
                            children: "Hapus"
                        }, void 0, false, {
                            fileName: "[project]/src/components/TransactionList.tsx",
                            lineNumber: 350,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            className: "flex-1 h-10 text-[13px] font-medium rounded-lg",
                            style: {
                                border: "1px solid var(--border-visible)",
                                color: "var(--text-primary)",
                                background: "transparent"
                            },
                            children: "Batal"
                        }, void 0, false, {
                            fileName: "[project]/src/components/TransactionList.tsx",
                            lineNumber: 361,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/TransactionList.tsx",
                    lineNumber: 346,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/TransactionList.tsx",
            lineNumber: 320,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/TransactionList.tsx",
        lineNumber: 315,
        columnNumber: 5
    }, this);
}
_c1 = DeleteConfirmModal;
function EditModal(param) {
    let { transaction, categories, addCategory, onSave, onClose } = param;
    _s1();
    const [name, setName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(transaction.name || "");
    const [nominal, setNominal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(transaction.nominal.toString());
    const [kategori, setKategori] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(transaction.kategori);
    const [keterangan, setKeterangan] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(transaction.keterangan || "");
    const [date, setDate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "EditModal.useState": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dayjs$2f$dayjs$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(transaction.date).format("YYYY-MM-DD")
    }["EditModal.useState"]);
    const [newCat, setNewCat] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [dropdownOpen, setDropdownOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const dropdownRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "EditModal.useEffect": ()=>{
            const handler = {
                "EditModal.useEffect.handler": (e)=>{
                    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                        setDropdownOpen(false);
                    }
                }
            }["EditModal.useEffect.handler"];
            document.addEventListener("mousedown", handler);
            return ({
                "EditModal.useEffect": ()=>document.removeEventListener("mousedown", handler)
            })["EditModal.useEffect"];
        }
    }["EditModal.useEffect"], []);
    const handleSelectCategory = (cat)=>{
        setKategori(cat);
        setDropdownOpen(false);
    };
    const handleNewCatKeyDown = (e)=>{
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddCat();
        }
    };
    const formatInput = (value)=>{
        const num = value.replace(/[^0-9]/g, "");
        if (!num) return "";
        return new Intl.NumberFormat("id-ID").format(parseInt(num, 10));
    };
    const handleSave = ()=>{
        const val = parseInt(nominal.replace(/[^0-9]/g, ""), 10);
        const safeName = name ? name.trim() : "";
        if (val > 0 && safeName && kategori) {
            onSave({
                name: safeName,
                nominal: val,
                kategori,
                keterangan,
                date: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dayjs$2f$dayjs$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(date).toISOString()
            });
        }
    };
    const handleAddCat = ()=>{
        const trimmed = newCat.trim();
        if (trimmed) {
            addCategory(trimmed);
            setKategori(trimmed);
            setNewCat("");
            setDropdownOpen(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-50 flex items-center justify-center p-4",
        style: {
            background: "rgba(0,0,0,0.6)"
        },
        onClick: (e)=>e.target === e.currentTarget && onClose(),
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-full max-w-md rounded-xl",
            style: {
                background: "var(--surface)",
                border: "1px solid var(--border-visible)"
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-4 flex items-center justify-between",
                    style: {
                        borderBottom: "1px solid var(--border)"
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-[16px] font-semibold",
                            style: {
                                color: "var(--text-display)"
                            },
                            children: "Edit Transaksi"
                        }, void 0, false, {
                            fileName: "[project]/src/components/TransactionList.tsx",
                            lineNumber: 474,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            className: "w-8 h-8 flex items-center justify-center rounded-full text-[18px]",
                            style: {
                                border: "1px solid var(--border-visible)",
                                color: "var(--text-secondary)",
                                background: "transparent"
                            },
                            children: "×"
                        }, void 0, false, {
                            fileName: "[project]/src/components/TransactionList.tsx",
                            lineNumber: 480,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/TransactionList.tsx",
                    lineNumber: 470,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-5 space-y-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "block text-[12px] mb-1",
                                            style: {
                                                color: "var(--text-secondary)"
                                            },
                                            children: "Nama"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/TransactionList.tsx",
                                            lineNumber: 496,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "text",
                                            value: name,
                                            onChange: (e)=>setName(e.target.value),
                                            className: "w-full h-10 px-3 text-[14px] rounded-lg",
                                            style: {
                                                border: "1px solid var(--border-visible)",
                                                background: "var(--black)",
                                                color: "var(--text-primary)"
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/TransactionList.tsx",
                                            lineNumber: 502,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/TransactionList.tsx",
                                    lineNumber: 495,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-[140px]",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "block text-[12px] mb-1",
                                            style: {
                                                color: "var(--text-secondary)"
                                            },
                                            children: "Nominal"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/TransactionList.tsx",
                                            lineNumber: 515,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "relative",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "absolute left-3 top-1/2 -translate-y-1/2 text-[12px] font-medium text-[var(--text-disabled)] pointer-events-none",
                                                    children: "Rp"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/TransactionList.tsx",
                                                    lineNumber: 522,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "text",
                                                    inputMode: "numeric",
                                                    value: formatInput(nominal),
                                                    onChange: (e)=>setNominal(e.target.value.replace(/[^0-9]/g, "")),
                                                    className: "w-full h-10 pl-8 pr-3 text-[14px] font-bold text-right rounded-lg",
                                                    style: {
                                                        border: "1px solid var(--border-visible)",
                                                        background: "var(--black)",
                                                        color: "var(--text-display)"
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/TransactionList.tsx",
                                                    lineNumber: 525,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/TransactionList.tsx",
                                            lineNumber: 521,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/TransactionList.tsx",
                                    lineNumber: 514,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/TransactionList.tsx",
                            lineNumber: 494,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-[140px]",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "block text-[12px] mb-1",
                                            style: {
                                                color: "var(--text-secondary)"
                                            },
                                            children: "Tanggal"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/TransactionList.tsx",
                                            lineNumber: 545,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$DatePicker$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DayPicker"], {
                                            date: date,
                                            onChange: setDate,
                                            className: "w-full h-10"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/TransactionList.tsx",
                                            lineNumber: 551,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/TransactionList.tsx",
                                    lineNumber: 544,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "block text-[12px] mb-1",
                                            style: {
                                                color: "var(--text-secondary)"
                                            },
                                            children: "Kategori"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/TransactionList.tsx",
                                            lineNumber: 558,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "relative w-full",
                                            ref: dropdownRef,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    onClick: ()=>setDropdownOpen(!dropdownOpen),
                                                    className: "w-full h-10 px-3 text-[14px] cursor-pointer rounded-lg flex items-center justify-between gap-2",
                                                    style: {
                                                        border: "1px solid var(--border-visible)",
                                                        background: "var(--black)",
                                                        color: "var(--text-primary)"
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "truncate",
                                                            children: kategori
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/TransactionList.tsx",
                                                            lineNumber: 575,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                            width: "12",
                                                            height: "12",
                                                            viewBox: "0 0 12 12",
                                                            fill: "none",
                                                            style: {
                                                                flexShrink: 0,
                                                                transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                                                                transition: "transform 0.2s ease"
                                                            },
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                d: "M2 4L6 8L10 4",
                                                                stroke: "currentColor",
                                                                strokeWidth: "1.5",
                                                                strokeLinecap: "round",
                                                                strokeLinejoin: "round"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/TransactionList.tsx",
                                                                lineNumber: 589,
                                                                columnNumber: 21
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/TransactionList.tsx",
                                                            lineNumber: 576,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/TransactionList.tsx",
                                                    lineNumber: 565,
                                                    columnNumber: 17
                                                }, this),
                                                dropdownOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "absolute z-50 w-full mt-1 rounded-lg overflow-hidden",
                                                    style: {
                                                        border: "1px solid var(--border-visible)",
                                                        background: "var(--black)",
                                                        boxShadow: "0 8px 24px rgba(0,0,0,0.4)"
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                maxHeight: "150px",
                                                                overflowY: "auto"
                                                            },
                                                            children: categories.map((k)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    type: "button",
                                                                    onClick: ()=>handleSelectCategory(k),
                                                                    className: "w-full px-3 py-2 text-[13px] text-left cursor-pointer flex items-center gap-2",
                                                                    style: {
                                                                        background: kategori === k ? "var(--surface)" : "transparent",
                                                                        color: kategori === k ? "var(--accent)" : "var(--text-primary)",
                                                                        borderBottom: "1px solid var(--border)",
                                                                        fontWeight: kategori === k ? 600 : 400
                                                                    },
                                                                    children: [
                                                                        kategori === k && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                                            width: "10",
                                                                            height: "10",
                                                                            viewBox: "0 0 10 10",
                                                                            fill: "none",
                                                                            style: {
                                                                                flexShrink: 0
                                                                            },
                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                                d: "M1 5.5L3.5 8L9 2",
                                                                                stroke: "var(--accent)",
                                                                                strokeWidth: "1.5",
                                                                                strokeLinecap: "round",
                                                                                strokeLinejoin: "round"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/components/TransactionList.tsx",
                                                                                lineNumber: 634,
                                                                                columnNumber: 31
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/TransactionList.tsx",
                                                                            lineNumber: 627,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "truncate",
                                                                            children: k
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/TransactionList.tsx",
                                                                            lineNumber: 643,
                                                                            columnNumber: 27
                                                                        }, this)
                                                                    ]
                                                                }, k, true, {
                                                                    fileName: "[project]/src/components/TransactionList.tsx",
                                                                    lineNumber: 610,
                                                                    columnNumber: 25
                                                                }, this))
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/TransactionList.tsx",
                                                            lineNumber: 608,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center gap-1.5 p-2",
                                                            style: {
                                                                borderTop: "1px solid var(--border-visible)",
                                                                background: "var(--surface)"
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                    type: "text",
                                                                    placeholder: "Kategori baru...",
                                                                    value: newCat,
                                                                    onChange: (e)=>setNewCat(e.target.value),
                                                                    onKeyDown: handleNewCatKeyDown,
                                                                    className: "flex-1 h-8 px-2.5 text-[12px] rounded-md",
                                                                    style: {
                                                                        border: "1px solid var(--border-visible)",
                                                                        background: "var(--black)",
                                                                        color: "var(--text-primary)",
                                                                        outline: "none",
                                                                        minWidth: 0
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/TransactionList.tsx",
                                                                    lineNumber: 655,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    type: "button",
                                                                    onClick: handleAddCat,
                                                                    className: "h-8 px-2.5 text-[11px] font-mono font-bold rounded-md",
                                                                    style: {
                                                                        background: newCat.trim() ? "var(--accent)" : "var(--border)",
                                                                        color: newCat.trim() ? "white" : "var(--text-secondary)",
                                                                        border: "none",
                                                                        cursor: newCat.trim() ? "pointer" : "default",
                                                                        whiteSpace: "nowrap"
                                                                    },
                                                                    children: "+ Add"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/TransactionList.tsx",
                                                                    lineNumber: 670,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/TransactionList.tsx",
                                                            lineNumber: 648,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/TransactionList.tsx",
                                                    lineNumber: 600,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/TransactionList.tsx",
                                            lineNumber: 564,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/TransactionList.tsx",
                                    lineNumber: 557,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/TransactionList.tsx",
                            lineNumber: 543,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "block text-[12px] mb-1",
                                    style: {
                                        color: "var(--text-secondary)"
                                    },
                                    children: "Catatan"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/TransactionList.tsx",
                                    lineNumber: 696,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "text",
                                    value: keterangan,
                                    onChange: (e)=>setKeterangan(e.target.value),
                                    className: "w-full h-10 px-3 text-[14px] rounded-lg",
                                    style: {
                                        border: "1px solid var(--border-visible)",
                                        background: "var(--black)",
                                        color: "var(--text-primary)"
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/src/components/TransactionList.tsx",
                                    lineNumber: 702,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/TransactionList.tsx",
                            lineNumber: 695,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-2 pt-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: onClose,
                                    className: "flex-1 h-11 text-[13px] rounded-lg",
                                    style: {
                                        border: "1px solid var(--border-visible)",
                                        color: "var(--text-secondary)",
                                        background: "transparent"
                                    },
                                    children: "Batal"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/TransactionList.tsx",
                                    lineNumber: 716,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleSave,
                                    disabled: !name.trim() || !nominal || parseInt(nominal) <= 0,
                                    className: "flex-1 h-11 text-[13px] font-bold rounded-lg disabled:opacity-50",
                                    style: {
                                        background: "var(--accent)",
                                        color: "white",
                                        border: "none"
                                    },
                                    children: "Simpan"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/TransactionList.tsx",
                                    lineNumber: 727,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/TransactionList.tsx",
                            lineNumber: 715,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/TransactionList.tsx",
                    lineNumber: 493,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/TransactionList.tsx",
            lineNumber: 463,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/TransactionList.tsx",
        lineNumber: 458,
        columnNumber: 5
    }, this);
}
_s1(EditModal, "3QrMMMbOMG+dvbnI9CQG8K/LvCU=");
_c2 = EditModal;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "TransactionList");
__turbopack_context__.k.register(_c1, "DeleteConfirmModal");
__turbopack_context__.k.register(_c2, "EditModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/Charts.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CategoryChart",
    ()=>CategoryChart,
    "SavingsChart",
    ()=>SavingsChart,
    "WeeklyChart",
    ()=>WeeklyChart
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$chartjs$2d$2$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-chartjs-2/dist/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$chart$2e$js$2f$dist$2f$chart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/chart.js/dist/chart.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dayjs$2f$dayjs$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/dayjs/dayjs.min.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature();
'use client';
;
;
;
;
__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$chart$2e$js$2f$dist$2f$chart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Chart"].register(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$chart$2e$js$2f$dist$2f$chart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ArcElement"], __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$chart$2e$js$2f$dist$2f$chart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Tooltip"], __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$chart$2e$js$2f$dist$2f$chart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Legend"], __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$chart$2e$js$2f$dist$2f$chart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CategoryScale"], __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$chart$2e$js$2f$dist$2f$chart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["LinearScale"], __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$chart$2e$js$2f$dist$2f$chart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["BarElement"], __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$chart$2e$js$2f$dist$2f$chart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PointElement"], __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$chart$2e$js$2f$dist$2f$chart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["LineElement"], __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$chart$2e$js$2f$dist$2f$chart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Filler"]);
const COLORS = [
    'rgba(215, 25, 33, 0.8)',
    'rgba(74, 158, 92, 0.8)',
    'rgba(212, 168, 67, 0.8)',
    'rgba(91, 155, 246, 0.8)',
    'rgba(168, 85, 247, 0.8)',
    'rgba(236, 72, 153, 0.8)',
    'rgba(245, 158, 11, 0.8)',
    'rgba(20, 184, 166, 0.8)'
];
function CategoryChart(param) {
    let { transactions, categories } = param;
    _s();
    const { data, categoryData } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CategoryChart.useMemo": ()=>{
            const catTotals = {};
            transactions.forEach({
                "CategoryChart.useMemo": (t)=>{
                    catTotals[t.kategori] = (catTotals[t.kategori] || 0) + t.nominal;
                }
            }["CategoryChart.useMemo"]);
            // Sort by amount descending
            const sorted = Object.entries(catTotals).filter({
                "CategoryChart.useMemo.sorted": (param)=>{
                    let [, v] = param;
                    return v > 0;
                }
            }["CategoryChart.useMemo.sorted"]).sort({
                "CategoryChart.useMemo.sorted": (a, b)=>b[1] - a[1]
            }["CategoryChart.useMemo.sorted"]);
            const labels = sorted.map({
                "CategoryChart.useMemo.labels": (param)=>{
                    let [k] = param;
                    return k;
                }
            }["CategoryChart.useMemo.labels"]);
            const values = sorted.map({
                "CategoryChart.useMemo.values": (param)=>{
                    let [, v] = param;
                    return v;
                }
            }["CategoryChart.useMemo.values"]);
            const total = values.reduce({
                "CategoryChart.useMemo.total": (s, v)=>s + v
            }["CategoryChart.useMemo.total"], 0);
            return {
                data: {
                    labels,
                    datasets: [
                        {
                            data: values,
                            backgroundColor: labels.map({
                                "CategoryChart.useMemo": (_, i)=>COLORS[i % COLORS.length]
                            }["CategoryChart.useMemo"]),
                            borderWidth: 0,
                            cutout: '65%'
                        }
                    ]
                },
                categoryData: sorted.map({
                    "CategoryChart.useMemo": (param, i)=>{
                        let [k, v] = param;
                        return {
                            name: k,
                            amount: v,
                            pct: total > 0 ? v / total * 100 : 0,
                            color: COLORS[i % COLORS.length]
                        };
                    }
                }["CategoryChart.useMemo"])
            };
        }
    }["CategoryChart.useMemo"], [
        transactions
    ]);
    if (transactions.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-center py-8",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-[13px]",
                style: {
                    color: 'var(--text-disabled)'
                },
                children: "Belum ada data"
            }, void 0, false, {
                fileName: "[project]/src/components/Charts.tsx",
                lineNumber: 76,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/Charts.tsx",
            lineNumber: 75,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col md:flex-row gap-4 items-center",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    width: 160,
                    height: 160,
                    flexShrink: 0
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$chartjs$2d$2$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Doughnut"], {
                    data: data,
                    options: {
                        plugins: {
                            legend: {
                                display: false
                            },
                            tooltip: {
                                enabled: true
                            }
                        },
                        responsive: true,
                        maintainAspectRatio: true
                    }
                }, void 0, false, {
                    fileName: "[project]/src/components/Charts.tsx",
                    lineNumber: 84,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/Charts.tsx",
                lineNumber: 83,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 w-full space-y-2",
                children: categoryData.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-2.5 h-2.5 rounded-full flex-shrink-0",
                                style: {
                                    background: c.color
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/components/Charts.tsx",
                                lineNumber: 96,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[13px] flex-1 truncate",
                                style: {
                                    color: 'var(--text-primary)'
                                },
                                children: c.name
                            }, void 0, false, {
                                fileName: "[project]/src/components/Charts.tsx",
                                lineNumber: 97,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[12px] font-mono",
                                style: {
                                    color: 'var(--text-secondary)'
                                },
                                children: [
                                    c.pct.toFixed(0),
                                    "%"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/Charts.tsx",
                                lineNumber: 98,
                                columnNumber: 13
                            }, this)
                        ]
                    }, c.name, true, {
                        fileName: "[project]/src/components/Charts.tsx",
                        lineNumber: 95,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/components/Charts.tsx",
                lineNumber: 93,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/Charts.tsx",
        lineNumber: 82,
        columnNumber: 5
    }, this);
}
_s(CategoryChart, "1L5vbDvBtv0HrCtBvej4ee7XvlU=");
_c = CategoryChart;
function WeeklyChart(param) {
    let { transactions, selectedMonth } = param;
    _s1();
    const [viewMode, setViewMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('weekly');
    const data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "WeeklyChart.useMemo[data]": ()=>{
            const month = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dayjs$2f$dayjs$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(selectedMonth);
            const daysInMonth = month.daysInMonth();
            if (viewMode === 'weekly') {
                // Split into ~4 weeks
                const weekRanges = [];
                for(let i = 0; i < 4; i++){
                    const start = i * 7 + 1;
                    const end = i === 3 ? daysInMonth : Math.min((i + 1) * 7, daysInMonth);
                    weekRanges.push({
                        start,
                        end,
                        label: "".concat(start, "-").concat(end)
                    });
                }
                const weekTotals = weekRanges.map({
                    "WeeklyChart.useMemo[data].weekTotals": (param)=>{
                        let { start, end } = param;
                        return transactions.filter({
                            "WeeklyChart.useMemo[data].weekTotals": (t)=>{
                                const d = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dayjs$2f$dayjs$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(t.date).date();
                                return d >= start && d <= end;
                            }
                        }["WeeklyChart.useMemo[data].weekTotals"]).reduce({
                            "WeeklyChart.useMemo[data].weekTotals": (sum, t)=>sum + t.nominal
                        }["WeeklyChart.useMemo[data].weekTotals"], 0);
                    }
                }["WeeklyChart.useMemo[data].weekTotals"]);
                return {
                    labels: weekRanges.map({
                        "WeeklyChart.useMemo[data]": (w)=>w.label
                    }["WeeklyChart.useMemo[data]"]),
                    datasets: [
                        {
                            data: weekTotals,
                            backgroundColor: 'rgba(215, 25, 33, 0.5)',
                            hoverBackgroundColor: 'rgba(215, 25, 33, 0.8)',
                            borderWidth: 0,
                            borderRadius: 6,
                            barPercentage: 0.6
                        }
                    ]
                };
            } else {
                // Daily view
                const days = Array.from({
                    length: daysInMonth
                }, {
                    "WeeklyChart.useMemo[data].days": (_, i)=>i + 1
                }["WeeklyChart.useMemo[data].days"]);
                const dailyTotals = days.map({
                    "WeeklyChart.useMemo[data].dailyTotals": (day)=>transactions.filter({
                            "WeeklyChart.useMemo[data].dailyTotals": (t)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dayjs$2f$dayjs$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(t.date).date() === day
                        }["WeeklyChart.useMemo[data].dailyTotals"]).reduce({
                            "WeeklyChart.useMemo[data].dailyTotals": (sum, t)=>sum + t.nominal
                        }["WeeklyChart.useMemo[data].dailyTotals"], 0)
                }["WeeklyChart.useMemo[data].dailyTotals"]);
                return {
                    labels: days.map({
                        "WeeklyChart.useMemo[data]": (d)=>d.toString()
                    }["WeeklyChart.useMemo[data]"]),
                    datasets: [
                        {
                            data: dailyTotals,
                            backgroundColor: 'rgba(215, 25, 33, 0.5)',
                            hoverBackgroundColor: 'rgba(215, 25, 33, 0.8)',
                            borderWidth: 0,
                            borderRadius: 2,
                            barPercentage: 0.8
                        }
                    ]
                };
            }
        }
    }["WeeklyChart.useMemo[data]"], [
        transactions,
        selectedMonth,
        viewMode
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-3",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setViewMode('weekly'),
                        className: "px-3 h-8 text-[12px] font-semibold rounded-lg transition-colors",
                        style: {
                            background: viewMode === 'weekly' ? 'var(--accent)' : 'transparent',
                            color: viewMode === 'weekly' ? 'white' : 'var(--text-secondary)',
                            border: viewMode === 'weekly' ? '1px solid var(--accent)' : '1px solid var(--border)'
                        },
                        children: "Per Minggu"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Charts.tsx",
                        lineNumber: 175,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setViewMode('daily'),
                        className: "px-3 h-8 text-[12px] font-semibold rounded-lg transition-colors",
                        style: {
                            background: viewMode === 'daily' ? 'var(--accent)' : 'transparent',
                            color: viewMode === 'daily' ? 'white' : 'var(--text-secondary)',
                            border: viewMode === 'daily' ? '1px solid var(--accent)' : '1px solid var(--border)'
                        },
                        children: "Per Hari"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Charts.tsx",
                        lineNumber: 186,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/Charts.tsx",
                lineNumber: 174,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    height: 160
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$chartjs$2d$2$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Bar"], {
                    data: data,
                    options: {
                        plugins: {
                            legend: {
                                display: false
                            }
                        },
                        scales: {
                            x: {
                                grid: {
                                    display: false
                                },
                                ticks: {
                                    color: 'rgba(150, 150, 150, 0.8)',
                                    font: {
                                        size: 10
                                    }
                                },
                                border: {
                                    display: false
                                }
                            },
                            y: {
                                grid: {
                                    color: 'rgba(150, 150, 150, 0.2)'
                                },
                                ticks: {
                                    color: 'rgba(150, 150, 150, 0.8)',
                                    font: {
                                        size: 10
                                    }
                                },
                                border: {
                                    display: false
                                }
                            }
                        },
                        responsive: true,
                        maintainAspectRatio: false
                    }
                }, void 0, false, {
                    fileName: "[project]/src/components/Charts.tsx",
                    lineNumber: 199,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/Charts.tsx",
                lineNumber: 198,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/Charts.tsx",
        lineNumber: 173,
        columnNumber: 5
    }, this);
}
_s1(WeeklyChart, "uP4RIHfD14YSJicKxCE+9C0CL7s=");
_c1 = WeeklyChart;
function SavingsChart(param) {
    let { monthlyData } = param;
    _s2();
    const data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "SavingsChart.useMemo[data]": ()=>{
            const labels = monthlyData.map({
                "SavingsChart.useMemo[data].labels": (d)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dayjs$2f$dayjs$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(d.month + '-01').format('MMM')
            }["SavingsChart.useMemo[data].labels"]);
            const savings = monthlyData.map({
                "SavingsChart.useMemo[data].savings": (d)=>d.budget - d.spent
            }["SavingsChart.useMemo[data].savings"]);
            return {
                labels,
                datasets: [
                    {
                        label: 'Sisa Budget',
                        data: savings,
                        borderColor: 'rgba(74, 158, 92, 0.9)',
                        backgroundColor: 'rgba(74, 158, 92, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: savings.map({
                            "SavingsChart.useMemo[data]": (v)=>v >= 0 ? 'rgba(74, 158, 92, 1)' : 'rgba(215, 25, 33, 1)'
                        }["SavingsChart.useMemo[data]"]),
                        pointRadius: 4,
                        pointHoverRadius: 6
                    }
                ]
            };
        }
    }["SavingsChart.useMemo[data]"], [
        monthlyData
    ]);
    if (monthlyData.length < 2) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-center py-8",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-[13px]",
                style: {
                    color: 'var(--text-disabled)'
                },
                children: "Butuh data minimal 2 bulan"
            }, void 0, false, {
                fileName: "[project]/src/components/Charts.tsx",
                lineNumber: 258,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/Charts.tsx",
            lineNumber: 257,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            height: 180
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$chartjs$2d$2$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Line"], {
            data: data,
            options: {
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (ctx)=>{
                                const val = ctx.parsed.y;
                                if (val === null || val === undefined) return '';
                                const prefix = val >= 0 ? '+' : '';
                                return "".concat(prefix).concat(new Intl.NumberFormat('id-ID').format(val));
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: 'rgba(150, 150, 150, 0.8)',
                            font: {
                                size: 11
                            }
                        },
                        border: {
                            display: false
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(150, 150, 150, 0.2)'
                        },
                        ticks: {
                            color: 'rgba(150, 150, 150, 0.8)',
                            font: {
                                size: 10
                            }
                        },
                        border: {
                            display: false
                        }
                    }
                },
                responsive: true,
                maintainAspectRatio: false
            }
        }, void 0, false, {
            fileName: "[project]/src/components/Charts.tsx",
            lineNumber: 267,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/Charts.tsx",
        lineNumber: 266,
        columnNumber: 5
    }, this);
}
_s2(SavingsChart, "jwuu1hJIzb+z9O8CErpZ1XdXNoc=");
_c2 = SavingsChart;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "CategoryChart");
__turbopack_context__.k.register(_c1, "WeeklyChart");
__turbopack_context__.k.register(_c2, "SavingsChart");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/BudgetCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BudgetCard",
    ()=>BudgetCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/utils/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
'use client';
;
;
function BudgetCard(param) {
    let { remaining, totalSpent, target, progress, editingBudget, targetInput, onEditClick, onInputChange, onSave, onCancel } = param;
    const getStatusColor = ()=>{
        if (progress > 100) return 'var(--accent)';
        if (progress > 80) return 'var(--warning)';
        return 'var(--success)';
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "label block mb-2",
                        children: "SISA BUDGET"
                    }, void 0, false, {
                        fileName: "[project]/src/components/BudgetCard.tsx",
                        lineNumber: 40,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "font-display text-[42px] font-medium tracking-tight",
                        style: {
                            color: remaining < 0 ? 'var(--accent)' : 'var(--text-display)'
                        },
                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(remaining)
                    }, void 0, false, {
                        fileName: "[project]/src/components/BudgetCard.tsx",
                        lineNumber: 41,
                        columnNumber: 9
                    }, this),
                    editingBudget ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-2 mt-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "text",
                                inputMode: "numeric",
                                value: targetInput,
                                onChange: (e)=>onInputChange(e.target.value.replace(/[^0-9]/g, '')),
                                autoFocus: true,
                                className: "flex-1 p-2 text-[16px] font-mono"
                            }, void 0, false, {
                                fileName: "[project]/src/components/BudgetCard.tsx",
                                lineNumber: 49,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: onSave,
                                className: "px-4 py-2 font-bold",
                                style: {
                                    background: 'var(--success)',
                                    color: 'var(--black)',
                                    borderRadius: '4px',
                                    border: 'none'
                                },
                                children: "✓"
                            }, void 0, false, {
                                fileName: "[project]/src/components/BudgetCard.tsx",
                                lineNumber: 57,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: onCancel,
                                style: {
                                    padding: '8px 12px',
                                    border: '1px solid var(--border-visible)',
                                    borderRadius: '4px',
                                    color: 'var(--text-secondary)',
                                    background: 'transparent'
                                },
                                children: "×"
                            }, void 0, false, {
                                fileName: "[project]/src/components/BudgetCard.tsx",
                                lineNumber: 64,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/BudgetCard.tsx",
                        lineNumber: 48,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: onEditClick,
                        className: "label mt-3 hover:text-text-secondary",
                        style: {
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer'
                        },
                        children: "Edit Budget"
                    }, void 0, false, {
                        fileName: "[project]/src/components/BudgetCard.tsx",
                        lineNumber: 72,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/BudgetCard.tsx",
                lineNumber: 39,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex justify-between items-center mb-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "label",
                                children: "PENGELUARAN"
                            }, void 0, false, {
                                fileName: "[project]/src/components/BudgetCard.tsx",
                                lineNumber: 84,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-mono text-[14px] font-bold",
                                style: {
                                    color: getStatusColor()
                                },
                                children: [
                                    progress > 100 ? 'OVER ' : '',
                                    Math.min(progress, 100).toFixed(0),
                                    "%"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/BudgetCard.tsx",
                                lineNumber: 85,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/BudgetCard.tsx",
                        lineNumber: 83,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-1 mb-3",
                        children: Array.from({
                            length: 10
                        }).map((_, i)=>{
                            const segmentFill = (i + 1) * 10 <= progress;
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1 h-3 rounded-sm transition-colors",
                                style: {
                                    background: segmentFill ? getStatusColor() : 'var(--border)'
                                }
                            }, i, false, {
                                fileName: "[project]/src/components/BudgetCard.tsx",
                                lineNumber: 94,
                                columnNumber: 15
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/src/components/BudgetCard.tsx",
                        lineNumber: 90,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-2 items-center font-mono text-[12px]",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-bold",
                                style: {
                                    color: getStatusColor()
                                },
                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(totalSpent)
                            }, void 0, false, {
                                fileName: "[project]/src/components/BudgetCard.tsx",
                                lineNumber: 103,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    color: 'var(--text-disabled)'
                                },
                                children: "/"
                            }, void 0, false, {
                                fileName: "[project]/src/components/BudgetCard.tsx",
                                lineNumber: 104,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    color: 'var(--text-secondary)'
                                },
                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(target)
                            }, void 0, false, {
                                fileName: "[project]/src/components/BudgetCard.tsx",
                                lineNumber: 105,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/BudgetCard.tsx",
                        lineNumber: 102,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/BudgetCard.tsx",
                lineNumber: 82,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/BudgetCard.tsx",
        lineNumber: 38,
        columnNumber: 5
    }, this);
}
_c = BudgetCard;
var _c;
__turbopack_context__.k.register(_c, "BudgetCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/BottomNav.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BottomNav",
    ()=>BottomNav
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
const NAV_ITEMS = [
    {
        href: '/',
        label: 'Dashboard',
        icon: (active)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                width: "22",
                height: "22",
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: active ? 'var(--accent)' : 'var(--text-secondary)',
                strokeWidth: "2",
                strokeLinecap: "round",
                strokeLinejoin: "round",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                        x: "3",
                        y: "3",
                        width: "7",
                        height: "7",
                        rx: "1"
                    }, void 0, false, {
                        fileName: "[project]/src/components/BottomNav.tsx",
                        lineNumber: 12,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                        x: "14",
                        y: "3",
                        width: "7",
                        height: "7",
                        rx: "1"
                    }, void 0, false, {
                        fileName: "[project]/src/components/BottomNav.tsx",
                        lineNumber: 13,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                        x: "3",
                        y: "14",
                        width: "7",
                        height: "7",
                        rx: "1"
                    }, void 0, false, {
                        fileName: "[project]/src/components/BottomNav.tsx",
                        lineNumber: 14,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                        x: "14",
                        y: "14",
                        width: "7",
                        height: "7",
                        rx: "1"
                    }, void 0, false, {
                        fileName: "[project]/src/components/BottomNav.tsx",
                        lineNumber: 15,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/BottomNav.tsx",
                lineNumber: 11,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
    },
    {
        href: '/transaction',
        label: 'Transaksi',
        icon: (active)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                width: "22",
                height: "22",
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: active ? 'var(--accent)' : 'var(--text-secondary)',
                strokeWidth: "2",
                strokeLinecap: "round",
                strokeLinejoin: "round",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                        x1: "12",
                        y1: "5",
                        x2: "12",
                        y2: "19"
                    }, void 0, false, {
                        fileName: "[project]/src/components/BottomNav.tsx",
                        lineNumber: 24,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                        x1: "5",
                        y1: "12",
                        x2: "19",
                        y2: "12"
                    }, void 0, false, {
                        fileName: "[project]/src/components/BottomNav.tsx",
                        lineNumber: 25,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/BottomNav.tsx",
                lineNumber: 23,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
    }
];
function BottomNav() {
    _s();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
        className: "fixed bottom-0 left-0 right-0 z-40",
        style: {
            background: 'var(--surface)',
            borderTop: '1px solid var(--border)',
            backdropFilter: 'blur(12px)'
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "max-w-5xl mx-auto flex",
            children: NAV_ITEMS.map((item)=>{
                const active = pathname === item.href;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    href: item.href,
                    className: "flex-1 flex flex-col items-center gap-1 py-3",
                    style: {
                        textDecoration: 'none'
                    },
                    children: [
                        item.icon(active),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-[10px] font-medium",
                            style: {
                                color: active ? 'var(--accent)' : 'var(--text-secondary)',
                                fontWeight: active ? 600 : 400
                            },
                            children: item.label
                        }, void 0, false, {
                            fileName: "[project]/src/components/BottomNav.tsx",
                            lineNumber: 54,
                            columnNumber: 15
                        }, this)
                    ]
                }, item.href, true, {
                    fileName: "[project]/src/components/BottomNav.tsx",
                    lineNumber: 47,
                    columnNumber: 13
                }, this);
            })
        }, void 0, false, {
            fileName: "[project]/src/components/BottomNav.tsx",
            lineNumber: 43,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/BottomNav.tsx",
        lineNumber: 35,
        columnNumber: 5
    }, this);
}
_s(BottomNav, "xbyQPtUVMO7MNj7WjJlpdWqRcTo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"]
    ];
});
_c = BottomNav;
var _c;
__turbopack_context__.k.register(_c, "BottomNav");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/StoreInit.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "StoreInit",
    ()=>StoreInit
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$budget$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/budget.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function StoreInit() {
    _s();
    const { initStore } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$budget$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useBudgetStore"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "StoreInit.useEffect": ()=>{
            initStore();
        }
    }["StoreInit.useEffect"], [
        initStore
    ]);
    return null;
}
_s(StoreInit, "VWZolYwgS4Vxryz+xCLsV9xXJxM=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$budget$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useBudgetStore"]
    ];
});
_c = StoreInit;
var _c;
__turbopack_context__.k.register(_c, "StoreInit");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/DataActions.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DataActions",
    ()=>DataActions
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$papaparse$2f$papaparse$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/papaparse/papaparse.min.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dayjs$2f$dayjs$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/dayjs/dayjs.min.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$budget$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/budget.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function DataActions() {
    _s();
    const { transactions, importData } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$budget$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useBudgetStore"])();
    const fileInputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const downloadCSV = (data, filename)=>{
        const csv = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$papaparse$2f$papaparse$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].unparse(data);
        const blob = new Blob([
            csv
        ], {
            type: 'text/csv;charset=utf-8;'
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        setTimeout(()=>{
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        }, 100);
    };
    const handleDownloadTemplate = ()=>{
        const template = [
            {
                name: 'Makan siang',
                nominal: 25000,
                kategori: 'Makanan',
                keterangan: 'Nasi padang',
                date: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dayjs$2f$dayjs$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])().format('DD/MM/YYYY')
            }
        ];
        downloadCSV(template, 'template_transaksi.csv');
    };
    const handleExport = ()=>{
        const data = transactions.map((t)=>({
                name: t.name,
                nominal: t.nominal,
                kategori: t.kategori,
                keterangan: t.keterangan || '',
                date: t.date,
                source: t.source || 'Web'
            }));
        downloadCSV(data, 'export_transaksi.csv');
    };
    const handleImportClick = ()=>{
        var _fileInputRef_current;
        (_fileInputRef_current = fileInputRef.current) === null || _fileInputRef_current === void 0 ? void 0 : _fileInputRef_current.click();
    };
    const handleFileChange = (e)=>{
        var _e_target_files;
        const file = (_e_target_files = e.target.files) === null || _e_target_files === void 0 ? void 0 : _e_target_files[0];
        if (!file) return;
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$papaparse$2f$papaparse$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results)=>{
                const parsedTxs = [];
                results.data.forEach((row)=>{
                    if (row.name && row.nominal && row.kategori) {
                        const rawNominal = row.nominal.toString().replace(/[^0-9]/g, '');
                        const parsedNominal = parseInt(rawNominal, 10);
                        let rowDate = new Date().toISOString();
                        if (row.date) {
                            const parts = row.date.split('/');
                            if (parts.length === 3) {
                                // DD/MM/YYYY
                                const d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                                if (!isNaN(d.getTime())) rowDate = d.toISOString();
                            } else {
                                const d = new Date(row.date);
                                if (!isNaN(d.getTime())) rowDate = d.toISOString();
                            }
                        }
                        if (parsedNominal > 0) {
                            parsedTxs.push({
                                id: crypto.randomUUID(),
                                name: row.name,
                                nominal: parsedNominal,
                                kategori: row.kategori,
                                keterangan: row.keterangan || '',
                                date: rowDate,
                                source: row.source || 'CSV'
                            });
                        }
                    }
                });
                if (parsedTxs.length > 0) {
                    importData(parsedTxs);
                    alert("Berhasil mengimpor ".concat(parsedTxs.length, " transaksi!"));
                } else {
                    alert('Format CSV tidak valid atau data kosong. Pastikan kolom name, nominal, dan kategori terisi.');
                }
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
            error: (error)=>{
                alert("Error parsing CSV: ".concat(error.message));
            }
        });
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-3 p-4 rounded-xl mt-4",
        style: {
            background: 'var(--surface)'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-[14px] font-semibold",
                style: {
                    color: 'var(--text-display)'
                },
                children: "Manajemen Data"
            }, void 0, false, {
                fileName: "[project]/src/components/DataActions.tsx",
                lineNumber: 119,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 sm:grid-cols-3 gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleDownloadTemplate,
                        className: "w-full h-11 text-[13px] font-medium rounded-lg",
                        style: {
                            border: '1px solid var(--border-visible)',
                            color: 'var(--text-secondary)',
                            background: 'transparent'
                        },
                        children: "Unduh Template"
                    }, void 0, false, {
                        fileName: "[project]/src/components/DataActions.tsx",
                        lineNumber: 121,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleExport,
                        className: "w-full h-11 text-[13px] font-medium rounded-lg",
                        style: {
                            border: '1px solid var(--border-visible)',
                            color: 'var(--text-secondary)',
                            background: 'transparent'
                        },
                        children: "Export CSV"
                    }, void 0, false, {
                        fileName: "[project]/src/components/DataActions.tsx",
                        lineNumber: 128,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleImportClick,
                        className: "w-full h-11 text-[13px] font-bold rounded-lg",
                        style: {
                            background: 'var(--accent)',
                            color: 'white',
                            border: 'none'
                        },
                        children: "Import CSV"
                    }, void 0, false, {
                        fileName: "[project]/src/components/DataActions.tsx",
                        lineNumber: 135,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "file",
                        accept: ".csv",
                        ref: fileInputRef,
                        style: {
                            display: 'none'
                        },
                        onChange: handleFileChange
                    }, void 0, false, {
                        fileName: "[project]/src/components/DataActions.tsx",
                        lineNumber: 142,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/DataActions.tsx",
                lineNumber: 120,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/DataActions.tsx",
        lineNumber: 118,
        columnNumber: 5
    }, this);
}
_s(DataActions, "4H8/9oI9TdTF6QhNuj/Nqqv5DJc=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$budget$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useBudgetStore"]
    ];
});
_c = DataActions;
var _c;
__turbopack_context__.k.register(_c, "DataActions");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_43a2dd16._.js.map