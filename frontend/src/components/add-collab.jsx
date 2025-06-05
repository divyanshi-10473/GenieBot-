import React, { useEffect, useRef, useState } from 'react';
import { UserPlus, Users, Send, Trash2, X, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/input';
import { useDispatch, useSelector } from 'react-redux';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from '@/components/ui/dialog';

import {
    fetchInvitesByProjectId,
    inviteCollaborator,
    deleteInvite
} from '../../store/invites';
import { getAllUsers } from '../../store/auth';
import Swal from 'sweetalert2';
import { deleteConversation } from '../../store/message';
function AddCollab({ projectId }) {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showTeammates, setShowTeammates] = useState(false);
    const { UsersList } = useSelector((state) => state.auth);
    const { invites } = useSelector((state) => state.projectInvites);


    async function handleDelete() {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This action cannot be undone!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        });

        if (!result.isConfirmed) return;

        dispatch(deleteConversation(projectId)).unwrap().then((data) => {
            console.log(data, "this is the data from delete conversation", data?.success)
            if (data?.success) {
                toast.success(data?.message, { position: 'bottom-right' });
                setShowTeammates(false)
            }
        })


    }

        const handleInvite = async (userId) => {
        try {
            await dispatch(inviteCollaborator({ projectId, invitedUserId: userId })).unwrap();
            toast.success('Invite sent', { position: 'bottom-right' });
            dispatch(fetchInvitesByProjectId(projectId));
        } catch (err) {
            console.error('Invite failed', err);
            toast.error(err || 'Failed to send invite', { position: 'bottom-right' });
        }
    }

async function handleDeleteInvite(inviteId) {
  const result = await Swal.fire({
    title: "Remove Invite?",
    text: "This invite will be deleted and cannot be undone.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
  });

  if (!result.isConfirmed) return;

  dispatch(deleteInvite(inviteId))
    .unwrap()
    .then((data) => {
      console.log("Deleted invite:", inviteId);
      toast.success("Invite removed successfully.", { position: "bottom-right" });
      // Optionally, re-fetch invites or update local state here:
      dispatch(fetchInvitesByProjectId(projectId));
    })
    .catch((err) => {
      console.error("Error deleting invite:", err);
      toast.error(err || "Failed to remove invite.", { position: "bottom-right" });
    });
}



    const filteredUsers = UsersList.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );


    useEffect(() => {

        if (dialogOpen) {
            dispatch(getAllUsers()).unwrap().catch(err => console.error('Fetch users failed', err));
        }
    }, [dialogOpen, dispatch]);
    

    useEffect(() => {
        dispatch(fetchInvitesByProjectId(projectId)).unwrap()
            .catch(err => console.error('Fetch invites failed', err));
    }, [dispatch, projectId]);



    return (
        <div className=' top-0 flex-shrink-0  bg-[rgb(24,32,46)]  z-10  border-b border-teal-800/40 h-[50px]'>
            <div className="flex items-center justify-between mb-6 ">
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-sm">
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
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="max-h-60 overflow-y-auto space-y-2">
                            {filteredUsers.map((u) => (
                                <div
                                    key={u._id}
                                    className="flex items-center justify-between p-2 bg-[rgb(28,39,62)] hover:bg-[rgb(6,10,18)] rounded"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-teal-700 flex items-center justify-center text-white uppercase">
                                            <UserRound />
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{u.username}</p>
                                            <p className="text-gray-400 text-xs">{u.email}</p>
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
                <button
                    className="text-gray-300 hover:text-teal-400"
                    onClick={() => setShowTeammates(!showTeammates)}
                >
                    <Users size={20} />
                </button>
            </div>

            {showTeammates && (
                <>
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40"
                        onClick={() => setShowTeammates(false)}
                    />
                    <aside className="fixed inset-y-0 left-0 w-full md:w-72 bg-[rgb(24,32,46)] border-r border-teal-800/40 p-6 z-50 overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-teal-400 font-semibold">
                                Team Members & Invites
                            </h3>
                            <button onClick={() => setShowTeammates(false)}>
                                <X size={20} className="text-gray-400 hover:text-red-500" />
                            </button>
                        </div>
                        <ul className="space-y-3 text-gray-300">
                            {invites.length === 0 && (
                                <li className="flex items-center justify-between border-b border-teal-800/30 pb-1">
                                    <span>you</span>
                                    <span className="text-xs text-teal-400">(Admin)</span>
                                </li>
                            )}

                            {invites.length > 0 && (
                                <li className="flex items-center justify-between border-b border-teal-800/30 pb-1">
                                    Invited by: {invites[0].invitedBy._id === user.id ? 'You' : invites[0].invitedBy.username}
                                </li>
                            )}


                            {invites.map((inv) => (
                                <li
                                    key={inv._id}
                                    className="flex items-center justify-between gap-3 py-2 border-b border-teal-800/30"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-teal-700 flex items-center justify-center text-white uppercase">
                                            <UserRound />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">

                                                {inv.invitedUser._id === user.id
                                                    ? 'you'
                                                    : inv.invitedUser.username}
                                            </p>
                                            <p className="text-xs">
                                                <span
                                                    className={
                                                        inv.status === 'requested'
                                                            ? 'text-yellow-400'
                                                            : 'text-teal-400'
                                                    }
                                                >
                                                    {inv.status}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                    {inv.invitedBy._id === user.id && (
                                        <Button
                                            size="xs"
                                            variant="ghost"
                                            onClick={() => handleDeleteInvite(inv._id)}
                                        >
                                            <Trash2 size={14} />
                                        </Button>
                                    )}
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={handleDelete}
                            className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-xl text-sm shadow-sm transition-all duration-200 mt-4"
                        >
                            Clear Conversation
                        </button>

                    </aside>

                </>
            )}


        </div>
    )
}

export default AddCollab;