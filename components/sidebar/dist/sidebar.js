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
// Update getMenuItems to use proper types
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
    // Always call useQuery, but disable it if there's no userId yet
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
    }), company = _d.data, isCompanyLoading = _d.isLoading, companyError = _d.error;
    // Consolidate loading state checks after all hooks are called
    if (status === "loading" || isCompanyLoading) {
        return React.createElement("div", { className: "p-4 text-white" }, "Loading...");
    }
    // Check if company data is available and there was no error
    if (!company || companyError) {
        return (React.createElement("div", { className: "p-4 text-white" }, "Please complete your company profile to access the dashboard."));
    }
    var companyID = company.companyID;
    var menuItems = getMenuItems(userId, companyID);
    return (React.createElement(framer_motion_1.motion.div, { initial: false, animate: {
            width: isExpanded ? 320 : 80,
            transition: {
                duration: 0.5,
                type: "spring",
                stiffness: 200,
                damping: 25
            }
        }, className: "fixed left-0 top-0 h-screen bg-black overflow-hidden" },
        React.createElement("div", { className: "absolute inset-0" },
            React.createElement("div", { className: "absolute inset-0 bg-gradient-to-b from-violet-500/10 via-transparent to-blue-500/10" }),
            React.createElement("div", { className: "absolute h-full w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-500/10 via-transparent to-transparent" }),
            React.createElement(framer_motion_1.motion.div, { className: "absolute -left-32 top-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl", animate: {
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.3, 0.2]
                }, transition: {
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                } }),
            React.createElement(framer_motion_1.motion.div, { className: "absolute -right-32 bottom-20 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl", animate: {
                    scale: [1.2, 1, 1.2],
                    opacity: [0.3, 0.2, 0.3]
                }, transition: {
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                } })),
        React.createElement("div", { className: "absolute inset-0 border-r border-white/5" },
            React.createElement("div", { className: "absolute inset-0 bg-gradient-to-b from-white/5 via-white/0 to-white/5" })),
        React.createElement(framer_motion_1.motion.button, { onClick: function () { return setIsExpanded(!isExpanded); }, className: "absolute top-6 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors z-50", whileHover: { scale: 1.1 }, whileTap: { scale: 0.9 } },
            React.createElement(framer_motion_1.motion.div, { animate: { rotate: isExpanded ? 180 : 0 }, transition: { duration: 0.4, ease: "anticipate" } },
                React.createElement(lucide_react_1.Menu, { className: "w-5 h-5 text-zinc-400" }))),
        React.createElement("div", { className: "relative p-6" },
            React.createElement("div", { className: "flex items-center gap-4" },
                React.createElement(framer_motion_1.motion.div, { className: "relative w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 p-0.5", whileHover: { scale: 1.05 } },
                    React.createElement("div", { className: "absolute inset-0 bg-black/50 rounded-xl blur-sm" }),
                    React.createElement("div", { className: "relative h-full w-full bg-zinc-900/90 rounded-[10px] flex items-center justify-center" },
                        React.createElement("span", { className: "text-white text-xl font-bold" }, "H"))),
                React.createElement(framer_motion_1.AnimatePresence, null, isExpanded && (React.createElement(framer_motion_1.motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 }, transition: { duration: 0.3, ease: "easeOut" }, className: "flex flex-col" },
                    React.createElement(framer_motion_1.motion.span, { className: "text-2xl font-bold bg-gradient-to-r from-white via-white to-zinc-400 bg-clip-text text-transparent", initial: { y: -10, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { delay: 0.1 } }, "HireBit"),
                    React.createElement(framer_motion_1.motion.span, { className: "text-xs text-zinc-500", initial: { y: -10, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { delay: 0.2 } }, "Recruitment Suite")))))),
        React.createElement("nav", { className: "relative px-3 py-6" }, menuItems.map(function (item, index) {
            var isActive = pathname === item.link;
            var isHovered = hoveredItem === item.id;
            var Icon = item.icon;
            return (React.createElement(link_1["default"], { href: item.link, key: item.id },
                React.createElement(framer_motion_1.motion.div, { onHoverStart: function () { return setHoveredItem(item.id); }, onHoverEnd: function () { return setHoveredItem(null); }, initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: index * 0.1 }, className: "\n                  relative group flex items-center gap-4 px-4 py-4 mb-2\n                  rounded-xl cursor-pointer\n                  " + (isActive ? "text-white" : "text-zinc-400 hover:text-white") + "\n                " },
                    React.createElement(framer_motion_1.AnimatePresence, null, (isHovered || isActive) && (React.createElement(framer_motion_1.motion.div, { layoutId: "hoverBackground", initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "absolute inset-0 rounded-xl" },
                        React.createElement("div", { className: "absolute inset-0 rounded-xl bg-gradient-to-r from-violet-500/20 via-blue-500/20 to-fuchsia-500/20" }),
                        React.createElement("div", { className: "absolute inset-0 rounded-xl bg-black/20 backdrop-blur-sm" })))),
                    React.createElement(framer_motion_1.motion.div, { whileHover: { scale: 1.1, rotate: 5 }, transition: { type: "spring", stiffness: 400, damping: 17 }, className: "relative z-10" },
                        React.createElement("div", { className: "\n                    p-2 rounded-lg transition-colors duration-300\n                    " + (isActive ? "bg-gradient-to-br from-violet-500/80 to-blue-500/80 shadow-lg" : "bg-white/5") + "\n                  " },
                            React.createElement(Icon, { className: "w-5 h-5" }))),
                    React.createElement(framer_motion_1.AnimatePresence, null, isExpanded && (React.createElement(framer_motion_1.motion.span, { initial: { opacity: 0, x: -10 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -10 }, className: "relative z-10 text-sm font-medium tracking-wide" }, item.label))),
                    isActive && (React.createElement(framer_motion_1.motion.div, { layoutId: "activeIndicator", className: "absolute left-0 w-1 h-full bg-gradient-to-b from-violet-500 via-blue-500 to-fuchsia-500 rounded-full", initial: false, transition: { type: "spring", stiffness: 300, damping: 30 } })),
                    React.createElement(framer_motion_1.AnimatePresence, null, isHovered && isExpanded && (React.createElement(framer_motion_1.motion.div, { initial: { opacity: 0, x: -10 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -10 }, transition: { duration: 0.2 }, className: "ml-auto relative z-10" },
                        React.createElement(lucide_react_1.ChevronRight, { className: "w-4 h-4" })))))));
        })),
        React.createElement("div", { className: "absolute bottom-0 left-0 right-0" },
            React.createElement("div", { className: "h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" }),
            React.createElement("div", { className: "h-48 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" }))));
}
exports["default"] = Sidebar;
