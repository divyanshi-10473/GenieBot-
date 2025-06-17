import express from 'express';
import connectDB from './db/db.js';
import userRoutes from './routes/user.js'
import projectRoutes from './routes/project.js';
import inviteRoutes from './routes/invites.js';
import messageRoutes from './routes/message.js';
import aiRoutes from './routes/ai.js';
import fileRoutes from './routes/file.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
connectDB();

const app = express();

app.use(
    cors({
        origin: 'http://localhost:5173',
        methods: ['GET','POST', 'DELETE', 'PUT'],
        allowedHeaders: [
            "Content-Type",
            "Authorization",
            "Cache-Control",
            'Express',
            'Pragma'

        ],
        credentials: true
    })
);



app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());



app.use('/users', userRoutes);
app.use('/project', projectRoutes);
app.use('/projectInvites', inviteRoutes);
app.use('/message', messageRoutes);
app.use('/ai', aiRoutes);
app.use('/file', fileRoutes);




export default app;