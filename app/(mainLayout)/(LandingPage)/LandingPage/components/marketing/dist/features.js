"use client";
"use strict";
exports.__esModule = true;
var container_1 = require("../global/container");
var magic_card_1 = require("../ui/magic-card");
var ripple_1 = require("../ui/ripple");
var lucide_react_1 = require("lucide-react");
var section_bade_1 = require("../ui/section-bade");
var Features = function () {
    return (React.createElement("div", { className: "relative" },
        React.createElement("div", { className: "relative z-10" },
            React.createElement("div", { className: "flex flex-col items-center justify-center py-12 md:py-16 lg:py-32 w-full relative overflow-hidden" },
                React.createElement("div", { className: "bg-transparent z-0" }),
                React.createElement(container_1["default"], { delay: 0.0, duration: 0.8, reverse: false, simple: false, className: "relative z-10" },
                    React.createElement("div", { className: "flex flex-col items-center text-center max-w-3xl mx-auto" },
                        React.createElement(section_bade_1.SectionBadge, { title: "Why Hirebit?" }),
                        React.createElement("h2", { className: "text-5xl md:text-5xl lg:text-6xl font-heading font-black !leading-tight mt-6 bg-gradient-to-r from-foreground via-indigo-800 to-blue-600 bg-clip-text text-transparent" },
                            "Recruit Smarter, ",
                            React.createElement("br", null),
                            " Not Harder"),
                        React.createElement("p", { className: "text-lg md:text-xl text-center text-accent-foreground/80 mt-8 leading-relaxed max-w-2xl" }, "Skip the noise. Access only pre-verified, actively job-seeking professionals who match your requirements."))),
                React.createElement("div", { className: "mt-20 w-full" },
                    React.createElement("div", { className: "flex flex-col items-center gap-6 lg:gap-8 w-full" },
                        React.createElement(container_1["default"], null,
                            React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-[1fr_.65fr] w-full gap-6 lg:gap-8" },
                                React.createElement(magic_card_1["default"], { particles: true, className: "group hover:scale-[1.02] transition-all duration-300 flex flex-col items-start size-full bg-gradient-to-br from-violet-500/10 to-blue-500/10 backdrop-blur-xl" },
                                    React.createElement("div", { className: "bento-card flex items-center justify-center min-h-80" },
                                        React.createElement("div", { className: "flex flex-col gap-6 p-8" },
                                            React.createElement(lucide_react_1.Shield, { className: "w-16 h-16 text-violet-800" }),
                                            React.createElement("h3", { className: "text-2xl font-bold" }, "Triple Verification"),
                                            React.createElement("p", { className: "text-accent-foreground/80" }, "Every candidate profile is thoroughly verified through resume checks, skill assessments, and video interviews.")),
                                        React.createElement(ripple_1.Ripple, null))),
                                React.createElement(magic_card_1["default"], { particles: true, className: "hover:scale-[1.02] transition-all duration-300" },
                                    React.createElement("div", { className: "bento-card p-8" },
                                        React.createElement(lucide_react_1.Sparkle, { className: "w-12 h-12 text-blue-800 mb-6" }),
                                        React.createElement("h4", { className: "text-xl font-bold" }, "Zero Spam, No Bots"),
                                        React.createElement("p", { className: "text-base mt-4 text-accent-foreground/80" }, "Our AI-powered system eliminates fake profiles and automated applications."))))),
                        React.createElement(container_1["default"], null,
                            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full gap-6 lg:gap-8" },
                                React.createElement(magic_card_1["default"], { particles: true, className: "hover:scale-[1.02] transition-all duration-300" },
                                    React.createElement("div", { className: "bento-card p-8" },
                                        React.createElement(lucide_react_1.Target, { className: "w-12 h-12 text-green-800 mb-6" }),
                                        React.createElement("h4", { className: "text-xl font-bold" }, "Qualified Matches Only"),
                                        React.createElement("p", { className: "text-base mt-4 text-accent-foreground/80" }, "Access candidates who specifically match your job requirements and industry standards."))),
                                React.createElement(magic_card_1["default"], { particles: true, className: "hover:scale-[1.02] transition-all duration-300" },
                                    React.createElement("div", { className: "bento-card p-8" },
                                        React.createElement(lucide_react_1.Zap, { className: "w-12 h-12 text-yellow-800 mb-6" }),
                                        React.createElement("h4", { className: "text-xl font-bold" }, "Quick Response Time"),
                                        React.createElement("p", { className: "text-base mt-4 text-accent-foreground/80" }, "Connect with actively job-seeking candidates who respond within 24 hours."))),
                                React.createElement(magic_card_1["default"], { particles: true, className: "hover:scale-[1.02] transition-all duration-300" },
                                    React.createElement("div", { className: "bento-card p-8" },
                                        React.createElement(lucide_react_1.BarChart2, { className: "w-12 h-12 text-rose-800 mb-6" }),
                                        React.createElement("h4", { className: "text-xl font-bold" }, "Hiring Analytics"),
                                        React.createElement("p", { className: "text-base mt-4 text-accent-foreground/80" }, "Track your hiring pipeline with detailed insights and performance metrics.")))))))))));
};
exports["default"] = Features;
