import express, { Router } from 'express';
import auth from './authController.js';
import asyncHandler from '../../utils/asyncHandler.js';

const router = express.Router();

router.post('/register', asyncHandler(auth.register));
router.post('/login', asyncHandler(auth.login));
router.post('/refresh-token', asyncHandler(auth.refreshToken));
router.post('/reset-password', asyncHandler(auth.resetPassword));

export default router;
