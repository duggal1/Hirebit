"use client";
"use strict";
exports.__esModule = true;
var react_1 = require("react");
var framer_motion_1 = require("framer-motion");
var image_1 = require("next/image");
var link_1 = require("next/link");
function NotFound() {
    var _a = react_1.useState(true), logoLoading = _a[0], setLogoLoading = _a[1];
    return (React.createElement("div", { className: "relative min-h-screen bg-transparent flex flex-col items-center justify-center px-4 overflow-hidden" },
        React.createElement("div", { className: "absolute inset-0 -z-10" },
            React.createElement("div", { className: "absolute top-0 left-0 w-full h-full bg-transparent opacity-40" })),
        React.createElement("nav", { className: "absolute top-0 left-0 w-full p-4 flex justify-between items-center" },
            React.createElement(link_1["default"], { href: "/", className: "flex items-center space-x-2" },
                React.createElement("div", { className: "relative w-10 h-10" },
                    React.createElement(image_1["default"], { src: "/logo.png", alt: "HireBit Logo", fill: true, className: "object-contain" })),
                React.createElement("span", { className: "text-white text-xl font-bold" }, "HireBit"))),
        React.createElement(framer_motion_1.motion.div, { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, className: "text-center" },
            React.createElement("div", { className: "relative w-32 h-32 mx-auto mb-8" },
                React.createElement(image_1["default"], { src: "/logo.png", alt: "HireBit", fill: true, className: "object-contain", onLoadingComplete: function () { return setLogoLoading(false); } }),
                logoLoading && (React.createElement("div", { className: "absolute inset-0 flex items-center justify-center bg-black bg-opacity-50" },
                    React.createElement("span", { className: "text-white" }, "Loading...")))),
            React.createElement(framer_motion_1.motion.h1, { initial: { scale: 0.95, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { delay: 0.2 }, className: "text-9xl font-extrabold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent mb-4" }, "404"),
            React.createElement(framer_motion_1.motion.div, { initial: { y: 10, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { delay: 0.4 } },
                React.createElement("h2", { className: "text-3xl font-bold text-white mb-4" }, "The page has vanished into the digital universe."),
                React.createElement("p", { className: "text-gray-400 text-lg mb-8" }, "The page you're looking for has been lost in the void.")),
            React.createElement(framer_motion_1.motion.div, { initial: { scale: 0.9, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { delay: 0.6 } },
                React.createElement(link_1["default"], { href: "/main", className: "inline-flex items-center px-8 py-4 bg-blue-800 rounded-2xl font-semibold text-white hover:bg-blue-700 transition-all duration-300" }, "Return Home")))));
}
exports["default"] = NotFound;
