import express from 'express';
import connectDB from './db/db.js';

connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));





app.get('/', (req, res) => {
  res.send('Hello World!');
});

export default app;