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
var reviews_1 = require("../../constants/reviews");
var container_1 = require("../global/container");
var marquee_1 = require("../ui/marquee");
var section_bade_1 = require("../ui/section-bade");
var image_1 = require("next/image");
var firstRow = reviews_1.REVIEWS.slice(0, reviews_1.REVIEWS.length / 2);
var secondRow = reviews_1.REVIEWS.slice(reviews_1.REVIEWS.length / 2);
var Reviews = function () {
    return (React.createElement("div", { className: "flex flex-col items-center justify-center py-12 md:py-16 lg:py-24  w-full" },
        React.createElement(container_1["default"], { delay: 0.0, reverse: false, simple: false },
            React.createElement("div", { className: "flex flex-col items-center text-center max-w-xl mx-auto" },
                React.createElement(section_bade_1.SectionBadge, { title: "Our Customers" }),
                React.createElement("h2", { className: "text-2xl md:text-4xl lg:text-5xl font-heading font-black !leading-snug mt-6" }, "What our customers say about Hirebit"),
                React.createElement("p", { className: "text-base md:text-lg text-center text-accent-foreground/80 mt-6" }, "We are proud to have helped thousands of customers across the globe. Here are some of their stories \u2728"))),
        React.createElement(container_1["default"], null,
            React.createElement("div", { className: "mt-16 w-full relative overflow-hidden" },
                React.createElement("div", { className: "relative flex flex-col items-center justify-center overflow-hidden" },
                    React.createElement(marquee_1["default"], { pauseOnHover: true, className: "[--duration:30s]" }, firstRow.map(function (review) { return (React.createElement(ReviewCard, __assign({ key: review.username }, review))); })),
                    React.createElement(marquee_1["default"], { pauseOnHover: true, reverse: true, className: "[--duration:30s]" }, secondRow.map(function (review) { return (React.createElement(ReviewCard, __assign({ key: review.username }, review))); })),
                    React.createElement("div", { className: "pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background" }),
                    React.createElement("div", { className: "pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background" }),
                    React.createElement("div", { className: "absolute hidden lg:block top-1/4 left-1/4 w-28 h-28 rounded-full bg-primary/80 -z-10 blur-[6rem]" }),
                    React.createElement("div", { className: "absolute hidden lg:block top-1/4 right-1/4 w-28 h-28 rounded-full bg-primary/80 -z-10 blur-[6rem]" }))))));
};
var ReviewCard = function (_a) {
    var img = _a.img, name = _a.name, username = _a.username, review = _a.review;
    return (React.createElement("figure", { className: "relative w-64 cursor-pointer overflow-hidden rounded-xl border border-foreground/5 bg-neutral-50/[.05] hover:bg-foreground/10 p-4 transition-all duration-300 ease-in-out" },
        React.createElement("div", { className: "flex flex-row items-center gap-2" },
            React.createElement(image_1["default"], { className: "rounded-full", width: "32", height: "32", alt: "", src: img }),
            React.createElement("div", { className: "flex flex-col" },
                React.createElement("figcaption", { className: "text-sm font-medium text-foreground" }, name),
                React.createElement("p", { className: "text-xs font-medium text-foreground/40" }, username))),
        React.createElement("blockquote", { className: "mt-2 text-sm" }, review)));
};
exports["default"] = Reviews;
