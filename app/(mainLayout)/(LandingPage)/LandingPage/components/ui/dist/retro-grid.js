"use strict";
exports.__esModule = true;
var functions_1 = require("@/app/(mainLayout)/(LandingPage)/LandingPage/functions");
function RetroGrid(_a) {
    var className = _a.className, _b = _a.angle, angle = _b === void 0 ? 65 : _b;
    return (React.createElement("div", { className: functions_1.cn("pointer-events-none absolute size-full overflow-hidden opacity-50 [perspective:200px]", className), style: { "--grid-angle": angle + "deg" } },
        React.createElement("div", { className: "absolute inset-0 [transform:rotateX(var(--grid-angle))]" },
            React.createElement("div", { className: functions_1.cn("animate-grid", "[background-repeat:repeat] [background-size:60px_60px] [height:300vh] [inset:0%_0px] [margin-left:-50%] [transform-origin:100%_0_0] [width:600vw]", 
                // Light Styles
                // "[background-image:linear-gradient(to_right,rgba(0,0,0,0.3)_1px,transparent_0),linear-gradient(to_bottom,rgba(0,0,0,0.3)_1px,transparent_0)]",
                // Dark styles
                "[background-image:linear-gradient(to_right,rgba(255,255,255,0.3)_1px,transparent_0),linear-gradient(to_bottom,rgba(255,255,255,0.3)_1px,transparent_0)]") })),
        React.createElement("div", { className: "absolute inset-0 bg-gradient-to-t from-background to-transparent to-90%" })));
}
exports["default"] = RetroGrid;
;
