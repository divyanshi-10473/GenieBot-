import React, { useEffect, useRef, useState } from 'react';
import { UserPlus, Users, Send, Trash2, X, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  initializeSocket,
  disconnectSocket,
  recieveMessage as onSocketMessage,
  sendMessage as emitSocketMessage,
} from '@/config/socket';
import '../index.css';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useDispatch, useSelector } from 'react-redux';
import { getAllUsers } from '../../store/auth';
import {
  fetchInvitesByProjectId,
  inviteCollaborator,
  deleteInvite,
} from '../../store/invites';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { fetchMessagesByProject, sendMessages } from '../../store/message';

const Chatroom = () => {
  const dispatch = useDispatch();
  const { projectId } = useParams();
  const { user, UsersList } = useSelector((state) => state.auth);
  const { invites } = useSelector((state) => state.projectInvites);
  const { messagesList } = useSelector((state) => state.message);

  const msgEndRef = useRef(null);
  const [showTeammates, setShowTeammates] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [messageText, setMessageText] = useState('');

  // Helper to scroll
  const scrollToBottom = () => msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  // 1) Initialize socket & load history
  useEffect(() => {
    const sock = initializeSocket(projectId);

    dispatch(fetchMessagesByProject(projectId)).then(scrollToBottom);
    dispatch(fetchInvitesByProjectId(projectId));

    // return () => {
    //   disconnectSocket();
    // };
  }, [dispatch, projectId]);

  // 2) Listen for incoming socket messages
  useEffect(() => {
    const handler = (data) => {
      // Persist incoming message
      dispatch(sendMessages({ projectId, content: data.message }))
        .unwrap().then((response) => {
          console.log('Message received:', response);
          // Optionally scroll to bottom if this is the latest message
        })
        .catch(console.error);
    };

    onSocketMessage('project-message', handler);
    return () => {
      // (if your socket lib needs explicit off, call it here)
    };
  }, [dispatch, projectId]);

  // 3) Auto-scroll when messagesList changes
  useEffect(() => {
    if (messagesList.length) scrollToBottom();
  }, [messagesList]);

  // 4) Fetch users for the invite dialog
  useEffect(() => {
    if (dialogOpen) {
      dispatch(getAllUsers()).unwrap().catch(console.error);
    }
  }, [dialogOpen, dispatch]);

  // Send a new message
  const handleSend = () => {
    const text = messageText.trim();
    if (!text) return;

    const payload = {
      projectId,
      message: text,
      sender: { id: user.id, username: user.username },
      timestamp: new Date().toISOString(),
    };

    // 4a) Emit to socket
    emitSocketMessage('project-message', payload);

    // 4b) Persist + update Redux
    dispatch(sendMessages({ projectId, content: text }))
      .unwrap().then((response)=>{
         dispatch(fetchMessagesByProject(projectId)).then(scrollToBottom);
      })
      .catch(err => toast.error(err));

     

    setMessageText('');
  };

  // Invite handlers
  const handleInvite = async (userId) => {
    try {
      await dispatch(inviteCollaborator({ projectId, invitedUserId: userId })).unwrap();
      toast.success('Invite sent');
      dispatch(fetchInvitesByProjectId(projectId));
    } catch (err) {
      toast.error(err || 'Failed to send invite');
    }
  };
  const handleRemove = async (inviteId) => {
    try {
      await dispatch(deleteInvite(inviteId)).unwrap();
      toast.success('Invite removed');
      dispatch(fetchInvitesByProjectId(projectId));
    } catch (err) {
      toast.error(err || 'Failed to remove invite');
    }
  };

  const filteredUsers = UsersList.filter(u =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-screen flex flex-col md:flex-row bg-[rgb(18,25,39)] text-white">
      {/* ─── Sidebar ────────────────────────────────────────── */}
      <div className="w-full md:w-72 flex flex-col bg-[rgb(24,32,46)] border-b md:border-b-0 md:border-r border-teal-800/40 p-4">
        {/* Top toolbar */}
        <div className="flex-shrink-0  bg-[rgb(24,32,46)]  z-10  border-b border-teal-800/40 h-[50px] ">
         <div className="flex items-center justify-between mb-6 ">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-teal-600 hover:bg-teal-500 flex items-center gap-2">
                <UserPlus size={16} /> Add Collaborator
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Select a User to Invite</DialogTitle>
              </DialogHeader>
              <Input
                placeholder="Search users..."
                className="mb-2"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <div className="max-h-60 overflow-y-auto space-y-2">
                {filteredUsers.map(u => (
                  <div
                    key={u._id}
                    className="flex items-center justify-between p-2 bg-[rgb(28,39,62)] hover:bg-[rgb(6,10,18)] rounded"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-teal-700 flex items-center justify-center text-white uppercase">
                        <UserRound />
                      </div>
                      <div>
                        <p className="font-medium">{u.username}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleInvite(u._id)}>
                      Invite
                    </Button>
                  </div>
                ))}
              </div>
              <DialogClose asChild>
                <Button className="mt-4 w-full bg-teal-600 hover:bg-teal-500">Close</Button>
              </DialogClose>
            </DialogContent>
          </Dialog>
          <button onClick={() => setShowTeammates(v => !v)} className="text-gray-300 hover:text-teal-400">
            <Users size={20} />
          </button>
        </div>

        {/* Team list overlay */}
        {showTeammates && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setShowTeammates(false)}
            />
            <aside className="fixed inset-y-0 left-0 w-full md:w-72 bg-[rgb(24,32,46)] p-6 z-50 border-r border-teal-800/40 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-teal-400">Team Members & Invites</h3>
                <button onClick={() => setShowTeammates(false)}>
                  <X size={20} className="text-gray-400 hover:text-red-500" />
                </button>
              </div>
              <ul className="space-y-3">
                {invites.length === 0 && (
                  <li className="flex justify-between border-b border-teal-800/30 pb-1">
                    <span>you</span>
                    <span className="text-xs text-teal-400">(Admin)</span>
                  </li>
                )}
                {invites.map(inv => (
                  <li
                    key={inv._id}
                    className="flex items-center justify-between gap-3 py-2 border-b border-teal-800/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-teal-700 flex items-center justify-center text-white uppercase">
                        <UserRound />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {inv.invitedUser._id === user.id ? 'you' : inv.invitedUser.username}
                        </p>
                        <p className="text-xs">
                          <span className={inv.status === 'requested' ? 'text-yellow-400' : 'text-teal-400'}>
                            {inv.status}
                          </span>
                        </p>
                      </div>
                    </div>
                    {inv.invitedBy._id === user.id && (
                      <Button size="xs" variant="ghost" onClick={() => handleRemove(inv._id)}>
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            </aside>
          </>
        )}
        </div>
  

      {/* ─── Messages & Input ─────────────────────────────── */}
    
        <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide bg-[rgb(18,25,39)]">
          {!messagesList.length && <p className="text-gray-500 text-sm">No messages yet.</p>}
          {messagesList.map((msg, idx) => {
            const isMe = msg.sender._id === user.id;
          
            return (
              <div key={idx} className="flex">
                <div className={`flex flex-col space-y-1 ${isMe ? 'items-end ml-auto' : 'items-start mr-auto'}`}>
                  <span className={`text-xs font-medium ${isMe ? 'text-white' : 'text-gray-400'}`}>
                    {isMe ? 'You' : msg.sender.username}
                  </span>
                  <div
                    className={`p-2 rounded-lg break-words ${
                      isMe
                        ? 'bg-teal-600 text-white rounded-tr-none'
                        : 'bg-white/10 text-gray-200 rounded-tl-none'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <span className={`block text-[10px] mt-1 text-right ${isMe ? 'text-white' : 'text-gray-400'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={msgEndRef} />
        </div>

        {/* Input bar */}
        <div className="h-[50px] flex-shrink-0 flex items-center gap-2 p-3 bg-[rgb(24,32,46)] border-t border-teal-800/40">
          <Input
            value={messageText}
            onChange={e => setMessageText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-white/10 text-white border border-teal-700"
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <Button className="bg-teal-600 hover:bg-teal-500" onClick={handleSend}>
            <Send size={16} />
          </Button>
        </div>
  
       </div>
    </div>
  );
};

export default Chatroom;
