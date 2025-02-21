"use strict";
exports.__esModule = true;
exports.jobListingDurationPricing = exports.PRICING = void 0;
exports.PRICING = {
    BASE_MONTHLY_PRICE: 49.99,
    TAX_RATE: 0.1,
    DURATIONS: {
        '6': {
            days: 180,
            price: 249.00,
            description: "Maximum exposure",
            discount: 0.17,
            savings: "Save 17%"
        },
        '3': {
            days: 90,
            price: 129.00,
            description: "Extended visibility",
            discount: 0.14,
            savings: "Save 14%"
        },
        '1': {
            days: 30,
            price: 49.99,
            description: "Standard listing",
            discount: 0,
            savings: null
        }
    }
};
exports.jobListingDurationPricing = Object.entries(exports.PRICING.DURATIONS).map(function (_a) {
    var key = _a[0], value = _a[1];
    return ({
        days: value.days,
        price: value.price,
        description: value.description,
        savings: value.savings
    });
});
