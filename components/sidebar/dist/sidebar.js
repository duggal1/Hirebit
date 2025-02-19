"use client";
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var framer_motion_1 = require("framer-motion");
var link_1 = require("next/link");
var navigation_1 = require("next/navigation");
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var react_2 = require("next-auth/react");
var react_query_1 = require("@tanstack/react-query");
var getMenuItems = function (userId, companyID) { return [
    {
        id: 1,
        label: "Dashboard",
        icon: lucide_react_1.LayoutDashboard,
        link: "/dashboard/" + (userId || "no-user") + "/" + (companyID || "no-company")
    },
    { id: 2, label: "Job Listings", icon: lucide_react_1.Briefcase, link: "/jobs" },
    { id: 3, label: "Applications", icon: lucide_react_1.FileText, link: "/applications" },
    { id: 4, label: "Interviews", icon: lucide_react_1.Video, link: "/interviews" },
    { id: 5, label: "Billing", icon: lucide_react_1.CreditCard, link: "/billing" },
    { id: 6, label: "Settings", icon: lucide_react_1.Settings, link: "/settings" },
]; };
function Sidebar() {
    var _this = this;
    var pathname = navigation_1.usePathname();
    var _a = react_1.useState(true), isExpanded = _a[0], setIsExpanded = _a[1];
    var _b = react_1.useState(null), hoveredItem = _b[0], setHoveredItem = _b[1];
    var _c = react_2.useSession(), session = _c.data, status = _c.status;
    var user = session === null || session === void 0 ? void 0 : session.user;
    var userId = user === null || user === void 0 ? void 0 : user.id;
    var _d = react_query_1.useQuery({
        queryKey: ["company", userId],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("/api/companys")];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error("Failed to fetch company");
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
        enabled: !!userId
    }), company = _d.data, isCompanyLoading = _d.isLoading;
    if (status === "loading" || isCompanyLoading) {
        return React.createElement("div", { className: "p-6 text-neutral-400" }, "Loading...");
    }
    if (!company) {
        return (React.createElement("div", { className: "p-6 text-neutral-400" }, "Please complete your company profile."));
    }
    var menuItems = getMenuItems(userId, company.companyID);
    return (React.createElement(framer_motion_1.motion.div, { initial: false, animate: {
            width: isExpanded ? 300 : 80,
            transition: { duration: 0.3, ease: "easeInOut" }
        }, className: "fixed left-0 top-0 h-screen bg-black/50 backdrop-blur-lg border-r border-neutral-800 shadow-2xl" },
        React.createElement("div", { className: "absolute inset-0 bg-gradient-to-b from-black/30 to-black/70" }),
        React.createElement(framer_motion_1.motion.button, { onClick: function () { return setIsExpanded(!isExpanded); }, className: "absolute top-6 right-3 p-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg hover:shadow-2xl transition-all z-50", whileHover: { scale: 1.1 }, whileTap: { scale: 0.95 } },
            React.createElement(framer_motion_1.motion.div, { animate: { rotate: isExpanded ? 180 : 0 }, transition: { duration: 0.3 } },
                React.createElement(lucide_react_1.Menu, { className: "w-5 h-5 text-white" }))),
        React.createElement("div", { className: "relative p-6" },
            React.createElement("div", { className: "flex items-center gap-4" },
                React.createElement(framer_motion_1.motion.div, { className: "relative w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl", whileHover: { scale: 1.1 } },
                    React.createElement("span", { className: "text-white text-xl font-bold" }, "H")),
                React.createElement(framer_motion_1.AnimatePresence, null, isExpanded && (React.createElement(framer_motion_1.motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 }, transition: { duration: 0.3 }, className: "flex flex-col" },
                    React.createElement("span", { className: "text-white text-lg font-semibold" }, "HireBit"),
                    React.createElement("span", { className: "text-sm text-gray-300" }, "Recruitment Suite")))))),
        React.createElement("nav", { className: "relative px-4 py-4 space-y-2" }, menuItems.map(function (item) {
            var isActive = pathname === item.link;
            var isHovered = hoveredItem === item.id;
            var Icon = item.icon;
            return (React.createElement(link_1["default"], { href: item.link, key: item.id },
                React.createElement(framer_motion_1.motion.div, { onHoverStart: function () { return setHoveredItem(item.id); }, onHoverEnd: function () { return setHoveredItem(null); }, className: "\n                  relative flex items-center gap-4 px-4 py-3 rounded-xl\n                  transition-colors duration-300 cursor-pointer\n                  " + (isActive ? "bg-blue-600/40 text-white" : "text-gray-300 hover:bg-white/10") + "\n                ", whileHover: { scale: 1.02 } },
                    React.createElement("div", { className: "relative" },
                        isActive && (React.createElement(framer_motion_1.motion.div, { layoutId: "activeIndicator", className: "absolute inset-0 bg-blue-500/30 rounded-xl blur-md" })),
                        React.createElement(framer_motion_1.motion.div, { whileHover: { rotate: 10 }, transition: { type: "spring", stiffness: 300 } },
                            React.createElement(Icon, { className: "w-6 h-6 relative z-10" }))),
                    React.createElement(framer_motion_1.AnimatePresence, null, isExpanded && (React.createElement(framer_motion_1.motion.span, { initial: { opacity: 0, x: -10 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -10 }, transition: { duration: 0.3 }, className: "text-base font-medium whitespace-nowrap" }, item.label))),
                    React.createElement(framer_motion_1.AnimatePresence, null, isHovered && isExpanded && (React.createElement(framer_motion_1.motion.div, { initial: { opacity: 0, x: -5 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -5 }, className: "ml-auto" },
                        React.createElement(lucide_react_1.ChevronRight, { className: "w-5 h-5 text-white/70" })))))));
        }))));
}
exports["default"] = Sidebar;
