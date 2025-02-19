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
exports.POST = void 0;
var db_1 = require("@/app/utils/db");
var client_1 = require("@prisma/client");
var server_1 = require("next/server");
function POST(request) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6;
    return __awaiter(this, void 0, void 0, function () {
        var body, jobSeekerId, companySlug, verificationId, coverLetter, includeLinks, verification, resumeData, urls, jobPost, existingApplication, applicationCount, baseApplicationData, application, error_1;
        var _7, _8;
        return __generator(this, function (_9) {
            switch (_9.label) {
                case 0:
                    _9.trys.push([0, 9, , 10]);
                    return [4 /*yield*/, request.json()];
                case 1:
                    body = _9.sent();
                    console.log("Submit Application - Request body:", body);
                    jobSeekerId = body.jobSeekerId, companySlug = body.companySlug, verificationId = body.verificationId, coverLetter = body.coverLetter, includeLinks = body.includeLinks;
                    return [4 /*yield*/, db_1.prisma.verification.findFirst({
                            where: {
                                OR: [{ id: verificationId }, { jobSeekerId: jobSeekerId }]
                            },
                            include: {
                                jobSeeker: {
                                    include: {
                                        JobSeekerResume: {
                                            where: {
                                                isActive: true
                                            },
                                            select: {
                                                resumeName: true,
                                                resumeBio: true,
                                                pdfUrlId: true
                                            }
                                        }
                                    }
                                },
                                company: true
                            }
                        })];
                case 2:
                    verification = _9.sent();
                    resumeData = (_b = (_a = verification === null || verification === void 0 ? void 0 : verification.jobSeeker) === null || _a === void 0 ? void 0 : _a.JobSeekerResume) === null || _b === void 0 ? void 0 : _b[0];
                    if (!verification) {
                        console.log("Verification not found");
                        return [2 /*return*/, server_1.NextResponse.json({ error: "Verification not found" }, { status: 404 })];
                    }
                    urls = verification.urls;
                    return [4 /*yield*/, db_1.prisma.jobPost.findFirst({
                            where: {
                                company: { name: companySlug },
                                status: "ACTIVE"
                            }
                        })];
                case 3:
                    jobPost = _9.sent();
                    if (!jobPost) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: "No active job posts found for this company" }, { status: 404 })];
                    }
                    return [4 /*yield*/, db_1.prisma.jobApplication.findUnique({
                            where: { jobSeekerId_jobId: { jobSeekerId: jobSeekerId, jobId: jobPost.id } }
                        })];
                case 4:
                    existingApplication = _9.sent();
                    if (!!existingApplication) return [3 /*break*/, 6];
                    return [4 /*yield*/, db_1.prisma.jobApplication.count({
                            where: { jobSeekerId: jobSeekerId }
                        })];
                case 5:
                    applicationCount = _9.sent();
                    if (applicationCount >= 3) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: "Buy Hirebit Premium to unlock unlimited applications" }, { status: 400 })];
                    }
                    _9.label = 6;
                case 6:
                    baseApplicationData = {
                        coverLetter: coverLetter || "",
                        status: client_1.ApplicationStatus.PENDING,
                        includeLinks: includeLinks,
                        resume: ((_c = verification.jobSeeker) === null || _c === void 0 ? void 0 : _c.resume) || "",
                        lastActivity: new Date(),
                        isActive: true,
                        // Handle JSON fields properly for Prisma
                        answers: includeLinks ? {
                            set: {
                                linkedin: (urls === null || urls === void 0 ? void 0 : urls.linkedin) || "",
                                resumeData: resumeData ? {
                                    resumeName: resumeData.resumeName,
                                    resumeBio: resumeData.resumeBio,
                                    pdfUrlId: resumeData.pdfUrlId
                                } : null,
                                github: (urls === null || urls === void 0 ? void 0 : urls.github) || "",
                                portfolio: (urls === null || urls === void 0 ? void 0 : urls.portfolio) || "",
                                currentJobTitle: ((_d = verification.jobSeeker) === null || _d === void 0 ? void 0 : _d.currentJobTitle) || "",
                                industry: ((_e = verification.jobSeeker) === null || _e === void 0 ? void 0 : _e.industry) || "",
                                jobSearchStatus: ((_f = verification.jobSeeker) === null || _f === void 0 ? void 0 : _f.jobSearchStatus) || "OPEN_TO_OFFERS",
                                skills: ((_g = verification.jobSeeker) === null || _g === void 0 ? void 0 : _g.skills) || [],
                                experience: ((_h = verification.jobSeeker) === null || _h === void 0 ? void 0 : _h.experience) || 0,
                                yearsOfExperience: ((_j = verification.jobSeeker) === null || _j === void 0 ? void 0 : _j.yearsOfExperience) || 0,
                                location: ((_k = verification.jobSeeker) === null || _k === void 0 ? void 0 : _k.location) || "",
                                preferredLocation: ((_l = verification.jobSeeker) === null || _l === void 0 ? void 0 : _l.preferredLocation) || "",
                                remotePreference: ((_m = verification.jobSeeker) === null || _m === void 0 ? void 0 : _m.remotePreference) || "",
                                willingToRelocate: ((_o = verification.jobSeeker) === null || _o === void 0 ? void 0 : _o.willingToRelocate) || false,
                                availabilityPeriod: ((_p = verification.jobSeeker) === null || _p === void 0 ? void 0 : _p.availabilityPeriod) || 0,
                                availableFrom: ((_q = verification.jobSeeker) === null || _q === void 0 ? void 0 : _q.availableFrom) || null,
                                phoneNumber: ((_r = verification.jobSeeker) === null || _r === void 0 ? void 0 : _r.phoneNumber) || "",
                                desiredEmployment: ((_s = verification.jobSeeker) === null || _s === void 0 ? void 0 : _s.desiredEmployment) || "",
                                expectedSalaryMin: ((_t = verification.jobSeeker) === null || _t === void 0 ? void 0 : _t.expectedSalaryMin) || null,
                                expectedSalaryMax: ((_u = verification.jobSeeker) === null || _u === void 0 ? void 0 : _u.expectedSalaryMax) || null,
                                certifications: ((_v = verification.jobSeeker) === null || _v === void 0 ? void 0 : _v.certifications) || null,
                                education: ((_w = verification.jobSeeker) === null || _w === void 0 ? void 0 : _w.education) || null,
                                previousJobExperience: ((_x = verification.jobSeeker) === null || _x === void 0 ? void 0 : _x.previousJobExperience) || null
                            }
                        } : undefined,
                        // Handle other JSON fields
                        certifications: ((_y = verification.jobSeeker) === null || _y === void 0 ? void 0 : _y.certifications) ? {
                            set: verification.jobSeeker.certifications
                        } : client_1.Prisma.JsonNull,
                        education: ((_z = verification.jobSeeker) === null || _z === void 0 ? void 0 : _z.education) ? {
                            set: verification.jobSeeker.education
                        } : client_1.Prisma.JsonNull,
                        // Scalar fields
                        expectedSalaryMin: ((_0 = verification.jobSeeker) === null || _0 === void 0 ? void 0 : _0.expectedSalaryMin) || null,
                        expectedSalaryMax: ((_1 = verification.jobSeeker) === null || _1 === void 0 ? void 0 : _1.expectedSalaryMax) || null,
                        location: ((_2 = verification.jobSeeker) === null || _2 === void 0 ? void 0 : _2.location) || null,
                        phoneNumber: ((_3 = verification.jobSeeker) === null || _3 === void 0 ? void 0 : _3.phoneNumber) || null,
                        desiredEmployment: ((_4 = verification.jobSeeker) === null || _4 === void 0 ? void 0 : _4.desiredEmployment) || null,
                        // Application tracking fields
                        applicationStage: "INITIAL_REVIEW",
                        interviewFeedback: client_1.Prisma.JsonNull,
                        recruiterNotes: null,
                        lastReviewedAt: null,
                        reviewedBy: null,
                        codingTestResults: client_1.Prisma.JsonNull,
                        technicalSkillsAssessment: client_1.Prisma.JsonNull,
                        cultureFitScore: null,
                        communicationScore: null
                    };
                    return [4 /*yield*/, db_1.prisma.jobApplication.upsert({
                            where: {
                                jobSeekerId_jobId: {
                                    jobSeekerId: jobSeekerId,
                                    jobId: jobPost.id
                                }
                            },
                            update: baseApplicationData,
                            create: __assign(__assign(__assign({}, baseApplicationData), { jobSeeker: {
                                    connect: { id: jobSeekerId }
                                }, job: {
                                    connect: { id: jobPost.id }
                                } }), (jobPost.companyId ? {
                                company: {
                                    connect: { id: jobPost.companyId }
                                }
                            } : {}))
                        })];
                case 7:
                    application = _9.sent();
                    // 7. Update job metrics
                    return [4 /*yield*/, db_1.prisma.jobMetrics.upsert({
                            where: { jobPostId: jobPost.id },
                            create: {
                                jobPostId: jobPost.id,
                                totalViews: 0,
                                totalClicks: 0,
                                applications: 1,
                                viewsByDate: {},
                                clicksByDate: {},
                                locationData: ((_5 = verification.jobSeeker) === null || _5 === void 0 ? void 0 : _5.location) ? JSON.stringify((_7 = {}, _7[verification.jobSeeker.location] = 1, _7))
                                    : "{}"
                            },
                            update: {
                                applications: { increment: 1 },
                                locationData: ((_6 = verification.jobSeeker) === null || _6 === void 0 ? void 0 : _6.location) ? JSON.stringify((_8 = {},
                                    _8[verification.jobSeeker.location] = 1,
                                    _8))
                                    : undefined
                            }
                        })];
                case 8:
                    // 7. Update job metrics
                    _9.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            applicationId: application.id,
                            status: application.status,
                            submittedAt: application.lastActivity // Changed from lastActivityDate
                        })];
                case 9:
                    error_1 = _9.sent();
                    console.error("Error submitting application:", error_1);
                    return [2 /*return*/, server_1.NextResponse.json({ error: "Failed to submit application" }, { status: 500 })];
                case 10: return [2 /*return*/];
            }
        });
    });
}
exports.POST = POST;
