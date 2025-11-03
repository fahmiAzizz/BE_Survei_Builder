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
exports.logout = exports.login = exports.register = exports.deletePeneliti = exports.getPeneliti = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const penelitiModel_1 = require("../models/penelitiModel");
const getPeneliti = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield penelitiModel_1.Peneliti.findAll({
            attributes: ["id", "name", "email", "role"],
        });
        res.status(200).json(data);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Gagal mengambil data peneliti" });
    }
});
exports.getPeneliti = getPeneliti;
const deletePeneliti = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield penelitiModel_1.Peneliti.destroy({ where: { id: req.params.id } });
        res.status(200).json({ msg: "Peneliti berhasil dihapus" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Gagal menghapus peneliti" });
    }
});
exports.deletePeneliti = deletePeneliti;
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, confPassword, role } = req.body;
    if (password !== confPassword)
        return res.status(400).json({ msg: "Password dan konfirmasi tidak cocok" });
    try {
        const existing = yield penelitiModel_1.Peneliti.findOne({ where: { email } });
        if (existing)
            return res.status(400).json({ msg: "Email sudah terdaftar" });
        const salt = yield bcrypt_1.default.genSalt();
        const hash = yield bcrypt_1.default.hash(password, salt);
        yield penelitiModel_1.Peneliti.create({
            name,
            email,
            password_hash: hash,
            role: role || "inputer",
        });
        res.status(201).json({ msg: "Registrasi berhasil" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Gagal registrasi peneliti" });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const peneliti = yield penelitiModel_1.Peneliti.findOne({
            where: { email: req.body.email },
        });
        if (!peneliti)
            return res.status(404).json({ msg: "Email tidak ditemukan" });
        const match = yield bcrypt_1.default.compare(req.body.password, peneliti.password_hash);
        if (!match)
            return res.status(400).json({ msg: "Password salah" });
        const penelitiId = peneliti.id;
        const name = peneliti.name;
        const email = peneliti.email;
        const accessToken = jsonwebtoken_1.default.sign({ penelitiId, name, email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1d" });
        const refreshToken = jsonwebtoken_1.default.sign({ penelitiId, name, email }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "1d" });
        yield peneliti.update({ refresh_token: refreshToken });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
        });
        res.json({
            peneliti: {
                id: peneliti.id,
                name: peneliti.name,
                email: peneliti.email,
            },
            accessToken,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Login gagal" });
    }
});
exports.login = login;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken)
        return res.sendStatus(204);
    const peneliti = yield penelitiModel_1.Peneliti.findOne({
        where: { refresh_token: refreshToken },
    });
    if (!peneliti)
        return res.sendStatus(204);
    yield peneliti.update({ refresh_token: null });
    res.clearCookie("refreshToken");
    res.json({ msg: "Logout berhasil" });
});
exports.logout = logout;
