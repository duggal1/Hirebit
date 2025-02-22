"use strict";
exports.__esModule = true;
var lucide_react_1 = require("lucide-react");
var link_1 = require("next/link");
var blur_text_1 = require("../ui/blur-text");
var button_1 = require("../ui/button");
var image_1 = require("next/image");
var container_1 = require("../global/container");
var Hero = function () {
    return (React.createElement("div", null,
        React.createElement("div", { className: "flex flex-col items-center text-center w-full max-w-5xl my-24 mx-auto z-40 relative" },
            React.createElement(container_1["default"], { delay: 0.1, 
                // Longer duration for smoother animation
                reverse: false, simple: true },
                React.createElement("div", { className: "pl-4 pr-3 py-2.5 rounded-full border border-foreground/5 hover:border-foreground/15 backdrop-blur-2xl cursor-pointer flex items-center gap-3 select-none w-max mx-auto group hover:bg-gradient-to-r hover:from-black/5 hover:to-transparent transition-all duration-500 hover:scale-105 hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.2)]" },
                    React.createElement("div", { className: "relative w-5 h-5" },
                        React.createElement("div", { className: "absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-[spin_4s_linear_infinite] blur-sm opacity-70" }),
                        React.createElement("div", { className: "absolute inset-0.5 rounded-full bg-black flex items-center justify-center" },
                            React.createElement("div", { className: "w-3 h-3 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center animate-pulse" }))),
                    React.createElement("span", { className: "inline-flex items-center justify-center gap-3 animate-text-gradient bg-clip-text text-xl font-black text-transparent relative bg-[linear-gradient(to_right,theme(colors.indigo.500),theme(colors.purple.500),theme(colors.pink.500),theme(colors.indigo.500))] bg-[length:200%_auto] animate-[shimmer_2s_infinite]" },
                        "AI-Powered Talent Verification",
                        React.createElement("span", { className: "text-xs px-2.5 py-1.5 rounded-full bg-gradient-to-r from-blue-900/80 to-blue-800/80 flex items-center justify-center font-black group-hover:from-indigo-600/80 group-hover:to-purple-600/80 transition-all duration-500 backdrop-blur-md shadow-inner" },
                            React.createElement("span", { className: "text-white/90 group-hover:text-white transition-colors duration-300" }, "100% Human"),
                            React.createElement(lucide_react_1.ArrowRightIcon, { className: "w-3.5 h-3.5 ml-1.5 text-white/70 group-hover:text-white/90 group-hover:translate-x-0.5 transition-all duration-300" }))))),
            React.createElement(blur_text_1.BlurText, { word: "Find the right talent\n without the noise", className: "text-3xl sm:text-5xl lg:text-6xl xl:text-7xl bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-foreground via-foreground/80 to-foreground/60 bg-clip-text text-transparent py-2 md:py-0 lg:!leading-snug font-medium tracking-[-0.0125em] mt-6 font-heading" }),
            React.createElement(container_1["default"], { delay: 0.2, reverse: true },
                React.createElement("p", { className: "text-sm sm:text-base lg:text-lg mt-4 text-accent-foreground/60 max-w-2xl mx-auto backdrop-blur-sm py-2 px-4 rounded-full" },
                    "Every candidate is ID-verified and skill-tested. Our AI matches candidates to your exact job requirements. ",
                    React.createElement("span", { className: "hidden sm:inline" }, "Get detailed skill assessments and video introductions before the first interview."))),
            React.createElement(container_1["default"], { delay: 0.3, simple: true },
                React.createElement("div", { className: "flex items-center justify-center gap-x-4 mt-8" },
                    React.createElement(button_1.Button, { asChild: true, size: "lg", className: "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 hover:scale-105" },
                        React.createElement(link_1["default"], { href: "/main" }, "Post a job")),
                    React.createElement(button_1.Button, { asChild: true, size: "lg", variant: "outline", className: "backdrop-blur-md border-foreground/20 hover:border-foreground/40 hover:bg-white/5 transition-all duration-300 hover:scale-105" },
                        React.createElement(link_1["default"], { href: "#" }, "View talent pool")))),
            React.createElement(container_1["default"], { delay: 0.4, simple: true },
                React.createElement("div", { className: "relative mx-auto max-w-7xl rounded-xl lg:rounded-[32px]  bg-transparent md:p-4 mt-12  transition-all duration-500" },
                    React.createElement("div", { className: "absolute top-1/4 left-1/2 -z-10 w-3/4 -translate-x-1/2 h-1/4 -translate-y-1/2 inset-0 blur-[10rem] bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-indigo-500/20 via-purple-500/20 to-pink-500/20 animate-pulse" }),
                    React.createElement("div", { className: "rounded-lg lg:rounded-[24px] border p-2 border-neutral-800 bg-black/90 overflow-hidden group" },
                        React.createElement(image_1["default"], { src: "/images/dashboard.png", alt: "Recruiter dashboard showing candidate matches", width: 1920, height: 1080, className: "rounded-lg lg:rounded-[20px] opacity-90 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-[1.02]" })))))));
};
exports["default"] = Hero;
