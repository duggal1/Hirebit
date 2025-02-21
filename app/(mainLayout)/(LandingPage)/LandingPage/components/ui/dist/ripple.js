"use strict";
exports.__esModule = true;
exports.Ripple = void 0;
var react_1 = require("react");
exports.Ripple = react_1["default"].memo(function Ripple(_a) {
    var _b = _a.mainCircleSize, mainCircleSize = _b === void 0 ? 210 : _b, _c = _a.mainCircleOpacity, mainCircleOpacity = _c === void 0 ? 0.24 : _c, _d = _a.numCircles, numCircles = _d === void 0 ? 8 : _d;
    return (react_1["default"].createElement("div", { className: "absolute inset-0 flex items-center justify-center [mask-image:linear-gradient(to_bottom,#007BFF,transparent)]" }, Array.from({ length: numCircles }, function (_, i) {
        var size = mainCircleSize + i * 70;
        var opacity = Math.max(0, mainCircleOpacity - i * 0.03);
        var animationDelay = i * 0.06 + "s";
        var borderStyle = i === numCircles - 1 ? "dashed" : "solid";
        // Use the same dynamic opacity for the border color
        var borderAlpha = opacity;
        return (react_1["default"].createElement("div", { key: i, className: "absolute animate-ripple rounded-full shadow-xl border [--i:" + i + "] bg-blue-500/15", style: {
                width: size + "px",
                height: size + "px",
                opacity: opacity,
                animationDelay: animationDelay,
                borderStyle: borderStyle,
                borderWidth: "2px",
                borderColor: "rgba(0, 123, 255, " + borderAlpha + ")",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%) scale(1)"
            } }));
    })));
});
exports.Ripple.displayName = "Ripple";
