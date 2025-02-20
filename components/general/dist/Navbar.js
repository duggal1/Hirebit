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
exports.Navbar = void 0;
var link_1 = require("next/link");
var button_1 = require("../ui/button");
var image_1 = require("next/image");
var logo_png_1 = require("@/public/logo.png");
var lucide_react_1 = require("lucide-react");
var sheet_1 = require("@/components/ui/sheet");
var auth_1 = require("@/app/utils/auth");
var ThemeToggle_1 = require("./ThemeToggle");
var UserDropdown_1 = require("./UserDropdown");
function Navbar() {
    return __awaiter(this, void 0, void 0, function () {
        var session;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, auth_1.auth()];
                case 1:
                    session = _a.sent();
                    return [2 /*return*/, (React.createElement(React.Fragment, null,
                            React.createElement("nav", { className: "flex justify-between items-center py-5" },
                                React.createElement(link_1["default"], { href: "/", className: "flex items-center gap-2" },
                                    React.createElement(image_1["default"], { src: logo_png_1["default"], alt: "hirebit", width: 100, height: 80 }),
                                    React.createElement("h1", { className: "text-3xl font-extrabold  text-white" },
                                        "HIRE",
                                        React.createElement("span", { className: "text-blue-500" }, "BIT"))),
                                React.createElement("div", { className: "hidden md:flex items-center space-x-6" },
                                    React.createElement(ThemeToggle_1.ThemeToggle, null),
                                    React.createElement(link_1["default"], { href: "/post-job", className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white transition" }, "Post Job"),
                                    (session === null || session === void 0 ? void 0 : session.user) ? (React.createElement(UserDropdown_1.UserDropdown, { email: session.user.email, name: session.user.name, image: session.user.image })) : (React.createElement(link_1["default"], { href: "/login", className: "px-4 py-2 border border-gray-700 hover:border-gray-600 rounded-md text-gray-300 hover:text-white transition" }, "Login"))),
                                React.createElement("div", { className: "md:hidden flex items-center" },
                                    React.createElement(ThemeToggle_1.ThemeToggle, null),
                                    React.createElement(sheet_1.Sheet, null,
                                        React.createElement(sheet_1.SheetTrigger, { asChild: true },
                                            React.createElement(button_1.Button, { variant: "outline", size: "icon", className: "ml-2 border-gray-700 hover:border-gray-600" },
                                                React.createElement(lucide_react_1.Menu, { className: "h-6 w-6 text-gray-300" }))),
                                        React.createElement(sheet_1.SheetContent, { className: "bg-black text-white" },
                                            React.createElement(sheet_1.SheetHeader, null,
                                                React.createElement(sheet_1.SheetTitle, { className: "text-2xl font-bold" }, "HIREBIT")),
                                            React.createElement("div", { className: "mt-6 flex flex-col space-y-4" },
                                                React.createElement(link_1["default"], { href: "/", className: "px-4 py-2 hover:bg-gray-800 rounded transition" }, "Find New Job"),
                                                React.createElement(link_1["default"], { href: "/post-job", className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition" }, "Post a Job"),
                                                React.createElement(link_1["default"], { href: "/login", className: "px-4 py-2 border border-gray-700 hover:border-gray-600 rounded transition" }, "Login"))))))))];
            }
        });
    });
}
exports.Navbar = Navbar;
exports["default"] = Navbar;
