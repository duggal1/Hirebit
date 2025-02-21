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
exports.InputOTPSeparator = exports.InputOTPSlot = exports.InputOTPGroup = exports.InputOTP = void 0;
var React = require("react");
var input_otp_1 = require("input-otp");
var lucide_react_1 = require("lucide-react");
var functions_1 = require("@/app/(mainLayout)/(LandingPage)/LandingPage/functions");
var InputOTP = React.forwardRef(function (_a, ref) {
    var className = _a.className, containerClassName = _a.containerClassName, props = __rest(_a, ["className", "containerClassName"]);
    return (React.createElement(input_otp_1.OTPInput, __assign({ ref: ref, containerClassName: functions_1.cn("flex items-center gap-2 has-[:disabled]:opacity-50", containerClassName), className: functions_1.cn("disabled:cursor-not-allowed", className) }, props)));
});
exports.InputOTP = InputOTP;
InputOTP.displayName = "InputOTP";
var InputOTPGroup = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (React.createElement("div", __assign({ ref: ref, className: functions_1.cn("flex items-center", className) }, props)));
});
exports.InputOTPGroup = InputOTPGroup;
InputOTPGroup.displayName = "InputOTPGroup";
var InputOTPSlot = React.forwardRef(function (_a, ref) {
    var index = _a.index, className = _a.className, props = __rest(_a, ["index", "className"]);
    var inputOTPContext = React.useContext(input_otp_1.OTPInputContext);
    var _b = inputOTPContext.slots[index], char = _b.char, hasFakeCaret = _b.hasFakeCaret, isActive = _b.isActive;
    return (React.createElement("div", __assign({ ref: ref, className: functions_1.cn("relative flex h-10 w-10 items-center justify-center border-y border-r border-input text-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md", isActive && "z-10 ring-2 ring-ring ring-offset-background", className) }, props),
        char,
        hasFakeCaret && (React.createElement("div", { className: "pointer-events-none absolute inset-0 flex items-center justify-center" },
            React.createElement("div", { className: "h-4 w-px animate-caret-blink bg-foreground duration-1000" })))));
});
exports.InputOTPSlot = InputOTPSlot;
InputOTPSlot.displayName = "InputOTPSlot";
var InputOTPSeparator = React.forwardRef(function (_a, ref) {
    var props = __rest(_a, []);
    return (React.createElement("div", __assign({ ref: ref, role: "separator" }, props),
        React.createElement(lucide_react_1.Dot, null)));
});
exports.InputOTPSeparator = InputOTPSeparator;
InputOTPSeparator.displayName = "InputOTPSeparator";
