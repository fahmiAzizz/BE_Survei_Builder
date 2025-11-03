"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const penelitiController_js_1 = require("../controllers/penelitiController.js");
const verifyToken_js_1 = require("../middleware/verifyToken.js");
const router = express_1.default.Router();
router.get("/peneliti", verifyToken_js_1.verifyToken, penelitiController_js_1.getPeneliti);
router.delete("/peneliti/:id", verifyToken_js_1.verifyToken, penelitiController_js_1.deletePeneliti);
router.post("/peneliti/register", penelitiController_js_1.register);
router.post("/peneliti/login", penelitiController_js_1.login);
router.post("/peneliti/logout", penelitiController_js_1.logout);
exports.default = router;
