"use strict";
exports.__esModule = true;
var constants_1 = require("@/app/(mainLayout)/(LandingPage)/LandingPage/constants");
var link_1 = require("next/link");
var container_1 = require("../global/container");
var icons_1 = require("../global/icons");
var wrapper_1 = require("../global/wrapper");
var button_1 = require("../ui/button");
var particles_1 = require("../ui/particles");
var Footer = function () {
    return (React.createElement("footer", { className: "w-full py-10 relative" },
        React.createElement(container_1["default"], null,
            React.createElement(wrapper_1["default"], { className: "relative flex flex-col md:flex-row justify-between pb-40 overflow-hidden footer" },
                React.createElement(particles_1.Particles, { className: "absolute inset-0 w-full -z-10", quantity: 40, ease: 10, color: "#d4d4d8", refresh: true }),
                React.createElement("div", { className: "flex flex-col items-start max-w-48" },
                    React.createElement("div", { className: "flex items-center gap-2" },
                        React.createElement(icons_1["default"].icon, { className: "w-5 h-5" }),
                        React.createElement("span", { className: "text-xl font-medium" }, "Luro")),
                    React.createElement("p", { className: "text-base max-w mt-4" }, "Empower your business with our AI tools."),
                    React.createElement(button_1.Button, { className: "mt-8" },
                        React.createElement(link_1["default"], { href: "/app" }, "Start for free"))),
                React.createElement("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-lg mt-10 md:mt-0" }, constants_1.FOOTER_LINKS === null || constants_1.FOOTER_LINKS === void 0 ? void 0 : constants_1.FOOTER_LINKS.map(function (section, index) { return (React.createElement("div", { key: index, className: "flex flex-col gap-4" },
                    React.createElement("h4", { className: "text-sm font-medium" }, section.title),
                    React.createElement("ul", { className: "space-y-4 w-full" }, section.links.map(function (link, index) { return (React.createElement("li", { key: index, className: "text-sm text-muted-foreground hover:text-foreground transition-all w-full" },
                        React.createElement(link_1["default"], { href: link.href, className: "w-full" }, link.name))); })))); })))),
        React.createElement(container_1["default"], null,
            React.createElement(wrapper_1["default"], { className: "pt-10 flex items-center justify-between relative" },
                React.createElement("p", { className: "text-sm text-secondary-foreground" },
                    "\u00A9 ",
                    new Date().getFullYear(),
                    " Luro. All rights reserved."),
                React.createElement("div", { className: "flex items-center gap-4" },
                    React.createElement(link_1["default"], { href: "#", className: "p-1" },
                        React.createElement(icons_1["default"].instagram, { className: "w-5 h-5 text-muted-foreground hover:text-secondary-foreground" })),
                    React.createElement(link_1["default"], { href: "#", className: "p-1" },
                        React.createElement(icons_1["default"].twitter, { className: "w-5 h-5 text-muted-foreground hover:text-secondary-foreground" })),
                    React.createElement(link_1["default"], { href: "#", className: "p-1" },
                        React.createElement(icons_1["default"].discord, { className: "w-5 h-5 text-muted-foreground hover:text-secondary-foreground" })))))));
};
exports["default"] = Footer;
