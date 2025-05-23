import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minlength: [6, 'Email must be at least 6 characters long'],
        maxlegnth: [50, 'Email must be at most 50 characters long'],
    },
    password: {
        type: String,
        required: true, 
    }
    });

    
const User = mongoose.model('User', userSchema);