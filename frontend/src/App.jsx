import { Route, Routes } from 'react-router-dom';
import './App.css';
import Home from './pages/home';
import Login from './pages/login';
import Register from './pages/register';
import NotFound from './pages/notfound';
import Project from './pages/project';
import CheckAuth from './components/common/checkAuth';

import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { checkAuth } from '../store/auth';
import Chatroom from './pages/chatroom';
import GitHubCallback from './components/github';



function App() {
  const { isAuthenticated, user, isLoading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  

  return (
    <Routes>
      <Route path="/auth/github/callback" element={<GitHubCallback />} />
      <Route path='/' element={<Home />} />
      <Route path='/login' element={<CheckAuth isAuthenticated={isAuthenticated} user={user}><Login /></CheckAuth>} />
      <Route path='/register' element={<CheckAuth isAuthenticated={isAuthenticated} user={user}><Register /></CheckAuth>} />
      <Route path='/project' element={<CheckAuth isAuthenticated={isAuthenticated} user={user}><Project /></CheckAuth>} />
      <Route path='/chatroom/:projectId' element={<CheckAuth isAuthenticated={isAuthenticated} user={user}><Chatroom /></CheckAuth>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
