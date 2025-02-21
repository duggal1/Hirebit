"use strict";
exports.__esModule = true;
var react_1 = require("react");
var functions_1 = require("@/app/(mainLayout)/(LandingPage)/LandingPage/functions");
var MenuIcon = function (_a) {
    var isOpen = _a.isOpen, onClick = _a.onClick;
    return (react_1["default"].createElement("button", { onClick: onClick, className: functions_1.cn("relative z-40 w-8 h-8 p-2 flex flex-col justify-center gap-1.5 hover:bg-muted rounded-md items-center lg:hidden", "focus:outline-none") },
        react_1["default"].createElement("span", { className: functions_1.cn("block w-4 h-[1.5px] bg-current rounded-full origin-center transform transition-transform duration-300 ease-in-out", isOpen ? "rotate-45" : "rotate-0") }),
        react_1["default"].createElement("span", { className: functions_1.cn("block w-4 h-[1.5px] bg-current rounded-full origin-center transform transition-transform duration-300 ease-in-out", isOpen ? "-rotate-45" : "rotate-0") })));
};
exports["default"] = MenuIcon;
