"use client";
"use strict";
exports.__esModule = true;
var accordion_1 = require("@/app/(mainLayout)/(LandingPage)/LandingPage/components/ui/accordion");
var functions_1 = require("@/app/(mainLayout)/(LandingPage)/LandingPage/functions");
var hooks_1 = require("@/app/(mainLayout)/(LandingPage)/LandingPage/hooks");
var framer_motion_1 = require("framer-motion");
var lucide_react_1 = require("lucide-react");
var link_1 = require("next/link");
var react_1 = require("react");
var MobileMenu = function (_a) {
    var isOpen = _a.isOpen, setIsOpen = _a.setIsOpen;
    var ref = hooks_1.useClickOutside(function () { return setIsOpen(false); });
    var variants = {
        open: { opacity: 1, y: 20 },
        closed: { opacity: 0, y: 0 }
    };
    return (react_1["default"].createElement("div", { ref: ref, className: functions_1.cn("absolute top-12 inset-x-0 size-full p-4 z-20 bg-inherit flex flex-1", isOpen ? "flex" : "hidden") },
        react_1["default"].createElement(framer_motion_1.motion.div, { initial: "closed", animate: isOpen ? "open" : "closed", variants: variants, transition: {
                type: "spring",
                bounce: 0.15,
                duration: 0.5
            }, className: "size-full flex flex-col justify-start" },
            react_1["default"].createElement("ul", { className: "flex flex-col items-start flex-1 w-full space-y-3" },
                react_1["default"].createElement("li", { onClick: function () { return setIsOpen(false); }, className: "w-full px-4 py-2 text-lg hover:text-muted-foreground font-normal transition transform rounded-md cursor-pointer text-foreground text-start active:scale-95 hover:bg-muted/20 active:opacity-80" },
                    react_1["default"].createElement(link_1["default"], { href: "/how-it-works", className: "flex items-center w-full text-start" },
                        react_1["default"].createElement(lucide_react_1.UserCog, { className: "w-4 h-4 mr-2" }),
                        "How it works")),
                react_1["default"].createElement(accordion_1.Accordion, { type: "single", collapsible: true, className: "w-full" },
                    react_1["default"].createElement(accordion_1.AccordionItem, { value: "item-1", className: "border-transparent" },
                        react_1["default"].createElement(accordion_1.AccordionTrigger, { className: "px-4 py-2 text-lg hover:text-muted-foreground font-normal" },
                            react_1["default"].createElement("span", { className: "flex items-center" },
                                react_1["default"].createElement(lucide_react_1.CopyCheck, { className: "w-4 h-4 mr-2" }),
                                "Features")),
                        react_1["default"].createElement(accordion_1.AccordionContent, { onClick: function () { return setIsOpen(false); }, className: "flex flex-col items-start gap-1 mt-1" },
                            react_1["default"].createElement("li", { className: "w-full px-4 py-2 text-lg font-normal transition transform rounded-md cursor-pointer text-foreground/80 hover:text-muted-foreground text-start active:scale-95 hover:bg-muted/20 active:opacity-80" },
                                react_1["default"].createElement(link_1["default"], { href: "/", className: "flex items-center w-full text-start" },
                                    react_1["default"].createElement(lucide_react_1.Captions, { className: "w-4 h-4 mr-2" }),
                                    "Caption Generation")),
                            react_1["default"].createElement("li", { className: "w-full px-4 py-2 text-lg font-normal transition transform rounded-md cursor-pointer text-foreground/80 hover:text-muted-foreground text-start active:scale-95 hover:bg-muted/20 active:opacity-80" },
                                react_1["default"].createElement(link_1["default"], { href: "/", className: "flex items-center w-full text-start" },
                                    react_1["default"].createElement(lucide_react_1.CalendarClock, { className: "w-4 h-4 mr-2" }),
                                    "Post Scheduling")),
                            react_1["default"].createElement("li", { className: "w-full px-4 py-2 text-lg font-normal transition transform rounded-md cursor-pointer text-foreground/80 hover:text-muted-foreground text-start active:scale-95 hover:bg-muted/20 active:opacity-80" },
                                react_1["default"].createElement(link_1["default"], { href: "/", className: "flex items-center w-full text-start" },
                                    react_1["default"].createElement(lucide_react_1.LineChart, { className: "w-4 h-4 mr-2" }),
                                    "Analytics Dashboard"))))),
                react_1["default"].createElement("li", { onClick: function () { return setIsOpen(false); }, className: "w-full px-4 py-2 text-lg hover:text-muted-foreground font-normal transition transform rounded-md cursor-pointer text-foreground text-start active:scale-95 hover:bg-muted/20 active:opacity-80" },
                    react_1["default"].createElement(link_1["default"], { href: "/", className: "flex items-center w-full text-start" },
                        react_1["default"].createElement(lucide_react_1.Gem, { className: "w-4 h-4 mr-2" }),
                        "Pricing")),
                react_1["default"].createElement("li", { onClick: function () { return setIsOpen(false); }, className: "w-full px-4 py-2 text-lg hover:text-muted-foreground font-normal transition transform rounded-md cursor-pointer text-foreground text-start active:scale-95 hover:bg-muted/20 active:opacity-80" },
                    react_1["default"].createElement(link_1["default"], { href: "/", className: "flex items-center w-full text-start" },
                        react_1["default"].createElement(lucide_react_1.Waypoints, { className: "w-4 h-4 mr-2" }),
                        "Integrations")),
                react_1["default"].createElement(accordion_1.Accordion, { type: "single", collapsible: true, className: "w-full" },
                    react_1["default"].createElement(accordion_1.AccordionItem, { value: "item-1", className: "border-transparent" },
                        react_1["default"].createElement(accordion_1.AccordionTrigger, { className: "px-4 py-2 text-lg hover:text-muted-foreground font-normal" },
                            react_1["default"].createElement("span", { className: "flex items-center" },
                                react_1["default"].createElement(lucide_react_1.Layers3, { className: "w-4 h-4 mr-2" }),
                                "Resources")),
                        react_1["default"].createElement(accordion_1.AccordionContent, { onClick: function () { return setIsOpen(false); }, className: "flex flex-col items-start gap-1 mt-1" },
                            react_1["default"].createElement("li", { className: "w-full px-4 py-2 text-lg font-normal transition transform rounded-md cursor-pointer text-foreground/80 hover:text-muted-foreground text-start active:scale-95 hover:bg-muted/20 active:opacity-80" },
                                react_1["default"].createElement(link_1["default"], { href: "/", className: "flex items-center w-full text-start" },
                                    react_1["default"].createElement(lucide_react_1.Newspaper, { className: "w-4 h-4 mr-2" }),
                                    "Blog")),
                            react_1["default"].createElement("li", { className: "w-full px-4 py-2 text-lg font-normal transition transform rounded-md cursor-pointer text-foreground/80 hover:text-muted-foreground text-start active:scale-95 hover:bg-muted/20 active:opacity-80" },
                                react_1["default"].createElement(link_1["default"], { href: "/", className: "flex items-center w-full text-start" },
                                    react_1["default"].createElement(lucide_react_1.FileText, { className: "w-4 h-4 mr-2" }),
                                    "Case Studies")),
                            react_1["default"].createElement("li", { className: "w-full px-4 py-2 text-lg font-normal transition transform rounded-md cursor-pointer text-foreground/80 hover:text-muted-foreground text-start active:scale-95 hover:bg-muted/20 active:opacity-80" },
                                react_1["default"].createElement(link_1["default"], { href: "/", className: "flex items-center w-full text-start" },
                                    react_1["default"].createElement(lucide_react_1.Box, { className: "w-4 h-4 mr-2" }),
                                    "Tools")),
                            react_1["default"].createElement("li", { className: "w-full px-4 py-2 text-lg font-normal transition transform rounded-md cursor-pointer text-foreground/80 hover:text-muted-foreground text-start active:scale-95 hover:bg-muted/20 active:opacity-80" },
                                react_1["default"].createElement(link_1["default"], { href: "/", className: "flex items-center w-full text-start" },
                                    react_1["default"].createElement(lucide_react_1.CircleHelp, { className: "w-4 h-4 mr-2" }),
                                    "Support")))))))));
};
exports["default"] = MobileMenu;
