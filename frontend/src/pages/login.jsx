import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import image from '../assets/robo.png';
import { useDispatch } from 'react-redux';
import { loginUser } from '../../store/auth';
import toast from 'react-hot-toast';
import img from '../assets/github.png'
import { Button } from '@/components/ui/button';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
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
      const result = await dispatch(loginUser(formData)).unwrap();
      toast.success(result?.message, {
        position: 'bottom-right',
      });
      navigate('/project');
    } catch (errorMessage) {
      toast.error(errorMessage, {
        position: 'bottom-right',
      });
    }
  };

  const handleGitHubLogin = () => {
  window.location.href = `https://github.com/login/oauth/authorize?client_id=${import.meta.env.VITE_GITHUB_CLIENT_ID}&scope=user`;
};


  return (
    <div className="min-h-screen w-full flex flex-col" style={{ backgroundColor: 'rgb(18, 25, 39)' }}>
      {/* Navbar */}
      <header className="flex justify-between items-center px-8 py-4 backdrop-blur bg-white/5 text-white">
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
        {/* Left Side (Image) */}
        <div className="hidden lg:flex w-1/2 items-center justify-center">
          <img
            src={image}
            alt="robo"
            className="h-[500px] object-contain animate-float"
            style={{ filter: 'drop-shadow(5px 5px 12px rgba(24, 138, 130, 0.789))' }}
          />
        </div>

        {/* Right Side (Form) */}
        <div className="flex items-center justify-center w-full lg:w-1/2 p-4">
          <div
            className="w-full max-w-md rounded-2xl p-6 sm:p-8 space-y-6 border border-teal-700"
            style={{
              background: 'rgb(18, 25, 39)',
              boxShadow: '0px 0px 80px rgb(31, 177, 168)',
            }}
          >
            <h2 className="text-2xl font-bold text-white text-center">Login</h2>
            <Button
  onClick={handleGitHubLogin}
  variant="outline"
  className="flex items-center gap-2 w-full justify-center"
>
  <img src={img} alt="GitHub" className="w-6 h-6" />
  Continue with GitHub
</Button>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                  Email address
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
                <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
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
                Login
              </button>
            </form>
            <p className="text-sm text-center text-white">
              Don't have an account?{' '}
              <Link to="/register" className="underline">
                Register
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
