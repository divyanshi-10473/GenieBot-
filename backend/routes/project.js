import {Router} from 'express';
import { authMiddleware } from '../controllers/auth-controller/index.js';
import { createProject, fetchProjects } from '../controllers/project-controller/index.js';

const router = Router();

router.post('/create', authMiddleware, createProject)
router.get('/get', authMiddleware, fetchProjects)


export default router;