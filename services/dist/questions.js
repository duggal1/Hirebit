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
exports.generatePhdCodingQuestionHint = exports.generateQuestionForJob = void 0;
var generative_ai_1 = require("@google/generative-ai");
var db_1 = require("@/app/utils/db");
var GEMINI_API_KEY = process.env.GEMINI_API_KEY;
var genAI = new generative_ai_1.GoogleGenerativeAI(GEMINI_API_KEY);
/**
 * Generates one extremely advanced PhD-level coding challenge based on the provided skills.
 */
function generatePhdCodingQuestion(skills, jobTitle) {
    return __awaiter(this, void 0, Promise, function () {
        var model, prompt, result, text, jsonMatch, jsonStr, parsedQuestion, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
                    prompt = "\nGenerate 6 extremely hard and complex PhD-level coding challenge for a " + jobTitle + " role that solves a real-world problem using advanced techniques. It should test the following skills: " + skills.join(', ') + ". Do not generate more than 400 tokens. Return ONLY a valid JSON object in the following structure:\n{\n  \"title\": \"A descriptive title\",\n  \"description\": \"Detailed problem description with context and requirements\",\n  \"difficulty\": \"PhD\",\n  \"timeLimit\": 1120,\n  \"testCases\": [\n    {\"input\": \"input format\", \"expectedOutput\": \"output format\"},\n    {\"input\": \"input format\", \"expectedOutput\": \"output format\"}\n  ],\n  \"constraints\": [\"constraint 1\", \"constraint 2\"],\n  \"examples\": [\n    {\"input\": \"example input\", \"output\": \"example output\", \"explanation\": \"explanation\"}\n  ]\n}\n";
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, model.generateContent(prompt)];
                case 2:
                    result = _a.sent();
                    return [4 /*yield*/, result.response];
                case 3:
                    text = (_a.sent()).text();
                    // Clean the response by removing any markdown or extra formatting
                    text = text
                        .replace(/```json\s*/g, '')
                        .replace(/```\s*$/g, '')
                        .replace(/`/g, '')
                        .trim();
                    jsonMatch = text.match(/\{[\s\S]*\}/);
                    if (!jsonMatch) {
                        throw new Error('JSON object not found in the response');
                    }
                    jsonStr = jsonMatch[0];
                    parsedQuestion = JSON.parse(jsonStr);
                    return [2 /*return*/, __assign(__assign({ id: "q-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9) }, parsedQuestion), { difficulty: "PhD", timeLimit: 1120 })];
                case 4:
                    error_1 = _a.sent();
                    console.error("Error generating coding question:", error_1);
                    return [2 /*return*/, null];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Generates a hint for the provided coding question.
 */
function generatePhdCodingQuestionHint(question) {
    return __awaiter(this, void 0, Promise, function () {
        var model, prompt, result, text, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
                    prompt = "\nBased on the following coding challenge:\nTitle: " + question.title + "\nDescription: " + question.description + "\n\nProvide a concise hint that guides the candidate on how to approach solving this problem without revealing the full solution.\nReturn ONLY the hint as plain text.\n";
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, model.generateContent(prompt)];
                case 2:
                    result = _a.sent();
                    return [4 /*yield*/, result.response];
                case 3:
                    text = (_a.sent()).text();
                    text = text
                        .replace(/```json\s*/g, '')
                        .replace(/```\s*$/g, '')
                        .replace(/`/g, '')
                        .trim();
                    return [2 /*return*/, text];
                case 4:
                    error_2 = _a.sent();
                    console.error("Error generating hint for coding question:", error_2);
                    return [2 /*return*/, null];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.generatePhdCodingQuestionHint = generatePhdCodingQuestionHint;
/**
 * Finds a job post by ID and generates a coding question using the job's required skills.
 */
function generateQuestionForJob(jobPostId) {
    return __awaiter(this, void 0, Promise, function () {
        var jobPost, skillsRequired, jobTitle, question, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, db_1.prisma.jobPost.findUnique({
                            where: { id: jobPostId }
                        })];
                case 1:
                    jobPost = _a.sent();
                    if (!jobPost) {
                        throw new Error("Job post not found");
                    }
                    skillsRequired = jobPost.skillsRequired, jobTitle = jobPost.jobTitle;
                    console.log("Generating coding question for \"" + jobTitle + "\" using skills: " + skillsRequired.join(", "));
                    return [4 /*yield*/, generatePhdCodingQuestion(skillsRequired, jobTitle)];
                case 2:
                    question = _a.sent();
                    if (question) {
                        console.log("Successfully generated coding question:", question.title);
                        return [2 /*return*/, question];
                    }
                    throw new Error("Failed to generate coding question.");
                case 3:
                    error_3 = _a.sent();
                    console.error("Error generating question for job:", error_3);
                    throw error_3;
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.generateQuestionForJob = generateQuestionForJob;
exports["default"] = generatePhdCodingQuestion;
