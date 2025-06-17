import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderPlus,
  Users,
  MessageSquareText,
  Bot,
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  const steps = [
    {
      title: 'Create a Project',
      desc: 'Start by creating a new project where all your files, chats, and code live together.',
      icon: FolderPlus,
    },
    {
      title: 'Add Collaborators',
      desc: 'Invite your team easily and manage their access to collaborate in real-time.',
      icon: Users,
    },
    {
      title: 'Chat & Code Together',
      desc: 'Collaborate using real-time chat and a shared code editor for a seamless workflow.',
      icon: MessageSquareText,
    },
    {
      title: 'AI Assistant Support',
      desc: 'Ask questions, generate code, and get smart suggestions from our integrated AI bot.',
      icon: Bot,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex flex-col font-sans">
      {/* Navbar */}
      <header className="flex justify-between items-center px-6 sm:px-12 py-6 backdrop-blur bg-white/5 border-b border-white/10 shadow-md sticky top-0 z-50">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Collaborator<span className="text-teal-500">X</span>
        </h1>
        <div className="space-x-2 sm:space-x-4">
          <button
            onClick={() => navigate('/login')}
            className="px-4 sm:px-5 py-2 rounded-full bg-transparent border border-white hover:bg-white hover:text-black transition"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/register')}
            className="px-4 sm:px-5 py-2 rounded-full bg-teal-500 hover:bg-teal-600 text-white transition shadow-lg"
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col justify-center items-center text-center px-6 sm:px-12 mt-8 mb-12 min-h-[75vh]">
        <h2 className="text-4xl sm:text-6xl font-extrabold mb-6 leading-tight drop-shadow-sm">
          Collaborate. Chat. Build. <br />
          <span className="text-teal-500">Together on CollaboratorX</span>
        </h2>
        <p className="text-base sm:text-lg max-w-2xl mb-8 text-gray-300">
          Real-time collaboration, AI-assisted chats, and team-driven development — all in one beautiful workspace.
        </p>
        <div className="space-y-3 sm:space-x-4 flex flex-col sm:flex-row items-center justify-center">
          <button
            onClick={() => navigate('/register')}
            className="px-8 py-3 text-lg rounded-full bg-teal-600 hover:bg-teal-700 transition shadow-md w-full sm:w-auto"
          >
            Get Started
          </button>
          <button
            onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-3 text-lg rounded-full border border-white/30 hover:bg-white hover:text-black transition w-full sm:w-auto"
          >
            How It Works
          </button>
        </div>
      </main>

      {/* How It Works Section */}
<section
  id="how-it-works"
  className="px-6 sm:px-12 py-16 text-center bg-gradient-to-b from-[#121826] to-black border-t border-white/10"
>
  <h3 className="text-3xl sm:text-4xl font-bold mb-12 text-white">
    How <span className="text-teal-500">CollaboratorX</span> Works
  </h3>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
    {steps.map((step, index) => {
      const Icon = step.icon;
      return (
        <div
          key={index}
          className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-lg hover:shadow-teal-500/40 transition-all transform hover:-translate-y-2 duration-300"
        >
          <div className="flex items-center justify-center mb-5">
            <Icon size={40} className="text-teal-400" aria-hidden="true" />
          </div>
          <h4 className="text-xl font-semibold text-white mb-3">{step.title}</h4>
          <p className="text-gray-300 text-sm leading-relaxed">{step.desc}</p>
        </div>
      );
    })}
  </div>
</section>


      {/* Footer */}
      <footer className="text-center py-4 text-gray-500 text-sm border-t border-white/10">
        &copy; 2025 Divyanshi. All rights reserved.
      </footer>
    </div>
  );
};

export default Home;
