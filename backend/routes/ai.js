import {Router} from 'express';
import { getResult } from '../controllers/ai-controller/index.js';

const router = Router();

router.get('/get',  getResult)

export default router;