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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var zod_1 = require("@hookform/resolvers/zod");
var react_hook_form_1 = require("react-hook-form");
var form_1 = require("@/components/ui/form");
var input_1 = require("@/components/ui/input");
var textarea_1 = require("@/components/ui/textarea");
var zodSchemas_1 = require("@/app/utils/zodSchemas");
var react_1 = require("react");
var use_toast_1 = require("@/app/_components/ui/use-toast");
var button_1 = require("@/components/ui/button");
var lucide_react_1 = require("lucide-react");
var select_1 = require("@/components/ui/select");
var navigation_1 = require("next/navigation");
var card_1 = require("@/components/ui/card");
var actions_1 = require("@/app/actions");
var FileUpload_1 = require("@/components/general/FileUpload");
function JobSeekerForm() {
    var router = navigation_1.useRouter();
    var form = react_hook_form_1.useForm({
        resolver: zod_1.zodResolver(zodSchemas_1.jobSeekerSchema),
        mode: "onChange",
        defaultValues: {
            name: "",
            about: "",
            resume: "",
            location: "",
            phoneNumber: "",
            jobId: "",
            expectedSalaryMin: undefined,
            expectedSalaryMax: undefined,
            preferredLocation: "",
            remotePreference: "Hybrid",
            yearsOfExperience: 0,
            skills: [],
            certifications: undefined,
            availabilityPeriod: 30,
            education: [
                {
                    degree: "",
                    institution: "",
                    year: new Date().getFullYear(),
                    fieldOfStudy: ""
                },
            ],
            desiredEmployment: "Full-time",
            experience: 0,
            linkedin: "",
            github: "",
            portfolio: "",
            availableFrom: "",
            previousJobExperience: "",
            willingToRelocate: false,
            email: "",
            currentJobTitle: "",
            industry: "",
            jobSearchStatus: "OPEN_TO_OFFERS"
        }
    });
    var _a = react_hook_form_1.useFieldArray({
        name: "education",
        control: form.control
    }), educationFields = _a.fields, appendEducation = _a.append, removeEducation = _a.remove;
    var _b = react_hook_form_1.useFieldArray({
        name: "certifications",
        control: form.control,
        shouldUnregister: true
    }), certFields = _b.fields, appendCert = _b.append, removeCert = _b.remove;
    // Debug: Log form state
    console.log("Form state:", {
        isValid: form.formState.isValid,
        errors: form.formState.errors,
        isDirty: form.formState.isDirty
    });
    var _c = react_1.useState(false), pending = _c[0], setPending = _c[1];
    var _d = react_1.useState(false), disabled = _d[0], setDisabled = _d[1];
    var _e = react_1.useState(""), currentSkill = _e[0], setCurrentSkill = _e[1];
    function onSubmit(values) {
        return __awaiter(this, void 0, void 0, function () {
            var formData_1, result_1, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, 3, 4]);
                        setPending(true);
                        console.log("Submitting form with values:", values);
                        formData_1 = new FormData();
                        Object.entries(values).forEach(function (_a) {
                            var key = _a[0], value = _a[1];
                            if (Array.isArray(value)) {
                                formData_1.set(key, JSON.stringify(value));
                            }
                            else if (value !== null && value !== undefined) {
                                formData_1.set(key, value.toString());
                            }
                        });
                        return [4 /*yield*/, actions_1.submitJobSeeker({}, formData_1)];
                    case 1:
                        result_1 = _a.sent();
                        console.log("Submission result:", result_1);
                        if (result_1.success) {
                            use_toast_1.toast({
                                title: "Success",
                                description: result_1.message
                            });
                            // Add a small delay before redirect to show the success message
                            setTimeout(function () {
                                if (result_1.redirect) {
                                    router.push(result_1.redirect);
                                }
                            }, 1500);
                        }
                        else {
                            use_toast_1.toast({
                                title: "Error",
                                description: result_1.message,
                                variant: "destructive"
                            });
                        }
                        return [3 /*break*/, 4];
                    case 2:
                        error_1 = _a.sent();
                        console.error("Form submission error:", error_1);
                        use_toast_1.toast({
                            title: "Error",
                            description: error_1 instanceof Error
                                ? error_1.message
                                : "Something went wrong",
                            variant: "destructive"
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        setPending(false);
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }
    return (React.createElement(form_1.Form, __assign({}, form),
        React.createElement("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-8" },
            Object.keys(form.formState.errors).length > 0 && (React.createElement("div", { className: "bg-destructive/15 p-3 rounded-md" },
                React.createElement("h3", { className: "font-medium text-destructive text-sm" }, "Form has the following errors:"),
                React.createElement("ul", { className: "mt-2 text-destructive text-sm" }, Object.entries(form.formState.errors).map(function (_a) {
                    var field = _a[0], error = _a[1];
                    return (React.createElement("li", { key: field },
                        field,
                        ": ",
                        error === null || error === void 0 ? void 0 : error.message));
                })))),
            React.createElement("div", { className: "space-y-4" },
                React.createElement("h2", { className: "font-semibold text-xl" }, "Basic Information"),
                React.createElement(form_1.FormField, { control: form.control, name: "email", render: function (_a) {
                        var field = _a.field;
                        return (React.createElement(form_1.FormItem, null,
                            React.createElement(form_1.FormLabel, null, "Email Address"),
                            React.createElement(form_1.FormControl, null,
                                React.createElement(input_1.Input, __assign({ type: "email", placeholder: "your@email.com" }, field))),
                            React.createElement(form_1.FormDescription, null, "Your primary contact email"),
                            React.createElement(form_1.FormMessage, null)));
                    } }),
                React.createElement(form_1.FormField, { control: form.control, name: "name", render: function (_a) {
                        var field = _a.field;
                        return (React.createElement(form_1.FormItem, null,
                            React.createElement(form_1.FormLabel, null, "Full Name"),
                            React.createElement(form_1.FormControl, null,
                                React.createElement(input_1.Input, __assign({ placeholder: "John Doe" }, field))),
                            React.createElement(form_1.FormMessage, null)));
                    } }),
                React.createElement(form_1.FormField, { control: form.control, name: "currentJobTitle", render: function (_a) {
                        var field = _a.field;
                        return (React.createElement(form_1.FormItem, null,
                            React.createElement(form_1.FormLabel, null, "Current Job Title"),
                            React.createElement(form_1.FormControl, null,
                                React.createElement(input_1.Input, __assign({ placeholder: "Software Engineer" }, field, { value: field.value || "" }))),
                            React.createElement(form_1.FormDescription, null, "Your current or most recent job title"),
                            React.createElement(form_1.FormMessage, null)));
                    } }),
                React.createElement(form_1.FormField, { control: form.control, name: "industry", render: function (_a) {
                        var field = _a.field;
                        return (React.createElement(form_1.FormItem, null,
                            React.createElement(form_1.FormLabel, null, "Industry"),
                            React.createElement(form_1.FormControl, null,
                                React.createElement(input_1.Input, __assign({ placeholder: "Technology" }, field))),
                            React.createElement(form_1.FormDescription, null, "Your primary industry of expertise"),
                            React.createElement(form_1.FormMessage, null)));
                    } }),
                React.createElement(form_1.FormField, { control: form.control, name: "jobSearchStatus", render: function (_a) {
                        var field = _a.field;
                        return (React.createElement(form_1.FormItem, null,
                            React.createElement(form_1.FormLabel, null, "Job Search Status"),
                            React.createElement(select_1.Select, { onValueChange: field.onChange, defaultValue: field.value },
                                React.createElement(form_1.FormControl, null,
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, { placeholder: "Select your job search status" }))),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "ACTIVELY_LOOKING" }, "Actively Looking"),
                                    React.createElement(select_1.SelectItem, { value: "OPEN_TO_OFFERS" }, "Open to Offers"),
                                    React.createElement(select_1.SelectItem, { value: "NOT_LOOKING" }, "Not Looking"))),
                            React.createElement(form_1.FormDescription, null, "Let employers know your current job search status"),
                            React.createElement(form_1.FormMessage, null)));
                    } }),
                React.createElement(form_1.FormField, { control: form.control, name: "about", render: function (_a) {
                        var field = _a.field;
                        return (React.createElement(form_1.FormItem, null,
                            React.createElement(form_1.FormLabel, null, "About"),
                            React.createElement(form_1.FormControl, null,
                                React.createElement(textarea_1.Textarea, __assign({ placeholder: "Tell us about yourself...", className: "min-h-[100px]" }, field))),
                            React.createElement(form_1.FormMessage, null)));
                    } }),
                React.createElement(form_1.FormField, { control: form.control, name: "linkedin", render: function (_a) {
                        var field = _a.field;
                        return (React.createElement(form_1.FormItem, null,
                            React.createElement(form_1.FormLabel, null, "LinkedIn Profile"),
                            React.createElement(form_1.FormControl, null,
                                React.createElement(input_1.Input, __assign({}, field, { placeholder: "https://linkedin.com/in/...", value: field.value || "" }))),
                            React.createElement(form_1.FormDescription, null, "Optional"),
                            React.createElement(form_1.FormMessage, null)));
                    } }),
                React.createElement(form_1.FormField, { control: form.control, name: "github", render: function (_a) {
                        var field = _a.field;
                        return (React.createElement(form_1.FormItem, null,
                            React.createElement(form_1.FormLabel, null, "GitHub Profile"),
                            React.createElement(form_1.FormControl, null,
                                React.createElement(input_1.Input, __assign({}, field, { placeholder: "https://github.com/...", value: field.value || "" }))),
                            React.createElement(form_1.FormDescription, null, "Optional"),
                            React.createElement(form_1.FormMessage, null)));
                    } }),
                React.createElement(form_1.FormField, { control: form.control, name: "portfolio", render: function (_a) {
                        var field = _a.field;
                        return (React.createElement(form_1.FormItem, null,
                            React.createElement(form_1.FormLabel, null, "Portfolio Website"),
                            React.createElement(form_1.FormControl, null,
                                React.createElement(input_1.Input, __assign({}, field, { placeholder: "https://...", value: field.value || "" }))),
                            React.createElement(form_1.FormDescription, null, "Optional"),
                            React.createElement(form_1.FormMessage, null)));
                    } }),
                React.createElement(form_1.FormField, { control: form.control, name: "resume", render: function (_a) {
                        var field = _a.field;
                        return (React.createElement(form_1.FormItem, null,
                            React.createElement(form_1.FormLabel, null, "Resume URL"),
                            React.createElement(form_1.FormField, { control: form.control, name: "resume", render: function (_a) {
                                    var field = _a.field;
                                    return (React.createElement(form_1.FormItem, null,
                                        React.createElement(form_1.FormLabel, null, "Upload CV"),
                                        React.createElement(form_1.FormControl, null,
                                            React.createElement(FileUpload_1.FileUpload, { onChange: field.onChange, value: field.value, disabled: pending, className: "w-full" },
                                                React.createElement("p", null, "Drag and drop your CV here or click to upload"),
                                                React.createElement("p", { className: "text-sm text-slate-400" }, "Supports PDF files"))),
                                        React.createElement(form_1.FormDescription, null, "Upload your CV in PDF format"),
                                        React.createElement(form_1.FormMessage, null)));
                                } }),
                            React.createElement(form_1.FormMessage, null)));
                    } })),
            React.createElement("div", { className: "space-y-4" },
                React.createElement("h2", { className: "font-semibold text-xl" }, "Location & Preferences"),
                React.createElement("div", { className: "gap-4 grid grid-cols-1 md:grid-cols-2" },
                    React.createElement(form_1.FormField, { control: form.control, name: "location", render: function (_a) {
                            var field = _a.field;
                            return (React.createElement(form_1.FormItem, null,
                                React.createElement(form_1.FormLabel, null, "Current Location"),
                                React.createElement(form_1.FormControl, null,
                                    React.createElement(input_1.Input, __assign({}, field, { placeholder: "City, Country" }))),
                                React.createElement(form_1.FormMessage, null)));
                        } }),
                    React.createElement(form_1.FormField, { control: form.control, name: "preferredLocation", render: function (_a) {
                            var field = _a.field;
                            return (React.createElement(form_1.FormItem, null,
                                React.createElement(form_1.FormLabel, null, "Preferred Work Location"),
                                React.createElement(form_1.FormControl, null,
                                    React.createElement(input_1.Input, __assign({}, field, { placeholder: "City, Country" }))),
                                React.createElement(form_1.FormMessage, null)));
                        } })),
                React.createElement(form_1.FormField, { control: form.control, name: "remotePreference", render: function (_a) {
                        var field = _a.field;
                        return (React.createElement(form_1.FormItem, null,
                            React.createElement(form_1.FormLabel, null, "Remote Flexibility"),
                            React.createElement(select_1.Select, { onValueChange: field.onChange, defaultValue: field.value },
                                React.createElement(form_1.FormControl, null,
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, { placeholder: "Select work preference" }))),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "Remote" }, "Remote"),
                                    React.createElement(select_1.SelectItem, { value: "Hybrid" }, "Hybrid"),
                                    React.createElement(select_1.SelectItem, { value: "On-site" }, "On-site"))),
                            React.createElement(form_1.FormMessage, null)));
                    } })),
            React.createElement("div", { className: "space-y-4" },
                React.createElement("h2", { className: "font-semibold text-xl" }, "Key Skills & Certifications"),
                React.createElement(form_1.FormField, { control: form.control, name: "yearsOfExperience", render: function (_a) {
                        var field = _a.field;
                        return (React.createElement(form_1.FormItem, null,
                            React.createElement(form_1.FormLabel, null, "Years of Experience / Career Level"),
                            React.createElement(form_1.FormControl, null,
                                React.createElement(input_1.Input, __assign({ type: "number" }, field, { onChange: function (e) { return field.onChange(Number(e.target.value)); } }))),
                            React.createElement(form_1.FormMessage, null)));
                    } }),
                React.createElement(form_1.FormField, { control: form.control, name: "skills", render: function (_a) {
                        var field = _a.field;
                        return (React.createElement(form_1.FormItem, null,
                            React.createElement(form_1.FormLabel, null, "Skills"),
                            React.createElement(form_1.FormControl, null,
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement("div", { className: "flex flex-wrap gap-2" }, field.value.map(function (skill, index) { return (React.createElement("div", { key: index, className: "flex items-center gap-1 bg-secondary px-2 py-1 rounded-md" },
                                        React.createElement("span", null, skill),
                                        React.createElement(button_1.Button, { type: "button", variant: "ghost", size: "sm", className: "hover:bg-transparent p-0 w-4 h-4", onClick: function () {
                                                var newSkills = __spreadArrays(field.value);
                                                newSkills.splice(index, 1);
                                                field.onChange(newSkills);
                                            } },
                                            React.createElement(lucide_react_1.XIcon, { className: "w-3 h-3" })))); })),
                                    React.createElement("div", { className: "flex gap-2" },
                                        React.createElement(input_1.Input, { placeholder: "Add a skill", value: currentSkill, onChange: function (e) { return setCurrentSkill(e.target.value); }, onKeyPress: function (e) {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    if (currentSkill.trim()) {
                                                        field.onChange(__spreadArrays(field.value, [currentSkill.trim()]));
                                                        setCurrentSkill("");
                                                    }
                                                }
                                            } }),
                                        React.createElement(button_1.Button, { type: "button", onClick: function () {
                                                if (currentSkill.trim()) {
                                                    field.onChange(__spreadArrays(field.value, [currentSkill.trim()]));
                                                    setCurrentSkill("");
                                                }
                                            } }, "Add")))),
                            React.createElement(form_1.FormMessage, null)));
                    } }),
                React.createElement("div", { className: "space-y-4" },
                    React.createElement("div", { className: "flex justify-between items-center" },
                        React.createElement("h3", { className: "font-semibold text-lg" }, "Certifications"),
                        React.createElement(button_1.Button, { type: "button", variant: "outline", size: "sm", onClick: function () {
                                return appendCert({
                                    name: "",
                                    issuer: "",
                                    year: new Date().getFullYear(),
                                    url: ""
                                });
                            } },
                            React.createElement(lucide_react_1.PlusCircleIcon, { className: "mr-2 w-4 h-4" }),
                            "Add Certification")),
                    certFields.map(function (field, index) { return (React.createElement(card_1.Card, { key: field.id },
                        React.createElement(card_1.CardContent, { className: "pt-6" },
                            React.createElement("div", { className: "gap-4 grid grid-cols-1 md:grid-cols-2" },
                                React.createElement(form_1.FormField, { control: form.control, name: "certifications." + index + ".name", render: function (_a) {
                                        var field = _a.field;
                                        return (React.createElement(form_1.FormItem, null,
                                            React.createElement(form_1.FormLabel, null, "Certification Name"),
                                            React.createElement(form_1.FormControl, null,
                                                React.createElement(input_1.Input, __assign({}, field, { placeholder: "AWS Solutions Architect" }))),
                                            React.createElement(form_1.FormMessage, null)));
                                    } }),
                                React.createElement(form_1.FormField, { control: form.control, name: "certifications." + index + ".issuer", render: function (_a) {
                                        var field = _a.field;
                                        return (React.createElement(form_1.FormItem, null,
                                            React.createElement(form_1.FormLabel, null, "Issuing Organization"),
                                            React.createElement(form_1.FormControl, null,
                                                React.createElement(input_1.Input, __assign({}, field, { placeholder: "Amazon Web Services" }))),
                                            React.createElement(form_1.FormMessage, null)));
                                    } }),
                                React.createElement(form_1.FormField, { control: form.control, name: "certifications." + index + ".year", render: function (_a) {
                                        var field = _a.field;
                                        return (React.createElement(form_1.FormItem, null,
                                            React.createElement(form_1.FormLabel, null, "Year"),
                                            React.createElement(form_1.FormControl, null,
                                                React.createElement(input_1.Input, __assign({ type: "number" }, field, { onChange: function (e) {
                                                        return field.onChange(Number(e.target.value));
                                                    } }))),
                                            React.createElement(form_1.FormMessage, null)));
                                    } }),
                                React.createElement(form_1.FormField, { control: form.control, name: "certifications." + index + ".url", render: function (_a) {
                                        var field = _a.field;
                                        return (React.createElement(form_1.FormItem, null,
                                            React.createElement(form_1.FormLabel, null, "Certificate URL"),
                                            React.createElement(form_1.FormControl, null,
                                                React.createElement(input_1.Input, __assign({}, field, { placeholder: "https://..." }))),
                                            React.createElement(form_1.FormMessage, null)));
                                    } })),
                            React.createElement(button_1.Button, { type: "button", variant: "ghost", size: "sm", className: "mt-2", onClick: function () { return removeCert(index); } },
                                React.createElement(lucide_react_1.XIcon, { className: "mr-2 w-4 h-4" }),
                                "Remove")))); }))),
            React.createElement("div", { className: "space-y-4" },
                React.createElement("div", { className: "flex justify-between items-center" },
                    React.createElement("h2", { className: "font-semibold text-xl" }, "Educational Background"),
                    React.createElement(button_1.Button, { type: "button", variant: "outline", size: "sm", onClick: function () {
                            return appendEducation({
                                degree: "",
                                institution: "",
                                year: new Date().getFullYear(),
                                fieldOfStudy: ""
                            });
                        } },
                        React.createElement(lucide_react_1.PlusCircleIcon, { className: "mr-2 w-4 h-4" }),
                        "Add Education")),
                educationFields.map(function (field, index) { return (React.createElement(card_1.Card, { key: field.id },
                    React.createElement(card_1.CardContent, { className: "pt-6" },
                        React.createElement("div", { className: "gap-4 grid grid-cols-1 md:grid-cols-2" },
                            React.createElement(form_1.FormField, { control: form.control, name: "education." + index + ".degree", render: function (_a) {
                                    var field = _a.field;
                                    return (React.createElement(form_1.FormItem, null,
                                        React.createElement(form_1.FormLabel, null, "Degree"),
                                        React.createElement(form_1.FormControl, null,
                                            React.createElement(input_1.Input, __assign({}, field, { placeholder: "Bachelor's in..." }))),
                                        React.createElement(form_1.FormMessage, null)));
                                } }),
                            React.createElement(form_1.FormField, { control: form.control, name: "education." + index + ".institution", render: function (_a) {
                                    var field = _a.field;
                                    return (React.createElement(form_1.FormItem, null,
                                        React.createElement(form_1.FormLabel, null, "Institution"),
                                        React.createElement(form_1.FormControl, null,
                                            React.createElement(input_1.Input, __assign({}, field, { placeholder: "University name" }))),
                                        React.createElement(form_1.FormMessage, null)));
                                } }),
                            React.createElement(form_1.FormField, { control: form.control, name: "education." + index + ".year", render: function (_a) {
                                    var field = _a.field;
                                    return (React.createElement(form_1.FormItem, null,
                                        React.createElement(form_1.FormLabel, null, "Year"),
                                        React.createElement(form_1.FormControl, null,
                                            React.createElement(input_1.Input, __assign({ type: "number" }, field, { onChange: function (e) {
                                                    return field.onChange(Number(e.target.value));
                                                } }))),
                                        React.createElement(form_1.FormMessage, null)));
                                } }),
                            React.createElement(form_1.FormField, { control: form.control, name: "education." + index + ".fieldOfStudy", render: function (_a) {
                                    var field = _a.field;
                                    return (React.createElement(form_1.FormItem, null,
                                        React.createElement(form_1.FormLabel, null, "Field of Study"),
                                        React.createElement(form_1.FormControl, null,
                                            React.createElement(input_1.Input, __assign({}, field, { placeholder: "Computer Science" }))),
                                        React.createElement(form_1.FormMessage, null)));
                                } })),
                        React.createElement(button_1.Button, { type: "button", variant: "ghost", size: "sm", className: "mt-2", onClick: function () { return removeEducation(index); } },
                            React.createElement(lucide_react_1.XIcon, { className: "mr-2 w-4 h-4" }),
                            "Remove")))); })),
            React.createElement("div", { className: "space-y-4" },
                React.createElement("h2", { className: "font-semibold text-xl" }, "Employment Preferences"),
                React.createElement("div", { className: "gap-4 grid grid-cols-1 md:grid-cols-2" },
                    React.createElement(form_1.FormField, { control: form.control, name: "availabilityPeriod", render: function (_a) {
                            var field = _a.field;
                            return (React.createElement(form_1.FormItem, null,
                                React.createElement(form_1.FormLabel, null, "Availability / Notice Period (Days)"),
                                React.createElement(form_1.FormControl, null,
                                    React.createElement(input_1.Input, __assign({ type: "number", min: 0 }, field, { onChange: function (e) { return field.onChange(Number(e.target.value)); }, placeholder: "30" }))),
                                React.createElement(form_1.FormDescription, null, "Number of days until you can start"),
                                React.createElement(form_1.FormMessage, null)));
                        } }),
                    React.createElement(form_1.FormField, { control: form.control, name: "expectedSalaryMax", render: function (_a) {
                            var _b;
                            var field = _a.field;
                            return (React.createElement(form_1.FormItem, null,
                                React.createElement(form_1.FormLabel, null, "Expected Salary (Max)"),
                                React.createElement(form_1.FormControl, null,
                                    React.createElement(input_1.Input, __assign({ type: "number", placeholder: "Maximum Salary" }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "", onChange: function (e) {
                                            return field.onChange(e.target.value ? Number(e.target.value) : undefined);
                                        } }))),
                                React.createElement(form_1.FormMessage, null)));
                        } }),
                    React.createElement(form_1.FormField, { control: form.control, name: "expectedSalaryMin", render: function (_a) {
                            var _b;
                            var field = _a.field;
                            return (React.createElement(form_1.FormItem, null,
                                React.createElement(form_1.FormLabel, null, "Expected Salary (Min)"),
                                React.createElement(form_1.FormControl, null,
                                    React.createElement(input_1.Input, __assign({ type: "number", placeholder: "Minimum Salary" }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "", onChange: function (e) {
                                            return field.onChange(e.target.value ? Number(e.target.value) : undefined);
                                        } }))),
                                React.createElement(form_1.FormMessage, null)));
                        } })),
                React.createElement(form_1.FormField, { control: form.control, name: "desiredEmployment", render: function (_a) {
                        var field = _a.field;
                        return (React.createElement(form_1.FormItem, null,
                            React.createElement(form_1.FormLabel, null, "Desired Employment Type / Work Arrangement"),
                            React.createElement(select_1.Select, { onValueChange: field.onChange, defaultValue: field.value },
                                React.createElement(form_1.FormControl, null,
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, { placeholder: "Select employment type" }))),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "Full-time" }, "Full-time"),
                                    React.createElement(select_1.SelectItem, { value: "Part-time" }, "Part-time"),
                                    React.createElement(select_1.SelectItem, { value: "Contract" }, "Contract"),
                                    React.createElement(select_1.SelectItem, { value: "Internship" }, "Internship"))),
                            React.createElement(form_1.FormMessage, null)));
                    } })),
            React.createElement("div", { className: "space-y-4" },
                React.createElement("h2", { className: "font-semibold text-xl" }, "Additional Information"),
                React.createElement(form_1.FormField, { control: form.control, name: "availableFrom", render: function (_a) {
                        var field = _a.field;
                        return (React.createElement(form_1.FormItem, null,
                            React.createElement(form_1.FormLabel, null, "Available From"),
                            React.createElement(form_1.FormControl, null,
                                React.createElement(input_1.Input, __assign({ type: "date" }, field, { value: field.value || "" }))),
                            React.createElement(form_1.FormDescription, null, "Select the date when you are available to start."),
                            React.createElement(form_1.FormMessage, null)));
                    } }),
                React.createElement(form_1.FormField, { control: form.control, name: "previousJobExperience", render: function (_a) {
                        var field = _a.field;
                        return (React.createElement(form_1.FormItem, null,
                            React.createElement(form_1.FormLabel, null, "Previous Job Experience"),
                            React.createElement(form_1.FormControl, null,
                                React.createElement(textarea_1.Textarea, __assign({ placeholder: "Detail your previous job experience..." }, field))),
                            React.createElement(form_1.FormDescription, null, "This data cannot be reversed. Write down correctly."),
                            React.createElement(form_1.FormMessage, null)));
                    } }),
                React.createElement(form_1.FormField, { control: form.control, name: "willingToRelocate", render: function (_a) {
                        var _b;
                        var field = _a.field;
                        return (React.createElement(form_1.FormItem, { className: "flex items-center space-x-2" },
                            React.createElement(form_1.FormControl, null,
                                React.createElement(input_1.Input, { type: "checkbox", checked: (_b = field.value) !== null && _b !== void 0 ? _b : false, onChange: function (e) { return field.onChange(e.target.checked); } })),
                            React.createElement(form_1.FormLabel, null, "Willing to Relocate"),
                            React.createElement(form_1.FormMessage, null)));
                    } })),
            React.createElement(button_1.Button, { type: "submit", disabled: pending, className: "w-full" }, pending ? (React.createElement(React.Fragment, null,
                React.createElement(lucide_react_1.Loader2Icon, { className: "mr-2 w-4 h-4 animate-spin" }),
                "Submitting...")) : ("Submit")))));
}
exports["default"] = JobSeekerForm;
