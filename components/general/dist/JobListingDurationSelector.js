"use strict";
exports.__esModule = true;
exports.JobListingDurationSelector = void 0;
var React = require("react");
var card_1 = require("@/components/ui/card");
var label_1 = require("@/components/ui/label");
var radio_group_1 = require("@/components/ui/radio-group");
var form_1 = require("../ui/form");
var pricingTiers_1 = require("@/app/utils/pricingTiers");
var badge_1 = require("@/components/ui/badge");
function JobListingDurationSelector(_a) {
    var _b;
    var field = _a.field;
    return (React.createElement(form_1.FormControl, null,
        React.createElement(radio_group_1.RadioGroup, { value: (_b = field.value) === null || _b === void 0 ? void 0 : _b.toString(), onValueChange: function (value) { return field.onChange(parseInt(value)); } },
            React.createElement("div", { className: "grid gap-4" }, pricingTiers_1.jobListingDurationPricing.map(function (duration) { return (React.createElement("div", { key: duration.days, className: "relative" },
                React.createElement(radio_group_1.RadioGroupItem, { value: duration.days.toString(), id: duration.days.toString(), className: "peer sr-only" }),
                React.createElement(label_1.Label, { htmlFor: duration.days.toString(), className: "flex flex-col cursor-pointer" },
                    React.createElement(card_1.Card, { className: "p-4 border-2 transition-all " + (field.value === duration.days
                            ? "border-primary bg-primary/10"
                            : "hover:bg-secondary/50") },
                        React.createElement("div", { className: "flex justify-between items-center" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "font-semibold text-lg" },
                                    duration.days / 30,
                                    " ",
                                    duration.days / 30 === 1 ? 'Month' : 'Months'),
                                React.createElement("p", { className: "text-sm text-muted-foreground" }, duration.description),
                                duration.savings && (React.createElement(badge_1.Badge, { variant: "secondary", className: "mt-1" }, duration.savings))),
                            React.createElement("div", { className: "text-right" },
                                React.createElement("p", { className: "font-bold text-xl" },
                                    "$",
                                    duration.price.toFixed(2)),
                                React.createElement("p", { className: "text-sm text-muted-foreground" },
                                    "$",
                                    (duration.price / (duration.days / 30)).toFixed(2),
                                    "/month"))))))); })))));
}
exports.JobListingDurationSelector = JobListingDurationSelector;
