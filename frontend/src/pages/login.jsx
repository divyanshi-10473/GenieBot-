import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import image from '../assets/robo.png'
import { useDispatch } from 'react-redux';
import { loginUser } from '../../store/auth';
import toast from 'react-hot-toast';


export default function Login() {
 const dispatch= useDispatch();
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
      console.log('Login Result:', result); // Log the result for debugging
     toast.success(result?.message, {
  position: "bottom-right"
})
      navigate("/project");
     
    } catch (errorMessage) {
     toast.error(errorMessage, {
  position: "bottom-right"
})
    }
  };
  
  

  return (
    <div className="min-h-screen lg:flex" style={{ backgroundColor: 'rgb(18, 25, 39)' }}>
      {/* Image: visible only on large screens */}
     <div className="hidden lg:flex lg:w-1/2 items-center justify-center">
  <img
    src={image}
    alt="robo image"
    className="h-[500px] animate-float"
    style={{ filter:' drop-shadow(5px 5px 12px rgba(24, 138, 130, 0.789) )' }}
  />
</div>


      {/* Form */}
      <div className="flex items-center justify-center w-full lg:w-1/2 min-h-screen p-4">
        <div
          className="max-w-md w-full rounded-2xl shadow-xl p-8 space-y-6 border border-teal-700"
          style={{
            background: 'rgb(18, 25, 39)',
            boxShadow: '0px 0px 80px rgb(31, 177, 168)',
          }}
        >
          <h2 className="text-2xl font-bold text-white text-center">Login</h2>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-3">
                Email address
              </label>
              <input
                id="email"
                name='email'
                type="email"
                required
               value={formData.email}
              onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 bg-black text-white rounded-lg"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-3">
                Password
              </label>
              <input
                id="password"
                name='password'
                type="password"
                required
                value={formData.password}
              onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 bg-black text-white rounded-lg"
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
  )
}
