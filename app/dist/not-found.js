"use client";
"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var react_1 = require("react");
var framer_motion_1 = require("framer-motion");
var framer_motion_2 = require("framer-motion");
var image_1 = require("next/image");
var link_1 = require("next/link");
function NotFound() {
    var _a = react_1.useState(true), logoLoading = _a[0], setLogoLoading = _a[1];
    return (React.createElement(framer_motion_1.MotionConfig, { reducedMotion: "user" },
        React.createElement(framer_motion_2.AnimatePresence, { mode: "wait" },
            React.createElement(framer_motion_1.motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center px-4 overflow-hidden" },
                React.createElement("nav", { className: "absolute top-0 left-0 w-full flex justify-between items-center p-4 z-50" },
                    React.createElement(link_1["default"], { href: "/" },
                        React.createElement("div", { className: "flex items-center space-x-2 cursor-pointer" },
                            React.createElement("div", { className: "relative w-10 h-10" },
                                React.createElement(image_1["default"], { src: "/logo.png", alt: "HireBit Logo", fill: true, className: "object-contain" })),
                            React.createElement("span", { className: "text-white text-xl font-bold" }, "HireBit")))),
                React.createElement(framer_motion_1.motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4" },
                    React.createElement("div", { className: "max-w-4xl w-full relative isolate" },
                        React.createElement("div", { className: "absolute inset-0 -z-10 transform-gpu overflow-hidden blur-3xl", "aria-hidden": "true" },
                            React.createElement("div", { className: "relative left-1/2 aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-purple-500 to-blue-500 opacity-20", style: {
                                    clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)'
                                } })),
                        React.createElement("div", { className: "text-center" },
                            React.createElement(framer_motion_1.motion.div, { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { delay: 0.2 }, className: "flex justify-center mb-8 relative" },
                                React.createElement("div", { className: "relative w-32 h-32" },
                                    React.createElement(image_1["default"], { src: "/logo.png", alt: "HireBit", fill: true, priority: true, className: "object-contain hover:scale-105 transition-transform duration-300", onLoadingComplete: function () { return setLogoLoading(false); } }),
                                    logoLoading && (React.createElement("div", { className: "absolute inset-0 flex items-center justify-center bg-black bg-opacity-50" },
                                        React.createElement("span", { className: "text-white" }, "Loading..."))))),
                            React.createElement(framer_motion_1.motion.h1, { initial: { scale: 0.95, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { delay: 0.4 }, className: "text-9xl font-extrabold bg-gradient-to-r from-purple-400 via-blue-300 to-emerald-400 bg-clip-text text-transparent mb-8" }, "404"),
                            React.createElement(framer_motion_1.motion.div, { initial: { y: 10, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { delay: 0.6 } },
                                React.createElement("h2", { className: "text-3xl font-bold text-white mb-4" }, "The page has vanished into the digital universe."),
                                React.createElement("p", { className: "text-gray-400 text-lg mb-8" }, "The page you're looking for has been lost in the void.")),
                            React.createElement(framer_motion_1.motion.div, { initial: { scale: 0.9, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { delay: 0.8 } },
                                React.createElement("a", { href: "/", className: "inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-500 rounded-2xl font-semibold text-white hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 group" },
                                    React.createElement("span", null, "Return Home"),
                                    React.createElement("svg", { className: "ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
                                        React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M14 5l7 7m0 0l-7 7m7-7H3" }))))),
                        React.createElement("div", { className: "absolute top-0 left-0 w-full h-full pointer-events-none" }, __spreadArrays(Array(12)).map(function (_, i) { return (React.createElement(framer_motion_1.motion.div, { key: i, className: "absolute bg-gradient-to-r from-purple-400/20 to-blue-400/20 rounded-full", style: {
                                width: Math.random() * 20 + 10 + 'px',
                                height: Math.random() * 20 + 10 + 'px',
                                top: Math.random() * 100 + '%',
                                left: Math.random() * 100 + '%'
                            }, animate: {
                                y: [0, -40, 0],
                                opacity: [0.3, 0.6, 0.3]
                            }, transition: {
                                duration: 3 + Math.random() * 4,
                                repeat: Infinity,
                                ease: 'easeInOut'
                            } })); }))))))));
}
exports["default"] = NotFound;
