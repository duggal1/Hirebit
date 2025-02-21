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
var react_1 = require("react");
var framer_motion_1 = require("framer-motion");
var link_1 = require("next/link");
var image_1 = require("next/image"); // Added Image import
var navigation_1 = require("next/navigation");
var react_2 = require("next-auth/react");
var react_query_1 = require("@tanstack/react-query");
var lucide_react_1 = require("lucide-react");
var loading_1 = require("../loading/Loadingstate/loading");
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
        return react_1["default"].createElement(loading_1["default"], null);
    }
    if (!company) {
        return null;
    }
    var menuItems = getMenuItems(userId, company.companyID);
    return (react_1["default"].createElement(framer_motion_1.motion.div, { initial: false, animate: {
            width: isExpanded ? 320 : 80,
            transition: { duration: 0.8, type: "spring", stiffness: 100 }
        }, className: "fixed left-0 top-0 h-screen z-50 overflow-hidden" },
        react_1["default"].createElement("div", { className: "absolute inset-0 bg-black/40 backdrop-blur-2xl" }),
        react_1["default"].createElement(framer_motion_1.motion.div, { animate: {
                background: [
                    "radial-gradient(circle at 0% 0%, rgba(29,78,216,0.15), transparent 50%)",
                    "radial-gradient(circle at 100% 100%, rgba(29,78,216,0.15), transparent 50%)",
                    "radial-gradient(circle at 0% 100%, rgba(29,78,216,0.15), transparent 50%)",
                    "radial-gradient(circle at 100% 0%, rgba(29,78,216,0.15), transparent 50%)",
                ]
            }, transition: {
                duration: 10,
                repeat: Infinity,
                repeatType: "reverse"
            }, className: "absolute inset-0 opacity-30" }),
        react_1["default"].createElement("div", { className: "absolute inset-0 opacity-[0.15] mix-blend-soft-light" },
            react_1["default"].createElement("div", { className: "absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4xNSIvPjwvc3ZnPg==')] animate-[noise_1s_infinite]" })),
        react_1["default"].createElement("div", { className: "absolute right-0 top-0 w-[1px] h-full bg-gradient-to-b from-white/5 via-white/10 to-white/5" }),
        react_1["default"].createElement(framer_motion_1.motion.button, { onClick: function () { return setIsExpanded(!isExpanded); }, className: "absolute top-6 -right-3 p-3 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.2)] z-50", whileHover: { scale: 1.1, x: -2 }, whileTap: { scale: 0.95 } },
            react_1["default"].createElement(framer_motion_1.motion.div, { animate: {
                    rotate: isExpanded ? 180 : 0,
                    scale: [1, 1.2, 1]
                }, transition: {
                    duration: 0.5,
                    scale: {
                        duration: 0.2,
                        times: [0, 0.5, 1]
                    }
                } },
                react_1["default"].createElement(lucide_react_1.Menu, { className: "w-4 h-4 text-white/80" }))),
        react_1["default"].createElement("div", { className: "relative p-6" },
            react_1["default"].createElement(framer_motion_1.motion.div, { className: "flex items-center gap-4", initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay: 0.2 } },
                react_1["default"].createElement(framer_motion_1.motion.div, { className: "relative w-12 h-12 rounded-full overflow-hidden", whileHover: { scale: 1.05 }, whileTap: { scale: 0.98 } },
                    react_1["default"].createElement("div", { className: "absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 animate-pulse" }),
                    react_1["default"].createElement("div", { className: "absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent rotate-180 animate-[spin_4s_linear_infinite]" }),
                    react_1["default"].createElement(framer_motion_1.motion.div, { className: "relative z-10 w-full h-full flex items-center justify-center bg-black/20 backdrop-blur-sm", initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.5 } },
                        react_1["default"].createElement(link_1["default"], { href: "/", className: "flex flex-col items-center gap-2 self-center" },
                            react_1["default"].createElement(image_1["default"], { src: "/logo.png", alt: "Logo", width: 150, height: 100, className: "h-30 w-30" })))),
                react_1["default"].createElement(framer_motion_1.AnimatePresence, null, isExpanded && (react_1["default"].createElement(framer_motion_1.motion.div, { initial: { opacity: 0, x: -10 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -10 }, transition: { duration: 0.4 }, className: "flex flex-col" },
                    react_1["default"].createElement(framer_motion_1.motion.span, { className: "text-white/90 text-sm font-light tracking-[0.2em]", initial: { opacity: 0, y: -5 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 } }, "HIREBIT"),
                    react_1["default"].createElement(framer_motion_1.motion.span, { className: "text-[10px] text-white/50 uppercase tracking-[0.3em]", initial: { opacity: 0, y: 5 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2 } }, "Enterprise")))))),
        react_1["default"].createElement(framer_motion_1.AnimatePresence, null, isExpanded && (react_1["default"].createElement(framer_motion_1.motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 10 }, transition: { duration: 0.4 }, className: "px-6 mb-8" },
            react_1["default"].createElement("div", { className: "relative group" },
                react_1["default"].createElement("div", { className: "absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-purple-500/0 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500" }),
                react_1["default"].createElement("div", { className: "absolute inset-0 bg-white/5 rounded-xl backdrop-blur-md border border-white/10 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" }),
                react_1["default"].createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50 group-hover:text-white/80 transition-colors duration-300" }),
                react_1["default"].createElement("input", { type: "text", placeholder: "Search...", className: "w-full h-10 bg-white/5 rounded-xl pl-10 pr-4 text-sm text-white/80 placeholder-white/30 border border-white/10 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all duration-300" }))))),
        react_1["default"].createElement("nav", { className: "relative px-4 py-2 space-y-2" }, menuItems.map(function (item) {
            var isActive = pathname === item.link;
            var isHovered = hoveredItem === item.id;
            var Icon = item.icon;
            return (react_1["default"].createElement(link_1["default"], { href: item.link, key: item.id },
                react_1["default"].createElement(framer_motion_1.motion.div, { onHoverStart: function () { return setHoveredItem(item.id); }, onHoverEnd: function () { return setHoveredItem(null); }, className: "\n                  relative flex items-center gap-4 px-4 py-3 rounded-xl\n                  transition-all duration-300 cursor-pointer group\n                  " + (isActive
                        ? "bg-white/10 text-white/90 border border-white/10"
                        : "text-white/50 hover:text-white/90") + "\n                ", whileHover: { x: 4, scale: 1.02 }, transition: { duration: 0.3 } },
                    react_1["default"].createElement(framer_motion_1.motion.div, { className: "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300", style: {
                            background: "linear-gradient(45deg, rgba(59,130,246,0.1), rgba(147,51,234,0.1))"
                        } }),
                    isActive && (react_1["default"].createElement(framer_motion_1.motion.div, { layoutId: "activeIndicator", className: "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8" },
                        react_1["default"].createElement("div", { className: "w-full h-full bg-gradient-to-b from-blue-500 via-purple-500 to-blue-500 rounded-full blur-sm" }),
                        react_1["default"].createElement("div", { className: "absolute inset-0 bg-gradient-to-b from-blue-400 via-purple-400 to-blue-400 rounded-full animate-pulse" }))),
                    react_1["default"].createElement(framer_motion_1.motion.div, { whileHover: { scale: 1.1, rotate: 5 }, transition: { type: "spring", stiffness: 400, damping: 10 }, className: "relative w-6 h-6 flex items-center justify-center" },
                        react_1["default"].createElement(Icon, { className: "w-4 h-4 relative z-10" }),
                        isActive && (react_1["default"].createElement(framer_motion_1.motion.div, { initial: { scale: 0 }, animate: { scale: 1 }, className: "absolute inset-0 bg-blue-500/20 blur-md rounded-full" }))),
                    react_1["default"].createElement(framer_motion_1.AnimatePresence, null, isExpanded && (react_1["default"].createElement(framer_motion_1.motion.span, { initial: { opacity: 0, x: -6 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -6 }, className: "text-xs tracking-wider font-light" }, item.label.toUpperCase()))),
                    react_1["default"].createElement(framer_motion_1.AnimatePresence, null, isHovered && isExpanded && (react_1["default"].createElement(framer_motion_1.motion.div, { initial: { opacity: 0, scale: 0.8, x: -4 }, animate: { opacity: 1, scale: 1, x: 0 }, exit: { opacity: 0, scale: 0.8, x: -4 }, transition: { duration: 0.2 }, className: "ml-auto" },
                        react_1["default"].createElement(lucide_react_1.ChevronRight, { className: "w-4 h-4 text-white/50" })))))));
        }))));
}
exports["default"] = Sidebar;
