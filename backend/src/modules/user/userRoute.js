import express from 'express';
import asyncHandler from '../../utils/asyncHandler.js';
import { userController } from './userController.js';

const router = express.Router();

router.get('/', asyncHandler(userController.list));
router.get('/:id', asyncHandler(userController.show));

router.post('/', asyncHandler(userController.create));

router.put('/:id', asyncHandler(userController.update));

router.patch(
  '/reset-password/:email',
  asyncHandler(userController.updatePassword)
);

router.patch('/avatar/:id', asyncHandler(userController.updateAvatarUrl));
router.patch('/cover/:id', asyncHandler(userController.updateCoverUrl));

router.delete('/:id', asyncHandler(userController.remove));

export default router;
