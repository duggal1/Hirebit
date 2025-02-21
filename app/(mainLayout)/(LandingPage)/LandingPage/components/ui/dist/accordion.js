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
exports.AccordionContent = exports.AccordionTrigger = exports.AccordionItem = exports.Accordion = void 0;
var React = require("react");
var AccordionPrimitive = require("@radix-ui/react-accordion");
var lucide_react_1 = require("lucide-react");
var functions_1 = require("@/app/(mainLayout)/(LandingPage)/LandingPage/functions");
var Accordion = AccordionPrimitive.Root;
exports.Accordion = Accordion;
var AccordionItem = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (React.createElement(AccordionPrimitive.Item, __assign({ ref: ref, className: functions_1.cn("border-b", className) }, props)));
});
exports.AccordionItem = AccordionItem;
AccordionItem.displayName = "AccordionItem";
var AccordionTrigger = React.forwardRef(function (_a, ref) {
    var className = _a.className, children = _a.children, props = __rest(_a, ["className", "children"]);
    return (React.createElement(AccordionPrimitive.Header, { className: "flex" },
        React.createElement(AccordionPrimitive.Trigger, __assign({ ref: ref, className: functions_1.cn("flex flex-1 items-center justify-between py-4 font-medium transition-all hover:bg-muted/20 rounded-md [&[data-state=open]>svg]:rotate-180", className) }, props),
            children,
            React.createElement(lucide_react_1.ChevronDown, { className: "h-4 w-4 shrink-0 transition-transform duration-200" }))));
});
exports.AccordionTrigger = AccordionTrigger;
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;
var AccordionContent = React.forwardRef(function (_a, ref) {
    var className = _a.className, children = _a.children, props = __rest(_a, ["className", "children"]);
    return (React.createElement(AccordionPrimitive.Content, __assign({ ref: ref, className: "overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down" }, props),
        React.createElement("div", { className: functions_1.cn("pb-4 pt-0", className) }, children)));
});
exports.AccordionContent = AccordionContent;
AccordionContent.displayName = AccordionPrimitive.Content.displayName;
