"use client";
"use strict";
exports.__esModule = true;
var framer_motion_1 = require("framer-motion");
var functions_1 = require("../../functions");
var Container = function (_a) {
    var children = _a.children, className = _a.className, _b = _a.delay, delay = _b === void 0 ? 0.05 : _b, // Even faster initial delay
    reverse = _a.reverse, simple = _a.simple, _c = _a.duration // Shorter duration for snappier feel
    , duration = _c === void 0 ? 0.6 : _c // Shorter duration for snappier feel
    ;
    var scrollYProgress = framer_motion_1.useScroll().scrollYProgress;
    var scaleX = framer_motion_1.useSpring(scrollYProgress, {
        stiffness: 35,
        damping: 12,
        mass: 0.05,
        restDelta: 0.000001 // Extremely precise stopping
    });
    return (React.createElement(framer_motion_1.motion.div, { className: functions_1.cn("w-full h-full", className), initial: {
            opacity: 0,
            y: reverse ? -6 : 6,
            scale: 0.998 // Nearly imperceptible scale
        }, whileInView: {
            opacity: 1,
            y: 0,
            scale: 1
        }, viewport: {
            once: false,
            margin: "-20%",
            amount: 0.05 // Ultra-responsive triggering
        }, transition: {
            delay: delay,
            duration: simple ? 0.3 : duration,
            type: "spring",
            stiffness: simple ? 45 : 35,
            damping: simple ? 10 : 8,
            mass: simple ? 0.1 : 0.05,
            restDelta: 0.000001,
            restSpeed: 0.000001,
            bounce: 0.02 // Minimal bounce for modern feel
        }, style: {
            willChange: "transform, opacity",
            backfaceVisibility: "hidden",
            WebkitFontSmoothing: "antialiased",
            perspective: 4000,
            transformStyle: "preserve-3d",
            touchAction: "pan-x pan-y",
            transform: "translate3d(0,0,0)",
            filter: "blur(0)",
            isolation: "isolate",
            contain: "paint layout",
            contentVisibility: "auto"
        } }, children));
};
exports["default"] = Container;
