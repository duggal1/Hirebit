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
exports.buttonVariants = exports.Button = void 0;
var React = require("react");
var react_slot_1 = require("@radix-ui/react-slot");
var class_variance_authority_1 = require("class-variance-authority");
var functions_1 = require("@/app/(mainLayout)/(LandingPage)/LandingPage/functions");
var buttonVariants = class_variance_authority_1.cva("inline-flex items-center justify-center whitespace-nowrap rounded-md shadow-none text-sm font-medium ring-offset-background transition transform-gpu ease-in-out duration-300 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 active:scale-95 group select-none", {
    variants: {
        variant: {
            "default": "bg-primary text-primary-foreground hover:opacity-70 bt-primary",
            destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
            secondary: "text-primary bg-primary/10 hover:bg-primary/30",
            tertiary: "text-foreground bg-[#232323] hover:brightness-125",
            subtle: "border border-input bg-accent/20 hover:bg-white/10 hover:text-accent-foreground",
            ghost: "hover:bg-accent hover:text-accent-foreground",
            link: "text-primary underline-offset-4 hover:underline",
            white: "bg-foreground text-background hover:opacity-70"
        },
        size: {
            "default": "h-9 px-4 py-2",
            sm: "h-8 px-3",
            lg: "h-10 px-8",
            xl: "h-12 px-10",
            icon: "h-8 w-8",
            iconlg: "h-10 w-10"
        }
    },
    defaultVariants: {
        variant: "default",
        size: "default"
    }
});
exports.buttonVariants = buttonVariants;
var Button = React.forwardRef(function (_a, ref) {
    var iconl = _a.iconl, iconr = _a.iconr, className = _a.className, variant = _a.variant, size = _a.size, _b = _a.asChild, asChild = _b === void 0 ? false : _b, props = __rest(_a, ["iconl", "iconr", "className", "variant", "size", "asChild"]);
    var Comp = asChild ? react_slot_1.Slot : "button";
    return (React.createElement(Comp, __assign({ className: functions_1.cn(buttonVariants({ variant: variant, size: size, className: className })), ref: ref }, props)));
});
exports.Button = Button;
Button.displayName = "Button";
