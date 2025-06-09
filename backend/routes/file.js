
import {Router} from 'express';
import { authMiddleware } from '../controllers/auth-controller/index.js';
import { deleteFile, getFileTreeByProjectId, renameFile, updateFileContent } from '../controllers/file-controller/index.js';
const router = Router();

router.get('/get/:projectId', authMiddleware, getFileTreeByProjectId);
router.put('/update',authMiddleware, updateFileContent);
router.put('/delete',authMiddleware, deleteFile);
router.put('/rename',authMiddleware, renameFile);

export default router;