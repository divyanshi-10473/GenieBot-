import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../../models/user.js';
import axios from 'axios';
import dotenv from 'dotenv';
import { getGitHubAccessToken, getGitHubPrimaryEmail, getGitHubUser } from '../../service/github.js';
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;


export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check for existing email
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    // Check for existing username
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ success: false, message: "Username already taken" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      authProvider: 'local',
      profilePic: null, // or provide a default avatar URL if preferred
    });

    await newUser.save();

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
    });

  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const Checkuser = await User.findOne({ email });
    if (!Checkuser) {
      return res.status(400).json({
        success: false,
        message: 'User not found',
      });
    }
    const isMatch = await bcrypt.compare(password, Checkuser.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials',
      });
    }
    const token = jwt.sign(
      { id: Checkuser._id, name: Checkuser.username, email: Checkuser.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    res
      .cookie('token', token, {
        httpOnly: true,
        secure: false,
      })
      .json({
        success: true,
        message: 'Logged in successfully',
        user: {
          email: Checkuser.email,
          username: Checkuser.username,
          id: Checkuser._id,
        },
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const logoutUser = (req, res) => {
  res.clearCookie('token').json({
    success: true,
    message: 'Logged out successfully!',
  });
};

export const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ success: false, message: 'Please login to access this resource' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

export const loginWithGithub = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'GitHub authorization code is required' });
    }

    // 1. Exchange code for access token
    const accessToken = await getGitHubAccessToken(code);
    if (!accessToken) {
      return res.status(401).json({ success: false, message: 'Failed to get GitHub access token' });
    }

    // 2. Fetch user data
    const githubUser = await getGitHubUser(accessToken);
    let email = githubUser.email;

    if (!email) {
      // Fallback: fetch primary verified email
      email = await getGitHubPrimaryEmail(accessToken);
      if (!email) {
        return res.status(401).json({ success: false, message: 'GitHub email not accessible' });
      }
    }

    // 3. Check or create user
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        username: githubUser.login,
        email,
        authProvider: 'github',
        profilePic: githubUser.avatar_url,
        password: null,
      });
    }

    // 4. Generate JWT token
    const token = jwt.sign(
      { id: user._id, name: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 5. Set token in cookie and return user info
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
    }).json({
      success: true,
      message: 'Logged in with GitHub successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });

  } catch (error) {
    console.error('GitHub login error:', error);
    res.status(500).json({
      success: false,
      message: 'GitHub login failed',
    });
  }
};




export const getAllUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id; // assuming you're using JWT middleware to extract this

    const users = await User.find({ _id: { $ne: currentUserId } }).select('_id username email');

    res.status(200).json(
    {success: true,
    data: users}
  );
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getSingleUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('_id username email');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};




