"use strict";
exports.__esModule = true;
var container_1 = require("../global/container");
var dashboard2_png_1 = require("@/public/images/dashboard2.png");
var image_1 = require("next/image");
var particles_1 = require("../ui/particles");
var section_bade_1 = require("../ui/section-bade");
var Connect = function () {
    return (React.createElement("div", { className: "flex flex-col items-center justify-center py-8 md:py-12 w-full relative" },
        React.createElement("div", { className: "absolute inset-0 bg-transparent" }),
        React.createElement(container_1["default"], { delay: 0.0, duration: 0.8, reverse: false, simple: false },
            React.createElement("div", { className: "flex flex-col items-center text-center max-w-2xl mx-auto relative z-10" },
                React.createElement(section_bade_1.SectionBadge, { title: "Top Quality Jobs" }),
                React.createElement("h2", { className: "text-3xl md:text-4xl lg:text-5xl font-black  !leading-snug mt-6 bg-gradient-to-r from-blue-600 via-violet-600 to-blue-600 bg-clip-text text-transparent" }, "Get the Most Highest Quality of Job by Our Top Company"),
                React.createElement("p", { className: "text-base md:text-lg text-center text-accent-foreground/80 mt-6" }, "Find the best job opportunities with top companies. Enjoy features like qualified candidates, triple verification, no bots, and personalized AI candidate matching tailored to your job posts."))),
        React.createElement(container_1["default"], null,
            React.createElement("div", { className: "w-full relative mt-12" },
                React.createElement(image_1["default"], { src: dashboard2_png_1["default"], alt: "Logo", className: "h-100 w-100" }),
                React.createElement(particles_1.Particles, { className: "absolute inset-0", quantity: 150, ease: 80, color: "#e4e4e7", refresh: true })))));
};
exports["default"] = Connect;
