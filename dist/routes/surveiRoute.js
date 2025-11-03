"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const surveiController_1 = require("../controllers/surveiController");
const verifyToken_1 = require("../middleware/verifyToken");
const router = express_1.default.Router();
router.get('/survei', verifyToken_1.verifyToken, surveiController_1.getAllSurveys);
router.get('/survei/:id', verifyToken_1.verifyToken, surveiController_1.getSurveyById);
router.post('/survei', surveiController_1.createSurvey);
router.put('/survei/:id', verifyToken_1.verifyToken, surveiController_1.updateSurvey);
router.delete('/survei/:id', verifyToken_1.verifyToken, surveiController_1.deleteSurvey);
exports.default = router;
