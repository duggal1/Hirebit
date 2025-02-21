"use strict";
exports.__esModule = true;
exports.Spotlight = void 0;
var react_1 = require("react");
var functions_1 = require("@/app/(mainLayout)/(LandingPage)/LandingPage/functions");
exports.Spotlight = function (_a) {
    var className = _a.className, fill = _a.fill;
    return (react_1["default"].createElement("svg", { className: functions_1.cn("animate-spotlight pointer-events-none absolute z-[1]  h-[169%] w-[138%] lg:w-[84%] opacity-0", className), xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 3787 2842", fill: "none" },
        react_1["default"].createElement("g", { filter: "url(#filter)" },
            react_1["default"].createElement("ellipse", { cx: "1924.71", cy: "273.501", rx: "1924.71", ry: "273.501", transform: "matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)", fill: fill || "white", fillOpacity: "0.21" })),
        react_1["default"].createElement("defs", null,
            react_1["default"].createElement("filter", { id: "filter", x: "0.860352", y: "0.838989", width: "3785.16", height: "2840.26", filterUnits: "userSpaceOnUse", colorInterpolationFilters: "sRGB" },
                react_1["default"].createElement("feFlood", { floodOpacity: "0", result: "BackgroundImageFix" }),
                react_1["default"].createElement("feBlend", { mode: "normal", "in": "SourceGraphic", in2: "BackgroundImageFix", result: "shape" }),
                react_1["default"].createElement("feGaussianBlur", { stdDeviation: "151", result: "effect1_foregroundBlur_1065_8" })))));
};
