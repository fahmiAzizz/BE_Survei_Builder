"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionOption = void 0;
exports.default = questionOptionModel;
const sequelize_1 = require("sequelize");
class QuestionOption extends sequelize_1.Model {
}
exports.QuestionOption = QuestionOption;
function questionOptionModel(sequelize) {
    QuestionOption.init({
        question_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
        option_text: { type: sequelize_1.DataTypes.STRING },
    }, {
        sequelize,
        tableName: "question_option",
        timestamps: false,
    });
    return QuestionOption;
}
