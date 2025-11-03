"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Answer = void 0;
exports.default = answerModel;
const sequelize_1 = require("sequelize");
class Answer extends sequelize_1.Model {
}
exports.Answer = Answer;
function answerModel(sequelize) {
    Answer.init({
        response_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
        question_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
        group_index: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
        answer_text: { type: sequelize_1.DataTypes.TEXT },
    }, {
        sequelize,
        tableName: "answer",
        timestamps: false,
    });
    return Answer;
}
