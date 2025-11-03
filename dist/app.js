"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./config/db");
const dotenv_1 = __importDefault(require("dotenv"));
const penelitiRoute_1 = __importDefault(require("./routes/penelitiRoute"));
const surveiRoute_1 = __importDefault(require("./routes/surveiRoute"));
const responseRoute_1 = __importDefault(require("./routes/responseRoute"));
const app = (0, express_1.default)();
dotenv_1.default.config();
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: "http://localhost:5173", // asal dari FE kamu (Vite default)
    credentials: true // biar cookie (refresh token) bisa ikut
}));
app.use('/', penelitiRoute_1.default);
app.use('/', surveiRoute_1.default);
app.use('/', responseRoute_1.default);
(0, db_1.initDB)();
exports.default = app;
