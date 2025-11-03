"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Responden = void 0;
exports.default = respondenModel;
const sequelize_1 = require("sequelize");
class Responden extends sequelize_1.Model {
}
exports.Responden = Responden;
function respondenModel(sequelize) {
    Responden.init({
        name: { type: sequelize_1.DataTypes.STRING },
        email: { type: sequelize_1.DataTypes.STRING },
        address: { type: sequelize_1.DataTypes.STRING },
    }, {
        sequelize,
        tableName: "responden",
        timestamps: true,
    });
    return Responden;
}
