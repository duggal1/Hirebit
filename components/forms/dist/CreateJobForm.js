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
exports.CreateJobForm = void 0;
var countriesList_1 = require("@/app/utils/countriesList");
var card_1 = require("../ui/card");
var form_1 = require("../ui/form");
var input_1 = require("../ui/input");
var select_1 = require("../ui/select");
var textarea_1 = require("../ui/textarea");
var lucide_react_1 = require("lucide-react");
var button_1 = require("../ui/button");
var image_1 = require("next/image");
var sonner_1 = require("sonner");
var UploadThingReExport_1 = require("../general/UploadThingReExport");
var react_1 = require("react");
var react_hook_form_1 = require("react-hook-form");
var zod_1 = require("@hookform/resolvers/zod");
var zodSchemas_1 = require("@/app/utils/zodSchemas");
var SalaryRangeSelector_1 = require("../general/SalaryRangeSelector");
var JobDescriptionEditor_1 = require("../richTextEditor/JobDescriptionEditor");
var BenefitsSelector_1 = require("../general/BenefitsSelector");
var JobListingDurationSelector_1 = require("../general/JobListingDurationSelector");
var actions_1 = require("@/app/actions");
var payment_modal_1 = require("../stripe/payment-modal");
function CreateJobForm(_a) {
    // Local state to handle comma‑separated input for skills
    var _b, _c;
    var companyAbout = _a.companyAbout, companyLocation = _a.companyLocation, companyLogo = _a.companyLogo, companyXAccount = _a.companyXAccount, companyName = _a.companyName, companyWebsite = _a.companyWebsite;
    var _d = react_1.useState(false), isPaymentModalOpen = _d[0], setIsPaymentModalOpen = _d[1];
    var _e = react_1.useState(null), selectedPriceId = _e[0], setSelectedPriceId = _e[1];
    // Add at the top with other state declarations
    var _f = react_1.useState(null), jobId = _f[0], setJobId = _f[1];
    var _g = react_1.useState(""), skillsInput = _g[0], setSkillsInput = _g[1];
    // State to manage preview generation
    var _h = react_1.useState(false), generatingPreview = _h[0], setGeneratingPreview = _h[1];
    // Initialize react-hook-form with Zod validation
    var form = react_hook_form_1.useForm({
        resolver: zod_1.zodResolver(zodSchemas_1.jobSchema),
        defaultValues: {
            // Existing default fields
            benefits: [],
            companyDescription: companyAbout,
            companyLocation: companyLocation,
            companyName: companyName,
            companyWebsite: companyWebsite,
            companyXAccount: companyXAccount || "",
            employmentType: "",
            jobDescription: "",
            jobTitle: "",
            location: "",
            salaryFrom: 0,
            salaryTo: 0,
            companyLogo: companyLogo,
            listingDuration: 30,
            skillsRequired: [],
            positionRequirement: "Entry",
            requiredExperience: 0,
            jobCategory: "",
            interviewStages: 1,
            visaSponsorship: false,
            compensationDetails: ""
        }
    });
    var _j = react_1.useState(false), pending = _j[0], setPending = _j[1];
    // Function to trigger Gemini preview generation.
    function generatePreview() {
        return __awaiter(this, void 0, void 0, function () {
            var currentValues, res, generatedContent, editorContent, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, 4, 5]);
                        setGeneratingPreview(true);
                        currentValues = form.getValues();
                        return [4 /*yield*/, fetch("/api/ai-jobpost-writer", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ jobData: currentValues })
                            })];
                    case 1:
                        res = _a.sent();
                        if (!res.ok) {
                            throw new Error("Failed to generate preview");
                        }
                        return [4 /*yield*/, res.json()];
                    case 2:
                        generatedContent = (_a.sent()).generatedContent;
                        editorContent = {
                            type: "doc",
                            content: [
                                {
                                    type: "paragraph",
                                    content: [
                                        {
                                            type: "text",
                                            text: generatedContent
                                        }
                                    ]
                                }
                            ]
                        };
                        // Update the jobDescription field with the JSON stringified content
                        form.setValue("jobDescription", JSON.stringify(editorContent));
                        sonner_1.toast.success("Preview generated successfully!");
                        return [3 /*break*/, 5];
                    case 3:
                        error_1 = _a.sent();
                        console.error(error_1);
                        sonner_1.toast.error("Error generating preview: " + error_1.message);
                        return [3 /*break*/, 5];
                    case 4:
                        setGeneratingPreview(false);
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }
    function onSubmit(values) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, success, createdJobId_1, priceIdMap, priceId, error_2;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, 3, 4]);
                        setPending(true);
                        return [4 /*yield*/, actions_1.createJob(values)];
                    case 1:
                        _a = _b.sent(), success = _a.success, createdJobId_1 = _a.jobId;
                        if (!success || !createdJobId_1) {
                            throw new Error('Failed to create job post');
                        }
                        console.log('Job created with initial status:', {
                            jobId: createdJobId_1,
                            status: 'pending_payment' // Initial status
                        });
                        priceIdMap = {
                            30: 'price_1QuYsyRw85cV5wwQ5dPUcH75',
                            60: 'price_1QuYqlRw85cV5wwQsiwP2aFK',
                            90: 'price_1QuYs7Rw85cV5wwQZfNT5mIg'
                        };
                        priceId = priceIdMap[values.listingDuration];
                        if (!priceId) {
                            throw new Error('Invalid listing duration');
                        }
                        // Open payment modal with correct values
                        setSelectedPriceId(priceId);
                        setJobId(createdJobId_1);
                        setIsPaymentModalOpen(true);
                        // Add listener for payment success
                        window.addEventListener('payment_success', function () { return __awaiter(_this, void 0, void 0, function () {
                            var response, job, error_3;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 3, , 4]);
                                        return [4 /*yield*/, fetch("/api/jobs/" + createdJobId_1)];
                                    case 1:
                                        response = _a.sent();
                                        return [4 /*yield*/, response.json()];
                                    case 2:
                                        job = _a.sent();
                                        console.log('Job status after payment:', {
                                            jobId: createdJobId_1,
                                            status: job.status,
                                            paymentStatus: job.paymentStatus,
                                            activatedAt: job.activatedAt
                                        });
                                        return [3 /*break*/, 4];
                                    case 3:
                                        error_3 = _a.sent();
                                        console.error('Error checking job status:', error_3);
                                        return [3 /*break*/, 4];
                                    case 4: return [2 /*return*/];
                                }
                            });
                        }); });
                        return [3 /*break*/, 4];
                    case 2:
                        error_2 = _b.sent();
                        console.error('Job creation error:', error_2);
                        sonner_1.toast.error(error_2.message || "Something went wrong. Please try again.");
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
        React.createElement("form", { onSubmit: form.handleSubmit(onSubmit), className: "flex flex-col gap-8 col-span-1 lg:col-span-2" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Job Information")),
                React.createElement(card_1.CardContent, { className: "space-y-6" },
                    React.createElement("div", { className: "gap-6 grid md:grid-cols-2" },
                        React.createElement(form_1.FormField, { control: form.control, name: "jobTitle", render: function (_a) {
                                var field = _a.field;
                                return (React.createElement(form_1.FormItem, null,
                                    React.createElement(form_1.FormLabel, null, "Job Title"),
                                    React.createElement(form_1.FormControl, null,
                                        React.createElement(input_1.Input, __assign({ placeholder: "Job Title" }, field))),
                                    React.createElement(form_1.FormMessage, null)));
                            } }),
                        React.createElement(form_1.FormField, { control: form.control, name: "employmentType", render: function (_a) {
                                var field = _a.field;
                                return (React.createElement(form_1.FormItem, null,
                                    React.createElement(form_1.FormLabel, null, "Employment Type"),
                                    React.createElement(select_1.Select, { onValueChange: field.onChange, defaultValue: field.value },
                                        React.createElement(form_1.FormControl, null,
                                            React.createElement(select_1.SelectTrigger, null,
                                                React.createElement(select_1.SelectValue, { placeholder: "Select Employment Type" }))),
                                        React.createElement(select_1.SelectContent, null,
                                            React.createElement(select_1.SelectGroup, null,
                                                React.createElement(select_1.SelectLabel, null, "Employment Type"),
                                                React.createElement(select_1.SelectItem, { value: "full-time" }, "Full Time"),
                                                React.createElement(select_1.SelectItem, { value: "part-time" }, "Part Time"),
                                                React.createElement(select_1.SelectItem, { value: "contract" }, "Contract"),
                                                React.createElement(select_1.SelectItem, { value: "internship" }, "Internship")))),
                                    React.createElement(form_1.FormMessage, null)));
                            } })),
                    React.createElement("div", { className: "gap-6 grid md:grid-cols-2" },
                        React.createElement(form_1.FormField, { control: form.control, name: "location", render: function (_a) {
                                var field = _a.field;
                                return (React.createElement(form_1.FormItem, null,
                                    React.createElement(form_1.FormLabel, null, "Location"),
                                    React.createElement(select_1.Select, { onValueChange: field.onChange, defaultValue: field.value },
                                        React.createElement(form_1.FormControl, null,
                                            React.createElement(select_1.SelectTrigger, null,
                                                React.createElement(select_1.SelectValue, { placeholder: "Select Location" }))),
                                        React.createElement(select_1.SelectContent, null,
                                            React.createElement(select_1.SelectGroup, null,
                                                React.createElement(select_1.SelectLabel, null, "Worldwide"),
                                                React.createElement(select_1.SelectItem, { value: "worldwide" },
                                                    React.createElement("span", null, "\uD83C\uDF0D"),
                                                    React.createElement("span", { className: "pl-2" }, "Worldwide / Remote"))),
                                            React.createElement(select_1.SelectGroup, null,
                                                React.createElement(select_1.SelectLabel, null, "Location"),
                                                countriesList_1.countryList.map(function (country) { return (React.createElement(select_1.SelectItem, { value: country.name, key: country.code },
                                                    React.createElement("span", null, country.flagEmoji),
                                                    React.createElement("span", { className: "pl-2" }, country.name))); })))),
                                    React.createElement(form_1.FormMessage, null)));
                            } }),
                        React.createElement(form_1.FormItem, null,
                            React.createElement(form_1.FormLabel, null, "Salary Range"),
                            React.createElement(form_1.FormControl, null,
                                React.createElement(SalaryRangeSelector_1.SalaryRangeSelector, { control: form.control, minSalary: 30000, maxSalary: 1000000 })),
                            React.createElement(form_1.FormMessage, null, ((_b = form.formState.errors.salaryFrom) === null || _b === void 0 ? void 0 : _b.message) || ((_c = form.formState.errors.salaryTo) === null || _c === void 0 ? void 0 : _c.message)))),
                    React.createElement(form_1.FormField, { control: form.control, name: "jobDescription", render: function (_a) {
                            var field = _a.field;
                            return (React.createElement(form_1.FormItem, null,
                                React.createElement(form_1.FormLabel, null, "Job Description"),
                                React.createElement(form_1.FormControl, null,
                                    React.createElement(JobDescriptionEditor_1["default"], { field: field })),
                                React.createElement(form_1.FormMessage, null)));
                        } }),
                    React.createElement("div", { className: "flex justify-end" },
                        React.createElement(button_1.Button, { type: "button", onClick: generatePreview, disabled: generatingPreview }, generatingPreview ? "Generating Preview..." : "Generate Preview")),
                    React.createElement(form_1.FormField, { control: form.control, name: "benefits", render: function (_a) {
                            var field = _a.field;
                            return (React.createElement(form_1.FormItem, null,
                                React.createElement(form_1.FormLabel, null, "Benefits"),
                                React.createElement(form_1.FormControl, null,
                                    React.createElement(BenefitsSelector_1["default"], { field: field })),
                                React.createElement(form_1.FormMessage, null)));
                        } }))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Job Requirements")),
                React.createElement(card_1.CardContent, { className: "space-y-6" },
                    React.createElement(form_1.FormField, { control: form.control, name: "skillsRequired", render: function (_a) {
                            var field = _a.field;
                            return (React.createElement(form_1.FormItem, null,
                                React.createElement(form_1.FormLabel, null, "Skills Required"),
                                React.createElement(form_1.FormControl, null,
                                    React.createElement(input_1.Input, { placeholder: "Enter skills separated by commas (e.g. JavaScript, React)", value: skillsInput, onChange: function (e) { return setSkillsInput(e.target.value); }, onBlur: function () {
                                            field.onChange(skillsInput
                                                .split(",")
                                                .map(function (skill) { return skill.trim(); })
                                                .filter(function (skill) { return skill.length > 0; }));
                                        } })),
                                React.createElement(form_1.FormMessage, null)));
                        } }),
                    React.createElement(form_1.FormField, { control: form.control, name: "positionRequirement", render: function (_a) {
                            var field = _a.field;
                            return (React.createElement(form_1.FormItem, null,
                                React.createElement(form_1.FormLabel, null, "Position Requirement"),
                                React.createElement(select_1.Select, { onValueChange: field.onChange, defaultValue: field.value },
                                    React.createElement(form_1.FormControl, null,
                                        React.createElement(select_1.SelectTrigger, null,
                                            React.createElement(select_1.SelectValue, { placeholder: "Select Position Requirement" }))),
                                    React.createElement(select_1.SelectContent, null,
                                        React.createElement(select_1.SelectItem, { value: "Entry" }, "Entry"),
                                        React.createElement(select_1.SelectItem, { value: "Mid" }, "Mid"),
                                        React.createElement(select_1.SelectItem, { value: "Senior" }, "Senior"),
                                        React.createElement(select_1.SelectItem, { value: "Expert" }, "Expert"))),
                                React.createElement(form_1.FormMessage, null)));
                        } }),
                    React.createElement(form_1.FormField, { control: form.control, name: "requiredExperience", render: function (_a) {
                            var field = _a.field;
                            return (React.createElement(form_1.FormItem, null,
                                React.createElement(form_1.FormLabel, null, "Required Experience (years)"),
                                React.createElement(form_1.FormControl, null,
                                    React.createElement(input_1.Input, { type: "number", placeholder: "e.g. 3", value: field.value, onChange: function (e) { return field.onChange(Number(e.target.value)); } })),
                                React.createElement(form_1.FormMessage, null)));
                        } }),
                    React.createElement(form_1.FormField, { control: form.control, name: "jobCategory", render: function (_a) {
                            var field = _a.field;
                            return (React.createElement(form_1.FormItem, null,
                                React.createElement(form_1.FormLabel, null, "Job Category"),
                                React.createElement(form_1.FormControl, null,
                                    React.createElement(input_1.Input, __assign({ placeholder: "e.g. Software Development, Marketing" }, field))),
                                React.createElement(form_1.FormMessage, null)));
                        } }),
                    React.createElement(form_1.FormField, { control: form.control, name: "interviewStages", render: function (_a) {
                            var field = _a.field;
                            return (React.createElement(form_1.FormItem, null,
                                React.createElement(form_1.FormLabel, null, "Number of Interview Stages"),
                                React.createElement(form_1.FormControl, null,
                                    React.createElement(input_1.Input, { type: "number", placeholder: "e.g. 3", value: field.value, onChange: function (e) { return field.onChange(Number(e.target.value)); } })),
                                React.createElement(form_1.FormMessage, null)));
                        } }),
                    React.createElement(form_1.FormField, { control: form.control, name: "visaSponsorship", render: function (_a) {
                            var field = _a.field;
                            return (React.createElement(form_1.FormItem, { className: "flex flex-row items-center space-x-3" },
                                React.createElement(form_1.FormControl, null,
                                    React.createElement("input", { type: "checkbox", checked: field.value, onChange: function (e) { return field.onChange(e.target.checked); } })),
                                React.createElement(form_1.FormLabel, { className: "flex-1" }, "Visa Sponsorship Available"),
                                React.createElement(form_1.FormMessage, null)));
                        } }),
                    React.createElement(form_1.FormField, { control: form.control, name: "compensationDetails", render: function (_a) {
                            var field = _a.field;
                            return (React.createElement(form_1.FormItem, null,
                                React.createElement(form_1.FormLabel, null, "Compensation Details"),
                                React.createElement(form_1.FormControl, null,
                                    React.createElement(textarea_1.Textarea, __assign({ placeholder: 'Enter additional details in JSON format (e.g. {"bonus": 5000, "stockOptions": "0.05"})' }, field))),
                                React.createElement(form_1.FormMessage, null)));
                        } }))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Company Information")),
                React.createElement(card_1.CardContent, { className: "space-y-6" },
                    React.createElement("div", { className: "gap-6 grid md:grid-cols-2" },
                        React.createElement(form_1.FormField, { control: form.control, name: "companyName", render: function (_a) {
                                var field = _a.field;
                                return (React.createElement(form_1.FormItem, null,
                                    React.createElement(form_1.FormLabel, null, "Company Name"),
                                    React.createElement(form_1.FormControl, null,
                                        React.createElement(input_1.Input, __assign({ placeholder: "Company Name" }, field))),
                                    React.createElement(form_1.FormMessage, null)));
                            } }),
                        React.createElement(form_1.FormField, { control: form.control, name: "companyLocation", render: function (_a) {
                                var field = _a.field;
                                return (React.createElement(form_1.FormItem, null,
                                    React.createElement(form_1.FormLabel, null, "Location"),
                                    React.createElement(select_1.Select, { onValueChange: field.onChange, defaultValue: field.value },
                                        React.createElement(form_1.FormControl, null,
                                            React.createElement(select_1.SelectTrigger, null,
                                                React.createElement(select_1.SelectValue, { placeholder: "Select Location" }))),
                                        React.createElement(select_1.SelectContent, null,
                                            React.createElement(select_1.SelectGroup, null,
                                                React.createElement(select_1.SelectLabel, null, "Worldwide"),
                                                React.createElement(select_1.SelectItem, { value: "worldwide" },
                                                    React.createElement("span", null, "\uD83C\uDF0D"),
                                                    React.createElement("span", { className: "pl-2" }, "Worldwide"))),
                                            React.createElement(select_1.SelectGroup, null,
                                                React.createElement(select_1.SelectLabel, null, "Location"),
                                                countriesList_1.countryList.map(function (country) { return (React.createElement(select_1.SelectItem, { value: country.name, key: country.name },
                                                    React.createElement("span", null, country.flagEmoji),
                                                    React.createElement("span", { className: "pl-2" }, country.name))); })))),
                                    React.createElement(form_1.FormMessage, null)));
                            } })),
                    React.createElement("div", { className: "gap-6 grid md:grid-cols-2" },
                        React.createElement(form_1.FormField, { control: form.control, name: "companyWebsite", render: function (_a) {
                                var field = _a.field;
                                return (React.createElement(form_1.FormItem, null,
                                    React.createElement(form_1.FormLabel, null, "Company Website"),
                                    React.createElement(form_1.FormControl, null,
                                        React.createElement("div", { className: "flex" },
                                            React.createElement("span", { className: "flex justify-center items-center border-input bg-muted px-3 border border-r-0 rounded-l-md text-muted-foreground text-sm" }, "https://"),
                                            React.createElement(input_1.Input, __assign({}, field, { placeholder: "Company Website", className: "rounded-l-none" })))),
                                    React.createElement(form_1.FormMessage, null)));
                            } }),
                        React.createElement(form_1.FormField, { control: form.control, name: "companyXAccount", render: function (_a) {
                                var field = _a.field;
                                return (React.createElement(form_1.FormItem, null,
                                    React.createElement(form_1.FormLabel, null, "Company X Account"),
                                    React.createElement(form_1.FormControl, null,
                                        React.createElement("div", { className: "flex" },
                                            React.createElement("span", { className: "flex justify-center items-center border-input bg-muted px-3 border border-r-0 rounded-l-md text-muted-foreground text-sm" }, "@"),
                                            React.createElement(input_1.Input, __assign({}, field, { placeholder: "Company X Account", className: "rounded-l-none" })))),
                                    React.createElement(form_1.FormMessage, null)));
                            } })),
                    React.createElement(form_1.FormField, { control: form.control, name: "companyDescription", render: function (_a) {
                            var field = _a.field;
                            return (React.createElement(form_1.FormItem, null,
                                React.createElement(form_1.FormLabel, null, "Company Description"),
                                React.createElement(form_1.FormControl, null,
                                    React.createElement(textarea_1.Textarea, __assign({ placeholder: "Company Description", className: "min-h-[120px]" }, field))),
                                React.createElement(form_1.FormMessage, null)));
                        } }),
                    React.createElement(form_1.FormField, { control: form.control, name: "companyLogo", render: function (_a) {
                            var field = _a.field;
                            return (React.createElement(form_1.FormItem, null,
                                React.createElement(form_1.FormLabel, null, "Company Logo"),
                                React.createElement(form_1.FormControl, null,
                                    React.createElement("div", null, field.value ? (React.createElement("div", { className: "relative w-fit" },
                                        React.createElement(image_1["default"], { src: field.value, alt: "Company Logo", width: 100, height: 100, className: "rounded-lg" }),
                                        React.createElement(button_1.Button, { type: "button", variant: "destructive", size: "icon", className: "-top-2 -right-2 absolute", onClick: function () { return field.onChange(""); } },
                                            React.createElement(lucide_react_1.XIcon, { className: "w-4 h-4" })))) : (React.createElement(UploadThingReExport_1.UploadDropzone, { endpoint: "imageUploader", onClientUploadComplete: function (res) {
                                            field.onChange(res[0].url);
                                            sonner_1.toast.success("Logo uploaded successfully!");
                                        }, onUploadError: function () {
                                            sonner_1.toast.error("Something went wrong. Please try again.");
                                        } })))),
                                React.createElement(form_1.FormMessage, null)));
                        } }))),
            "// In the Card component at the bottom of the form",
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Job Listing Duration")),
                React.createElement(card_1.CardContent, null,
                    React.createElement(form_1.FormField, { control: form.control, name: "listingDuration", render: function (_a) {
                            var field = _a.field;
                            return (React.createElement(form_1.FormItem, null,
                                React.createElement(form_1.FormControl, null,
                                    React.createElement(JobListingDurationSelector_1.JobListingDurationSelector, { field: field })),
                                React.createElement(form_1.FormMessage, null)));
                        } })),
                React.createElement(payment_modal_1.PaymentModal, { isOpen: isPaymentModalOpen, onClose: function () { return setIsPaymentModalOpen(false); }, priceId: selectedPriceId, jobId: jobId })),
            React.createElement(button_1.Button, { type: "submit", className: "w-full", disabled: pending }, pending ? "Submitting..." : "Continue"))));
}
exports.CreateJobForm = CreateJobForm;
