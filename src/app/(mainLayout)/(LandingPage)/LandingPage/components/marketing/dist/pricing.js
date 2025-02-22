"use client";
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var tabs_1 = require("@/components/ui/tabs");
var constants_1 = require("@/src/app/(mainLayout)/(LandingPage)/LandingPage/constants");
var functions_1 = require("@/src/app/(mainLayout)/(LandingPage)/LandingPage/functions");
var framer_motion_1 = require("framer-motion");
var lucide_react_1 = require("lucide-react");
var link_1 = require("next/link");
var container_1 = require("../global/container");
var button_1 = require("../ui/button");
var number_ticker_1 = require("../ui/number-ticker");
var section_bade_1 = require("../ui/section-bade");
var RECRUITER_PLANS = [
    {
        id: "starter",
        title: "Starter",
        desc: "Perfect for small teams starting their hiring journey",
        monthlyPrice: 0,
        yearlyPrice: 0,
        buttonText: "Start Free",
        features: [
            "Up to 3 active job posts",
            "Basic candidate verification",
            "Email support",
            "Basic candidate matching",
            "48-hour response time"
        ]
    },
    {
        id: "pro",
        title: "Professional",
        desc: "For growing teams who need serious hiring power",
        monthlyPrice: 99,
        yearlyPrice: 990,
        buttonText: "Start Hiring",
        features: [
            "Unlimited job posts",
            "Triple-layer verification",
            "AI-powered candidate matching",
            "24-hour candidate response guarantee",
            "Custom hiring pipeline",
            "Advanced analytics dashboard",
            "Priority support"
        ]
    },
    {
        id: "enterprise",
        title: "Enterprise",
        desc: "Custom solutions for large-scale hiring needs",
        monthlyPrice: 299,
        yearlyPrice: 2990,
        buttonText: "Contact Sales",
        features: [
            "Everything in Pro",
            "Custom verification process",
            "Dedicated account manager",
            "Custom AI matching rules",
            "API access",
            "Advanced team collaboration",
            "Custom analytics"
        ]
    }
];
var Pricing = function () {
    return (React.createElement("div", { className: "flex flex-col items-center justify-center py-12 md:py-16 lg:py-32 w-full relative" },
        React.createElement(container_1["default"], null,
            React.createElement("div", { className: "flex flex-col items-center text-center max-w-xl mx-auto" },
                React.createElement(section_bade_1.SectionBadge, { title: "Recruitment Plans" }),
                React.createElement("h2", { className: "text-2xl md:text-4xl lg:text-5xl font-black !leading-snug mt-6 bg-gradient-to-r from-blue-400 via-violet-400 to-blue-500 bg-clip-text text-transparent" }, "Choose Your Hiring Power"),
                React.createElement("p", { className: "text-base md:text-lg text-center text-accent-foreground/80 mt-6" }, "Start with verified candidates today. Scale as you grow."))),
        React.createElement("div", { className: "mt-8 w-full relative flex flex-col items-center justify-center" },
            React.createElement("div", { className: "absolute hidden lg:block top-1/2 right-2/3 translate-x-1/4 -translate-y-1/2 w-96 h-96 bg-primary/15 blur-[10rem] -z-10" }),
            React.createElement("div", { className: "absolute hidden lg:block top-1/2 left-2/3 -translate-x-1/4 -translate-y-1/2 w-96 h-96 bg-violet-500/15 blur-[10rem] -z-10" }),
            React.createElement(container_1["default"], null,
                React.createElement(tabs_1.Tabs, { defaultValue: "monthly", className: "w-full flex flex-col items-center justify-center" },
                    React.createElement(tabs_1.TabsList, null,
                        React.createElement(tabs_1.TabsTrigger, { value: "monthly" }, "Monthly"),
                        React.createElement(tabs_1.TabsTrigger, { value: "yearly" }, "Yearly")),
                    React.createElement(tabs_1.TabsContent, { value: "monthly" },
                        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mt-14" }, constants_1.PLANS.map(function (plan, index) { return (React.createElement(Plan, __assign({ key: index, index: index }, plan, { plan: "monthly" }))); }))),
                    React.createElement(tabs_1.TabsContent, { value: "yearly" },
                        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mt-14" }, constants_1.PLANS.map(function (plan, index) { return (React.createElement(Plan, __assign({ key: index, index: index }, plan, { plan: "yearly" }))); }))))))));
};
var Plan = function (_a) {
    var id = _a.id, title = _a.title, desc = _a.desc, monthlyPrice = _a.monthlyPrice, yearlyPrice = _a.yearlyPrice, buttonText = _a.buttonText, features = _a.features, index = _a.index, plan = _a.plan;
    var getDisplayedPrice = function (plan, monthlyPrice, yearlyPrice) {
        if (plan === "monthly") {
            return monthlyPrice === 0 ? 0 : monthlyPrice;
        }
        else if (plan === "yearly") {
            var discountedPrice = Math.round((yearlyPrice * 0.8) / 12);
            return yearlyPrice === 0 ? 0 : discountedPrice;
        }
        return 0;
    };
    var displayedPrice = getDisplayedPrice(plan, monthlyPrice, yearlyPrice);
    return (React.createElement("div", { key: index, className: "w-full relative flex flex-col saturate-150 rounded-2xl group hover:scale-[1.02] transition-all duration-500" },
        React.createElement("div", { className: "absolute inset-0 bg-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" }),
        React.createElement("div", { className: functions_1.cn("flex flex-col size-full border rounded-2xl relative p-3", "bg-gradient-to-br from-background/95 to-background/90 backdrop-blur-xl", "border-blue-950/20 hover:border-violet-500/30", "transition-all duration-500", id === "pro" ? "border-violet-500/50" : "border-border/60") },
            id === "pro" && (React.createElement("div", { className: "max-w-fit min-w-min inline-flex items-center whitespace-nowrap px-1 h-7 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 absolute -top-3 left-1/2 -translate-x-1/2 select-none" },
                React.createElement("span", { className: "flex-1 text-sm px-2 font-medium text-white animate-shimmer" }, "Most Popular"))),
            React.createElement("div", { className: "flex flex-col p-3 w-full" },
                React.createElement("h2", { className: "text-xl font-medium" }, title),
                React.createElement("p", { className: "text-sm mt-2 text-muted-foreground break-words" }, desc)),
            React.createElement("hr", { className: "shrink-0 border-none w-full h-px bg-border", role: "separator" }),
            React.createElement("div", { className: "relative flex flex-col flex-1 align-top w-full p-3 h-full break-words text-left gap-4" },
                React.createElement("div", { className: "flex items-end gap-2" },
                    React.createElement("div", { className: "flex items-end gap-1 w-40" },
                        React.createElement("span", { className: "text-2xl md:text-2xl font-black" },
                            "$",
                            displayedPrice === 0 ? 0 : React.createElement(number_ticker_1["default"], { value: displayedPrice })),
                        React.createElement("span", { className: "text-md text-muted-foreground font-medium font-headin" },
                            "per ",
                            plan === "monthly" ? "month" : "month")),
                    React.createElement(framer_motion_1.AnimatePresence, null, (id !== "free" && plan === "yearly") && (React.createElement(framer_motion_1.motion.span, { initial: { opacity: 0, scale: 0 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0 }, transition: { duration: 0.2 }, "aria-hidden": "true", className: "text-xs px-2 py-0.5 rounded mb-1 text-foreground bg-primary font-medium" }, "-20%")))),
                React.createElement("ul", { className: "flex flex-col gap-2" }, features.map(function (feature, index) { return (React.createElement("li", { key: index, className: "flex items-center gap-2" },
                    React.createElement(lucide_react_1.CheckIcon, { "aria-hidden": "true", className: "w-5 h-5 text-primary" }),
                    React.createElement("p", { className: "text-sm md:text-base text-muted-foreground" }, feature))); }))),
            React.createElement("div", { className: "p-3 mt- h-auto flex w-full items-center" },
                React.createElement(button_1.Button, { asChild: true, variant: id === "pro" ? "default" : "tertiary", className: "w-full hover:scale-100 hover:translate-y-0 shadow-none" },
                    React.createElement(link_1["default"], { href: "" }, buttonText))))));
};
exports["default"] = Pricing;
