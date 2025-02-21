"use client";
"use strict";
exports.__esModule = true;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var lucide_react_2 = require("lucide-react");
var card_1 = require("@/components/ui/card");
var lucide_react_3 = require("lucide-react");
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
var recharts_1 = require("recharts");
var dashboard_1 = require("@/app/LandingPage/constants/dashboard");
var chart_1 = require("@/components/ui/chart");
var components_1 = require("@/components");
var chartConfig = {
    reach: {
        label: "Total Reach",
        color: "hsl(var(--chart-1))"
    },
    engagement: {
        label: "Engagement",
        color: "hsl(var(--chart-2))"
    }
}, satisfies, ChartConfig;
var Page = function () {
    return (react_1["default"].createElement("div", { className: "p-4 w-full" },
        react_1["default"].createElement("div", { className: "flex flex-col w-full" },
            react_1["default"].createElement("div", { className: "mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4" },
                react_1["default"].createElement(components_1.Container, null,
                    react_1["default"].createElement(card_1.Card, null,
                        react_1["default"].createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2" },
                            react_1["default"].createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Total Reach"),
                            react_1["default"].createElement(lucide_react_3.UsersIcon, { className: "h-4 w-4 text-muted-foreground" })),
                        react_1["default"].createElement(card_1.CardContent, null,
                            react_1["default"].createElement("div", { className: "text-2xl font-bold" }, "2.4M"),
                            react_1["default"].createElement("p", { className: "text-xs text-muted-foreground" },
                                "+20.1% from last month",
                                react_1["default"].createElement(lucide_react_2.ArrowUpIcon, { className: "ml-1 h-4 w-4 text-green-500 inline" }))))),
                react_1["default"].createElement(components_1.Container, { delay: 0.1 },
                    react_1["default"].createElement(card_1.Card, null,
                        react_1["default"].createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2" },
                            react_1["default"].createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Engagement Rate"),
                            react_1["default"].createElement(lucide_react_2.Share2Icon, { className: "h-4 w-4 text-muted-foreground" })),
                        react_1["default"].createElement(card_1.CardContent, null,
                            react_1["default"].createElement("div", { className: "text-2xl font-bold" }, "4.3%"),
                            react_1["default"].createElement("p", { className: "text-xs text-muted-foreground" },
                                "+1.2% from last month",
                                react_1["default"].createElement(lucide_react_2.ArrowUpIcon, { className: "ml-1 h-4 w-4 text-green-500 inline" }))))),
                react_1["default"].createElement(components_1.Container, { delay: 0.2 },
                    react_1["default"].createElement(card_1.Card, null,
                        react_1["default"].createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2" },
                            react_1["default"].createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Active Campaigns"),
                            react_1["default"].createElement(lucide_react_2.BarChart3Icon, { className: "h-4 w-4 text-muted-foreground" })),
                        react_1["default"].createElement(card_1.CardContent, null,
                            react_1["default"].createElement("div", { className: "text-2xl font-bold" }, "12"),
                            react_1["default"].createElement("p", { className: "text-xs text-muted-foreground" },
                                "-2 from last month",
                                react_1["default"].createElement(lucide_react_1.ArrowDownIcon, { className: "ml-1 h-4 w-4 text-red-500 inline" }))))),
                react_1["default"].createElement(components_1.Container, { delay: 0.3 },
                    react_1["default"].createElement(card_1.Card, null,
                        react_1["default"].createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2" },
                            react_1["default"].createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Total Posts"),
                            react_1["default"].createElement(lucide_react_1.MessageSquareIcon, { className: "h-4 w-4 text-muted-foreground" })),
                        react_1["default"].createElement(card_1.CardContent, null,
                            react_1["default"].createElement("div", { className: "text-2xl font-bold" }, "842"),
                            react_1["default"].createElement("p", { className: "text-xs text-muted-foreground" },
                                "+48 from last month",
                                react_1["default"].createElement(lucide_react_2.ArrowUpIcon, { className: "ml-1 h-4 w-4 text-green-500 inline" })))))),
            react_1["default"].createElement("div", { className: "grid grid-cols-1 lg:grid-cols-6 gap-6 mt-8" },
                react_1["default"].createElement(components_1.Container, { delay: 0.2, className: "col-span-4" },
                    react_1["default"].createElement(card_1.Card, null,
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, null, "Performance Overview")),
                        react_1["default"].createElement(card_1.CardContent, { className: "py-2 w-full" },
                            react_1["default"].createElement(chart_1.ChartContainer, { config: chartConfig },
                                react_1["default"].createElement(recharts_1.AreaChart, { accessibilityLayer: true, data: dashboard_1.ANALYTICS_DATA, margin: {
                                        left: 12,
                                        right: 12
                                    } },
                                    react_1["default"].createElement(recharts_1.CartesianGrid, { vertical: false }),
                                    react_1["default"].createElement(recharts_1.XAxis, { dataKey: "name", tickLine: false, axisLine: false, tickMargin: 8, tickFormatter: function (value) { return value.slice(0, 3); } }),
                                    react_1["default"].createElement(chart_1.ChartTooltip, { cursor: false, content: react_1["default"].createElement(chart_1.ChartTooltipContent, null) }),
                                    react_1["default"].createElement("defs", null,
                                        react_1["default"].createElement("linearGradient", { id: "fillReach", x1: "0", y1: "0", x2: "0", y2: "1" },
                                            react_1["default"].createElement("stop", { offset: "5%", stopColor: "hsl(var(--chart-1))", stopOpacity: 0.8 }),
                                            react_1["default"].createElement("stop", { offset: "95%", stopColor: "hsl(var(--chart-1))", stopOpacity: 0.1 })),
                                        react_1["default"].createElement("linearGradient", { id: "fillEngagement", x1: "0", y1: "0", x2: "0", y2: "1" },
                                            react_1["default"].createElement("stop", { offset: "5%", stopColor: "hsl(var(--chart-2))", stopOpacity: 0.8 }),
                                            react_1["default"].createElement("stop", { offset: "95%", stopColor: "hsl(var(--chart-2))", stopOpacity: 0.1 }))),
                                    react_1["default"].createElement(recharts_1.Area, { dataKey: "engagement", type: "natural", fill: "url(#fillEngagement)", fillOpacity: 0.4, stroke: "hsl(var(--chart-2))", stackId: "a" }),
                                    react_1["default"].createElement(recharts_1.Area, { dataKey: "reach", type: "natural", fill: "url(#fillReach)", fillOpacity: 0.4, stroke: "hsl(var(--chart-1))", stackId: "a" })))))),
                react_1["default"].createElement(components_1.Container, { delay: 0.3, className: "col-span-2" },
                    react_1["default"].createElement(card_1.Card, null,
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, null, "Recent Sales"),
                            react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, "You made 265 sales this month.")),
                        react_1["default"].createElement(card_1.CardContent, null,
                            react_1["default"].createElement("div", { className: "space-y-8" }, dashboard_1.RECENT_SALES.map(function (sale) { return (react_1["default"].createElement("div", { key: sale.email, className: "flex items-center" },
                                react_1["default"].createElement("div", { className: "space-y-1" },
                                    react_1["default"].createElement("p", { className: "text-sm font-medium leading-none" }, sale.name),
                                    react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, sale.email)),
                                react_1["default"].createElement("div", { className: "ml-auto font-medium" }, sale.amount))); })))))))));
};
exports["default"] = Page;
