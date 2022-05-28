"use strict";
import express from "express";
import userController from "../controllers/userController.js"
const router = express.Router();

router.post('/login', userController)
router.get('/user/data', userController)
router.post('/grade/new', userController)
router.post('/user/new', userController)

export default router;
