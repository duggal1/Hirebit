"use strict";
exports.__esModule = true;
var images_1 = require("../global/images");
var marquee_1 = require("../ui/marquee");
var Companies = function () {
    return (React.createElement("div", { className: "flex w-full py-20" },
        React.createElement("div", { className: "flex flex-col items-center justify-center text-center w-full py-2" },
            React.createElement("h2", { className: "text-xl heading font-black text-blue-800" }, "Companies that trust us"),
            React.createElement("div", { className: "mt-16 w-full relative overflow-hidden" },
                React.createElement(marquee_1["default"], { pauseOnHover: true, className: "[--duration:30s]" },
                    React.createElement("div", { className: "flex gap-8 md:gap-12" },
                        React.createElement(images_1["default"].company1, { className: "w-24 h-8" }),
                        React.createElement(images_1["default"].company2, { className: "w-24 h-8" }),
                        React.createElement(images_1["default"].company3, { className: "w-24 h-8" }),
                        React.createElement(images_1["default"].company4, { className: "w-24 h-8" }),
                        React.createElement(images_1["default"].company5, { className: "w-24 h-8" }),
                        React.createElement(images_1["default"].company6, { className: "w-24 h-8" }),
                        React.createElement(images_1["default"].company7, { className: "w-24 h-8" }),
                        React.createElement(images_1["default"].company8, { className: "w-24 h-8" }),
                        React.createElement(images_1["default"].company9, { className: "w-24 h-8" }),
                        React.createElement(images_1["default"].company10, { className: "w-24 h-8" }))),
                React.createElement("div", { className: "pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background" }),
                React.createElement("div", { className: "pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background" })))));
};
exports["default"] = Companies;
