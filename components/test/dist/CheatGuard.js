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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.CheatGuard = void 0;
var react_1 = require("react");
var sonner_1 = require("sonner");
var BlockOverlay_1 = require("./BlockOverlay");
var copy_paste_guard_1 = require("./copy-paste-guard");
var navigation_1 = require("next/navigation");
function CheatGuard(_a) {
    var _this = this;
    var onViolation = _a.onViolation, onTestTerminate = _a.onTestTerminate, _b = _a.maxViolations, maxViolations = _b === void 0 ? 3 : _b;
    var router = navigation_1.useRouter();
    var _c = react_1.useState(0), violations = _c[0], setViolations = _c[1];
    var _d = react_1.useState(false), showOverlay = _d[0], setShowOverlay = _d[1];
    var _e = react_1.useState([]), cheatAttempts = _e[0], setCheatAttempts = _e[1];
    var handleViolation = react_1.useCallback(function (type, details) { return __awaiter(_this, void 0, void 0, function () {
        var newCount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    newCount = violations + 1;
                    setViolations(newCount);
                    setShowOverlay(true);
                    setCheatAttempts(function (prev) { return __spreadArrays(prev, [{
                            timestamp: Date.now(),
                            type: type,
                            details: details
                        }]); });
                    if (!(newCount >= maxViolations)) return [3 /*break*/, 2];
                    return [4 /*yield*/, onViolation(newCount)];
                case 1:
                    _a.sent();
                    onTestTerminate();
                    router.push('/');
                    return [2 /*return*/];
                case 2:
                    sonner_1.toast.warning("Warning " + newCount + "/" + maxViolations, {
                        description: 'Please stay in the test window',
                        duration: Infinity,
                        action: {
                            label: 'Continue Test',
                            onClick: function () { return setShowOverlay(false); }
                        }
                    });
                    return [2 /*return*/];
            }
        });
    }); }, [violations, maxViolations, onViolation, onTestTerminate, router]);
    react_1.useEffect(function () {
        var detectTabSwitch = function () {
            if (document.visibilityState === 'hidden') {
                handleViolation('tab_switch', 'Switched away from test');
            }
        };
        var detectDevTools = function () {
            if (window.outerWidth - window.innerWidth > 160) {
                handleViolation('devtools', 'DevTools detected');
            }
        };
        // Initialize copy-paste guard
        var copyPasteGuard = new copy_paste_guard_1.CopyPasteGuard(function () {
            handleViolation('copy_paste', 'Attempted copy/paste');
        });
        document.addEventListener('visibilitychange', detectTabSwitch);
        window.addEventListener('resize', detectDevTools);
        return function () {
            document.removeEventListener('visibilitychange', detectTabSwitch);
            window.removeEventListener('resize', detectDevTools);
            copyPasteGuard.cleanup();
        };
    }, [handleViolation]);
    return showOverlay ? (React.createElement(BlockOverlay_1.BlockOverlay, { count: violations, attempts: cheatAttempts })) : null;
}
exports.CheatGuard = CheatGuard;
