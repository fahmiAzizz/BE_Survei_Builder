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
exports.initDB = initDB;
exports.getDB = getDB;
const sequelize_1 = require("sequelize");
const mysql2_1 = __importDefault(require("mysql2"));
const dotenv_1 = __importDefault(require("dotenv"));
const penelitiModel_1 = __importDefault(require("../models/penelitiModel"));
const surveiModel_1 = __importDefault(require("../models/surveiModel"));
const sessionModel_1 = __importDefault(require("../models/sessionModel"));
const questionModel_1 = __importDefault(require("../models/questionModel"));
const questionOptionModel_1 = __importDefault(require("../models/questionOptionModel"));
const responseModel_1 = __importDefault(require("../models/responseModel"));
const answerModel_1 = __importDefault(require("../models/answerModel"));
dotenv_1.default.config();
let db;
function initDB() {
    return __awaiter(this, void 0, void 0, function* () {
        const sequelize = new sequelize_1.Sequelize({
            database: process.env.DB_NAME,
            username: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT || 3306),
            dialect: "mysql",
            dialectModule: mysql2_1.default,
            logging: false,
        });
        db = {
            sequelize,
            Peneliti: (0, penelitiModel_1.default)(sequelize),
            Survei: (0, surveiModel_1.default)(sequelize),
            Session: (0, sessionModel_1.default)(sequelize),
            Question: (0, questionModel_1.default)(sequelize),
            QuestionOption: (0, questionOptionModel_1.default)(sequelize),
            Response: (0, responseModel_1.default)(sequelize),
            Answer: (0, answerModel_1.default)(sequelize),
        };
        // === ASSOCIATIONS ===
        db.Peneliti.hasMany(db.Survei, { foreignKey: "created_by" });
        db.Survei.belongsTo(db.Peneliti, { foreignKey: "created_by" });
        db.Survei.hasMany(db.Session, { foreignKey: "survei_id" });
        db.Session.belongsTo(db.Survei, { foreignKey: "survei_id" });
        db.Session.hasMany(db.Question, { foreignKey: "session_id" });
        db.Question.belongsTo(db.Session, { foreignKey: "session_id" });
        db.Question.hasMany(db.QuestionOption, { foreignKey: "question_id" });
        db.QuestionOption.belongsTo(db.Question, { foreignKey: "question_id" });
        db.Survei.hasMany(db.Response, { foreignKey: "survei_id" });
        db.Response.belongsTo(db.Survei, { foreignKey: "survei_id" });
        db.Peneliti.hasMany(db.Response, { foreignKey: "submitted_by", as: "SubmittedResponses" });
        db.Response.belongsTo(db.Peneliti, { foreignKey: "submitted_by", as: "SubmittedBy" });
        db.Response.hasMany(db.Answer, { foreignKey: "response_id" });
        db.Answer.belongsTo(db.Response, { foreignKey: "response_id" });
        db.Question.hasMany(db.Answer, { foreignKey: "question_id" });
        db.Answer.belongsTo(db.Question, { foreignKey: "question_id" });
        db.Question.hasMany(db.Question, {
            as: "SubQuestions",
            onDelete: "CASCADE", // 🔹 ini penting
            hooks: true,
            foreignKey: "parent_question_id",
        });
        db.Question.belongsTo(db.Question, {
            as: "ParentQuestion",
            onDelete: "CASCADE", // 🔹 ini penting
            hooks: true,
            foreignKey: "parent_question_id",
        });
        sequelize.sync({ force: true })
            .then(() => {
            console.log('✅ Database synchronized with alter mode');
        })
            .catch((err) => {
            console.error('❌ Error syncing database:', err);
        });
        console.log("✅ Database initialized successfully!");
    });
}
function getDB() {
    if (!db)
        throw new Error("Database not initialized. Call initDB() first.");
    return db;
}
