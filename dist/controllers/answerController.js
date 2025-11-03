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
exports.getResponseById = exports.getResponsesBySurvey = exports.createSurveyResponse = void 0;
const db_1 = require("../config/db");
const respondenModel_1 = require("../models/respondenModel");
const responseModel_1 = require("../models/responseModel");
const answerModel_1 = require("../models/answerModel");
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
        // 2️⃣ Simpan data response survei
        const responseRecord = yield responseModel_1.Response.create({
            survei_id,
            responden_id: respondenRecord.id,
            submitted_by,
            submitted_at: new Date(),
        }, { transaction: t });
        // 3️⃣ Simpan jawaban
        const answerRecords = answers.map((a) => ({
            response_id: responseRecord.id,
            question_id: a.question_id,
            answer_text: a.answer_text,
        }));
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
// 🔹 Ambil semua response untuk satu survei
const getResponsesBySurvey = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { survei_id } = req.params;
        const responses = yield responseModel_1.Response.findAll({
            where: { survei_id },
            include: [respondenModel_1.Responden, answerModel_1.Answer],
        });
        res.json(responses);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
exports.getResponsesBySurvey = getResponsesBySurvey;
// 🔹 Ambil satu response lengkap (responden + jawaban)
const getResponseById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const response = yield responseModel_1.Response.findByPk(id, {
            include: [respondenModel_1.Responden, answerModel_1.Answer],
        });
        if (!response)
            return res.status(404).json({ message: "Response tidak ditemukan" });
        res.json(response);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
exports.getResponseById = getResponseById;
