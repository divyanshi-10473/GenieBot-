import {Router} from 'express';
import { authMiddleware } from '../controllers/auth-controller/index.js';

import { acceptInvite, deleteInvite, getInvitesByProjectId, getInvitesForUser, inviteCollaborator, rejectInvite } from "../controllers/invites-controller/index.js"
const router = Router();

router.post('/send', authMiddleware, inviteCollaborator)
router.get('/get/:projectId', authMiddleware, getInvitesByProjectId)
router.delete('/delete/:inviteId', authMiddleware, deleteInvite)
router.get('/fetch',authMiddleware,getInvitesForUser)
router.post('/accept/:inviteId',authMiddleware,acceptInvite)
router.put('/reject/:inviteId',authMiddleware,rejectInvite)


export default router;