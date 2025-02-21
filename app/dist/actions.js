"use server";
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
exports.__esModule = true;
exports.submitJobSeekerResume = exports.submitJobSeeker = exports.getJobMetrics = exports.trackJobClick = exports.trackJobView = exports.submitTest = exports.submitJobApplication = exports.getActiveJobs = exports.unsaveJobPost = exports.saveJobPost = exports.deleteJobPost = exports.updateJobPost = exports.handlePaymentSuccess = exports.createPaymentIntent = exports.createJob = exports.createJobSeeker = exports.createCompany = void 0;
var zod_1 = require("zod");
var hooks_1 = require("./utils/hooks");
var db_1 = require("./utils/db");
var navigation_1 = require("next/navigation");
var stripe_1 = require("./utils/stripe");
var cache_1 = require("next/cache");
var arcjet_1 = require("./utils/arcjet");
var next_1 = require("@arcjet/next");
var client_1 = require("./utils/inngest/client");
var jobMetrics_1 = require("./utils/jobMetrics");
var client_2 = require("@prisma/client");
var auth_1 = require("./utils/auth");
var zodSchemas_1 = require("./utils/zodSchemas");
var uuid_1 = require("uuid"); // Import UUID generator
var aj = arcjet_1["default"]
    .withRule(arcjet_1.shield({
    mode: "LIVE"
}))
    .withRule(arcjet_1.detectBot({
    mode: "LIVE",
    allow: []
}));
var BASE_URL = process.env.NODE_ENV === "production"
    ? "https://your-production-domain.com"
    : "http://localhost:3000";
