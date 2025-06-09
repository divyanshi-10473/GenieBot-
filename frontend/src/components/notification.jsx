import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { acceptInvite, fetchUserInvites, rejectInvite } from '../../store/invites';
import { Button } from '@/components/ui/button';
import { Check, X, Bell } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import toast from 'react-hot-toast';
import { fetchProjects } from '../../store/project';
import { formatDistanceToNow } from 'date-fns';

const NotificationPopover = () => {
  const dispatch = useDispatch();
  const { inviteProject } = useSelector(state => state.projectInvites);
  const hasPendingInvites = inviteProject.some(invite => invite.status === 'requested');

  useEffect(() => {
    dispatch(fetchUserInvites());
  }, [dispatch, inviteProject]);

  const handleAccept = async (inviteId) => {
    try {
      await dispatch(acceptInvite(inviteId)).unwrap();
      toast.success('Invite accepted');
      await dispatch(fetchUserInvites()).unwrap();
      await dispatch(fetchProjects()).unwrap();
    } catch (err) {
      console.error('Error accepting invite:', err);
      toast.error(err?.message || 'Failed to accept invite');
    }
  };

  const handleReject = async (inviteId) => {
    try {
  await dispatch(rejectInvite(inviteId)).unwrap();
  toast.success('Invite rejected');
  dispatch(fetchUserInvites());
} catch (err) {
  toast.error(err?.message || 'Failed to reject invite');
}
  };

  // Sort invites by createdAt descending (newest first)
  const sortedInvites = [...inviteProject].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <Popover>
      <PopoverTrigger className="relative">
        <Bell className="text-white cursor-pointer" />
        {hasPendingInvites && (
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 " />
        )}
      </PopoverTrigger>
      <PopoverContent className="bg-[rgb(24,32,46)] text-white w-80 p-4 pt-0 space-y-4 relative right-4 top-3 h-96 overflow-auto">
   <div className="sticky top-0 bg-[rgb(24,32,46)] w-[271px] z-10">
  <h4 className="font-semibold text-lg  w-100 bg-[rgb(24,32,46)] px-4 py-2 ">
    Invitations
  </h4> </div>
        {sortedInvites.length === 0 ? (
          <p className="text-sm">No invitations.</p>
        ) : (
          sortedInvites.map(invite => (
            <div key={invite._id} className="border border-gray-700 rounded-lg p-2 space-y-2 ">
              <p className="text-sm">
                {invite.invitedBy.username} invited you to <strong>{invite.projectId.name}</strong>
              </p>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(invite.createdAt), { addSuffix: true })}
              </p>
              {invite.status === 'requested' && (
                <div className="flex gap-2">
                  <Button size="sm" className="bg-green-600 hover:bg-green-500" onClick={() => handleAccept(invite._id)}>
                    <Check size={16} />
                  </Button>
                  <Button size="sm" className="bg-red-600 hover:bg-red-500" onClick={() => handleReject(invite._id)}>
                    <X size={16} />
                  </Button>
                </div>
              )}
              {invite.status === 'added' && <p className="text-green-400 text-sm">Accepted</p>}
              {invite.status === 'rejected' && <p className="text-red-400 text-sm">Rejected</p>}
            </div>
          ))
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationPopover;


