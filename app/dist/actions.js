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
exports.submitJobSeekerResume = exports.submitJobSeeker = exports.getJobMetrics = exports.trackJobClick = exports.trackJobView = exports.submitTest = exports.submitJobApplication = exports.getActiveJobs = exports.unsaveJobPost = exports.saveJobPost = exports.deleteJobPost = exports.updateJobPost = exports.createJob = exports.createJobSeeker = exports.createCompany = void 0;
var zod_1 = require("zod");
var hooks_1 = require("./utils/hooks");
var db_1 = require("./utils/db");
var navigation_1 = require("next/navigation");
var stripe_1 = require("./utils/stripe");
var pricingTiers_1 = require("./utils/pricingTiers");
var cache_1 = require("next/cache");
var arcjet_1 = require("./utils/arcjet");
var next_1 = require("@arcjet/next");
var client_1 = require("./utils/inngest/client");
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
                                willingToRelocate: validatedData.willingToRelocate
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
        var user, validatedData, company, stripeCustomerId, customer, jobPost, pricingTier, session;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, hooks_1.requireUser()];
                case 1:
                    user = _a.sent();
                    validatedData = zodSchemas_1.jobSchema.parse(data);
                    return [4 /*yield*/, db_1.prisma.company.findUnique({
                            where: {
                                userId: user.id
                            },
                            select: {
                                id: true,
                                user: {
                                    select: {
                                        stripeCustomerId: true
                                    }
                                }
                            }
                        })];
                case 2:
                    company = _a.sent();
                    if (!(company === null || company === void 0 ? void 0 : company.id)) {
                        return [2 /*return*/, navigation_1.redirect("/")];
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
                case 5: return [4 /*yield*/, db_1.prisma.jobPost.create({
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
                            compensationDetails: validatedData.compensationDetails
                        }
                    })];
                case 6:
                    jobPost = _a.sent();
                    pricingTier = pricingTiers_1.jobListingDurationPricing.find(function (tier) { return tier.days === validatedData.listingDuration; });
                    if (!pricingTier) {
                        throw new Error("Invalid listing duration selected");
                    }
                    return [4 /*yield*/, stripe_1.stripe.checkout.sessions.create({
                            customer: stripeCustomerId,
                            line_items: [
                                {
                                    price_data: {
                                        product_data: {
                                            name: "Job Posting - " + pricingTier.days + " Days",
                                            description: pricingTier.description,
                                            images: [
                                                "https://pve1u6tfz1.ufs.sh/f/Ae8VfpRqE7c0gFltIEOxhiBIFftvV4DTM8a13LU5EyzGb2SQ",
                                            ]
                                        },
                                        currency: "USD",
                                        unit_amount: pricingTier.price * 100
                                    },
                                    quantity: 1
                                },
                            ],
                            mode: "payment",
                            metadata: {
                                jobId: jobPost.id
                            },
                            success_url: BASE_URL + "/payment/success?session_id={CHECKOUT_SESSION_ID}",
                            cancel_url: BASE_URL + "/payment/cancel"
                        })];
                case 7:
                    session = _a.sent();
                    if (!session.url) {
                        throw new Error("Failed to create Stripe checkout session");
                    }
                    return [2 /*return*/, navigation_1.redirect(session.url)];
            }
        });
    });
}
exports.createJob = createJob;
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
        var user;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, hooks_1.requireUser()];
                case 1:
                    user = _a.sent();
                    return [4 /*yield*/, db_1.prisma.jobPost["delete"]({
                            where: {
                                id: jobId,
                                company: {
                                    userId: user.id
                                }
                            }
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/, navigation_1.redirect("/my-jobs")];
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
                    // Trigger AI evaluation
                    return [4 /*yield*/, client_1.inngest.send({
                            name: "application/submitted",
                            data: { applicationId: application.id }
                        })];
                case 4:
                    // Trigger AI evaluation
                    _a.sent();
                    cache_1.revalidatePath("/job/" + jobId);
                    return [2 /*return*/, { success: true }];
            }
        });
    });
}
exports.submitJobApplication = submitJobApplication;
// Remove the first duplicate submitTest function and evaluateCode function
// Keep only the more complete version
function evaluateCode(code, question) {
    return __awaiter(this, void 0, Promise, function () {
        var evaluationRes, error_2;
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
                    error_2 = _a.sent();
                    console.error('Code evaluation error:', error_2);
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
    return __awaiter(this, void 0, void 0, function () {
        var today, _a, jobPost, metrics, viewsByDate, error_3;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 6, , 7]);
                    today = new Date().toISOString().split('T')[0];
                    return [4 /*yield*/, Promise.all([
                            db_1.prisma.jobPost.update({
                                where: { id: jobId },
                                data: { views: { increment: 1 } }
                            }),
                            db_1.prisma.jobMetrics.findUnique({
                                where: { jobPostId: jobId }
                            })
                        ])];
                case 1:
                    _a = _c.sent(), jobPost = _a[0], metrics = _a[1];
                    if (!!metrics) return [3 /*break*/, 3];
                    // Create initial metrics if they don't exist
                    return [4 /*yield*/, db_1.prisma.jobMetrics.create({
                            data: {
                                jobPostId: jobId,
                                totalViews: 1,
                                viewsByDate: (_b = {}, _b[today] = 1, _b),
                                clicksByDate: {},
                                locationData: {}
                            }
                        })];
                case 2:
                    // Create initial metrics if they don't exist
                    _c.sent();
                    return [3 /*break*/, 5];
                case 3:
                    viewsByDate = __assign({}, metrics.viewsByDate);
                    viewsByDate[today] = (viewsByDate[today] || 0) + 1;
                    return [4 /*yield*/, db_1.prisma.jobMetrics.update({
                            where: { jobPostId: jobId },
                            data: {
                                totalViews: { increment: 1 },
                                viewsByDate: viewsByDate
                            }
                        })];
                case 4:
                    _c.sent();
                    _c.label = 5;
                case 5:
                    cache_1.revalidatePath("/job/" + jobId);
                    return [3 /*break*/, 7];
                case 6:
                    error_3 = _c.sent();
                    console.error('Failed to track job view:', error_3);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
exports.trackJobView = trackJobView;
function trackJobClick(jobId, location) {
    return __awaiter(this, void 0, void 0, function () {
        var today, _a, jobPost, metrics, clicksByDate, locationData, error_4;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 6, , 7]);
                    today = new Date().toISOString().split('T')[0];
                    return [4 /*yield*/, Promise.all([
                            db_1.prisma.jobPost.update({
                                where: { id: jobId },
                                data: { clicks: { increment: 1 } }
                            }),
                            db_1.prisma.jobMetrics.findUnique({
                                where: { jobPostId: jobId }
                            })
                        ])];
                case 1:
                    _a = _d.sent(), jobPost = _a[0], metrics = _a[1];
                    if (!!metrics) return [3 /*break*/, 3];
                    // Create initial metrics
                    return [4 /*yield*/, db_1.prisma.jobMetrics.create({
                            data: {
                                jobPostId: jobId,
                                totalClicks: 1,
                                clicksByDate: (_b = {}, _b[today] = 1, _b),
                                viewsByDate: {},
                                locationData: location ? (_c = {}, _c[location] = 1, _c) : {}
                            }
                        })];
                case 2:
                    // Create initial metrics
                    _d.sent();
                    return [3 /*break*/, 5];
                case 3:
                    clicksByDate = __assign({}, metrics.clicksByDate);
                    clicksByDate[today] = (clicksByDate[today] || 0) + 1;
                    locationData = __assign({}, metrics.locationData);
                    if (location) {
                        locationData[location] = (locationData[location] || 0) + 1;
                    }
                    return [4 /*yield*/, db_1.prisma.jobMetrics.update({
                            where: { jobPostId: jobId },
                            data: {
                                totalClicks: { increment: 1 },
                                clicksByDate: clicksByDate,
                                locationData: locationData
                            }
                        })];
                case 4:
                    _d.sent();
                    _d.label = 5;
                case 5:
                    cache_1.revalidatePath("/job/" + jobId);
                    return [3 /*break*/, 7];
                case 6:
                    error_4 = _d.sent();
                    console.error('Failed to track job click:', error_4);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
exports.trackJobClick = trackJobClick;
function getJobMetrics(jobId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, metrics, applications, ctr, conversionRate;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, Promise.all([
                        db_1.prisma.jobMetrics.findUnique({
                            where: { jobPostId: jobId },
                            include: {
                                jobPost: {
                                    select: {
                                        applications: true,
                                        views: true,
                                        clicks: true
                                    }
                                }
                            }
                        }),
                        // Get actual submitted applications count
                        db_1.prisma.jobApplication.count({
                            where: {
                                jobId: jobId,
                                status: {
                                    "in": ['PENDING', 'REVIEWED', 'SHORTLISTED', 'ACCEPTED']
                                }
                            }
                        })
                    ])];
                case 1:
                    _a = _b.sent(), metrics = _a[0], applications = _a[1];
                    if (!metrics) {
                        return [2 /*return*/, {
                                totalViews: 0,
                                totalClicks: 0,
                                applications: 0,
                                ctr: 0,
                                conversionRate: 0,
                                viewsByDate: {},
                                clicksByDate: {},
                                locationData: {}
                            }];
                    }
                    ctr = metrics.totalViews > 0
                        ? (metrics.totalClicks / metrics.totalViews) * 100
                        : 0;
                    conversionRate = metrics.totalClicks > 0
                        ? (applications / metrics.totalClicks) * 100
                        : 0;
                    return [2 /*return*/, {
                            totalViews: metrics.totalViews,
                            totalClicks: metrics.totalClicks,
                            applications: applications,
                            ctr: Number(ctr.toFixed(2)),
                            conversionRate: Number(conversionRate.toFixed(2)),
                            viewsByDate: metrics.viewsByDate,
                            clicksByDate: metrics.clicksByDate,
                            locationData: metrics.locationData
                        }];
            }
        });
    });
}
exports.getJobMetrics = getJobMetrics;
exports.submitJobSeeker = function (prevState, formData) { return __awaiter(void 0, void 0, void 0, function () {
    var session, rawData, validatedData, jobSeeker, error_5;
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
                    availableFrom: formData.get("availableFrom") && formData.get("availableFrom").trim() !== ""
                        ? new Date(formData.get("availableFrom")).toISOString()
                        : null,
                    previousJobExperience: formData.get("previousJobExperience") || null,
                    willingToRelocate: formData.get("willingToRelocate")
                        ? formData.get("willingToRelocate") === "true"
                        : null,
                    // ✅ New Fields Added:
                    jobSearchStatus: formData.get("jobSearchStatus"),
                    visaStatus: formData.get("visaStatus") || null,
                    noticePeriod: Number(formData.get("noticePeriod")) || 0,
                    expectedHourlyRate: formData.get("expectedHourlyRate")
                        ? Number(formData.get("expectedHourlyRate"))
                        : null
                };
                validatedData = zodSchemas_1.jobSeekerSchema.parse(rawData);
                return [4 /*yield*/, db_1.prisma.jobSeeker.upsert({
                        where: {
                            userId: session.user.id
                        },
                        update: {
                            education: validatedData.education,
                            educationDetails: validatedData.education,
                            name: validatedData.name,
                            about: validatedData.about,
                            phoneNumber: validatedData.phoneNumber,
                            resume: validatedData.resume,
                            location: validatedData.location,
                            skills: validatedData.skills,
                            experience: validatedData.experience,
                            expectedSalaryMin: validatedData.expectedSalaryMin,
                            expectedSalaryMax: validatedData.expectedSalaryMax,
                            preferredLocation: validatedData.preferredLocation,
                            remotePreference: validatedData.remotePreference,
                            yearsOfExperience: validatedData.yearsOfExperience,
                            availabilityPeriod: validatedData.availabilityPeriod,
                            desiredEmployment: validatedData.desiredEmployment,
                            certifications: validatedData.certifications
                                ? validatedData.certifications
                                : client_2.Prisma.JsonNull,
                            linkedin: validatedData.linkedin,
                            github: validatedData.github,
                            portfolio: validatedData.portfolio,
                            availableFrom: validatedData.availableFrom,
                            previousJobExperience: validatedData.previousJobExperience,
                            willingToRelocate: validatedData.willingToRelocate,
                            // ✅ New Fields Added:
                            jobSearchStatus: validatedData.jobSearchStatus,
                            visaStatus: validatedData.visaStatus,
                            noticePeriod: validatedData.noticePeriod,
                            expectedHourlyRate: validatedData.expectedHourlyRate
                        },
                        create: {
                            userId: session.user.id,
                            education: validatedData.education,
                            educationDetails: validatedData.education,
                            name: validatedData.name,
                            about: validatedData.about,
                            phoneNumber: validatedData.phoneNumber,
                            resume: validatedData.resume,
                            location: validatedData.location,
                            skills: validatedData.skills,
                            experience: validatedData.experience,
                            expectedSalaryMin: validatedData.expectedSalaryMin,
                            expectedSalaryMax: validatedData.expectedSalaryMax,
                            preferredLocation: validatedData.preferredLocation,
                            remotePreference: validatedData.remotePreference,
                            yearsOfExperience: validatedData.yearsOfExperience,
                            availabilityPeriod: validatedData.availabilityPeriod,
                            desiredEmployment: validatedData.desiredEmployment,
                            certifications: validatedData.certifications
                                ? validatedData.certifications
                                : client_2.Prisma.JsonNull,
                            linkedin: validatedData.linkedin,
                            github: validatedData.github,
                            portfolio: validatedData.portfolio,
                            availableFrom: validatedData.availableFrom,
                            previousJobExperience: validatedData.previousJobExperience,
                            willingToRelocate: validatedData.willingToRelocate,
                            // ✅ New Fields Added:
                            jobSearchStatus: validatedData.jobSearchStatus,
                            visaStatus: validatedData.visaStatus,
                            noticePeriod: validatedData.noticePeriod,
                            expectedHourlyRate: validatedData.expectedHourlyRate
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
            case 4: 
            // Return success response instead of redirecting
            return [2 /*return*/, {
                    message: "Profile updated successfully!",
                    success: true,
                    redirect: '/' // Add this to handle redirect on client side
                }];
            case 5:
                error_5 = _b.sent();
                console.error('Server error:', error_5);
                return [2 /*return*/, {
                        message: error_5 instanceof Error ? error_5.message : 'Failed to update profile',
                        success: false
                    }];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.submitJobSeekerResume = function (prevState, // new first parameter (can be ignored if not needed)
formData) { return __awaiter(void 0, void 0, Promise, function () {
    var user, jobId, resumeDataRaw, parsedResult, validResumeData, error_6;
    var _a, _b, _c, _d, _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0: return [4 /*yield*/, hooks_1.requireUser()];
            case 1:
                user = _f.sent();
                if (!(user === null || user === void 0 ? void 0 : user.id)) {
                    throw new Error("You must be logged in to submit your resume.");
                }
                jobId = (_a = formData.get("jobId")) === null || _a === void 0 ? void 0 : _a.toString();
                if (!jobId) {
                    throw new Error("Missing jobId in the submitted form data.");
                }
                resumeDataRaw = {
                    // Optionally provided from the client, otherwise the prisma default uuid will be used.
                    resumeId: ((_b = formData.get("resumeId")) === null || _b === void 0 ? void 0 : _b.toString()) || undefined,
                    resumeName: ((_c = formData.get("resumeName")) === null || _c === void 0 ? void 0 : _c.toString()) || "",
                    resumeBio: ((_d = formData.get("resumeBio")) === null || _d === void 0 ? void 0 : _d.toString()) || "",
                    pdfUrlId: ((_e = formData.get("pdfUrlId")) === null || _e === void 0 ? void 0 : _e.toString()) || ""
                };
                parsedResult = zodSchemas_1.resumeSchema.safeParse(resumeDataRaw);
                if (!parsedResult.success) {
                    // You can customize this error handling as needed.
                    throw new Error(parsedResult.error.message);
                }
                validResumeData = parsedResult.data;
                _f.label = 2;
            case 2:
                _f.trys.push([2, 4, , 5]);
                return [4 /*yield*/, db_1.prisma.jobSeekerResume.create({
                        data: __assign(__assign({}, (validResumeData.resumeId ? { resumeId: validResumeData.resumeId } : {})), { resumeName: validResumeData.resumeName, resumeBio: validResumeData.resumeBio, pdfUrlId: validResumeData.pdfUrlId })
                    })];
            case 3:
                _f.sent();
                return [3 /*break*/, 5];
            case 4:
                error_6 = _f.sent();
                console.error("Error creating JobSeekerResume:", error_6);
                throw new Error("Failed to create resume record.");
            case 5: 
            // After successful storage, redirect the user to the coding test page.
            return [2 /*return*/, navigation_1.redirect("/coding-test/" + jobId)];
        }
    });
}); };
