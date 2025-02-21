"use client";
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
exports.__esModule = true;
var navigation_menu_1 = require("@/app/(mainLayout)/(LandingPage)/LandingPage/components/ui/navigation-menu");
var lucide_react_1 = require("lucide-react");
var link_1 = require("next/link");
var react_1 = require("react");
var icons_1 = require("../global/icons");
var Menu = function () {
    return (react_1["default"].createElement(navigation_menu_1.NavigationMenu, null,
        react_1["default"].createElement(navigation_menu_1.NavigationMenuList, { className: "backdrop-blur-sm" },
            react_1["default"].createElement(navigation_menu_1.NavigationMenuItem, null,
                react_1["default"].createElement(link_1["default"], { href: "/how-it-works", legacyBehavior: true, passHref: true },
                    react_1["default"].createElement(navigation_menu_1.NavigationMenuLink, { className: "h-10 px-4 py-2 text-sm font-normal rounded-md text-muted-foreground hover:text-foreground w-max hover:bg-accent/20 transition-all duration-200" }, "How it works"))),
            react_1["default"].createElement(navigation_menu_1.NavigationMenuItem, null,
                react_1["default"].createElement(navigation_menu_1.NavigationMenuTrigger, { className: "text-muted-foreground hover:text-foreground" }, "Features"),
                react_1["default"].createElement(navigation_menu_1.NavigationMenuContent, null,
                    react_1["default"].createElement("ul", { className: "grid rounded-3xl gap-3 p-6 md:w-[400px] lg:w-[500px] xl:w-[550px] lg:grid-cols-[.75fr_1fr] bg-background/80 backdrop-blur-xl border border-border/10" },
                        react_1["default"].createElement("li", { className: "row-span-3" },
                            react_1["default"].createElement(navigation_menu_1.NavigationMenuLink, { asChild: true },
                                react_1["default"].createElement(link_1["default"], { href: "/", className: "flex flex-col justify-end w-full h-full p-6 no-underline rounded-2xl outline-none select-none bg-gradient-to-tr from-violet-500/20 to-blue-500/20 hover:from-violet-500/30 hover:to-blue-500/30 transition-all duration-300" },
                                    react_1["default"].createElement(icons_1["default"].icon, { className: "w-8 h-8 text-violet-500" }),
                                    react_1["default"].createElement("div", { className: "my-3 text-xl font-medium bg-gradient-to-r from-violet-500 to-blue-500 bg-clip-text text-transparent" }, "Hirebit"),
                                    react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, "Find pre-verified candidates faster")))),
                        react_1["default"].createElement(Item, { title: "Triple Verification", href: "/features/verification", icon: react_1["default"].createElement(lucide_react_1.ShieldCheckIcon, { className: "w-5 h-5 text-violet-500" }) }, "Every profile verified through resume, skills, and video checks"),
                        react_1["default"].createElement(Item, { title: "Smart Matching", href: "/features/matching", icon: react_1["default"].createElement(lucide_react_1.BrainCircuitIcon, { className: "w-5 h-5 text-blue-500" }) }, "AI matches candidates to your exact job requirements"),
                        react_1["default"].createElement(Item, { title: "Quality Candidates", href: "/features/quality", icon: react_1["default"].createElement(lucide_react_1.UserCheckIcon, { className: "w-5 h-5 text-green-500" }) }, "Access only serious, actively job-seeking professionals")))),
            react_1["default"].createElement("ul", { className: "grid w-[400px] gap-3 p-4 md:w-[400px] md:grid-cols-2 lg:w-[500px] xl:w-[500px]" },
                react_1["default"].createElement(Item, { title: "Blog", href: "/resources/blog", icon: react_1["default"].createElement(lucide_react_1.Newspaper, { className: "w-5 h-5" }) }, "Read our latest articles and updates."),
                react_1["default"].createElement(Item, { title: "Support", href: "/resources/support", icon: react_1["default"].createElement(lucide_react_1.CircleHelp, { className: "w-5 h-5" }) }, "Get help with any issues you may have.")))));
};
var Item = function (_a) {
    var title = _a.title, href = _a.href, children = _a.children, icon = _a.icon, props = __rest(_a, ["title", "href", "children", "icon"]);
    return (react_1["default"].createElement("li", null,
        react_1["default"].createElement(navigation_menu_1.NavigationMenuLink, { asChild: true },
            react_1["default"].createElement(link_1["default"], __assign({ passHref: true, href: href }, props, { className: "grid grid-cols-[.15fr_1fr] select-none space-y-1 rounded-xl p-4 leading-none no-underline outline-none transition-all duration-200 hover:bg-accent/20 hover:scale-[1.02] focus:bg-accent focus:text-accent-foreground group" }),
                react_1["default"].createElement("div", { className: "flex items-center mt-1 justify-center p-2 w-10 h-10 rounded-lg bg-background/50 backdrop-blur-sm border border-border/20" }, icon),
                react_1["default"].createElement("div", { className: "text-start ml-4" },
                    react_1["default"].createElement("span", { className: "text-sm font-medium group-hover:text-foreground leading-none" }, title),
                    react_1["default"].createElement("p", { className: "text-sm mt-1.5 line-clamp-2 text-muted-foreground/80" }, children))))));
};
Item.displayName = "Item";
exports["default"] = Menu;
