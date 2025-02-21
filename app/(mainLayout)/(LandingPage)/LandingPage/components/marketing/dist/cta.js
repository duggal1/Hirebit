"use client";
"use strict";
exports.__esModule = true;
var link_1 = require("next/link");
var container_1 = require("../global/container");
var button_1 = require("../ui/button");
var particles_1 = require("../ui/particles");
var retro_grid_1 = require("../ui/retro-grid");
var CTA = function () {
    return (React.createElement("div", { className: "flex flex-col items-center justify-center py-16 md:py-20 lg:py-32 w-full relative" },
        React.createElement(container_1["default"], { delay: 0.0, duration: 0.8, reverse: false, simple: false },
            React.createElement("div", { className: "flex flex-col items-center justify-center text-center w-full px-6 md:px-0 mx-auto min-h-[600px] bg-gradient-to-b from-background/80 to-background border border-foreground/10 rounded-[2.5rem] overflow-hidden relative backdrop-blur-xl" },
                React.createElement("div", { className: "absolute top-0 left-1/2 -translate-x-1/2 w-full h-24 bg-violet-500/30 blur-[8rem]" }),
                React.createElement("div", { className: "absolute bottom-0 right-1/2 translate-x-1/2 w-full h-24 bg-blue-500/30 blur-[8rem]" }),
                React.createElement("div", { className: "flex flex-col items-center justify-center w-full z-20 p-8" },
                    React.createElement("div", { className: "inline-flex items-center gap-2 px-4 py-2 rounded-full border border-foreground/10 bg-foreground/5 backdrop-blur-sm mb-6" },
                        React.createElement("span", { className: "inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" }),
                        React.createElement("span", { className: "text-sm text-foreground/80" }, "Trusted by 1000+ recruiters")),
                    React.createElement("h2", { className: "text-4xl md:text-7xl font-heading font-bold !leading-[1.1] mt-6 bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text text-transparent" },
                        "Find Top Talent. ",
                        React.createElement("br", { className: "hidden md:block" }),
                        React.createElement("span", { className: "text-violet-500" }, "Zero Noise.")),
                    React.createElement("p", { className: "text-lg md:text-xl text-center text-accent-foreground/80 max-w-2xl mx-auto mt-8 leading-relaxed" }, "Access pre-verified candidates who mean business. Every profile is triple-checked, bot-free, and ready to move. Stop wasting time on unqualified applications."),
                    React.createElement("div", { className: "flex flex-col md:flex-row items-center justify-center w-full gap-6 mt-10" },
                        React.createElement(button_1.Button, { asChild: true, size: "lg", className: "w-full md:w-max bg-violet-500 hover:bg-violet-600 text-white px-8 py-6 text-lg rounded-2xl shadow-lg shadow-violet-500/25 transition-all hover:scale-105" },
                            React.createElement(link_1["default"], { href: "/signup" }, "Start Hiring Now")),
                        React.createElement(button_1.Button, { asChild: true, size: "lg", variant: "secondary", className: "w-full md:w-max px-8 py-6 text-lg rounded-2xl border border-foreground/10 hover:bg-foreground/5 transition-all" },
                            React.createElement(link_1["default"], { href: "/features" }, "View Features"))),
                    React.createElement("div", { className: "flex items-center gap-4 mt-10 text-sm text-foreground/60" },
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
                                React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M5 13l4 4L19 7" })),
                            "Triple Verified"),
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
                                React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M5 13l4 4L19 7" })),
                            "No Bots"),
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
                                React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M5 13l4 4L19 7" })),
                            "Qualified Only"))),
                React.createElement(retro_grid_1["default"], null),
                React.createElement(particles_1.Particles, { refresh: true, ease: 100, color: "#a855f7", quantity: 150, className: "size-full absolute inset-0 opacity-50" })))));
};
exports["default"] = CTA;
