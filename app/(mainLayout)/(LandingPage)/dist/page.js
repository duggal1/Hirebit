"use strict";
exports.__esModule = true;
var components_1 = require("./LandingPage/components");
var spotlight_1 = require("./LandingPage/components/ui/spotlight");
var HomePage = function () {
    return (React.createElement(components_1.Background, null,
        React.createElement(components_1.Wrapper, { className: "py-20 relative" },
            React.createElement(components_1.Container, { className: "relative" },
                React.createElement(spotlight_1.Spotlight, { className: "-top-40 left-0 md:left-60 md:-top-20", fill: "rgba(0, 122, 255, 0.5)" // Modern blue tone
                 }),
                React.createElement(components_1.Hero, null)),
            React.createElement(components_1.Container, { className: "py-8 lg:py-20" },
                React.createElement(components_1.Companies, null)),
            React.createElement(components_1.Connect, null),
            React.createElement(components_1.Features, null),
            React.createElement(components_1.Perks, null),
            React.createElement(components_1.Pricing, null),
            React.createElement(components_1.Reviews, null),
            React.createElement(components_1.CTA, null))));
};
exports["default"] = HomePage;
