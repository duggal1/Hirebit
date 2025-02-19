"use client";
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.JobSeekerResume = void 0;
var zod_1 = require("@hookform/resolvers/zod");
var react_hook_form_1 = require("react-hook-form");
var zod_2 = require("zod");
var button_1 = require("@/components/ui/button");
var form_1 = require("@/components/ui/form");
var input_1 = require("@/components/ui/input");
var textarea_1 = require("@/components/ui/textarea");
var FileUpload_1 = require("@/components/general/FileUpload");
var lucide_react_1 = require("lucide-react");
var navigation_1 = require("next/navigation");
var sonner_1 = require("sonner");
var react_1 = require("react");
var framer_motion_1 = require("framer-motion");
var utils_1 = require("@/lib/utils");
var actions_1 = require("@/app/actions");
var uuid_1 = require("uuid");
var useaction_1 = require("@/lib/useaction");
var progress_1 = require("@/app/_components/ui/progress");
// Define a dedicated Zod schema for resume details.
var resumeFormSchema = zod_2.z.object({
    resumeId: zod_2.z.string().uuid().optional(),
    resumeName: zod_2.z.string().min(2, "Resume name must be at least 2 characters"),
    resumeBio: zod_2.z.string().min(10, "Resume bio must be at least 10 characters"),
    pdfUrlId: zod_2.z
        .string()
        .url("Invalid PDF URL")
        .min(1, "Resume PDF is required")
});
function JobSeekerResume(_a) {
    var _this = this;
    var jobSeekerId = _a.jobSeekerId;
    var router = navigation_1.useRouter();
    var _b = react_1.useState(false), analyzing = _b[0], setAnalyzing = _b[1];
    // State to store the complete analysis data from the API.
    var _c = react_1.useState(null), resumeAnalysis = _c[0], setResumeAnalysis = _c[1];
    // Generate a unique resume ID on component mount.
    var generatedResumeId = react_1.useState(function () { return uuid_1.v4(); })[0];
    // Prepare the action state for submitting the resume.
    var _d = useaction_1.useActionState(actions_1.submitJobSeekerResume, {
        message: "",
        success: false
    }), state = _d[0], formAction = _d[1];
    // Initialize the form using our dedicated resume schema.
    var form = react_hook_form_1.useForm({
        resolver: zod_1.zodResolver(resumeFormSchema),
        defaultValues: {
            resumeId: generatedResumeId,
            resumeName: "",
            resumeBio: "",
            pdfUrlId: ""
        },
        mode: "onChange"
    });
    // Watch form values and calculate overall validity.
    var formValues = form.watch();
    var isFormValid = react_1.useMemo(function () {
        return !!(formValues.resumeName && formValues.resumeBio && formValues.pdfUrlId);
    }, [formValues]);
    // Handle form submission.
    var onSubmit = function (event) { return __awaiter(_this, void 0, void 0, function () {
        var isValid, formData_1, values, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    event.preventDefault();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, form.trigger()];
                case 2:
                    isValid = _a.sent();
                    if (!isValid) {
                        sonner_1.toast.error("Please fix validation errors", {
                            description: "All fields must be filled correctly"
                        });
                        return [2 /*return*/];
                    }
                    formData_1 = new FormData();
                    values = form.getValues();
                    Object.entries(values).forEach(function (_a) {
                        var key = _a[0], value = _a[1];
                        formData_1.append(key, typeof value === "string" ? value : JSON.stringify(value));
                    });
                    // Append the jobSeekerId from the Prisma model.
                    formData_1.append("jobSeekerId", jobSeekerId);
                    formAction(formData_1);
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error("Submission error:", error_1);
                    sonner_1.toast.error(error_1 instanceof Error ? error_1.message : "Failed to submit form");
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    react_1.useEffect(function () {
        if (state.success) {
            sonner_1.toast.success(state.message);
            // Redirect to app/coding-test/[jobSeekerId]/page.tsx
            router.push("/coding-test/" + jobSeekerId);
        }
        else if (state.message) {
            sonner_1.toast.error(state.message);
        }
    }, [state, router, jobSeekerId]);
    // Handle resume file upload using UploadThing.
    var handleResumeUpload = function (url) { return __awaiter(_this, void 0, void 0, function () {
        var response, data, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, 4, 5]);
                    setAnalyzing(true);
                    // Validate the URL returned from UploadThing.
                    if (!url.startsWith("https://uploadthing.com/f/") &&
                        !url.startsWith("https://utfs.io/f/")) {
                        sonner_1.toast.error("Invalid Resume URL", {
                            description: "Please upload a valid PDF file through our uploader"
                        });
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, fetch("/api/validate-resume", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Accept: "application/json"
                            },
                            body: JSON.stringify({ resumeUrl: url })
                        })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    if (!response.ok) {
                        throw new Error(data.error || "Failed to analyze resume");
                    }
                    // Set the PDF URL in the form.
                    form.setValue("pdfUrlId", url, {
                        shouldValidate: true,
                        shouldDirty: true,
                        shouldTouch: true
                    });
                    // Save the full analysis data from the API.
                    setResumeAnalysis(data);
                    sonner_1.toast.success("Resume Uploaded and Analyzed Successfully", {
                        description: "Your resume has been uploaded and analyzed."
                    });
                    return [3 /*break*/, 5];
                case 3:
                    error_2 = _a.sent();
                    console.error("Resume upload error:", error_2);
                    sonner_1.toast.error("Upload Failed", {
                        description: error_2 instanceof Error ? error_2.message : "Failed to upload resume"
                    });
                    return [3 /*break*/, 5];
                case 4:
                    setAnalyzing(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var pathname = navigation_1.usePathname();
    var isCodingTestPage = pathname.includes("/coding-test/");
    return (React.createElement("div", { className: "bg-gradient-to-r from-black to-blue-900/10 " },
        React.createElement("div", { className: "" },
            React.createElement("div", { className: "" },
                React.createElement("div", { className: "" }),
                React.createElement("div", { className: "" }))),
        React.createElement("div", { className: "relative mx-auto px-6 py-12 max-w-7xl" },
            React.createElement(framer_motion_1.motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "space-y-10" },
                React.createElement(framer_motion_1.motion.header, { initial: { y: -50, opacity: 0 }, animate: { y: 0, opacity: 1 }, className: "relative mb-16" },
                    React.createElement("div", { className: "absolute -top-20 -left-20 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl" }),
                    React.createElement("div", { className: "relative flex items-center gap-8" },
                        React.createElement(framer_motion_1.motion.div, { initial: { scale: 0 }, animate: { scale: 1 }, className: "bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-6 rounded-2xl backdrop-blur-xl border border-white/10" },
                            React.createElement(lucide_react_1.Rocket, { className: "w-10 h-10 text-blue-400" })),
                        React.createElement("div", null,
                            React.createElement(framer_motion_1.motion.h1, { initial: { x: -20, opacity: 0 }, animate: { x: 0, opacity: 1 }, className: "text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent" }, "Resume Analysis"),
                            React.createElement(framer_motion_1.motion.p, { initial: { x: -20, opacity: 0 }, animate: { x: 0, opacity: 1 }, transition: { delay: 0.2 }, className: "mt-3 text-xl text-gray-400" }, "Let's enhance your professional profile")))),
                React.createElement(form_1.Form, __assign({}, form),
                    React.createElement("form", { onSubmit: onSubmit, className: "space-y-8" },
                        React.createElement(framer_motion_1.motion.div, { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1 }, className: "grid grid-cols-1 lg:grid-cols-2 gap-8" },
                            React.createElement("div", { className: "bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-8 shadow-2xl" },
                                React.createElement(form_1.FormField, { control: form.control, name: "resumeName", render: function (_a) {
                                        var field = _a.field;
                                        return (React.createElement(form_1.FormItem, { className: "mb-8" },
                                            React.createElement(form_1.FormLabel, { className: "text-lg font-medium bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent" }, "Resume Name"),
                                            React.createElement(form_1.FormControl, null,
                                                React.createElement(input_1.Input, __assign({}, field, { className: "h-14 bg-white/5 border-white/10 focus:border-blue-500 rounded-xl text-white placeholder-gray-500", placeholder: "Enter a name for your resume" }))),
                                            React.createElement(form_1.FormMessage, null)));
                                    } }),
                                React.createElement(form_1.FormField, { control: form.control, name: "resumeBio", render: function (_a) {
                                        var field = _a.field;
                                        return (React.createElement(form_1.FormItem, null,
                                            React.createElement(form_1.FormLabel, { className: "text-lg font-medium bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent" }, "Professional Bio"),
                                            React.createElement(form_1.FormControl, null,
                                                React.createElement(textarea_1.Textarea, __assign({}, field, { className: "min-h-[150px] bg-white/5 border-white/10 focus:border-blue-500 rounded-xl text-white placeholder-gray-500", placeholder: "Write a compelling professional bio" }))),
                                            React.createElement(form_1.FormMessage, null)));
                                    } })),
                            React.createElement("div", { className: "relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 to-black p-1" },
                                React.createElement("div", { className: "absolute inset-0 bg-gradient-to-r from-violet-600/20 via-transparent to-cyan-600/20 animate-gradient-slow" }),
                                React.createElement("div", { className: "relative bg-zinc-900/80 backdrop-blur-xl rounded-[1.4rem] p-8 border border-white/5" },
                                    React.createElement("div", { className: "space-y-8" },
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement("div", { className: "inline-flex items-center px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20" },
                                                React.createElement("span", { className: "text-xs font-medium text-violet-300" }, " Dont have a Resume?")),
                                            React.createElement("h2", { className: "text-3xl font-semibold tracking-tight text-white" }, "dont worrry we got you!!"),
                                            React.createElement("p", { className: "text-zinc-400 text-sm leading-relaxed max-w-md" }, "Design a professional resume that captures attention and showcases your potential.")),
                                        React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                                            React.createElement("div", { className: "p-4 rounded-2xl bg-white/5 border border-white/10" },
                                                React.createElement("div", { className: "text-sm font-medium text-white" }, "AI-Powered"),
                                                React.createElement("div", { className: "text-xs text-zinc-400 mt-1" }, "Smart formatting & suggestions")),
                                            React.createElement("div", { className: "p-4 rounded-2xl bg-white/5 border border-white/10" },
                                                React.createElement("div", { className: "text-sm font-medium text-white" }, "ATS-Friendly"),
                                                React.createElement("div", { className: "text-xs text-zinc-400 mt-1" }, "Optimized for job systems"))),
                                        React.createElement("a", { href: "/resume/" + jobSeekerId + "/resume-builder", className: "group relative flex items-center justify-between w-full" },
                                            React.createElement("div", { className: "absolute inset-0 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" }),
                                            React.createElement("div", { className: "relative flex items-center justify-between w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 group-hover:border-white/20 transition-all duration-300" },
                                                React.createElement("div", { className: "flex items-center gap-3" },
                                                    React.createElement(lucide_react_1.Rocket, { className: "w-5 h-5 text-violet-400" }),
                                                    React.createElement("span", { className: "font-medium text-white" }, "Start Building")),
                                                React.createElement(lucide_react_1.ArrowUpRight, { className: "w-5 h-5 text-white/70 group-hover:text-white transition-colors duration-300" })))),
                                    React.createElement("div", { className: "absolute bottom-8 right-8 flex items-center gap-2" },
                                        React.createElement("div", { className: "w-2 h-2 rounded-full bg-emerald-400 animate-pulse" }),
                                        React.createElement("span", { className: "text-xs text-zinc-500 font-medium" }, "System Online")))),
                            React.createElement("div", { className: "bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-8 shadow-2xl" },
                                React.createElement("div", { className: "flex items-center gap-4 mb-8" },
                                    React.createElement(framer_motion_1.motion.div, { whileHover: { scale: 1.1 }, className: "bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-3 rounded-xl" },
                                        React.createElement(lucide_react_1.UploadCloud, { className: "w-6 h-6 text-blue-400" })),
                                    React.createElement("h2", { className: "text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent" }, "Upload Resume")),
                                React.createElement(form_1.FormField, { control: form.control, name: "pdfUrlId", render: function (_a) {
                                        var field = _a.field;
                                        return (React.createElement(form_1.FormItem, null,
                                            React.createElement(form_1.FormControl, null,
                                                React.createElement(framer_motion_1.motion.div, { whileHover: { scale: 1.02 }, transition: { type: "spring", stiffness: 300 } },
                                                    React.createElement(FileUpload_1.FileUpload, { value: field.value, onChange: handleResumeUpload, disabled: analyzing, className: "border-2 border-dashed border-white/10 hover:border-blue-500/50 rounded-2xl transition-all duration-300" },
                                                        React.createElement("div", { className: "flex flex-col items-center justify-center h-56 space-y-6" },
                                                            React.createElement(framer_motion_1.motion.div, { animate: { y: [0, -10, 0] }, transition: { repeat: Infinity, duration: 2 }, className: "bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-5 rounded-full" },
                                                                React.createElement(lucide_react_1.UploadCloud, { className: "w-10 h-10 text-blue-400" })),
                                                            React.createElement("div", { className: "text-center" },
                                                                React.createElement("p", { className: "text-xl font-medium text-white mb-2" }, "Drop your resume here"),
                                                                React.createElement("p", { className: "text-gray-400" }, "PDF format \u2022 Max 4MB")))))),
                                            React.createElement(form_1.FormMessage, null)));
                                    } }),
                                analyzing && (React.createElement(framer_motion_1.motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, className: "mt-6" },
                                    React.createElement("div", { className: "bg-blue-500/10 rounded-xl p-4 border border-blue-500/20" },
                                        React.createElement("div", { className: "flex items-center gap-3 mb-3" },
                                            React.createElement(lucide_react_1.Loader2, { className: "w-5 h-5 text-blue-400 animate-spin" }),
                                            React.createElement("p", { className: "text-blue-400 font-medium" }, "Analyzing your resume...")),
                                        React.createElement(progress_1.Progress, { value: 66, className: "h-1 bg-gray-800", indicatorClassName: "bg-gradient-to-r from-purple-400 via-pink-500 to-red-500" })))))),
                        React.createElement(framer_motion_1.AnimatePresence, null, resumeAnalysis && (React.createElement(framer_motion_1.motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 }, className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" },
                            React.createElement(framer_motion_1.motion.div, { whileHover: { scale: 1.02 }, className: "col-span-full bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-8" },
                                React.createElement("div", { className: "flex items-center justify-between mb-6" },
                                    React.createElement("h3", { className: "text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent" }, "Resume Statistics"),
                                    resumeAnalysis.isValid ? (React.createElement("div", { className: "flex items-center gap-2 text-green-400" },
                                        React.createElement(lucide_react_1.CheckCircle, { className: "w-5 h-5" }),
                                        React.createElement("span", null, "Valid Resume"))) : (React.createElement("div", { className: "flex items-center gap-2 text-red-400" },
                                        React.createElement(lucide_react_1.XCircle, { className: "w-5 h-5" }),
                                        React.createElement("span", null, "Needs Improvement")))),
                                React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6" },
                                    React.createElement("div", { className: "bg-white/5 rounded-2xl p-6" },
                                        React.createElement("div", { className: "flex items-center gap-3 mb-4" },
                                            React.createElement(lucide_react_1.Briefcase, { className: "w-5 h-5 text-blue-400" }),
                                            React.createElement("span", { className: "text-gray-400" }, "Experience")),
                                        React.createElement("p", { className: "text-2xl font-bold text-white" },
                                            resumeAnalysis.experience.years,
                                            " Years"),
                                        React.createElement("p", { className: "text-gray-400 mt-1" }, resumeAnalysis.experience.level)),
                                    React.createElement("div", { className: "bg-white/5 rounded-2xl p-6" },
                                        React.createElement("div", { className: "flex items-center gap-3 mb-4" },
                                            React.createElement(lucide_react_1.Zap, { className: "w-5 h-5 text-purple-400" }),
                                            React.createElement("span", { className: "text-gray-400" }, "Skills")),
                                        React.createElement("p", { className: "text-2xl font-bold text-white" }, resumeAnalysis.skills.length),
                                        React.createElement("p", { className: "text-gray-400 mt-1" }, "Key Skills")),
                                    React.createElement("div", { className: "bg-white/5 rounded-2xl p-6" },
                                        React.createElement("div", { className: "flex items-center gap-3 mb-4" },
                                            React.createElement(lucide_react_1.GraduationCap, { className: "w-5 h-5 text-yellow-400" }),
                                            React.createElement("span", { className: "text-gray-400" }, "Education")),
                                        React.createElement("p", { className: "text-2xl font-bold text-white" }, resumeAnalysis.education.length),
                                        React.createElement("p", { className: "text-gray-400 mt-1" }, "Qualifications")))),
                            React.createElement(framer_motion_1.motion.div, { whileHover: { scale: 1.02 }, className: "bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-8" },
                                React.createElement("h3", { className: "text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-6" }, "Skills Overview"),
                                React.createElement("div", { className: "flex flex-wrap gap-2" }, resumeAnalysis.skills.map(function (skill, index) { return (React.createElement(framer_motion_1.motion.span, { key: index, initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 }, transition: { delay: index * 0.1 }, className: "px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full text-blue-400 text-sm font-medium" }, skill)); }))),
                            React.createElement(framer_motion_1.motion.div, { whileHover: { scale: 1.02 }, className: "bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-8" },
                                React.createElement("h3", { className: "text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-6" }, "Education"),
                                React.createElement("div", { className: "space-y-4" }, resumeAnalysis.education.map(function (edu, index) { return (React.createElement(framer_motion_1.motion.div, { key: index, initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: index * 0.2 }, className: "relative pl-6 pb-4 border-l border-gray-700" },
                                    React.createElement("div", { className: "absolute left-0 top-0 -translate-x-1/2 w-3 h-3 rounded-full bg-blue-400" }),
                                    React.createElement("p", { className: "text-white font-medium" }, edu.degree),
                                    React.createElement("p", { className: "text-gray-400" }, edu.institution),
                                    React.createElement("p", { className: "text-gray-500 text-sm" }, edu.year))); }))),
                            React.createElement(framer_motion_1.motion.div, { whileHover: { scale: 1.02 }, className: "bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-8" },
                                React.createElement("h3", { className: "text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-6" }, "Detailed Feedback"),
                                React.createElement("div", { className: "space-y-6" },
                                    React.createElement(framer_motion_1.motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "bg-green-500/10 rounded-2xl p-4" },
                                        React.createElement("h4", { className: "text-green-400 font-medium mb-2" }, "Strengths"),
                                        React.createElement("ul", { className: "space-y-2" }, resumeAnalysis.feedback.strengths.map(function (strength, index) { return (React.createElement(framer_motion_1.motion.li, { key: index, initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: index * 0.1 }, className: "flex items-center gap-2 text-gray-300" },
                                            React.createElement(lucide_react_1.CheckCircle, { className: "w-4 h-4 text-green-400 flex-shrink-0" }),
                                            React.createElement("span", null, strength))); }))),
                                    React.createElement(framer_motion_1.motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "bg-yellow-500/10 rounded-2xl p-4" },
                                        React.createElement("h4", { className: "text-yellow-400 font-medium mb-2" }, "Areas for Improvement"),
                                        React.createElement("ul", { className: "space-y-2" }, resumeAnalysis.feedback.improvements.map(function (improvement, index) { return (React.createElement(framer_motion_1.motion.li, { key: index, initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: index * 0.1 }, className: "flex items-center gap-2 text-gray-300" },
                                            React.createElement(lucide_react_1.AlertTriangle, { className: "w-4 h-4 text-yellow-400 flex-shrink-0" }),
                                            React.createElement("span", null, improvement))); }))))),
                            React.createElement(framer_motion_1.motion.div, { whileHover: { scale: 1.02 }, className: "bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-8" },
                                React.createElement("h3", { className: "text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-6" }, "Buzzword Analysis"),
                                React.createElement("div", { className: "space-y-4" },
                                    React.createElement("div", { className: "flex items-center justify-between" },
                                        React.createElement("span", { className: "text-gray-400" }, "Total Buzzwords"),
                                        React.createElement("span", { className: "text-2xl font-bold text-white" }, resumeAnalysis.buzzwords.count)),
                                    resumeAnalysis.buzzwords.list.length > 0 && (React.createElement("div", { className: "flex flex-wrap gap-2 mt-4" }, resumeAnalysis.buzzwords.list.map(function (word, index) { return (React.createElement(framer_motion_1.motion.span, { key: index, initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 }, transition: { delay: index * 0.1 }, className: "px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full text-sm" }, word)); }))),
                                    resumeAnalysis.buzzwords.warning && (React.createElement(framer_motion_1.motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, className: "mt-4 p-4 bg-red-500/10 rounded-xl border border-red-500/20" },
                                        React.createElement("p", { className: "text-red-400 text-sm font-medium" }, "\u26A0\uFE0F High buzzword usage detected. Consider reducing for more impact."))),
                                    resumeAnalysis.criticalFlaws && resumeAnalysis.criticalFlaws.length > 0 && (React.createElement(framer_motion_1.motion.div, { whileHover: { scale: 1.03, boxShadow: "0 0 30px rgba(255,0,0,0.1)" }, whileTap: { scale: 0.98 }, initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { type: "spring", stiffness: 300 }, className: "relative bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-8 shadow-lg overflow-hidden" },
                                        React.createElement("div", { className: "absolute inset-0 bg-gradient-to-br from-red-500/10 via-red-400/10 to-red-300/10 pointer-events-none blur-3xl" }),
                                        React.createElement("div", { className: "relative" },
                                            React.createElement("h3", { className: "text-2xl font-extrabold bg-gradient-to-r from-red-400 to-red-200 bg-clip-text text-transparent mb-4" }, "Critical Flaws"),
                                            React.createElement("ul", { className: "space-y-2" }, resumeAnalysis.criticalFlaws.map(function (flaw, index) { return (React.createElement(framer_motion_1.motion.li, { key: index, initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: index * 0.1 }, className: "flex items-center gap-2 text-red-400 text-lg" },
                                                React.createElement(lucide_react_1.XCircle, { className: "w-5 h-5" }),
                                                React.createElement("span", null, flaw))); }))))),
                                    resumeAnalysis.additionalRecommendations && (React.createElement(framer_motion_1.motion.div, { whileHover: { scale: 1.03, boxShadow: "0 0 30px rgba(255,255,255,0.1)" }, whileTap: { scale: 0.98 }, initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { type: "spring", stiffness: 300 }, className: "relative bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-8 shadow-lg overflow-hidden" },
                                        React.createElement("div", { className: "absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 pointer-events-none blur-3xl" }),
                                        React.createElement("div", { className: "relative" },
                                            React.createElement("h3", { className: "text-2xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4" }, "Additional Recommendations"),
                                            React.createElement("p", { className: "text-lg text-gray-300 leading-relaxed" }, resumeAnalysis.additionalRecommendations))))))))),
                        React.createElement(framer_motion_1.motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "sticky bottom-8 mt-8" },
                            React.createElement(framer_motion_1.motion.div
                            // Continuous pulsing if NOT on the coding test page.
                            , { 
                                // Continuous pulsing if NOT on the coding test page.
                                animate: !isCodingTestPage ? { scale: [1, 1.05, 1] } : {}, transition: !isCodingTestPage
                                    ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                                    : {}, whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, className: "bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10 p-6" },
                                React.createElement(button_1.Button, { type: "submit", disabled: !isFormValid, className: utils_1.cn("w-full h-14 bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white rounded-xl font-medium text-lg transition-all duration-300", !isFormValid && "opacity-50 cursor-not-allowed") },
                                    React.createElement(framer_motion_1.motion.div, { className: "flex items-center justify-center gap-2", whileHover: { gap: "0.75rem" } },
                                        React.createElement(lucide_react_1.Rocket, { className: "w-5 h-5" }),
                                        React.createElement("span", null, isFormValid ? "Submit Resume" : "Complete All Fields")))))))))));
}
exports.JobSeekerResume = JobSeekerResume;
