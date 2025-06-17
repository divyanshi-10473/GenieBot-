import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import image from '../assets/robo.png';
import { useDispatch } from 'react-redux';
import { registerUser } from '../../store/auth';
import toast from 'react-hot-toast';

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await dispatch(registerUser(formData)).unwrap();
      toast.success(result?.message, {
        position: 'bottom-right',
      });
      navigate('/login');
    } catch (errorMessage) {
      toast.error(errorMessage, {
        position: 'bottom-right',
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#121927] text-white">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-4 backdrop-blur bg-white/5">
        <h1 className="text-3xl font-bold">
          Collaborator<span className="text-teal-500">X</span>
        </h1>
        <div className="space-x-4 hidden sm:flex">
          <button
            onClick={() => navigate('/login')}
            className="px-5 py-2 rounded-full bg-transparent border border-white hover:bg-white hover:text-black transition"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/register')}
            className="px-5 py-2 rounded-full bg-teal-500 hover:bg-teal-600 text-white transition"
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Image */}
        <div className="hidden lg:flex w-1/2 items-center justify-center">
          <img
            src={image}
            alt="robot"
            className="h-[500px] object-contain animate-float"
            style={{ filter: 'drop-shadow(5px 5px 12px rgba(24, 138, 130, 0.789))' }}
          />
        </div>

        {/* Right Form */}
        <div className="flex items-center justify-center w-full lg:w-1/2 p-4">
          <div
            className="w-full max-w-md rounded-2xl p-6 sm:p-8 space-y-6 border border-teal-700"
            style={{
              background: '#121927',
              boxShadow: '0px 0px 80px rgb(31, 177, 168)',
            }}
          >
            <h2 className="text-2xl font-bold text-center">Sign Up</h2>
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium mb-2">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-black text-white rounded-lg"
                  placeholder="Enter your username"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-black text-white rounded-lg"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-black text-white rounded-lg"
                  placeholder="Enter password"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-teal-800 hover:bg-teal-600 text-white font-semibold rounded-lg"
              >
                Sign Up
              </button>
            </form>
            <p className="text-sm text-center">
              Already have an account?{' '}
              <Link to="/login" className="underline">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
            <footer className="text-center py-4 text-gray-500 text-sm border-t border-white/10">
        &copy; 2025 Divyanshi. All rights reserved.
      </footer>
    </div>
  );
}
