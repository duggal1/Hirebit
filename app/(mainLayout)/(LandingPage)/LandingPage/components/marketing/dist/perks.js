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
var functions_1 = require("@/app/(mainLayout)/(LandingPage)/LandingPage/functions");
var lucide_react_1 = require("lucide-react");
var container_1 = require("../global/container");
var section_bade_1 = require("../ui/section-bade");
var RECRUITER_PERKS = [
    {
        title: "Triple-Checked Profiles",
        description: "Every candidate goes through resume verification, skill tests, and video interviews before reaching you.",
        icon: lucide_react_1.Shield
    },
    {
        title: "Real Candidates Only",
        description: "No fake profiles or bots. Access only active job seekers who are ready to interview.",
        icon: lucide_react_1.UserCheck
    },
    {
        title: "Smart Match",
        description: "Our AI finds candidates that perfectly match your job requirements and company culture.",
        icon: lucide_react_1.Brain
    },
    {
        title: "24-Hour Response",
        description: "Connect with candidates who respond within 24 hours of your message.",
        icon: lucide_react_1.Clock
    },
    {
        title: "Targeted Search",
        description: "Find candidates by exact skills, experience level, and location that you need.",
        icon: lucide_react_1.Target
    },
    {
        title: "Hiring Analytics",
        description: "Track your hiring pipeline with real-time data on candidate engagement and response rates.",
        icon: lucide_react_1.ChartBar
    }
];
var Perks = function () {
    return (React.createElement("div", { className: "flex flex-col items-center justify-center py-16 md:py-24 lg:py-32 w-full relative" },
        React.createElement("div", { className: "bg-transparent" }),
        React.createElement(container_1["default"], { delay: 0.0, duration: 0.8, reverse: false, simple: false },
            React.createElement("div", { className: "flex flex-col items-center text-center max-w-3xl mx-auto" },
                React.createElement(section_bade_1.SectionBadge, { title: "Why Recruiters Choose Us" }),
                React.createElement("h2", { className: "text-4xl md:text-5xl lg:text-6xl font-black !leading-tight mt-8 bg-gradient-to-r from-foreground via-violet-600 to-blue-600 bg-clip-text text-transparent" }, "Hire Better, Faster, Smarter"),
                React.createElement("p", { className: "text-lg md:text-xl text-center text-accent-foreground/80 mt-6 max-w-2xl" }, "Stop wasting time on unqualified applications. Get access to pre-verified candidates who match your needs."))),
        React.createElement(container_1["default"], null,
            React.createElement("div", { className: "mt-20 w-full" },
                React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full gap-6 relative" }, RECRUITER_PERKS.map(function (perk, index) { return (React.createElement(Perk, __assign({ key: index, index: index }, perk))); }))))));
};
var Perk = function (_a) {
    var title = _a.title, description = _a.description, Icon = _a.icon, index = _a.index;
    return (React.createElement("div", { className: functions_1.cn("group/perk flex flex-col p-8 rounded-2xl backdrop-blur-xl transition-all duration-500", "bg-gradient-to-br from-background/50 to-background/30", "border border-foreground/5 hover:border-violet-500/20", "hover:shadow-[0_0_30px_-5px_rgba(124,58,237,0.1)]") },
        React.createElement("div", { className: "group-hover/perk:-translate-y-1 transform-gpu transition-all duration-300 flex flex-col w-full" },
            React.createElement("div", { className: "mb-6 relative" },
                React.createElement("div", { className: "absolute inset-0 bg-violet-500/10 blur-2xl rounded-full" }),
                React.createElement("div", { className: "relative bg-gradient-to-br from-background/80 to-background/40 p-4 rounded-xl border border-foreground/5 backdrop-blur-md" },
                    React.createElement(Icon, { strokeWidth: 1.5, className: "w-8 h-8 text-violet-500 transition-all duration-300" }))),
            React.createElement("div", { className: "space-y-2" },
                React.createElement("h3", { className: "text-xl font-medium bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text text-transparent" }, title),
                React.createElement("p", { className: "text-base text-accent-foreground/70 leading-relaxed" }, description)))));
};
exports["default"] = Perks;
