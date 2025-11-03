"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Question = void 0;
exports.default = questionModel;
const sequelize_1 = require("sequelize");
class Question extends sequelize_1.Model {
}
exports.Question = Question;
function questionModel(sequelize) {
    Question.init({
        session_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
        question_text: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
        type: {
            type: sequelize_1.DataTypes.ENUM("text", "number", "date", "dropdown", "checkbox", "rating"),
            allowNull: false,
        },
        required: { type: sequelize_1.DataTypes.BOOLEAN, defaultValue: false },
        order: { type: sequelize_1.DataTypes.INTEGER },
        parent_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
    }, {
        sequelize,
        tableName: "question",
        timestamps: false,
    });
    return Question;
}
