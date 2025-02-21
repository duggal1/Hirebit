"use strict";
exports.__esModule = true;
var lucide_react_1 = require("lucide-react");
var link_1 = require("next/link");
var blur_text_1 = require("../ui/blur-text");
var button_1 = require("../ui/button");
var image_1 = require("next/image");
var container_1 = require("../global/container");
var splash_cursor_1 = require("@/components/ui/splash-cursor");
var Hero = function () {
    return (React.createElement("div", null,
        React.createElement(splash_cursor_1.SplashCursor, null),
        React.createElement("div", { className: "flex flex-col items-center text-center w-full max-w-5xl my-24 mx-auto z-40 relative" },
            React.createElement(container_1["default"], { delay: 0.0 },
                React.createElement("div", { className: "pl-2 pr-1 py-1 rounded-full border border-foreground/10 hover:border-foreground/15 backdrop-blur-lg cursor-pointer flex items-center gap-2.5 select-none w-max mx-auto" },
                    React.createElement("div", { className: "w-3.5 h-3.5 rounded-full bg-primary/40 flex items-center justify-center relative" },
                        React.createElement("div", { className: "w-2.5 h-2.5 rounded-full bg-primary/60 flex items-center justify-center animate-ping" },
                            React.createElement("div", { className: "w-2.5 h-2.5 rounded-full bg-primary/60 flex items-center justify-center animate-ping" })),
                        React.createElement("div", { className: "w-1.5 h-1.5 rounded-full bg-primary flex items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" })),
                    React.createElement("span", { className: "inline-flex items-center justify-center gap-2 animate-text-gradient animate-background-shine bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#d946ef] bg-[200%_auto] bg-clip-text text-xl font-black text-transparent" },
                        "Triple-verified candidates",
                        React.createElement("span", { className: "text-xs text-secondary-foreground px-1.5 py-0.5 rounded-full bg-gradient-to-b from-foreground/20 to-foreground/10 flex items-center justify-center font-black" },
                            "No bots",
                            React.createElement(lucide_react_1.ArrowRightIcon, { className: "w-3.5 h-3.5 ml-1 text-foreground/50" }))))),
            React.createElement(blur_text_1.BlurText, { word: "Find the right talent\n without the noise", className: "text-3xl sm:text-5xl lg:text-6xl xl:text-7xl bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent py-2 md:py-0 lg:!leading-snug font-medium tracking-[-0.0125em] mt-6 font-heading" }),
            React.createElement(container_1["default"], { delay: 0.1 },
                React.createElement("p", { className: "text-sm sm:text-base lg:text-lg mt-4 text-gray-400 max-w-2xl mx-auto" },
                    "Every candidate is ID-verified and skill-tested. Our AI matches candidates to your exact job requirements. ",
                    React.createElement("span", { className: "hidden sm:inline" }, "Get detailed skill assessments and video introductions before the first interview."))),
            React.createElement(container_1["default"], { delay: 0.2 },
                React.createElement("div", { className: "flex items-center justify-center gap-x-4 mt-8" },
                    React.createElement(button_1.Button, { asChild: true, size: "lg", className: "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-lg" },
                        React.createElement(link_1["default"], { href: "/main" }, "Post a job")),
                    React.createElement(button_1.Button, { asChild: true, size: "lg", variant: "outline", className: "backdrop-blur-md border-foreground/20 hover:border-foreground/40" },
                        React.createElement(link_1["default"], { href: "#" }, "View talent pool")))),
            React.createElement(container_1["default"], { delay: 0.3 },
                React.createElement("div", { className: "relative mx-auto max-w-7xl rounded-xl lg:rounded-[32px] border border-neutral-200/10 p-2 backdrop-blur-xl bg-transparent md:p-4 mt-12 shadow-2xl" },
                    React.createElement("div", { className: "absolute top-1/4 left-1/2 -z-10 w-3/4 -translate-x-1/2 h-1/4 -translate-y-1/2 inset-0 blur-[10rem] bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20" }),
                    React.createElement("div", { className: "rounded-lg lg:rounded-[24px] border p-2 border-neutral-800 bg-black/90 overflow-hidden" },
                        React.createElement(image_1["default"], { src: "/images/dashboard.png", alt: "Recruiter dashboard showing candidate matches", width: 1920, height: 1080, className: "rounded-lg lg:rounded-[20px] opacity-90 hover:opacity-100 transition-opacity duration-300" })))))));
};
exports["default"] = Hero;
