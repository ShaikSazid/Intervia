import express from "express";
import * as authController from "./auth.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/me", authenticate, authController.me);
router.post("/logout", authController.logout);
router.post("/refresh", authController.refresh);

export { router };