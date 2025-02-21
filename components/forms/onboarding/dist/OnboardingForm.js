"use client";
"use strict";
exports.__esModule = true;
var card_1 = require("@/components/ui/card");
var react_1 = require("react");
var CompanyForm_1 = require("./CompanyForm");
var image_1 = require("next/image");
var logo_png_1 = require("@/public/logo.png");
var UserTypeSelection_1 = require("./UserTypeSelection");
var JobSeekerForm_1 = require("./JobSeekerForm");
function OnboardingForm() {
    var _a = react_1.useState(1), step = _a[0], setStep = _a[1];
    var _b = react_1.useState(null), userType = _b[0], setUserType = _b[1];
    var handleUserTypeSelect = function (type) {
        setUserType(type);
        setStep(2);
    };
    var renderStep = function () {
        switch (step) {
            case 1:
                return React.createElement(UserTypeSelection_1["default"], { onSelect: handleUserTypeSelect });
            case 2:
                return userType === "company" ? React.createElement(CompanyForm_1["default"], null) : React.createElement(JobSeekerForm_1["default"], null);
            default:
                return null;
        }
    };
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "flex items-center gap-3 mb-10" },
            React.createElement(image_1["default"], { src: logo_png_1["default"], alt: "JobMarshal Logo", width: 80, height: 80 }),
            React.createElement("div", { className: "text-6xl text-white font-black" },
                "Hire",
                React.createElement("span", { className: "text-blue-600" }, "bit"))),
        React.createElement(card_1.Card, { className: "w-full max-w-lg" },
            React.createElement(card_1.CardContent, { className: "p-6" }, renderStep()))));
}
exports["default"] = OnboardingForm;
