"use client";
"use strict";
exports.__esModule = true;
exports.GeometricBackground = void 0;
var framer_motion_1 = require("framer-motion");
var utils_1 = require("@/lib/utils");
function ElegantShape(_a) {
    var className = _a.className, _b = _a.delay, delay = _b === void 0 ? 0 : _b, _c = _a.width, width = _c === void 0 ? 400 : _c, _d = _a.height, height = _d === void 0 ? 100 : _d, _e = _a.rotate, rotate = _e === void 0 ? 0 : _e, _f = _a.gradient, gradient = _f === void 0 ? "from-white/[0.08]" : _f;
    return (React.createElement(framer_motion_1.motion.div, { initial: {
            opacity: 0,
            y: -150,
            rotate: rotate - 15
        }, animate: {
            opacity: 1,
            y: 0,
            rotate: rotate
        }, transition: {
            duration: 2.4,
            delay: delay,
            ease: [0.23, 0.86, 0.39, 0.96],
            opacity: { duration: 1.2 }
        }, className: utils_1.cn("absolute", className) },
        React.createElement(framer_motion_1.motion.div, { animate: {
                y: [0, 15, 0]
            }, transition: {
                duration: 12,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut"
            }, style: {
                width: width,
                height: height
            }, className: "relative" },
            React.createElement("div", { className: utils_1.cn("absolute inset-0 rounded-full", "bg-gradient-to-r to-transparent", gradient, "backdrop-blur-[2px] border-2 border-white/[0.15]", "shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]", "after:absolute after:inset-0 after:rounded-full", "after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]") }))));
}
function GeometricBackground() {
    return (React.createElement("div", { className: "relative min-h-screen w-full overflow-hidden bg-[#030303]" },
        React.createElement("div", { className: "absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl" }),
        React.createElement("div", { className: "absolute inset-0 overflow-hidden" },
            React.createElement(ElegantShape, { delay: 0.3, width: 600, height: 140, rotate: 12, gradient: "from-indigo-500/[0.15]", className: "left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]" }),
            React.createElement(ElegantShape, { delay: 0.5, width: 500, height: 120, rotate: -15, gradient: "from-rose-500/[0.15]", className: "right-[-5%] md:right-[0%] top-[70%] md:top-[75%]" }),
            React.createElement(ElegantShape, { delay: 0.4, width: 300, height: 80, rotate: -8, gradient: "from-violet-500/[0.15]", className: "left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]" }),
            React.createElement(ElegantShape, { delay: 0.6, width: 200, height: 60, rotate: 20, gradient: "from-amber-500/[0.15]", className: "right-[15%] md:right-[20%] top-[10%] md:top-[15%]" }),
            React.createElement(ElegantShape, { delay: 0.7, width: 150, height: 40, rotate: -25, gradient: "from-cyan-500/[0.15]", className: "left-[20%] md:left-[25%] top-[5%] md:top-[10%]" })),
        React.createElement("div", { className: "absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/80 pointer-events-none" })));
}
exports.GeometricBackground = GeometricBackground;
