"use client";
"use strict";
exports.__esModule = true;
var framer_motion_1 = require("framer-motion");
var functions_1 = require("../../functions");
var Container = function (_a) {
    var children = _a.children, className = _a.className, _b = _a.delay, delay = _b === void 0 ? 0.15 : _b, // Reduced delay for smoother start
    reverse = _a.reverse, simple = _a.simple, _c = _a.duration // Increased duration for smoother animation
    , duration = _c === void 0 ? 1.2 : _c // Increased duration for smoother animation
    ;
    // Enhanced spring settings for scrolling
    var scrollYProgress = framer_motion_1.useScroll().scrollYProgress;
    var scaleX = framer_motion_1.useSpring(scrollYProgress, {
        stiffness: 70,
        damping: 20,
        restDelta: 0.0001 // Smaller restDelta for more precise stopping
    });
    return (React.createElement(framer_motion_1.motion.div, { className: functions_1.cn("w-full h-full", className), initial: {
            opacity: 0,
            y: reverse ? -15 : 15,
            scale: 0.98 // Closer to 1 for subtler scale effect
        }, whileInView: {
            opacity: 1,
            y: 0,
            scale: 1
        }, viewport: {
            once: false,
            margin: "-10%",
            amount: 0.2 // Reduced amount for earlier triggering
        }, transition: {
            delay: delay,
            duration: simple ? 0.6 : duration,
            type: "spring",
            stiffness: simple ? 80 : 50,
            damping: simple ? 15 : 12,
            mass: simple ? 0.8 : 1,
            restDelta: 0.0001,
            restSpeed: 0.0001,
            bounce: 0.1 // Added slight bounce for natural feel
        }, style: {
            willChange: "transform, opacity",
            backfaceVisibility: "hidden",
            WebkitFontSmoothing: "subpixel-antialiased",
            perspective: 2000,
            transformStyle: "preserve-3d",
            touchAction: "pan-x pan-y"
        } }, children));
};
exports["default"] = Container;
