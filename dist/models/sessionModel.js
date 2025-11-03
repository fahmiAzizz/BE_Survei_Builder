"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Session = void 0;
exports.default = sessionModel;
const sequelize_1 = require("sequelize");
class Session extends sequelize_1.Model {
}
exports.Session = Session;
function sessionModel(sequelize) {
    Session.init({
        survei_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
        name: { type: sequelize_1.DataTypes.STRING },
        order: { type: sequelize_1.DataTypes.INTEGER },
        allow_multiple: {
            type: sequelize_1.DataTypes.BOOLEAN,
        },
    }, {
        sequelize,
        tableName: "session",
        timestamps: false,
    });
    return Session;
}
