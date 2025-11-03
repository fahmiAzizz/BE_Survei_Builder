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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertResponseToExcel = void 0;
const exceljs_1 = __importDefault(require("exceljs"));
const respondenModel_1 = require("../models/respondenModel");
const responseModel_1 = require("../models/responseModel");
const answerModel_1 = require("../models/answerModel");
const questionModel_1 = require("../models/questionModel");
const penelitiModel_1 = require("../models/penelitiModel");
const sessionModel_1 = require("../models/sessionModel");
const surveiModel_1 = require("../models/surveiModel");
const convertResponseToExcel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { survei_id } = req.params;
        const responses = yield responseModel_1.Response.findAll({
            where: { survei_id },
            include: [
                { model: respondenModel_1.Responden, attributes: ["id", "name", "email", "address"] },
                { model: penelitiModel_1.Peneliti, as: "SubmittedBy", attributes: ["id", "name"] },
                {
                    model: answerModel_1.Answer,
                    attributes: ["question_id", "answer_text", "group_index"], // 🆕 tambahkan group_index
                    include: [
                        {
                            model: questionModel_1.Question,
                            attributes: ["id", "question_text"],
                            include: [
                                { model: sessionModel_1.Session, attributes: ["id", "name", "allow_multiple"] },
                            ],
                        },
                    ],
                },
                {
                    model: surveiModel_1.Survei,
                    attributes: ["id", "name"],
                    include: [{ model: penelitiModel_1.Peneliti, attributes: ["id", "name"] }],
                },
            ],
            order: [["id", "ASC"]],
        });
        if (!responses.length) {
            return res.status(404).json({ message: "Tidak ada data untuk survei ini." });
        }
        // 🔹 Format data mentah
        const formatted = responses.map((r) => {
            var _a, _b, _c, _d, _e, _f, _g;
            return ({
                id: r.id,
                survei_name: ((_a = r.Survei) === null || _a === void 0 ? void 0 : _a.name) || null,
                created_by: ((_c = (_b = r.Survei) === null || _b === void 0 ? void 0 : _b.Peneliti) === null || _c === void 0 ? void 0 : _c.name) || null,
                submitted_by: ((_d = r.SubmittedBy) === null || _d === void 0 ? void 0 : _d.name) || null,
                submitted_at: r.submitted_at,
                responden_name: ((_e = r.Responden) === null || _e === void 0 ? void 0 : _e.name) || null,
                responden_email: ((_f = r.Responden) === null || _f === void 0 ? void 0 : _f.email) || null,
                responden_address: ((_g = r.Responden) === null || _g === void 0 ? void 0 : _g.address) || null,
                answers: r.Answers.map((a) => {
                    var _a, _b, _c, _d, _e, _f;
                    return ({
                        question_id: (_a = a.Question) === null || _a === void 0 ? void 0 : _a.id,
                        question_text: ((_b = a.Question) === null || _b === void 0 ? void 0 : _b.question_text) || null,
                        session_name: ((_d = (_c = a.Question) === null || _c === void 0 ? void 0 : _c.Session) === null || _d === void 0 ? void 0 : _d.name) || "Tanpa Session",
                        allow_multiple: ((_f = (_e = a.Question) === null || _e === void 0 ? void 0 : _e.Session) === null || _f === void 0 ? void 0 : _f.allow_multiple) || false,
                        answer_text: a.answer_text,
                        group_index: a.group_index || 1, // 🆕 tambahkan
                    });
                }),
            });
        });
        // 🔹 Kelompokkan berdasarkan session
        const sessionGroups = {};
        formatted.forEach((r) => {
            r.answers.forEach((a) => {
                const sessionName = a.session_name || "Tanpa Session";
                const allowMultiple = a.allow_multiple || false;
                if (!sessionGroups[sessionName]) {
                    sessionGroups[sessionName] = { rows: [], allowMultiple };
                }
                sessionGroups[sessionName].rows.push(Object.assign(Object.assign({}, r), { question_id: a.question_id, question_text: a.question_text, answer_text: a.answer_text, group_index: a.group_index }));
            });
        });
        const workbook = new exceljs_1.default.Workbook();
        // 🔹 Loop setiap session → buat sheet baru
        for (const [sessionName, group] of Object.entries(sessionGroups)) {
            const { rows, allowMultiple } = group;
            const worksheet = workbook.addWorksheet(sessionName.slice(0, 31));
            // 🔹 Ambil pertanyaan unik
            const uniqueQuestions = Array.from(new Map(rows.map((r) => [r.question_id, r.question_text])).entries());
            // 🔹 Header kolom
            const headers = [
                { header: "Nama Responden", key: "responden_name", width: 25 },
                { header: "Email", key: "email", width: 25 },
                { header: "Alamat", key: "address", width: 30 },
                ...(allowMultiple
                    ? [{ header: "Group Index", key: "group_index", width: 15 }]
                    : []),
                ...uniqueQuestions.map(([qId, qText], i) => ({
                    header: qText || `Pertanyaan ${i + 1}`,
                    key: `q_${qId}`,
                    width: 25,
                })),
            ];
            worksheet.columns = headers;
            // 🔹 Buat mapping response → 1 baris
            const responsesMap = {};
            rows.forEach((r) => {
                const key = allowMultiple
                    ? `${r.id}_${r.group_index}`
                    : String(r.id); // 🆕 pisahkan berdasarkan group_index
                if (!responsesMap[key]) {
                    responsesMap[key] = {
                        responden_name: r.responden_name,
                        email: r.responden_email,
                        address: r.responden_address,
                    };
                    if (allowMultiple) {
                        responsesMap[key].group_index = r.group_index;
                    }
                }
                responsesMap[key][`q_${r.question_id}`] = r.answer_text;
            });
            // 🔹 Tambahkan ke worksheet
            Object.values(responsesMap).forEach((row) => worksheet.addRow(row));
            // Styling header
            worksheet.getRow(1).font = { bold: true };
            worksheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" };
            worksheet.getRow(1).height = 25;
            worksheet.eachRow((row) => {
                row.eachCell((cell) => {
                    cell.border = {
                        top: { style: "thin" },
                        left: { style: "thin" },
                        bottom: { style: "thin" },
                        right: { style: "thin" },
                    };
                });
            });
        }
        // 🔹 Output file Excel
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; filename=survey_${survei_id}_responses.xlsx`);
        yield workbook.xlsx.write(res);
        res.end();
    }
    catch (err) {
        console.error("❌ Error convertResponseToExcel:", err);
        res.status(500).json({ message: err.message });
    }
});
exports.convertResponseToExcel = convertResponseToExcel;
