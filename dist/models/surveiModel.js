"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Survei = void 0;
exports.default = surveiModel;
const sequelize_1 = require("sequelize");
class Survei extends sequelize_1.Model {
}
exports.Survei = Survei;
function surveiModel(sequelize) {
    Survei.init({
        name: { type: sequelize_1.DataTypes.STRING, allowNull: false },
        description: { type: sequelize_1.DataTypes.TEXT },
        created_by: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    }, {
        sequelize,
        tableName: "survei",
        timestamps: true,
    });
    return Survei;
}
