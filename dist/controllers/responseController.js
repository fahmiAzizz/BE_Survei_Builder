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
exports.deleteSurveyResponse = exports.updateSurveyResponse = exports.getResponseById = exports.getResponsesBySurvey = exports.createSurveyResponse = void 0;
const db_1 = require("../config/db");
const respondenModel_1 = require("../models/respondenModel");
const responseModel_1 = require("../models/responseModel");
const answerModel_1 = require("../models/answerModel");
const questionModel_1 = require("../models/questionModel");
const penelitiModel_1 = require("../models/penelitiModel");
const sessionModel_1 = require("../models/sessionModel");
const surveiModel_1 = require("../models/surveiModel");
// 🔹 Buat response survei baru
const createSurveyResponse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const db = (0, db_1.getDB)();
    const t = yield db.sequelize.transaction();
    try {
        const { survei_id, responden, answers, submitted_by } = req.body;
        const respondenRecord = yield respondenModel_1.Responden.create({
            name: responden.name,
            email: responden.email,
            address: responden.address,
        }, { transaction: t });
        const responseRecord = yield responseModel_1.Response.create({
            survei_id,
            responden_id: respondenRecord.id,
            submitted_by,
            submitted_at: new Date(),
        }, { transaction: t });
        const answerRecords = answers.map((a) => {
            var _a;
            return ({
                response_id: responseRecord.id,
                question_id: a.question_id,
                answer_text: a.answer_text,
                group_index: (_a = a.group_index) !== null && _a !== void 0 ? _a : 1,
            });
        });
        yield answerModel_1.Answer.bulkCreate(answerRecords, { transaction: t });
        yield t.commit();
        res.status(201).json({
            message: "Response survei berhasil disimpan",
            data: {
                responden: respondenRecord,
                response: responseRecord,
                answers: answerRecords,
            },
        });
    }
    catch (err) {
        yield t.rollback();
        console.error("❌ Error createSurveyResponse:", err);
        res.status(500).json({ message: err.message });
    }
});
exports.createSurveyResponse = createSurveyResponse;
const getResponsesBySurvey = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { survei_id } = req.params;
        const responses = yield responseModel_1.Response.findAll({
            where: { survei_id },
            include: [
                {
                    model: respondenModel_1.Responden,
                    attributes: ["id", "name", "email", "address"],
                },
                {
                    model: penelitiModel_1.Peneliti, // 🔹 relasi ke peneliti yang submit
                    as: "SubmittedBy",
                    attributes: ["id", "name"],
                },
                {
                    model: answerModel_1.Answer,
                    attributes: ["question_id", "answer_text"],
                    include: [
                        {
                            model: questionModel_1.Question,
                            attributes: ["id", "question_text"],
                            include: [
                                {
                                    model: sessionModel_1.Session,
                                    attributes: ["id", "name"], // nama sesi
                                },
                            ],
                        },
                    ],
                },
                {
                    model: surveiModel_1.Survei,
                    attributes: ["id", "name"],
                    include: [
                        {
                            model: penelitiModel_1.Peneliti,
                            attributes: ["id", "name"], // peneliti pembuat survei
                        },
                    ],
                },
            ],
            order: [["id", "ASC"]],
        });
        const formatted = responses.map((r) => {
            var _a, _b, _c;
            return ({
                id: r.id,
                survei_id: r.survei_id,
                submitted_by: r.submitted_by,
                submitted_by_name: ((_a = r.SubmittedBy) === null || _a === void 0 ? void 0 : _a.name) || null, // 🔹 tampilkan nama peneliti yang submit
                submitted_at: r.submitted_at,
                created_by: ((_c = (_b = r.Survei) === null || _b === void 0 ? void 0 : _b.Peneliti) === null || _c === void 0 ? void 0 : _c.name) || null, // nama peneliti pembuat survei
                responden: r.Responden,
                answers: r.Answers.map((a) => {
                    var _a, _b, _c;
                    return ({
                        question_id: a.question_id,
                        question_text: ((_a = a.Question) === null || _a === void 0 ? void 0 : _a.question_text) || null,
                        session_name: ((_c = (_b = a.Question) === null || _b === void 0 ? void 0 : _b.Session) === null || _c === void 0 ? void 0 : _c.name) || null, // tampilkan sesi
                        answer_text: a.answer_text,
                    });
                }),
            });
        });
        res.status(200).json({
            message: "Berhasil mengambil semua response survei",
            data: formatted,
        });
    }
    catch (err) {
        console.error("❌ Error getResponsesBySurvey:", err);
        res.status(500).json({ message: err.message });
    }
});
exports.getResponsesBySurvey = getResponsesBySurvey;
// 🔹 Ambil satu response lengkap (responden + pertanyaan + jawaban)
const getResponseById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const response = yield responseModel_1.Response.findByPk(id, {
            include: [
                {
                    model: respondenModel_1.Responden,
                    attributes: ["id", "name", "email", "address"],
                },
                {
                    model: answerModel_1.Answer,
                    required: false, // ← agar tetap bisa ambil meskipun belum ada jawaban
                    attributes: ["question_id", "answer_text"],
                    include: [
                        {
                            model: questionModel_1.Question,
                            required: false, // ← biar tidak error walau pertanyaan hilang
                            attributes: ["id", "question_text"],
                        },
                    ],
                },
            ],
        });
        if (!response)
            return res.status(404).json({ message: "Response tidak ditemukan" });
        const answersRaw = response.Answers || response.Answer || [];
        const formatted = {
            id: response.id,
            survei_id: response.survei_id,
            responden: response.Responden,
            submitted_by: response.submitted_by,
            submitted_at: response.submitted_at,
            answers: answersRaw.map((a) => {
                var _a, _b, _c, _d;
                return ({
                    question_id: (_a = a === null || a === void 0 ? void 0 : a.question_id) !== null && _a !== void 0 ? _a : null,
                    question_text: (_c = (_b = a === null || a === void 0 ? void 0 : a.Question) === null || _b === void 0 ? void 0 : _b.question_text) !== null && _c !== void 0 ? _c : "",
                    answer_text: (_d = a === null || a === void 0 ? void 0 : a.answer_text) !== null && _d !== void 0 ? _d : "",
                });
            }),
        };
        res.status(200).json({
            message: "Berhasil mengambil detail response",
            data: formatted,
        });
    }
    catch (err) {
        console.error("❌ Error getResponseById:", err);
        res.status(500).json({ message: err.message });
    }
});
exports.getResponseById = getResponseById;
const updateSurveyResponse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const db = (0, db_1.getDB)();
    const t = yield db.sequelize.transaction();
    try {
        const { id } = req.params;
        const { responden, answers } = req.body;
        const response = yield responseModel_1.Response.findByPk(id, { transaction: t });
        if (!response) {
            yield t.rollback();
            return res.status(404).json({ message: "Response survei tidak ditemukan" });
        }
        const respondenRecord = yield respondenModel_1.Responden.findByPk(response.responden_id, { transaction: t });
        if (respondenRecord) {
            yield respondenRecord.update({
                name: responden.name,
                email: responden.email,
                address: responden.address,
            }, { transaction: t });
        }
        // Hapus semua jawaban lama dan ganti dengan yang baru
        yield answerModel_1.Answer.destroy({ where: { response_id: id }, transaction: t });
        const answerRecords = answers.map((a) => ({
            response_id: id,
            question_id: a.question_id,
            answer_text: a.answer_text,
        }));
        yield answerModel_1.Answer.bulkCreate(answerRecords, { transaction: t });
        yield t.commit();
        res.status(200).json({
            message: "Response survei berhasil diperbarui",
            data: {
                responden: respondenRecord,
                response,
                answers: answerRecords,
            },
        });
    }
    catch (err) {
        yield t.rollback();
        console.error("❌ Error updateSurveyResponse:", err);
        res.status(500).json({ message: err.message });
    }
});
exports.updateSurveyResponse = updateSurveyResponse;
const deleteSurveyResponse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const db = (0, db_1.getDB)();
    const t = yield db.sequelize.transaction();
    try {
        const { id } = req.params;
        const response = yield responseModel_1.Response.findByPk(id, { transaction: t });
        if (!response) {
            yield t.rollback();
            return res.status(404).json({ message: "Response survei tidak ditemukan" });
        }
        // Hapus semua Answer
        yield answerModel_1.Answer.destroy({ where: { response_id: id }, transaction: t });
        // Hapus responden
        yield respondenModel_1.Responden.destroy({ where: { id: response.responden_id }, transaction: t });
        // Hapus record response
        yield response.destroy({ transaction: t });
        yield t.commit();
        res.status(200).json({ message: "Response survei berhasil dihapus" });
    }
    catch (err) {
        yield t.rollback();
        console.error("❌ Error deleteSurveyResponse:", err);
        res.status(500).json({ message: err.message });
    }
});
exports.deleteSurveyResponse = deleteSurveyResponse;
