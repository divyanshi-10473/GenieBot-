import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Markdown from 'markdown-to-jsx';

import {
  initializeSocket,
  recieveMessage,
  sendMessage,
} from '@/config/socket';

import { fetchMessagesByProject, sendMessages } from '../../store/message';
import AddCollab from '@/components/add-collab';
import Editor from '@/components/code-editor';

import '../index.css';

const Chatroom = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { messagesList } = useSelector((state) => state.message);
  const { projectId } = useParams();

  const [message, setMessage] = useState('');

  const [chatOpen, setChatOpen] = useState(true);
  const msgEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const socketRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);



const WriteAiMessage = (msg) => {
  try {
    const match = msg.match(/\{[\s\S]*\}/); // Matches first full JSON object
    if (!match) throw new Error("No JSON found");

    const parsed = JSON.parse(match[0]); // Parse the extracted JSON string

    return (
      <div className="overflow-auto bg-slate-950 text-white rounded-sm p-2">
        <Markdown>{parsed.text || 'No text content found.'}</Markdown>
        
      </div>
    );
  } catch (error) {
    console.error("AI render error:", error.message);
    return <div className="text-red-500 text-sm">Failed to render AI response.</div>;
  }
};


  const handleSendMessage = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    const payload = {
      message: trimmedMessage,
      sender: user,
      timestamp: new Date().toISOString(),
    };

    sendMessage('project-message', payload);
    setMessage('');

    dispatch(sendMessages({ projectId, content: trimmedMessage }))
      .unwrap()
      .then(() => dispatch(fetchMessagesByProject(projectId)))
      .catch((err) => toast.error(err || 'Failed to send message'));
  };

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = initializeSocket(projectId);

      recieveMessage('project-message', () => {
        dispatch(fetchMessagesByProject(projectId)).then(() => {
          scrollToBottom();
        });
      });
    }

    dispatch(fetchMessagesByProject(projectId));
  }, [dispatch, projectId, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [messagesList, scrollToBottom]);

  return (
    <div className="h-screen md:pl-12 flex flex-col md:flex-row bg-[rgb(18,25,39)] text-white">
      <div className="hidden md:flex fixed top-1 left-1 z-20">
        <button
          onClick={() => setChatOpen((prev) => !prev)}
          className="p-2 bg-teal-600 hover:bg-teal-500 text-white rounded-full shadow-lg"
        >
          {chatOpen ? <X size={20} /> : <MessageSquare size={20} />}
        </button>
      </div>

      {/* Chat Panel */}
      <div className={`chat-section transition-all duration-300 ease-in-out min-h-screen
        ${chatOpen ? 'w-full md:w-96 p-4' : 'w-0 md:w-0 p-0 overflow-hidden'} 
        flex flex-col border-b border-teal-800/40 bg-[rgb(24,32,46)]`}>

        <div className="fixed md:relative top-0 left-2 right-4 pt-4 md:pt-0 bg-[rgb(24,32,46)] z-10">
          <AddCollab projectId={projectId} />
        </div>

        <div
          className="flex-1 pt-16 md:pt-0 pb-7 overflow-y-auto mb-4 space-y-2 scrollbar-hide"
          ref={scrollContainerRef}
        >
          {messagesList.length === 0 ? (
            <p className="text-gray-500 text-sm">No messages yet.</p>
          ) : (
            messagesList.map((msg, idx) => {
              const isSystem = !msg.sender || msg.system === true;
              const isMe = !isSystem && msg.sender._id === user.id;
              const sender = isSystem ? 'AI Bot' : msg.sender.username;

              return (
                <div key={idx} className="flex px-2 sm:px-4 py-1">
                  <div className={`flex flex-col space-y-1 ${isMe ? 'items-end ml-auto' : 'items-start mr-auto'}`}>
                    <span className={`text-xs font-medium ${isMe ? 'text-white' : 'text-gray-400'}`}>
                      {isMe ? 'You' : sender}
                    </span>

                    <div
                      className={`
                        p-2 rounded-lg break-words md:max-w-72 max-w-[80vw] sm:max-w-[22rem]
                        overflow-x-auto whitespace-pre-wrap
                        ${isMe ? 'bg-teal-600 text-white rounded-tr-none' : 'bg-white/10 text-gray-200 rounded-tl-none'}
                      `}
                    >
                      <div className="text-sm markdown-body">
                        {isSystem ? WriteAiMessage(msg.content) : msg.content}
                      </div>
                      <div className={`text-[10px] ${isMe ? 'text-white' : 'text-gray-400'} mt-1 text-right`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false,
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={msgEndRef} />
        </div>

        {/* Message Input */}
        <div className="flex items-center gap-2 h-[50px] bg-[rgb(24,32,46)] fixed md:relative bottom-0 p-4 md:p-0 left-2 right-4">
          <Input
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
            }}
            placeholder="Type a message..."
            className="bg-white/10 text-white border border-teal-700"
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button className="bg-teal-600 hover:bg-teal-500" onClick={handleSendMessage}>
            <Send size={16} />
          </Button>
        </div>
      </div>

      {/* Editor Panel */}
      <div className="hidden md:flex flex-1 h-full">
        <Editor projectId={projectId} />
      </div>
    </div>
  );
};

export default Chatroom;
