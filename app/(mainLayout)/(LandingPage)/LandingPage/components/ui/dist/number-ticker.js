"use client";
"use strict";
exports.__esModule = true;
var react_1 = require("react");
var framer_motion_1 = require("framer-motion");
var functions_1 = require("@/app/(mainLayout)/(LandingPage)/LandingPage/functions");
function NumberTicker(_a) {
    var value = _a.value, _b = _a.direction, direction = _b === void 0 ? "up" : _b, _c = _a.delay, delay = _c === void 0 ? 0 : _c, className = _a.className;
    var ref = react_1.useRef(null);
    var motionValue = framer_motion_1.useMotionValue(direction === "down" ? value : 0);
    var springValue = framer_motion_1.useSpring(motionValue, {
        // damping: 50,
        // stiffness: 80,
        bounce: 0.15
    });
    var isInView = framer_motion_1.useInView(ref, { once: true, margin: "0px" });
    react_1.useEffect(function () {
        isInView &&
            setTimeout(function () {
                motionValue.set(direction === "down" ? 0 : value);
            }, delay * 500);
    }, [motionValue, isInView, delay, value, direction]);
    react_1.useEffect(function () {
        return springValue.on("change", function (latest) {
            if (ref.current) {
                ref.current.textContent = Intl.NumberFormat("en-US").format(Number(latest.toFixed(0)));
            }
        });
    }, [springValue]);
    return (React.createElement("span", { className: functions_1.cn("inline-block font-default text-inherit tracking-wider", className), ref: ref }));
}
exports["default"] = NumberTicker;
;
