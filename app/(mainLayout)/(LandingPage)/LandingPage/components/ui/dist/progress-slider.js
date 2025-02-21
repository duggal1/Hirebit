'use client';
"use strict";
exports.__esModule = true;
var react_1 = require("react");
var image_1 = require("next/image");
var react_2 = require("@headlessui/react");
function ProgressSlider(_a) {
    var items = _a.items;
    var duration = 5000;
    var itemsRef = react_1.useRef(null);
    var frame = react_1.useRef(0);
    var firstFrameTime = react_1.useRef(performance.now());
    var _b = react_1.useState(0), active = _b[0], setActive = _b[1];
    var _c = react_1.useState(0), progress = _c[0], setProgress = _c[1];
    react_1.useEffect(function () {
        firstFrameTime.current = performance.now();
        frame.current = requestAnimationFrame(animate);
        return function () {
            cancelAnimationFrame(frame.current);
        };
    }, [active]);
    var animate = function (now) {
        var timeFraction = (now - firstFrameTime.current) / duration;
        if (timeFraction <= 1) {
            setProgress(timeFraction * 100);
            frame.current = requestAnimationFrame(animate);
        }
        else {
            timeFraction = 1;
            setProgress(0);
            setActive((active + 1) % items.length);
        }
    };
    var heightFix = function () {
        if (itemsRef.current && itemsRef.current.parentElement)
            itemsRef.current.parentElement.style.height = itemsRef.current.clientHeight + "px";
    };
    react_1.useEffect(function () {
        heightFix();
    }, []);
    return (React.createElement("div", { className: "w-full max-w-5xl mx-auto text-center" },
        React.createElement("div", { className: "transition-all duration-150 delay-300 ease-in-out" },
            React.createElement("div", { className: "relative flex flex-col", ref: itemsRef }, items.map(function (item, index) { return (React.createElement(react_2.Transition, { key: index, show: active === index, enter: "transition ease-in-out duration-500 delay-200 order-first", enterFrom: "opacity-0 scale-105", enterTo: "opacity-100 scale-100", leave: "transition ease-in-out duration-300 absolute", leaveFrom: "opacity-100 scale-100", leaveTo: "opacity-0 scale-95", beforeEnter: function () { return heightFix(); } },
                React.createElement(image_1["default"], { className: "rounded-xl", src: item.img, width: 1024, height: 576, alt: item.desc }))); }))),
        React.createElement("div", { className: "max-w-xs sm:max-w-sm md:max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mt-8" }, items.map(function (item, index) { return (React.createElement("button", { key: index, className: "p-2 rounded focus:outline-none focus-visible:ring focus-visible:ring-indigo-300 group", onClick: function () { setActive(index); setProgress(0); } },
            React.createElement("span", { className: "text-center flex flex-col items-center " + (active === index ? '' : 'opacity-50 group-hover:opacity-100 group-focus:opacity-100 transition-opacity') },
                React.createElement("span", { className: "flex items-center justify-center relative w-9 h-9 rounded-full bg-indigo-100 mb-2" },
                    React.createElement(image_1["default"], { src: item.buttonIcon, alt: item.desc })),
                React.createElement("span", { className: "block text-sm font-medium text-slate-900 mb-2" }, item.desc),
                React.createElement("span", { className: "block relative w-full bg-slate-200 h-1 rounded-full", role: "progressbar", "aria-valuenow": active === index ? progress : 0 },
                    React.createElement("span", { className: "absolute inset-0 bg-indigo-500 rounded-[inherit]", style: { width: active === index ? progress + "%" : '0%' } }))))); }))));
}
exports["default"] = ProgressSlider;
;
