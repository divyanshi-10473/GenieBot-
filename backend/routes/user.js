import express from 'express';
import { registerUser, loginUser, logoutUser, authMiddleware, getAllUsers, loginWithGithub } from '../controllers/auth-controller/index.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/github', loginWithGithub);
router.get('/get-user', authMiddleware, getAllUsers);
router.get('/check-auth', authMiddleware, (req, res) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    message: 'User is authenticated',
    user,
  });
});

export default router;
