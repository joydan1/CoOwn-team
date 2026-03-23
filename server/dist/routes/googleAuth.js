"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const router = (0, express_1.Router)();
router.get("/google", passport_1.default.authenticate('google', { scope: ['profile', 'email'] }));
router.get("/google/callback", passport_1.default.authenticate("google", { session: false }), (req, res) => {
    res.json(req.user);
});
exports.default = router;
//# sourceMappingURL=googleAuth.js.map