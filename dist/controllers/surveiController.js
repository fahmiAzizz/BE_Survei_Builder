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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSurvey = exports.updateSurvey = exports.getSurveyById = exports.getAllSurveys = exports.createSurvey = void 0;
const surveiModel_1 = require("../models/surveiModel");
const sessionModel_1 = require("../models/sessionModel");
const questionModel_1 = require("../models/questionModel");
const penelitiModel_1 = require("../models/penelitiModel");
const questionOptionModel_1 = require("../models/questionOptionModel");
const db_1 = require("../config/db");
const sequelize_1 = require("sequelize");
const createSurvey = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    const db = (0, db_1.getDB)();
    const t = yield db.sequelize.transaction();
    try {
        console.log("BODY createSurvey:", JSON.stringify(req.body, null, 2));
        const { name, description, created_by, sessions } = req.body;
        const survey = yield db.Survei.create({ name, description, created_by }, { transaction: t });
        for (const s of Array.isArray(sessions) ? sessions : []) {
            const session = yield db.Session.create({
                survei_id: survey.id,
                name: (_a = s.name) !== null && _a !== void 0 ? _a : null,
                order: (_b = s.order) !== null && _b !== void 0 ? _b : null,
                allow_multiple: (_c = s.allow_multiple) !== null && _c !== void 0 ? _c : false,
            }, { transaction: t });
            for (const q of Array.isArray(s.questions) ? s.questions : []) {
                // sanitize basic fields
                const mainQPayload = {
                    session_id: session.id,
                    question_text: (_d = q.question_text) !== null && _d !== void 0 ? _d : "",
                    type: (_e = q.type) !== null && _e !== void 0 ? _e : "text",
                    required: !!q.required,
                    order: (_f = q.order) !== null && _f !== void 0 ? _f : null,
                    parent_question_id: null,
                };
                const question = yield db.Question.create(mainQPayload, {
                    transaction: t,
                });
                console.log("Created main question:", question.id, mainQPayload);
                // options for main question
                if (["dropdown", "checkbox"].includes(q.type) && Array.isArray(q.options) && q.options.length) {
                    const options = q.options.map((opt) => ({
                        question_id: question.id,
                        option_text: opt,
                    }));
                    try {
                        yield db.QuestionOption.bulkCreate(options, { transaction: t });
                    }
                    catch (err) {
                        console.error("Error bulk creating main question options", err);
                        throw err;
                    }
                }
                // SUB QUESTIONS (defensive)
                if (Array.isArray(q.subQuestions) && q.subQuestions.length) {
                    for (const sub of q.subQuestions) {
                        if (!sub || typeof sub !== "object")
                            continue;
                        const subPayload = {
                            session_id: session.id,
                            question_text: (_g = sub.question_text) !== null && _g !== void 0 ? _g : "",
                            type: (_h = sub.type) !== null && _h !== void 0 ? _h : "text",
                            required: !!sub.required,
                            order: (_j = sub.order) !== null && _j !== void 0 ? _j : null,
                            parent_id: question.id,
                        };
                        console.log("Creating subQuestion for parent:", question.id, "payload:", subPayload);
                        const subQuestion = yield db.Question.create(subPayload, {
                            transaction: t,
                        });
                        // options for sub question
                        if (["dropdown", "checkbox"].includes(subPayload.type) &&
                            Array.isArray(sub.options) &&
                            sub.options.length) {
                            const subOptions = sub.options.map((opt) => ({
                                question_id: subQuestion.id,
                                option_text: opt,
                            }));
                            try {
                                yield db.QuestionOption.bulkCreate(subOptions, {
                                    transaction: t,
                                });
                            }
                            catch (err) {
                                console.error("Error bulk creating sub question options", err);
                                throw err;
                            }
                        }
                    }
                }
            }
        }
        yield t.commit();
        const fullSurvey = yield db.Survei.findByPk(survey.id, {
            include: [
                {
                    model: db.Session,
                    include: [
                        {
                            model: db.Question,
                            include: [
                                db.QuestionOption,
                                { model: db.Question, as: "SubQuestions", include: [db.QuestionOption] },
                            ],
                        },
                    ],
                },
            ],
        });
        res.status(201).json({
            message: "Survey berhasil dibuat",
            data: fullSurvey,
        });
    }
    catch (err) {
        yield t.rollback();
        console.error("❌ Error createSurvey:", err);
        res.status(500).json({ message: (_k = err.message) !== null && _k !== void 0 ? _k : "Server error" });
    }
});
exports.createSurvey = createSurvey;
const getAllSurveys = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const surveys = yield surveiModel_1.Survei.findAll({
            include: [
                {
                    model: penelitiModel_1.Peneliti,
                    attributes: ["id", "name"],
                },
                {
                    model: sessionModel_1.Session,
                    include: [
                        {
                            model: questionModel_1.Question,
                            include: [
                                questionOptionModel_1.QuestionOption,
                                {
                                    model: questionModel_1.Question,
                                    as: "SubQuestions",
                                    include: [questionOptionModel_1.QuestionOption],
                                },
                            ],
                        },
                    ],
                },
            ],
            order: [
                ["id", "ASC"],
                [sessionModel_1.Session, "order", "ASC"],
                [sessionModel_1.Session, questionModel_1.Question, "order", "ASC"],
            ],
        });
        res.json(surveys);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
