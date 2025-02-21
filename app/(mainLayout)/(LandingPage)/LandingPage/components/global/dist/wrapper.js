"use strict";
exports.__esModule = true;
var react_1 = require("react");
var functions_1 = require("@/app/(mainLayout)/(LandingPage)/LandingPage/functions");
var Wrapper = function (_a) {
    var children = _a.children, className = _a.className;
    return (react_1["default"].createElement("div", { className: functions_1.cn("size-full mx-auto max-w-6xl px-4 md:px-12", className) }, children));
};
exports["default"] = Wrapper;
