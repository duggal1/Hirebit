"use strict";
exports.__esModule = true;
exports.FileUpload = void 0;
var react_1 = require("react");
var UploadThingReExport_1 = require("./UploadThingReExport");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
var button_1 = require("../ui/button");
function FileUpload(_a) {
    var onChange = _a.onChange, value = _a.value, disabled = _a.disabled, className = _a.className, children = _a.children;
    return (react_1["default"].createElement("div", { className: "transition-all duration-500 " + className }, value ? (react_1["default"].createElement("div", { className: "group relative overflow-hidden bg-gradient-to-r from-slate-900/40 to-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-800/50 shadow-[0_0_15px_rgba(0,0,0,0.2)] dark:shadow-[0_0_25px_rgba(0,0,0,0.4)] hover:shadow-[0_0_25px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_0_35px_rgba(0,0,0,0.5)] transition-all duration-500" },
        react_1["default"].createElement("div", { className: "absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/2 opacity-50" }),
        react_1["default"].createElement("div", { className: "flex items-center gap-8 p-7 relative z-10" },
            react_1["default"].createElement("div", { className: "relative" },
                react_1["default"].createElement("div", { className: "absolute inset-0 bg-primary/10 rounded-2xl animate-pulse-slow" }),
                react_1["default"].createElement("div", { className: "absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-2xl blur-sm" }),
                react_1["default"].createElement(lucide_react_1.FileText, { className: "w-12 h-12 text-primary/80 relative z-10" })),
            react_1["default"].createElement("div", { className: "flex-1 space-y-2" },
                react_1["default"].createElement("p", { className: "font-medium text-base text-slate-100/90" }, "Resume uploaded"),
                react_1["default"].createElement("p", { className: "text-slate-400/80 text-sm" }, "PDF document ready")),
            react_1["default"].createElement(button_1.Button, { type: "button", variant: "ghost", size: "sm", onClick: function () { return onChange(""); }, disabled: disabled, className: "opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-500/10 hover:text-red-400 rounded-xl" },
                react_1["default"].createElement(lucide_react_1.XIcon, { className: "w-5 h-5" }))))) : (react_1["default"].createElement("div", { className: "relative group" },
        react_1["default"].createElement("div", { className: "absolute inset-0 bg-gradient-to-r from-primary/3 via-primary/5 to-primary/3 rounded-2xl animate-gradient blur-xl" }),
        react_1["default"].createElement("div", { className: "relative border-[2.5px] border-dashed border-slate-700/50 dark:border-slate-700/30 rounded-2xl bg-slate-900/50 backdrop-blur-xl transition-all duration-500 group-hover:border-primary/30" },
            react_1["default"].createElement("div", { className: "flex flex-col justify-center items-center w-full min-h-[240px] p-10" },
                react_1["default"].createElement("div", { className: "mb-8 relative" },
                    react_1["default"].createElement("div", { className: "absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-full blur-md" }),
                    react_1["default"].createElement("div", { className: "absolute inset-0 bg-primary/10 rounded-full animate-pulse-slow" }),
                    react_1["default"].createElement(lucide_react_1.Upload, { className: "w-14 h-14 text-primary/80 relative z-10" })),
                react_1["default"].createElement(UploadThingReExport_1.UploadDropzone, { endpoint: "resumeUploader", onClientUploadComplete: function (res) {
                        onChange(res[0].url);
                        sonner_1.toast.success("Resume uploaded successfully!");
                    }, onUploadError: function (error) {
                        sonner_1.toast.error(error.message || "Upload failed");
                    }, className: "ut-button:bg-gradient-to-r ut-button:from-primary/80 ut-button:to-primary/70 \n                  ut-button:hover:from-primary/90 ut-button:hover:to-primary/80\n                  ut-button:text-white/90 ut-label:text-slate-300\n                  ut-button:shadow-[0_0_20px_rgba(0,0,0,0.3)] ut-button:hover:shadow-[0_0_30px_rgba(0,0,0,0.4)]\n                  ut-button:transition-all ut-button:duration-500\n                  ut-button:rounded-xl ut-button:font-medium ut-button:px-8 ut-button:py-4\n                  ut-upload-icon:text-primary/80 ut-upload-icon:w-10 ut-upload-icon:h-10\n                  ut-label:font-medium ut-label:text-base\n                  ut-allowed-content:text-slate-400 dark:ut-allowed-content:text-slate-500\n                  ut-container:border-none ut-container:bg-transparent\n                  hover:ut-button:scale-[1.02] active:ut-button:scale-[0.98]", disabled: disabled }),
                react_1["default"].createElement("div", { className: "mt-6 text-center space-y-3" }, children)))))));
}
exports.FileUpload = FileUpload;
