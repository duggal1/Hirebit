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
var card_1 = require("@/components/ui/card");
var image_1 = require("next/image");
var CreateJobForm_1 = require("@/components/forms/CreateJobForm");
var db_1 = require("@/app/utils/db");
var hooks_1 = require("@/app/utils/hooks");
var navigation_1 = require("next/navigation");
var companies = [
    { id: 0, name: "Google", logo: "/google.png" },
    { id: 1, name: "Adobe", logo: "/adobe.png" },
    { id: 2, name: "Nvidia", logo: "/nvidia.png" },
    { id: 3, name: "Canva", logo: "/canva.png" }
];
var testimonials = [
    {
        quote: "We trust HireBit as the best tech recruiter platform for finding exceptional talent.",
        author: "Sundar Pichai",
        company: "Google",
        role: "CEO"
    },
    {
        quote: "HireBit revolutionized our hiring process with their cutting-edge platform.",
        author: "Jensen Huang",
        company: "Nvidia",
        role: "CEO"
    }
];
var stats = [
    { value: "50k+", label: "Active Candidates", icon: "👥" },
    { value: "24h", label: "Average Response", icon: "⚡" },
    { value: "98%", label: "Success Rate", icon: "🎯" },
    { value: "1000+", label: "Enterprise Clients", icon: "🏢" }
];
function getCompany(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.prisma.company.findUnique({
                        where: { userId: userId },
                        select: {
                            name: true,
                            location: true,
                            about: true,
                            logo: true,
                            xAccount: true,
                            website: true
                        }
                    })];
                case 1:
                    data = _a.sent();
                    if (!data)
                        return [2 /*return*/, navigation_1.redirect("/")];
                    return [2 /*return*/, data];
            }
        });
    });
}
var PostJobPage = function () { return __awaiter(void 0, void 0, void 0, function () {
    var session, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, hooks_1.requireUser()];
            case 1:
                session = _a.sent();
                return [4 /*yield*/, getCompany(session.id)];
            case 2:
                data = _a.sent();
                return [2 /*return*/, (react_1["default"].createElement("div", { className: "min-h-screen bg-transparent text-white" },
                        react_1["default"].createElement("div", { className: "container mx-auto px-4 py-8" },
                            react_1["default"].createElement("div", { className: "gap-8 grid grid-cols-1 lg:grid-cols-3" },
                                react_1["default"].createElement("div", { className: "lg:col-span-2" },
                                    react_1["default"].createElement(CreateJobForm_1.CreateJobForm, { companyAbout: data.about, companyLocation: data.location, companyLogo: data.logo, companyName: data.name, companyXAccount: data.xAccount, companyWebsite: data.website })),
                                react_1["default"].createElement("div", { className: "lg:col-span-1" },
                                    react_1["default"].createElement(card_1.Card, { className: "relative overflow-hidden border border-zinc-800/50 bg-black/40 backdrop-blur-xl before:absolute before:inset-0 before:bg-gradient-to-b before:from-blue-500/10 before:to-purple-500/10 before:opacity-0 hover:before:opacity-100 before:transition-opacity" },
                                        react_1["default"].createElement("div", { className: "absolute inset-0 bg-grid-white/[0.02]" }),
                                        react_1["default"].createElement("div", { className: "absolute inset-0 bg-black/40" }),
                                        react_1["default"].createElement(card_1.CardHeader, { className: "relative" },
                                            react_1["default"].createElement(card_1.CardTitle, { className: "text-3xl font-bold" },
                                                react_1["default"].createElement("span", { className: "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent" }, "Trusted by Giants"))),
                                        react_1["default"].createElement(card_1.CardContent, { className: "relative space-y-12" },
                                            react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-6" }, companies.map(function (company) { return (react_1["default"].createElement("div", { key: company.id, className: "group relative overflow-hidden rounded-xl bg-gradient-to-br from-zinc-800/50 via-zinc-900/50 to-black/50 p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20" },
                                                react_1["default"].createElement("div", { className: "absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 transition-opacity group-hover:opacity-100" }),
                                                react_1["default"].createElement(image_1["default"], { src: company.logo, alt: company.name, height: 300, width: 300, className: "relative z-10 transition-transform group-hover:scale-110" }))); })),
                                            react_1["default"].createElement("div", { className: "space-y-6" }, testimonials.map(function (testimonial, index) { return (react_1["default"].createElement("div", { key: index, className: "group relative overflow-hidden rounded-xl bg-gradient-to-br from-zinc-800/30 via-zinc-900/30 to-black/30 p-6 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10" },
                                                react_1["default"].createElement("div", { className: "absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 transition-opacity group-hover:opacity-100" }),
                                                react_1["default"].createElement("p", { className: "relative text-sm italic text-zinc-300" },
                                                    "\"",
                                                    testimonial.quote,
                                                    "\""),
                                                react_1["default"].createElement("div", { className: "relative mt-4 flex items-center gap-3" },
                                                    react_1["default"].createElement("div", { className: "flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-sm font-bold" }, testimonial.author[0]),
                                                    react_1["default"].createElement("div", null,
                                                        react_1["default"].createElement("p", { className: "font-medium text-white" }, testimonial.author),
                                                        react_1["default"].createElement("p", { className: "text-xs text-zinc-400" },
                                                            testimonial.role,
                                                            ", ",
                                                            testimonial.company))))); })),
                                            react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-4" }, stats.map(function (stat, index) { return (react_1["default"].createElement("div", { key: index, className: "group relative overflow-hidden rounded-xl bg-gradient-to-br from-zinc-800/30 via-zinc-900/30 to-black/30 p-4 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10" },
                                                react_1["default"].createElement("div", { className: "absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 transition-opacity group-hover:opacity-100" }),
                                                react_1["default"].createElement("div", { className: "relative" },
                                                    react_1["default"].createElement("div", { className: "text-2xl" }, stat.icon),
                                                    react_1["default"].createElement("div", { className: "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-xl font-bold text-transparent" }, stat.value),
                                                    react_1["default"].createElement("div", { className: "text-xs text-zinc-400" }, stat.label)))); })))))))))];
        }
    });
}); };
exports["default"] = PostJobPage;