exports.getAllSurveys = getAllSurveys;
const getSurveyById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const survey = yield surveiModel_1.Survei.findByPk(id, {
            include: [
                {
                    model: sessionModel_1.Session,
                    include: [
                        {
                            model: questionModel_1.Question,
                            include: [
                                questionOptionModel_1.QuestionOption,
                                {
                                    model: questionModel_1.Question,
                                    as: "SubQuestions",
                                    include: [questionOptionModel_1.QuestionOption],
                                },
                            ],
                        },
                    ],
                },
            ],
        });
        if (!survey)
            return res.status(404).json({ message: "Survey tidak ditemukan" });
        res.json(survey);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
exports.getSurveyById = getSurveyById;
const updateSurvey = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const db = (0, db_1.getDB)();
    const t = yield db.sequelize.transaction();
    try {
        const { id } = req.params;
        const { name, description, sessions } = req.body;
        const survey = yield db.Survei.findByPk(id);
        if (!survey) {
            yield t.rollback();
            return res.status(404).json({ message: "Survey tidak ditemukan" });
        }
        yield survey.update({ name, description }, { transaction: t });
        const updatedSessionIds = [];
        for (const s of sessions) {
            let session;
            if (s.id) {
                session = yield db.Session.findByPk(s.id);
                if (session) {
                    yield session.update({ name: s.name, order: s.order, allow_multiple: s.allow_multiple }, { transaction: t });
                }
            }
            else {
                session = yield db.Session.create({ survei_id: id, name: s.name, order: s.order, allow_multiple: s.allow_multiple }, { transaction: t });
            }
            if (!session)
                continue;
            updatedSessionIds.push(session.id);
            const updatedQuestionIds = [];
            for (const q of s.questions || []) {
                let question;
                // 🔹 Buat / update pertanyaan utama
                if (q.id) {
                    question = yield db.Question.findByPk(q.id);
                    if (question) {
                        yield question.update({
                            question_text: q.question_text,
                            type: q.type,
                            required: q.required,
                            order: q.order,
                        }, { transaction: t });
                    }
                }
                else {
                    question = yield db.Question.create({
                        session_id: session.id,
                        question_text: q.question_text,
                        type: q.type,
                        required: q.required,
                        order: q.order,
                    }, { transaction: t });
                }
                if (!question)
                    continue;
                updatedQuestionIds.push(question.id);
                const updatedSubIds = [];
                for (const sub of q.SubQuestions || []) {
                    let subQ;
                    if (sub.id) {
                        subQ = yield db.Question.findByPk(sub.id);
                        if (subQ) {
                            yield subQ.update({
                                session_id: session.id,
                                parent_id: question.id,
                                question_text: sub.question_text,
                                type: sub.type,
                                required: sub.required,
                                order: sub.order,
                            }, { transaction: t });
                        }
                    }
                    else {
                        subQ = yield db.Question.create({
                            session_id: session.id,
                            parent_id: question.id,
                            question_text: sub.question_text,
                            type: sub.type,
                            required: sub.required,
                            order: sub.order,
                        }, { transaction: t });
                    }
                    if (!subQ)
                        continue;
                    updatedSubIds.push(subQ.id);
                    // 🔹 Opsi jawaban sub-question (dropdown / checkbox)
                    if (["dropdown", "checkbox"].includes(sub.type)) {
                        yield db.QuestionOption.destroy({
                            where: { question_id: subQ.id },
                            transaction: t,
                        });
                        if ((_a = sub.options) === null || _a === void 0 ? void 0 : _a.length) {
                            const newOptions = sub.options.map((opt) => ({
                                question_id: subQ.id,
                                option_text: opt,
                            }));
                            yield db.QuestionOption.bulkCreate(newOptions, {
                                transaction: t,
                            });
                        }
                    }
                }
                // 🔹 Hapus sub-question yang dihapus di frontend
                yield db.Question.destroy({
                    where: {
                        parent_id: question.id,
                        id: { [sequelize_1.Op.notIn]: updatedSubIds.length ? updatedSubIds : [0] },
                    },
                    transaction: t,
                });
                // 🔹 Opsi pertanyaan utama (dropdown / checkbox)
                if (["dropdown", "checkbox"].includes(q.type)) {
                    yield db.QuestionOption.destroy({
                        where: { question_id: question.id },
                        transaction: t,
                    });
                    if ((_b = q.options) === null || _b === void 0 ? void 0 : _b.length) {
                        const newOptions = q.options.map((opt) => ({
                            question_id: question.id,
                            option_text: opt,
                        }));
                        yield db.QuestionOption.bulkCreate(newOptions, { transaction: t });
                    }
                }
            }
            // 🔹 Hapus pertanyaan utama yang dihapus di frontend
            yield db.Question.destroy({
                where: {
                    session_id: session.id,
                    parent_id: null,
                    id: { [sequelize_1.Op.notIn]: updatedQuestionIds.length ? updatedQuestionIds : [0] },
                },
                transaction: t,
            });
        }
        // 🔹 Hapus session yang dihapus di frontend
        yield db.Session.destroy({
            where: {
                survei_id: id,
                id: { [sequelize_1.Op.notIn]: updatedSessionIds.length ? updatedSessionIds : [0] },
            },
            transaction: t,
        });
        yield t.commit();
        res.json({
            message: "Survey berhasil diperbarui (termasuk sub-question)",
            data: { id, name, description },
        });
    }
    catch (err) {
        yield t.rollback();
        console.error("❌ Error update survey:", err);
        res.status(500).json({ message: err.message });
    }
});
exports.updateSurvey = updateSurvey;
const deleteSurvey = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deleted = yield surveiModel_1.Survei.destroy({ where: { id } });
        if (!deleted)
            return res.status(404).json({ message: "Survey tidak ditemukan" });
        res.json({ message: "Survey berhasil dihapus" });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
exports.deleteSurvey = deleteSurvey;
