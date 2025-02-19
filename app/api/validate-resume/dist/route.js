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
var generative_ai_1 = require("@google/generative-ai");
var pdf_1 = require("@langchain/community/document_loaders/fs/pdf");
var server_1 = require("next/server");
var genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
function isValidUrl(url) {
    try {
        var newUrl = new URL(url);
        // Allow both uploadthing.com and utfs.io URLs
        return (newUrl.hostname === "uploadthing.com" ||
            newUrl.hostname.endsWith(".uploadthing.com") ||
            newUrl.hostname === "utfs.io");
    }
    catch (e) {
        return false;
    }
}
function POST(req) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    return __awaiter(this, void 0, void 0, function () {
        var body, resumeUrl, normalizedUrl, pdfBuffer, pdfResponse, _l, _m, _o, contentType, error_1, resumeText, loader, docs, error_2, model, prompt, result, analysisText, cleanedResponse, startIndex, endIndex, analysis, yearsStr, validatedAnalysis, error_3, error_4;
        return __generator(this, function (_p) {
            switch (_p.label) {
                case 0:
                    _p.trys.push([0, 17, , 18]);
                    return [4 /*yield*/, req.json()];
                case 1:
                    body = _p.sent();
                    resumeUrl = body.resumeUrl;
                    console.log("Received resume URL:", resumeUrl); // Debug log
                    // Validate URL
                    if (!resumeUrl) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: "Missing resume URL" }, { status: 400 })];
                    }
                    if (!isValidUrl(resumeUrl)) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: "Invalid resume URL format. Must be from UploadThing." }, { status: 400 })];
                    }
                    normalizedUrl = resumeUrl.startsWith("https://uploadthing.com/f/")
                        ? "https://utfs.io/f/" + resumeUrl.split("/f/")[1]
                        : resumeUrl;
                    pdfBuffer = void 0;
                    _p.label = 2;
                case 2:
                    _p.trys.push([2, 7, , 8]);
                    console.log("Fetching PDF from:", normalizedUrl); // Debug log
                    return [4 /*yield*/, fetch(normalizedUrl, {
                            headers: {
                                Accept: "application/pdf",
                                "X-Requested-With": "XMLHttpRequest"
                            },
                            redirect: "follow",
                            cache: "no-cache"
                        })];
                case 3:
                    pdfResponse = _p.sent();
                    if (!!pdfResponse.ok) return [3 /*break*/, 5];
                    _m = (_l = console).error;
                    _o = ["PDF fetch failed:",
                        pdfResponse.status];
                    return [4 /*yield*/, pdfResponse.text()];
                case 4:
                    _m.apply(_l, _o.concat([_p.sent()]));
                    throw new Error("HTTP " + pdfResponse.status);
                case 5:
                    contentType = pdfResponse.headers.get("Content-Type");
                    if (!(contentType === null || contentType === void 0 ? void 0 : contentType.includes("application/pdf"))) {
                        console.error("Invalid content type:", contentType);
                        throw new Error("Invalid PDF content type");
                    }
                    return [4 /*yield*/, pdfResponse.arrayBuffer()];
                case 6:
                    pdfBuffer = _p.sent();
                    if (!pdfBuffer || pdfBuffer.byteLength === 0) {
                        throw new Error("Empty PDF buffer");
                    }
                    return [3 /*break*/, 8];
                case 7:
                    error_1 = _p.sent();
                    console.error("PDF fetch error:", error_1);
                    return [2 /*return*/, server_1.NextResponse.json({
                            error: "Failed to download resume",
                            details: error_1 instanceof Error ? error_1.message : "Unknown error"
                        }, { status: 400 })];
                case 8:
                    resumeText = void 0;
                    _p.label = 9;
                case 9:
                    _p.trys.push([9, 11, , 12]);
                    loader = new pdf_1.PDFLoader(new Blob([pdfBuffer], { type: "application/pdf" }), {
                        parsedItemSeparator: " ",
                        splitPages: false
                    });
                    return [4 /*yield*/, loader.load()];
                case 10:
                    docs = _p.sent();
                    resumeText = docs.map(function (doc) { return doc.pageContent; }).join("\n");
                    if (!resumeText.trim()) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                isValid: false,
                                feedback: {
                                    strengths: [],
                                    improvements: ["The PDF appears to be empty or unreadable"],
                                    overallFeedback: "Please upload a valid resume PDF file"
                                },
                                skills: [],
                                experience: { years: 0, level: "entry" },
                                education: [],
                                buzzwords: { count: 0, list: [], warning: false },
                                criticalFlaws: [],
                                additionalRecommendations: ""
                            })];
                    }
                    return [3 /*break*/, 12];
                case 11:
                    error_2 = _p.sent();
                    console.error("PDF parsing error:", error_2);
                    return [2 /*return*/, server_1.NextResponse.json({
                            isValid: false,
                            feedback: {
                                strengths: [],
                                improvements: ["Failed to parse PDF content"],
                                overallFeedback: "Please ensure you've uploaded a valid PDF file"
                            },
                            skills: [],
                            experience: { years: 0, level: "entry" },
                            education: [],
                            buzzwords: { count: 0, list: [], warning: false },
                            criticalFlaws: [],
                            additionalRecommendations: ""
                        })];
                case 12:
                    _p.trys.push([12, 15, , 16]);
                    model = genAI.getGenerativeModel({
                        model: "gemini-2.0-flash"
                    });
                    prompt = "You are a resume analyzer. Your task is to analyze the resume and return ONLY a JSON object with no additional text or explanation. The JSON must follow this exact structure:\n{\n  \"isValid\": boolean,\n  \"feedback\": {\n    \"strengths\": string[],\n    \"improvements\": string[],\n    \"overallFeedback\": string\n  },\n  \"skills\": string[],\n  \"experience\": {\n    \"years\": number,\n    \"level\": \"entry\"|\"mid\"|\"senior\"\n  },\n  \"education\": [{\n    \"degree\": string,\n    \"institution\": string,\n    \"year\": number\n  }],\n  \"buzzwords\": {\n    \"count\": number,\n    \"list\": string[],\n    \"warning\": boolean\n  },\n  \"criticalFlaws\": string[],\n  \"additionalRecommendations\": string\n}\n\nRules for analysis:\n1. ALWAYS provide 3-5 strengths even if the resume needs improvements.\n2. Focus on technical skills, experience, and education.\n3. Provide actionable improvement suggestions.\n4. Analyze the resume for excessive use of buzzwords that might turn off recruiters.\n5. Identify any critical flaws in the resume. Critical flaws include: overuse of buzzwords, overlapping engineering jargon, multiple job titles that conflict or confuse, a confusing overall structure, or language that appears shady or unprofessional.\n6. Offer additional recommendations for improvement.\n\nResume text to analyze:\n" + resumeText.substring(0, 30000);
                    return [4 /*yield*/, model.generateContent(prompt)];
                case 13:
                    result = _p.sent();
                    return [4 /*yield*/, result.response.text()];
                case 14:
                    analysisText = (_p.sent()).trim();
                    cleanedResponse = analysisText
                        .replace(/```json\s*/g, "") // Remove JSON code block markers with any whitespace
                        .replace(/```\s*/g, "") // Remove any other code block markers
                        .replace(/[\u201C\u201D]/g, '"') // Replace smart quotes with straight quotes
                        .trim();
                    startIndex = cleanedResponse.indexOf("{");
                    endIndex = cleanedResponse.lastIndexOf("}") + 1;
                    if (startIndex === -1 || endIndex === 0) {
                        throw new Error("No valid JSON object found in response");
                    }
                    cleanedResponse = cleanedResponse.slice(startIndex, endIndex);
                    try {
                        analysis = JSON.parse(cleanedResponse);
                        // Convert string years to number if needed
                        if (typeof ((_a = analysis.experience) === null || _a === void 0 ? void 0 : _a.years) === "string") {
                            yearsStr = analysis.experience.years;
                            analysis.experience.years = parseInt(yearsStr.replace("+", ""));
                        }
                        // Fix education year if it's "20xx"
                        if (((_b = analysis.education) === null || _b === void 0 ? void 0 : _b.length) > 0) {
                            analysis.education = analysis.education.map(function (edu) { return (__assign(__assign({}, edu), { year: edu.year === "20xx" ? new Date().getFullYear() : edu.year })); });
                        }
                        validatedAnalysis = {
                            isValid: Boolean(analysis.isValid),
                            feedback: {
                                strengths: Array.isArray((_c = analysis.feedback) === null || _c === void 0 ? void 0 : _c.strengths)
                                    ? analysis.feedback.strengths
                                    : [],
                                improvements: Array.isArray((_d = analysis.feedback) === null || _d === void 0 ? void 0 : _d.improvements)
                                    ? analysis.feedback.improvements
                                    : [],
                                overallFeedback: ((_e = analysis.feedback) === null || _e === void 0 ? void 0 : _e.overallFeedback) ||
                                    "Resume analyzed successfully"
                            },
                            skills: Array.isArray(analysis.skills) ? analysis.skills : [],
                            experience: {
                                years: typeof ((_f = analysis.experience) === null || _f === void 0 ? void 0 : _f.years) === "number"
                                    ? analysis.experience.years
                                    : 0,
                                level: ["entry", "mid", "senior"].includes((_g = analysis.experience) === null || _g === void 0 ? void 0 : _g.level)
                                    ? analysis.experience.level
                                    : "entry"
                            },
                            education: Array.isArray(analysis.education)
                                ? analysis.education
                                : [],
                            buzzwords: {
                                count: ((_h = analysis.buzzwords) === null || _h === void 0 ? void 0 : _h.count) || 0,
                                list: Array.isArray((_j = analysis.buzzwords) === null || _j === void 0 ? void 0 : _j.list)
                                    ? analysis.buzzwords.list
                                    : [],
                                warning: Boolean((_k = analysis.buzzwords) === null || _k === void 0 ? void 0 : _k.warning)
                            },
                            criticalFlaws: Array.isArray(analysis.criticalFlaws)
                                ? analysis.criticalFlaws
                                : [],
                            additionalRecommendations: analysis.additionalRecommendations || ""
                        };
                        return [2 /*return*/, server_1.NextResponse.json(validatedAnalysis)];
                    }
                    catch (error) {
                        console.error("JSON parsing error:", error);
                        console.error("Cleaned response:", cleanedResponse);
                        return [2 /*return*/, server_1.NextResponse.json({
                                isValid: false,
                                feedback: {
                                    strengths: [],
                                    improvements: ["Failed to analyze resume content"],
                                    overallFeedback: "Our analysis system encountered an error. Please try again."
                                },
                                skills: [],
                                experience: { years: 0, level: "entry" },
                                education: [],
                                buzzwords: { count: 0, list: [], warning: false },
                                criticalFlaws: [],
                                additionalRecommendations: ""
                            })];
                    }
                    return [3 /*break*/, 16];
                case 15:
                    error_3 = _p.sent();
                    console.error("Gemini analysis error:", error_3);
                    return [2 /*return*/, server_1.NextResponse.json({
                            isValid: false,
                            feedback: {
                                strengths: [],
                                improvements: ["Error analyzing resume content"],
                                overallFeedback: "Our AI system encountered an error. Please try again later."
                            },
                            skills: [],
                            experience: { years: 0, level: "entry" },
                            education: [],
                            buzzwords: { count: 0, list: [], warning: false },
                            criticalFlaws: [],
                            additionalRecommendations: ""
                        })];
                case 16: return [3 /*break*/, 18];
                case 17:
                    error_4 = _p.sent();
                    console.error("General error:", error_4);
                    return [2 /*return*/, server_1.NextResponse.json({
                            isValid: false,
                            feedback: {
                                strengths: [],
                                improvements: ["Error processing resume"],
                                overallFeedback: "Please try again with a different file"
                            },
                            skills: [],
                            experience: { years: 0, level: "entry" },
                            education: [],
                            buzzwords: { count: 0, list: [], warning: false },
                            criticalFlaws: [],
                            additionalRecommendations: ""
                        }, { status: 500 })];
                case 18: return [2 /*return*/];
            }
        });
    });
}
exports.POST = POST;