function createCompany(data) {
    return __awaiter(this, void 0, void 0, function () {
        var user, req, decision, validatedData, companyData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, hooks_1.requireUser()];
                case 1:
                    user = _a.sent();
                    return [4 /*yield*/, next_1.request()];
                case 2:
                    req = _a.sent();
                    return [4 /*yield*/, aj.protect(req)];
                case 3:
                    decision = _a.sent();
                    if (decision.isDenied()) {
                        throw new Error("Forbidden");
                    }
                    validatedData = zodSchemas_1.companySchema.parse(data);
                    companyData = {
                        companyID: uuid_1.v4(),
                        name: validatedData.name,
                        location: validatedData.location,
                        about: validatedData.about,
                        logo: validatedData.logo,
                        website: validatedData.website,
                        xAccount: validatedData.xAccount,
                        industry: validatedData.industry || "Technology",
                        foundedAt: validatedData.foundedAt ? new Date(validatedData.foundedAt) : null,
                        employeeCount: validatedData.employeeCount,
                        annualRevenue: validatedData.annualRevenue,
                        companyType: validatedData.companyType,
                        linkedInUrl: validatedData.linkedInUrl,
                        hiringStatus: validatedData.hiringStatus,
                        glassdoorRating: validatedData.glassdoorRating,
                        techStack: validatedData.techStack
                    };
                    console.log(companyData);
                    return [4 /*yield*/, db_1.prisma.user.update({
                            where: {
                                id: user.id
                            },
                            data: {
                                onboardingCompleted: true,
                                userType: "COMPANY",
                                Company: {
                                    create: companyData
                                }
                            }
                        })];
                case 4:
                    _a.sent();
                    return [2 /*return*/, navigation_1.redirect("/")];
            }
        });
    });
}
exports.createCompany = createCompany;
function createJobSeeker(data) {
    return __awaiter(this, void 0, void 0, function () {
        var user, _a, jobId, validatedData, jobSeeker, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, hooks_1.requireUser()];
                case 1:
                    user = _b.sent();
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 6, , 7]);
                    _a = zodSchemas_1.jobSeekerSchema.parse(data), jobId = _a.jobId, validatedData = __rest(_a, ["jobId"]);
                    return [4 /*yield*/, db_1.prisma.jobSeeker.create({
                            data: {
                                name: validatedData.name,
                                about: validatedData.about,
                                resume: validatedData.resume,
                                location: validatedData.location,
                                skills: validatedData.skills,
                                experience: validatedData.experience,
                                education: validatedData.education,
                                expectedSalaryMax: validatedData.expectedSalaryMax,
                                preferredLocation: validatedData.preferredLocation,
                                remotePreference: validatedData.remotePreference,
                                yearsOfExperience: validatedData.yearsOfExperience,
                                availabilityPeriod: validatedData.availabilityPeriod,
                                desiredEmployment: validatedData.desiredEmployment,
                                certifications: validatedData.certifications
                                    ? validatedData.certifications
                                    : client_2.Prisma.JsonNull,
                                phoneNumber: validatedData.phoneNumber,
                                linkedin: validatedData.linkedin || null,
                                github: validatedData.github || null,
                                portfolio: validatedData.portfolio || null,
                                user: {
                                    connect: { id: user.id }
                                },
                                availableFrom: validatedData.availableFrom,
                                previousJobExperience: validatedData.previousJobExperience,
                                willingToRelocate: validatedData.willingToRelocate,
                                // Required fields
                                email: validatedData.email,
                                industry: validatedData.industry,
                                currentJobTitle: validatedData.currentJobTitle,
                                jobSearchStatus: validatedData.jobSearchStatus
                            }
                        })];
                case 3:
                    jobSeeker = _b.sent();
                    if (!jobId) return [3 /*break*/, 5];
                    return [4 /*yield*/, db_1.prisma.jobApplication.create({
                            data: {
                                jobSeekerId: jobSeeker.id,
                                jobId: jobId,
                                status: "PENDING",
                                resume: validatedData.resume
                            }
                        })];
                case 4:
                    _b.sent();
                    _b.label = 5;
                case 5: return [2 /*return*/, { success: true }];
                case 6:
                    error_1 = _b.sent();
                    console.error('Server error:', error_1);
                    throw new Error(error_1 instanceof zod_1.z.ZodError
                        ? "Invalid form data"
                        : "Failed to create profile");
                case 7: return [2 /*return*/];
            }
        });
    });
}
exports.createJobSeeker = createJobSeeker;
function createJob(data) {
    return __awaiter(this, void 0, void 0, function () {
        var user, validatedData, company, jobPost, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("[createJob] Received data:", data);
                    return [4 /*yield*/, hooks_1.requireUser()];
                case 1:
                    user = _a.sent();
                    validatedData = zodSchemas_1.jobSchema.parse(data);
                    return [4 /*yield*/, db_1.prisma.company.findUnique({
                            where: { userId: user.id },
                            select: {
                                id: true,
                                user: {
                                    select: {
                                        stripeCustomerId: true,
                                        email: true
                                    }
                                }
                            }
                        })];
                case 2:
                    company = _a.sent();
                    if (!(company === null || company === void 0 ? void 0 : company.id)) {
                        throw new Error("No company associated with user");
                    }
                    return [4 /*yield*/, db_1.prisma.jobPost.create({
                            data: {
                                companyId: company.id,
                                jobTitle: validatedData.jobTitle,
                                employmentType: validatedData.employmentType,
                                location: validatedData.location,
                                salaryFrom: validatedData.salaryFrom,
                                salaryTo: validatedData.salaryTo,
                                listingDuration: validatedData.listingDuration,
                                benefits: validatedData.benefits,
                                jobDescription: validatedData.jobDescription,
                                status: "ACTIVE",
                                skillsRequired: validatedData.skillsRequired,
                                positionRequirement: validatedData.positionRequirement,
                                requiredExperience: validatedData.requiredExperience,
                                jobCategory: validatedData.jobCategory,
                                interviewStages: validatedData.interviewStages,
                                visaSponsorship: validatedData.visaSponsorship,
                                compensationDetails: validatedData.compensationDetails,
                                paidAt: new Date(),
                                paymentStatus: "COMPLETED"
                            }
                        })];
                case 3:
                    jobPost = _a.sent();
                    _a.label = 4;
                case 4:
                    _a.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, client_1.inngest.send({
                            name: "payment.succeeded",
                            data: {
                                jobId: jobPost.id,
                                paymentIntentId: "manual_creation",
                                amount: validatedData.salaryFrom,
                                currency: "usd"
                            }
                        })];
                case 5:
                    _a.sent();
                    console.log("[createJob] Inngest event sent for job:", jobPost.id);
                    return [3 /*break*/, 7];
                case 6:
                    error_2 = _a.sent();
                    console.error("[createJob] Failed to send Inngest event:", error_2);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/, { success: true, jobId: jobPost.id }];
            }
        });
    });
}
exports.createJob = createJob;
// Add new action to handle payment intent creation
function createPaymentIntent(priceId, jobId) {
    return __awaiter(this, void 0, void 0, function () {
        var user, company, stripeCustomerId, customer, PRICE_MAPPING, amount, paymentIntent;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, hooks_1.requireUser()];
                case 1:
                    user = _a.sent();
                    return [4 /*yield*/, db_1.prisma.company.findUnique({
                            where: { userId: user.id },
                            select: {
                                id: true,
                                user: { select: { stripeCustomerId: true } }
                            }
                        })];
                case 2:
                    company = _a.sent();
                    if (!company) {
                        throw new Error("Company not found");
                    }
                    stripeCustomerId = company.user.stripeCustomerId;
                    if (!!stripeCustomerId) return [3 /*break*/, 5];
                    return [4 /*yield*/, stripe_1.stripe.customers.create({
                            email: user.email,
                            name: user.name || undefined
                        })];
                case 3:
                    customer = _a.sent();
                    stripeCustomerId = customer.id;
                    return [4 /*yield*/, db_1.prisma.user.update({
                            where: { id: user.id },
                            data: { stripeCustomerId: customer.id }
                        })];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    PRICE_MAPPING = {
                        'price_1QuYsyRw85cV5wwQ5dPUcH75': 4900,
                        'price_1QuYqlRw85cV5wwQsiwP2aFK': 12900,
                        'price_1QuYs7Rw85cV5wwQZfNT5mIg': 24900
                    };
                    amount = PRICE_MAPPING[priceId];
                    if (!amount) {
                        throw new Error("Invalid price ID");
                    }
                    return [4 /*yield*/, stripe_1.stripe.paymentIntents.create({
                            amount: amount,
                            currency: 'usd',
                            customer: stripeCustomerId,
                            metadata: {
                                jobId: jobId,
                                priceId: priceId
                            }
                        })];
                case 6:
                    paymentIntent = _a.sent();
                    return [2 /*return*/, {
                            clientSecret: paymentIntent.client_secret,
                            amount: amount
                        }];
            }
        });
    });
}
exports.createPaymentIntent = createPaymentIntent;
// Add new action to handle payment success
function handlePaymentSuccess(paymentIntentId) {
    return __awaiter(this, void 0, void 0, function () {
        var paymentIntent, jobId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, stripe_1.stripe.paymentIntents.retrieve(paymentIntentId)];
                case 1:
                    paymentIntent = _a.sent();
                    if (paymentIntent.status !== 'succeeded') {
                        throw new Error('Payment not successful');
                    }
                    jobId = paymentIntent.metadata.jobId;
                    // Activate the job post
                    return [4 /*yield*/, db_1.prisma.jobPost.update({
                            where: { id: jobId },
                            data: {
                                status: "ACTIVE",
                                paidAt: new Date(),
                                paymentId: paymentIntentId
                            }
                        })];
                case 2:
                    // Activate the job post
                    _a.sent();
                    return [2 /*return*/, { success: true }];
            }
        });
    });
}
exports.handlePaymentSuccess = handlePaymentSuccess;
function updateJobPost(data, jobId) {
    return __awaiter(this, void 0, void 0, function () {
        var user, validatedData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, hooks_1.requireUser()];
                case 1:
                    user = _a.sent();
                    validatedData = zodSchemas_1.jobSchema.parse(data);
                    return [4 /*yield*/, db_1.prisma.jobPost.update({
                            where: {
                                id: jobId,
                                company: {
                                    userId: user.id
                                }
                            },
                            data: {
                                jobDescription: validatedData.jobDescription,
                                jobTitle: validatedData.jobTitle,
                                employmentType: validatedData.employmentType,
                                location: validatedData.location,
                                salaryFrom: validatedData.salaryFrom,
                                salaryTo: validatedData.salaryTo,
                                listingDuration: validatedData.listingDuration,
                                benefits: validatedData.benefits
                            }
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/, navigation_1.redirect("/my-jobs")];
            }
        });
    });
}
exports.updateJobPost = updateJobPost;
function deleteJobPost(jobId) {
    return __awaiter(this, void 0, void 0, function () {
        var user, jobToDelete_1, error_3;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, hooks_1.requireUser()];
                case 1:
                    user = _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 5, , 6]);
                    return [4 /*yield*/, db_1.prisma.jobPost.findFirst({
                            where: {
                                id: jobId,
                                company: {
                                    userId: user.id
                                }
                            },
                            select: {
                                jobTitle: true,
                                location: true,
                                metrics: true,
                                JobAnalysis: true,
                                JobApplication: true,
                                SavedJobPost: true
                            }
                        })];
                case 3:
                    jobToDelete_1 = _a.sent();
                    if (!jobToDelete_1) {
                        return [2 /*return*/, {
                                success: false,
                                error: "Job post not found or unauthorized"
                            }];
                    }
                    // Use transaction to ensure all related records are deleted properly
                    return [4 /*yield*/, db_1.prisma.$transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!jobToDelete_1.metrics) return [3 /*break*/, 2];
                                        return [4 /*yield*/, tx.jobMetrics["delete"]({
                                                where: { jobPostId: jobId }
                                            })];
                                    case 1:
                                        _a.sent();
                                        _a.label = 2;
                                    case 2:
                                        if (!jobToDelete_1.JobAnalysis) return [3 /*break*/, 4];
                                        return [4 /*yield*/, tx.jobAnalysis["delete"]({
                                                where: { jobPostId: jobId }
                                            })];
                                    case 3:
                                        _a.sent();
                                        _a.label = 4;
                                    case 4: 
                                    // Delete all applications
                                    return [4 /*yield*/, tx.jobApplication.deleteMany({
                                            where: { jobId: jobId }
                                        })];
                                    case 5:
                                        // Delete all applications
                                        _a.sent();
                                        // Delete all saved job posts
                                        return [4 /*yield*/, tx.savedJobPost.deleteMany({
                                                where: { jobId: jobId }
                                            })];
                                    case 6:
                                        // Delete all saved job posts
                                        _a.sent();
                                        // Finally delete the job post
                                        return [4 /*yield*/, tx.jobPost["delete"]({
                                                where: { id: jobId }
                                            })];
                                    case 7:
                                        // Finally delete the job post
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 4:
                    // Use transaction to ensure all related records are deleted properly
                    _a.sent();
                    return [2 /*return*/, {
                            success: true,
                            jobTitle: jobToDelete_1.jobTitle,
                            location: jobToDelete_1.location
                        }];
                case 5:
                    error_3 = _a.sent();
                    console.error("Error deleting job post:", error_3);
                    return [2 /*return*/, {
                            success: false,
                            error: error_3 instanceof Error ? error_3.message : "Failed to delete job post"
                        }];
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.deleteJobPost = deleteJobPost;
function saveJobPost(jobId) {
    return __awaiter(this, void 0, void 0, function () {
        var user;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, hooks_1.requireUser()];
                case 1:
                    user = _a.sent();
                    return [4 /*yield*/, db_1.prisma.savedJobPost.create({
                            data: {
                                jobId: jobId,
                                userId: user.id
                            }
                        })];
                case 2:
                    _a.sent();
                    cache_1.revalidatePath("/job/" + jobId);
                    return [2 /*return*/];
            }
        });
    });
}
exports.saveJobPost = saveJobPost;
function unsaveJobPost(savedJobPostId) {
    return __awaiter(this, void 0, void 0, function () {
        var user, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, hooks_1.requireUser()];
                case 1:
                    user = _a.sent();
                    return [4 /*yield*/, db_1.prisma.savedJobPost["delete"]({
                            where: {
                                id: savedJobPostId,
                                userId: user.id
                            },
                            select: {
                                jobId: true
                            }
                        })];
                case 2:
                    data = _a.sent();
                    cache_1.revalidatePath("/job/" + data.jobId);
                    return [2 /*return*/];
            }
        });
    });
}
exports.unsaveJobPost = unsaveJobPost;
function getActiveJobs() {
    return __awaiter(this, void 0, void 0, function () {
        var jobs;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.prisma.jobPost.findMany({
                        where: {
                            status: "ACTIVE"
                        },
                        select: {
                            id: true,
                            jobTitle: true,
                            jobDescription: true,
                            salaryFrom: true,
                            salaryTo: true,
                            employmentType: true,
                            location: true,
                            createdAt: true,
                            company: {
                                select: {
                                    logo: true,
                                    name: true,
                                    about: true,
                                    location: true
                                }
                            }
                        },
                        orderBy: {
                            createdAt: 'desc'
                        }
                    })];
                case 1:
                    jobs = _a.sent();
                    console.log("Active jobs found:", jobs.length);
                    return [2 /*return*/, jobs];
            }
        });
    });
}
exports.getActiveJobs = getActiveJobs;
function submitJobApplication(jobId, formData) {
    return __awaiter(this, void 0, void 0, function () {
        var user, jobSeeker, application;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, hooks_1.requireUser()];
                case 1:
                    user = _a.sent();
                    return [4 /*yield*/, db_1.prisma.jobSeeker.findUnique({
                            where: { userId: user.id },
                            select: {
                                id: true,
                                resume: true
                            }
                        })];
                case 2:
                    jobSeeker = _a.sent();
                    if (!jobSeeker) {
                        throw new Error("Please complete your profile first");
                    }
                    return [4 /*yield*/, db_1.prisma.jobApplication.create({
                            data: {
                                jobSeekerId: jobSeeker.id,
                                jobId: jobId,
                                coverLetter: formData.get("coverLetter"),
                                resume: jobSeeker.resume,
                                status: "PENDING"
                            }
                        })];
                case 3:
                    application = _a.sent();
                    // Also update job metrics to trigger Gemini analysis and store metrics data
                    return [4 /*yield*/, jobMetrics_1.calculateAndUpdateJobMetrics(jobId)];
                case 4:
                    // Also update job metrics to trigger Gemini analysis and store metrics data
                    _a.sent();
                    cache_1.revalidatePath("/job/" + jobId);
                    return [2 /*return*/, { success: true }];
            }
        });
    });
}
exports.submitJobApplication = submitJobApplication;
function evaluateCode(code, question) {
    return __awaiter(this, void 0, Promise, function () {
        var evaluationRes, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetch(BASE_URL + "/api/evaluate-code", {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                code: code,
                                question: question // Pass the question context
                            })
                        })];
                case 1:
                    evaluationRes = _a.sent();
                    if (!evaluationRes.ok)
                        throw new Error('Evaluation failed');
                    return [2 /*return*/, evaluationRes.json()];
                case 2:
                    error_4 = _a.sent();
                    console.error('Code evaluation error:', error_4);
                    return [2 /*return*/, {
                            score: 0,
                            feedback: 'Evaluation service unavailable',
                            correctness: false,
                            efficiency: "low"
                        }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function submitTest(jobId, data) {
    return __awaiter(this, void 0, void 0, function () {
        var user, job, jobSeeker, existing, testRes, testData, score, evaluation, application;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, hooks_1.requireUser()];
                case 1:
                    user = _a.sent();
                    return [4 /*yield*/, db_1.prisma.jobPost.findUnique({
                            where: { id: jobId },
                            select: { jobDescription: true }
                        })];
                case 2:
                    job = _a.sent();
                    if (!job)
                        throw new Error("Job not found");
                    return [4 /*yield*/, db_1.prisma.jobSeeker.findUnique({
                            where: { userId: user.id }
                        })];
                case 3:
                    jobSeeker = _a.sent();
                    if (!jobSeeker)
                        throw new Error("Job seeker profile not found");
                    return [4 /*yield*/, db_1.prisma.jobApplication.findFirst({
                            where: {
                                jobId: jobId,
                                jobSeekerId: jobSeeker.id,
                                status: { "in": ['PENDING', 'ACCEPTED'] }
                            }
                        })];
                case 4:
                    existing = _a.sent();
                    if (existing) {
                        throw new Error("You've already completed this test");
                    }
                    return [4 /*yield*/, fetch(BASE_URL + "/api/generate-test", {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ jobDescription: job.jobDescription })
                        })];
                case 5:
                    testRes = _a.sent();
                    return [4 /*yield*/, testRes.json()];
                case 6:
                    testData = _a.sent();
                    score = 0;
                    if (!(data.status === 'completed' && data.code)) return [3 /*break*/, 8];
                    return [4 /*yield*/, evaluateCode(data.code, testData.questions[0])];
                case 7:
                    evaluation = _a.sent();
                    score = evaluation.score;
                    _a.label = 8;
                case 8: return [4 /*yield*/, db_1.prisma.jobApplication.create({
                        data: {
                            jobSeeker: {
                                connect: { id: jobSeeker.id }
                            },
                            job: {
                                connect: { id: jobId }
                            },
                            status: data.status === 'completed' ?
                                (score >= 70 ? 'ACCEPTED' : 'REJECTED') : 'REJECTED',
                            aiScore: score,
                            answers: data.code ? { code: data.code } : undefined,
                            resume: jobSeeker.resume
                        }
                    })];
                case 9:
                    application = _a.sent();
                    if (!(score < 70)) return [3 /*break*/, 11];
                    return [4 /*yield*/, db_1.prisma.jobSeeker.update({
                            where: { id: jobSeeker.id },
                            data: {
                                lastAttemptAt: new Date()
                            }
                        })];
                case 10:
                    _a.sent();
                    _a.label = 11;
                case 11: return [2 /*return*/, { score: score }];
            }
        });
    });
}
exports.submitTest = submitTest;
function isInCooldown(lastAttemptAt) {
    if (!lastAttemptAt)
        return false;
    var cooldownHours = 24;
    var cooldownEnds = new Date(lastAttemptAt.getTime() + cooldownHours * 60 * 60 * 1000);
    return new Date() < cooldownEnds;
}
function trackJobView(jobId) {
    "use server";
    return __awaiter(this, void 0, void 0, function () {
        var error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    // Update job post views
                    return [4 /*yield*/, db_1.prisma.jobPost.update({
                            where: { id: jobId },
                            data: { views: { increment: 1 } }
                        })];
                case 1:
                    // Update job post views
                    _a.sent();
                    // Update metrics with location data
                    return [4 /*yield*/, jobMetrics_1.updateMetricsWithLocation(jobId, 'view')];
                case 2:
                    // Update metrics with location data
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_5 = _a.sent();
                    console.error('Failed to track job view:', error_5);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.trackJobView = trackJobView;
function trackJobClick(jobId) {
    "use server";
    return __awaiter(this, void 0, void 0, function () {
        var error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    // Update job post clicks
                    return [4 /*yield*/, db_1.prisma.jobPost.update({
                            where: { id: jobId },
                            data: { clicks: { increment: 1 } }
                        })];
                case 1:
                    // Update job post clicks
                    _a.sent();
                    // Update metrics with location data
                    return [4 /*yield*/, jobMetrics_1.updateMetricsWithLocation(jobId, 'click')];
                case 2:
                    // Update metrics with location data
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_6 = _a.sent();
                    console.error('Failed to track job click:', error_6);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.trackJobClick = trackJobClick;
function getJobMetrics(jobId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, jobMetrics_1.calculateAndUpdateJobMetrics(jobId)];
        });
    });
}
exports.getJobMetrics = getJobMetrics;
exports.submitJobSeeker = function (prevState, formData) { return __awaiter(void 0, void 0, void 0, function () {
    var session, rawData, validatedData, jobSeeker, error_7;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 5, , 6]);
                return [4 /*yield*/, auth_1.auth()];
            case 1:
                session = _b.sent();
                if (!((_a = session === null || session === void 0 ? void 0 : session.user) === null || _a === void 0 ? void 0 : _a.id)) {
                    return [2 /*return*/, {
                            message: "You must be logged in to create a profile",
                            success: false
                        }];
                }
                rawData = {
                    educationDetails: formData.get('education')
                        ? JSON.parse(formData.get('education'))
                        : [],
                    education: formData.get('education')
                        ? JSON.parse(formData.get('education'))
                        : [],
                    name: formData.get('name'),
                    phoneNumber: formData.get('phoneNumber') || "",
                    jobId: formData.get('jobId') || "",
                    about: formData.get('about'),
                    resume: formData.get('resume'),
                    location: formData.get('location'),
                    skills: formData.get('skills') ? JSON.parse(formData.get('skills')) : [],
                    experience: Number(formData.get('experience')) || 0,
                    expectedSalaryMin: formData.get('expectedSalaryMin')
                        ? Number(formData.get('expectedSalaryMin'))
                        : null,
                    expectedSalaryMax: formData.get('expectedSalaryMax')
                        ? Number(formData.get('expectedSalaryMax'))
                        : null,
                    preferredLocation: formData.get('preferredLocation'),
                    remotePreference: formData.get('remotePreference'),
                    yearsOfExperience: Number(formData.get('yearsOfExperience')) || 0,
                    availabilityPeriod: Number(formData.get('availabilityPeriod')) || 30,
                    desiredEmployment: formData.get('desiredEmployment'),
                    certifications: formData.get('certifications')
                        ? JSON.parse(formData.get('certifications'))
                        : null,
                    linkedin: formData.get('linkedin') || null,
                    github: formData.get('github') || null,
                    portfolio: formData.get('portfolio') || null,
                    availableFrom: formData.get("availableFrom")
                        ? new Date(formData.get("availableFrom")).toISOString()
                        : null,
                    previousJobExperience: formData.get("previousJobExperience") || null,
                    willingToRelocate: formData.get("willingToRelocate") === "true",
                    // New fields
                    email: formData.get('email'),
                    currentJobTitle: formData.get('currentJobTitle') || null,
                    industry: formData.get('industry'),
                    jobSearchStatus: formData.get('jobSearchStatus')
                };
                validatedData = zodSchemas_1.jobSeekerSchema.parse(rawData);
                return [4 /*yield*/, db_1.prisma.jobSeeker.create({
                        data: {
                            name: validatedData.name,
                            about: validatedData.about,
                            resume: validatedData.resume,
                            location: validatedData.location,
                            skills: validatedData.skills,
                            experience: validatedData.experience,
                            education: validatedData.education,
                            expectedSalaryMax: validatedData.expectedSalaryMax,
                            preferredLocation: validatedData.preferredLocation,
                            remotePreference: validatedData.remotePreference,
                            yearsOfExperience: validatedData.yearsOfExperience,
                            availabilityPeriod: validatedData.availabilityPeriod,
                            desiredEmployment: validatedData.desiredEmployment,
                            certifications: validatedData.certifications
                                ? validatedData.certifications
                                : client_2.Prisma.JsonNull,
                            phoneNumber: validatedData.phoneNumber,
                            linkedin: validatedData.linkedin || null,
                            github: validatedData.github || null,
                            portfolio: validatedData.portfolio || null,
                            availableFrom: validatedData.availableFrom,
                            previousJobExperience: validatedData.previousJobExperience,
                            willingToRelocate: validatedData.willingToRelocate,
                            // New fields
                            email: validatedData.email,
                            currentJobTitle: validatedData.currentJobTitle,
                            industry: validatedData.industry,
                            jobSearchStatus: validatedData.jobSearchStatus,
                            user: {
                                connect: { id: session.user.id }
                            }
                        }
                    })];
            case 2:
                jobSeeker = _b.sent();
                if (!validatedData.jobId) return [3 /*break*/, 4];
                return [4 /*yield*/, db_1.prisma.jobApplication.create({
                        data: {
                            jobSeekerId: jobSeeker.id,
                            jobId: validatedData.jobId,
                            status: "PENDING",
                            resume: validatedData.resume
                        }
                    })];
            case 3:
                _b.sent();
                _b.label = 4;
            case 4: return [2 /*return*/, {
                    message: "Profile updated successfully!",
                    success: true,
                    redirect: '/'
                }];
            case 5:
                error_7 = _b.sent();
                console.error('Server error:', error_7);
                return [2 /*return*/, {
                        message: error_7 instanceof Error ? error_7.message : 'Failed to update profile',
                        success: false
                    }];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.submitJobSeekerResume = function (prevState, // new first parameter (can be ignored if not needed)
formData) { return __awaiter(void 0, void 0, Promise, function () {
    var user, jobSeeker, resumeDataRaw, parsedResult, validResumeData, error_8;
    var _a, _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0: return [4 /*yield*/, hooks_1.requireUser()];
            case 1:
                user = _e.sent();
                if (!(user === null || user === void 0 ? void 0 : user.id)) {
                    throw new Error("You must be logged in to submit your resume.");
                }
                return [4 /*yield*/, db_1.prisma.jobSeeker.findUnique({
                        where: { userId: user.id }
                    })];
            case 2:
                jobSeeker = _e.sent();
                if (!jobSeeker || !jobSeeker.id) {
                    throw new Error("JobSeeker record not found.");
                }
                resumeDataRaw = {
                    // Optionally provided from the client; otherwise, Prisma will generate one.
                    resumeId: ((_a = formData.get("resumeId")) === null || _a === void 0 ? void 0 : _a.toString()) || undefined,
                    resumeName: ((_b = formData.get("resumeName")) === null || _b === void 0 ? void 0 : _b.toString()) || "",
                    resumeBio: ((_c = formData.get("resumeBio")) === null || _c === void 0 ? void 0 : _c.toString()) || "",
                    pdfUrlId: ((_d = formData.get("pdfUrlId")) === null || _d === void 0 ? void 0 : _d.toString()) || ""
                };
                parsedResult = zodSchemas_1.resumeSchema.safeParse(resumeDataRaw);
                if (!parsedResult.success) {
                    throw new Error(parsedResult.error.message);
                }
                validResumeData = parsedResult.data;
                _e.label = 3;
            case 3:
                _e.trys.push([3, 5, , 6]);
                return [4 /*yield*/, db_1.prisma.jobSeekerResume.create({
                        data: __assign(__assign({}, (validResumeData.resumeId ? { resumeId: validResumeData.resumeId } : {})), { resumeName: validResumeData.resumeName, resumeBio: validResumeData.resumeBio, pdfUrlId: validResumeData.pdfUrlId, jobSeeker: {
                                connect: { id: jobSeeker.id }
                            } })
                    })];
            case 4:
                _e.sent();
                return [3 /*break*/, 6];
            case 5:
                error_8 = _e.sent();
                console.error("Error creating JobSeekerResume:", error_8);
                throw new Error("Failed to create resume record.");
            case 6: 
            // After successful storage, redirect the user to the coding test page using the JobSeeker's unique id.
            return [2 /*return*/, navigation_1.redirect("/coding-test/" + jobSeeker.id)];
        }
    });
}); };
