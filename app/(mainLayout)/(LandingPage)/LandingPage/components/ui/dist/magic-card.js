"use client";
"use strict";
exports.__esModule = true;
var react_1 = require("react");
var particles_1 = require("../ui/particles");
function MagicCard(_a) {
    var children = _a.children, _b = _a.particles, particles = _b === void 0 ? false : _b, _c = _a.count, count = _c === void 0 ? 20 : _c;
    var onMouseMove = function (e) {
        var currentTarget = e.currentTarget;
        var rect = currentTarget.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        currentTarget.style.setProperty('--pos-x', x + "px");
        currentTarget.style.setProperty('--pos-y', y + "px");
    };
    return (react_1["default"].createElement("div", { className: "card rounded-xl lg:rounded-2xl overflow-hidden", onMouseMove: onMouseMove },
        react_1["default"].createElement("div", { className: "content" },
            particles && (react_1["default"].createElement(particles_1.Particles, { className: "absolute inset-0 w-full h-full z-10", quantity: count, ease: 80, color: "#d4d4d8", refresh: true })),
            children)));
}
exports["default"] = MagicCard;
;
