"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Peneliti = void 0;
exports.default = penelitiModel;
const sequelize_1 = require("sequelize");
class Peneliti extends sequelize_1.Model {
}
exports.Peneliti = Peneliti;
function penelitiModel(sequelize) {
    Peneliti.init({
        name: { type: sequelize_1.DataTypes.STRING, allowNull: false },
        email: { type: sequelize_1.DataTypes.STRING, allowNull: false, unique: true },
        password_hash: { type: sequelize_1.DataTypes.STRING, allowNull: false },
        role: { type: sequelize_1.DataTypes.ENUM("creator", "inputer"), defaultValue: "inputer" },
    }, {
        sequelize,
        tableName: "peneliti",
        timestamps: true,
    });
    return Peneliti;
}
