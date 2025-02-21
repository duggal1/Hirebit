"use strict";
exports.__esModule = true;
var functions_1 = require("@/app/(mainLayout)/(LandingPage)/LandingPage/functions");
var react_1 = require("react");
var LoadingIcon = function (_a) {
    var _b = _a.size, size = _b === void 0 ? "sm" : _b, className = _a.className;
    return (react_1["default"].createElement("div", { className: functions_1.cn("border-2 border-muted-foreground border-t-foreground rounded-full animate-loading", size === "sm" && "w-4 h-4", size === "md" && "w-6 h-6", size === "lg" && "w-8 h-8", className) }));
};
exports["default"] = LoadingIcon;
