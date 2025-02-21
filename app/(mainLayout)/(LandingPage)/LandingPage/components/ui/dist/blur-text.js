"use client";
"use strict";
exports.__esModule = true;
exports.BlurText = void 0;
var framer_motion_1 = require("framer-motion");
var functions_1 = require("@/app/(mainLayout)/(LandingPage)/LandingPage/functions");
exports.BlurText = function (_a) {
    var word = _a.word, className = _a.className, variant = _a.variant, _b = _a.duration, duration = _b === void 0 ? 1 : _b;
    var defaultVariants = {
        hidden: { filter: "blur(10px)", opacity: 0, y: -20 },
        visible: { filter: "blur(0px)", opacity: 1, y: 0 }
    };
    var combinedVariants = variant || defaultVariants;
    var renderWord = function () {
        if (typeof word === 'string') {
            return word.split('\n').map(function (line, index) { return (React.createElement("span", { key: index },
                line,
                index < word.split('\n').length - 1 && React.createElement("br", { className: "hidden md:block" }))); });
        }
        return word; // If it's JSX or ReactNode, render it directly
    };
    return (React.createElement(framer_motion_1.motion.h1, { initial: "hidden", animate: "visible", transition: { duration: duration }, variants: combinedVariants, className: functions_1.cn(className, "text-center tracking-[-0.02em] drop-shadow-sm") }, renderWord()));
};
