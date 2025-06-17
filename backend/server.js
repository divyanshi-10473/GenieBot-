import dotenv from 'dotenv';
dotenv.config();

import cookie from 'cookie';
import http from 'http';
import jwt from 'jsonwebtoken';
import app from './app.js';
import { Server } from 'socket.io';
import Project from './models/project.js';
import mongoose from 'mongoose';
import Message from './models/message.js';
import { generateResult } from './service/ai.js';


const PORT = process.env.PORT || 3000;


const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*'
  }
})

io.use(async (socket, next) => {
  try {

    const cookies = socket.handshake.headers.cookie;
    if (!cookies) {
      return next(new Error('Authentication error: No cookies found'));
    }

    const parsedCookies = cookie.parse(cookies);
    const token = parsedCookies.token;

    if (!token) {
      return next(new Error('Authentication error: No token cookie'));
    }


    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;


    const projectId = socket.handshake.query.projectId;
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return next(new Error('Invalid projectId'));
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return next(new Error('Project not found'));
    }

    socket.project = project;

    next();
  } catch (error) {
    console.error('Socket authentication error:', error.message);
    next(new Error('Authentication error'));
  }
});

io.on('connection', socket => {

  console.log('A user connected');
  socket.join(socket.project._id.toString());

socket.on('project-message', async data => {
  const message = data.message;
  const ai = message.startsWith('@ai ');

  if (!ai) {
    socket.broadcast.to(socket.project._id.toString()).emit('project-message', data);
    return;
  }

  const aiText = message.replace('@ai', '');
  const result = await generateResult(aiText);

  let mes;
  try {
    const match = result.match(/\{[\s\S]*\}/);
    if (match) {
      mes = JSON.parse(match[0]);

      const fileTree = mes.fileTree;
      console.log(fileTree, "← fileTree extracted");

      if (fileTree) {
        const project = await Project.findById(socket.project._id);
        if (!project) return console.error("Project not found");

        project.fileTree = {
          ...project.fileTree,
          ...fileTree,
        };

        await project.save();
        console.log("file emmitted successfully")
        io.to(socket.project._id.toString()).emit('fileTreeUpdated')
        


      }
    } else {
      console.error("No valid JSON found in AI response");
    }
  } catch (err) {
    console.error("Error parsing AI response JSON:", err.message);
  }


  await Message.create({
    projectId: socket.project._id,
    sender: null,
    system: true,
    content: result,
    timestamp: new Date().toISOString(),
  });


  io.to(socket.project._id.toString()).emit('project-message', {
    sender: { username: 'AI Bot' },
    content: result,
    system: true,
    timestamp: new Date().toISOString(),
  });
});


  socket.on('disconnect', () => {
    console.log('user disconnected');
    socket.leave(socket.project._id.toString());
  });
});



server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});