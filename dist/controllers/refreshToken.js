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
exports.refreshToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const penelitiModel_1 = require("../models/penelitiModel");
const refreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken)
            return res.status(401).json({ msg: "Tidak ada refresh token" });
        const peneliti = yield penelitiModel_1.Peneliti.findOne({
            where: { refresh_token: refreshToken },
        });
        if (!peneliti)
            return res.status(403).json({ msg: "Refresh token tidak valid" });
        jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
            if (err)
                return res.status(403).json({ msg: "Refresh token kadaluarsa" });
            const penelitiId = peneliti.id;
            const name = peneliti.name;
            const email = peneliti.email;
            const accessToken = jsonwebtoken_1.default.sign({ penelitiId, name, email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
            res.json({ accessToken });
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Gagal memperbarui token" });
    }
});
exports.refreshToken = refreshToken;
