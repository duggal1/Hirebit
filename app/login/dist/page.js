"use strict";
exports.__esModule = true;
var LoginForm_1 = require("@/components/forms/LoginForm");
var link_1 = require("next/link");
var react_1 = require("react");
var logo_png_1 = require("@/public/logo.png");
var image_1 = require("next/image");
var LoginPage = function () {
    return (react_1["default"].createElement("div", { className: "min-h-screen w-screen flex items-center justify-center" },
        react_1["default"].createElement("div", { className: "flex w-full max-w-sm flex-col gap-6" },
            react_1["default"].createElement(link_1["default"], { href: "/", className: "flex flex-col justify-center items-center" },
                react_1["default"].createElement(image_1["default"], { src: logo_png_1["default"], alt: "Logo", className: "h-20 w-20" })),
            react_1["default"].createElement("div", { className: "flex flex-col  justify-center items-center" },
                react_1["default"].createElement("div", { className: "text-5xl  text-white font-black" },
                    "Hire",
                    react_1["default"].createElement("span", { className: "text-blue-600" }, "bit"))),
            react_1["default"].createElement(LoginForm_1.LoginForm, null))));
};
exports["default"] = LoginPage;
