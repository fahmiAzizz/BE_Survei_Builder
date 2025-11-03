"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Response = void 0;
exports.default = responseModel;
const sequelize_1 = require("sequelize");
class Response extends sequelize_1.Model {
}
exports.Response = Response;
function responseModel(sequelize) {
    Response.init({
        survei_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
        responden_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
        submitted_by: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
        submitted_at: { type: sequelize_1.DataTypes.DATE },
    }, {
        sequelize,
        tableName: "response",
        timestamps: false,
    });
    return Response;
}
