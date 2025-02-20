"use client";
"use strict";
exports.__esModule = true;
exports.SaveJobButton = exports.GeneralSubmitButton = void 0;
var react_dom_1 = require("react-dom");
var button_1 = require("../ui/button");
var lucide_react_1 = require("lucide-react");
function GeneralSubmitButton(_a) {
    var text = _a.text, icon = _a.icon, variant = _a.variant, _b = _a.width, width = _b === void 0 ? "w-full" : _b;
    var pending = react_dom_1.useFormStatus().pending;
    return (React.createElement(button_1.Button, { type: "submit", variant: variant, disabled: pending, className: width }, pending ? (React.createElement(React.Fragment, null,
        React.createElement(lucide_react_1.Loader2, { className: "w-4 h-4 animate-spin " }),
        React.createElement("span", null, "Submitting..."))) : (React.createElement(React.Fragment, null,
        icon && React.createElement("div", { className: "" }, icon),
        React.createElement("span", null, text)))));
}
exports.GeneralSubmitButton = GeneralSubmitButton;
function SaveJobButton(_a) {
    var savedJob = _a.savedJob;
    var pending = react_dom_1.useFormStatus().pending;
    return (React.createElement(button_1.Button, { variant: "outline", disabled: pending, type: "submit", className: "flex items-center gap-2" }, pending ? (React.createElement(React.Fragment, null,
        React.createElement(lucide_react_1.Loader2, { className: "h-4 w-4 animate-spin" }),
        React.createElement("span", null, "Saving..."))) : (React.createElement(React.Fragment, null,
        React.createElement(lucide_react_1.Heart, { className: "size-4 transition-colors " + (savedJob ? "fill-current text-red-500" : "") }),
        savedJob ? "Saved" : "Save Job"))));
}
exports.SaveJobButton = SaveJobButton;
