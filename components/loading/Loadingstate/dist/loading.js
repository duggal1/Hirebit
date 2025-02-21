"use strict";
exports.__esModule = true;
var react_1 = require("react");
var LoadingState = function () {
    return (react_1["default"].createElement("div", { className: "flex items-center justify-center space-x-2" },
        react_1["default"].createElement("div", { className: "w-3 h-3 bg-blue-600 rounded-full animate-bounce" }),
        react_1["default"].createElement("div", { className: "w-3 h-3 bg-pink-600 rounded-full animate-bounce delay-100" }),
        react_1["default"].createElement("div", { className: "w-3 h-3 bg-violet-600 rounded-full animate-bounce delay-200" })));
};
exports["default"] = LoadingState;
