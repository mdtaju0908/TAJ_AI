import express from 'express';
import {
  getChats,
  createChat,
  getChat,
  updateChat,
  deleteChat,
  addMessage
} from '../controllers/chat.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getChats)
  .post(createChat);

router.route('/:id')
  .get(getChat)
  .put(updateChat)
  .delete(deleteChat);

router.route('/:id/messages')
  .post(addMessage);

export default router;
