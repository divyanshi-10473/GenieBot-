import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../../models/user.js';

const JWT_SECRET = process.env.JWT_SECRET;

export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const checkEmail = await User.findOne({ email });
    if (checkEmail) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const checkUsername = await User.findOne({ username });
    if (checkUsername) {
      return res.status(400).json({ success: false, message: 'Username already taken' });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashPassword,
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
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




