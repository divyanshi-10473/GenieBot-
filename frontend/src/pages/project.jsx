import React, { useEffect, useState } from 'react';
import {
  Plus,
  Bell,
  LogOut,
  UserCog
} from 'lucide-react';

import avatar from '../assets/avtar.png';
import pro from '../assets/noProject.png'
import emptyState from '../assets/avtar.png';        // ← your "no projects" image
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../store/auth';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createProject, fetchProjects } from '../../store/project';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import NotificationPopover from '@/components/notification';

const Project = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const currentUserId = user.id;

  const { ProjectsList } = useSelector((state) => state.project);
  const dispatch = useDispatch();

  const [projectName, setProjectName] = useState('');
  const [open, setOpen] = useState(false);


  function handleLogout() {
    dispatch(logoutUser());
    toast.success('Logged out successfully', { position: 'bottom-right' });
  }

  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!projectName.trim()) {
      toast.error('Project Name required', { position: 'bottom-right' });
      return;
    }
    try {
      await dispatch(createProject({ name: projectName.trim() })).unwrap();
      toast.success('Project created successfully', { position: 'bottom-right' });
      setOpen(false);
      setProjectName('');
      await dispatch(fetchProjects()).unwrap();
    } catch (error) {
      console.error('Error creating project', error);
      toast.error(error.message || 'Failed to create project', { position: 'bottom-right' });
    }
  };

  const handleClick = (projectId) => {
    
    navigate(`/chatroom/${projectId}`);
  };

    useEffect(() => {
    dispatch(fetchProjects())
      .unwrap()
      .catch(err => console.error('Fetch projects failed', err));
  }, [dispatch]);


  return (
    <div className="min-h-screen bg-[rgb(18,25,39)]">
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 shadow-2xl shadow-teal-400 bg-[rgb(18,25,39)]">
        <div className="text-2xl font-bold text-white">
          Collaborator<span className="text-teal-400">X</span>
        </div>
        <div className="flex items-center gap-4">
          <Dialog
            open={open}
            onOpenChange={(isOpen) => {
              setOpen(isOpen);
              if (!isOpen) setProjectName('');
            }}
          >
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-2 text-white rounded-xl bg-teal-700 hover:bg-teal-500 transition">
                <Plus size={18} /> New Project
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create a New Project</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <Input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Enter project name"
                />
              </div>
              <DialogFooter>
                <Button onClick={handleAddProject} className="bg-teal-600 hover:bg-teal-500">
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

         <div className="relative">
  <NotificationPopover />
</div>


          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <img src={avatar} alt="User" className="w-8 h-8 rounded-full cursor-pointer" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40">
              <DropdownMenuLabel>Welcome {user?.name}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      <div className="p-6">
        <div className='sticky top-16 z-10 bg-[rgb(18,25,39)] pt-6 pb-1'>
        <h1 className="mb-8 text-3xl font-bold text-gray-200">👋 Welcome back!</h1>

        <h2 className="mb-4 text-xl font-semibold text-gray-200">Your Projects</h2>
        </div>
     {ProjectsList.length === 0 ? (
  <div className="flex flex-col items-center justify-center  text-center">
    <img src={pro} alt="No projects" className="w-[600px]" />
    {/* <p className="mt-6 text-gray-300 text-lg font-medium">No projects yet</p>
    <p className="text-gray-500 text-sm">Click “New Project” to get started 🚀</p> */}
  </div>
) : (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  mt-16 max-w-[1300px] gap-12 mx-auto">
    {[...ProjectsList].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).map((project)=>(

      <div
        key={project._id}
        className="relative backdrop-blur-md bg-white/5 border border-teal-800/40 rounded-2xl shadow-xl hover:shadow-teal-500/30 transition-all duration-300 p-6 group"
      >
        {/* Top: Project title and user count */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-white group-hover:text-teal-400 transition">
            {project.name}
          </h3>
          <div className="text-xs px-2 py-1 rounded bg-teal-600 text-white shadow-sm">
            {project.users.length} {project.users.length === 1 ? 'User' : 'Users'}
          </div>
        </div>

        {/* Avatars */}
        <div className="flex -space-x-3 mb-4">
  {project.users.slice(0, 3).map((user, idx) => (
    <div key={idx}>
      <div className="w-9 h-9 rounded-full bg-teal-700 border-2 border-teal-500 flex items-center justify-center text-white text-sm font-semibold shadow-md">
        {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
      </div>
    </div>
  ))}
  {project.users.length > 3 && (
    <span className="ml-3 text-sm text-gray-400">+{project.users.length - 3}</span>
  )}
</div>

{/* Description with collaborators */}
<p className="text-sm text-gray-400 mb-6">
  <span className="text-gray-300 font-medium">Collaborators:</span>{' '}
  {project.users.map((u, idx) => (
    <span key={idx}>
      {u._id === currentUserId ? 'you' : u.username}
      {idx < project.users.length - 1 ? ', ' : ''}
    </span>
  ))}
</p>



        {/* Action Button */}
        <button className="w-full py-2 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold shadow-md hover:shadow-teal-400/40 transition-all" onClick={() => handleClick(project._id)}>
          🚀 Open Chatroom
        </button>

        {/* Glowing effect on hover */}
        <div className="absolute inset-0 rounded-2xl border border-teal-500 opacity-0 group-hover:opacity-40 transition duration-300 pointer-events-none shadow-[0_0_30px_5px_rgba(0,255,255,0.3)]" />
      </div>
    ))}
  </div>
)}


       
      </div>
      
    </div>
  );
};

export default Project;
