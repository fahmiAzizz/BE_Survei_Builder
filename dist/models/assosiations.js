"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupAssociations = setupAssociations;
const surveiModel_1 = require("./surveiModel");
const sessionModel_1 = require("./sessionModel");
const questionModel_1 = require("./questionModel");
const questionOptionModel_1 = require("./questionOptionModel");
const respondenModel_1 = require("./respondenModel");
const responseModel_1 = require("./responseModel");
const answerModel_1 = require("./answerModel");
const penelitiModel_1 = require("./penelitiModel");
function setupAssociations() {
    // 🧩 Survei
    surveiModel_1.Survei.belongsTo(penelitiModel_1.Peneliti, { foreignKey: 'created_by', as: 'peneliti' });
    surveiModel_1.Survei.hasMany(sessionModel_1.Session, { foreignKey: 'survei_id', as: 'sessions' });
    surveiModel_1.Survei.hasMany(responseModel_1.Response, { foreignKey: 'survei_id', as: 'responses' });
    // 🧩 Session
    sessionModel_1.Session.belongsTo(surveiModel_1.Survei, { foreignKey: 'survei_id', as: 'survei' });
    sessionModel_1.Session.hasMany(questionModel_1.Question, { foreignKey: 'session_id', as: 'questions' });
    // 🧩 Question
    questionModel_1.Question.belongsTo(sessionModel_1.Session, { foreignKey: 'session_id', as: 'session' });
    questionModel_1.Question.hasMany(questionOptionModel_1.QuestionOption, { foreignKey: 'question_id', as: 'options' });
    questionModel_1.Question.hasMany(answerModel_1.Answer, { foreignKey: 'question_id', as: 'answers' });
    // 🧩 QuestionOption
    questionOptionModel_1.QuestionOption.belongsTo(questionModel_1.Question, { foreignKey: 'question_id', as: 'question' });
    // 🧩 Responden
    respondenModel_1.Responden.hasMany(responseModel_1.Response, { foreignKey: 'responden_id', as: 'responses' });
    // 🧩 Response
    responseModel_1.Response.belongsTo(surveiModel_1.Survei, { foreignKey: 'survei_id', as: 'survei' });
    responseModel_1.Response.belongsTo(respondenModel_1.Responden, { foreignKey: 'responden_id', as: 'responden' });
    responseModel_1.Response.belongsTo(penelitiModel_1.Peneliti, { foreignKey: 'submitted_by', as: 'peneliti' });
    responseModel_1.Response.hasMany(answerModel_1.Answer, { foreignKey: 'response_id', as: 'answers' });
    // 🧩 Answer
    answerModel_1.Answer.belongsTo(responseModel_1.Response, { foreignKey: 'response_id', as: 'response' });
    answerModel_1.Answer.belongsTo(questionModel_1.Question, { foreignKey: 'question_id', as: 'question' });
    // 🧩 Peneliti
    penelitiModel_1.Peneliti.hasMany(surveiModel_1.Survei, { foreignKey: 'created_by', as: 'surveis' });
    penelitiModel_1.Peneliti.hasMany(responseModel_1.Response, { foreignKey: 'submitted_by', as: 'responses' });
}
