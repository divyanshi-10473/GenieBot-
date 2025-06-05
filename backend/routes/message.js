import express from 'express';
import { authMiddleware } from '../controllers/auth-controller/index.js';
import {
  deleteConversation,
  getMessagesForProject,
  sendMessage
} from '../controllers/message-controller/index.js';

const router = express.Router();


router.post('/send', authMiddleware, sendMessage);
router.get('/fetch/:projectId', authMiddleware, getMessagesForProject);
router.delete('/clear/:projectId', authMiddleware, deleteConversation);

export default router;
