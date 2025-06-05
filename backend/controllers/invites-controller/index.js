import projectInvite from "../../models/invite.js";
import User from "../../models/user.js";
import Project from "../../models/project.js";

export const inviteCollaborator = async (req, res) => {
  const { projectId, invitedUserId } = req.body;
  const invitedBy = req.user.id;

  try {

    const userExists = await User.findById(invitedUserId);
    if (!userExists) {
      return res.status(404).json({ message: 'User not found' });
    }

  
    const existingInvite = await projectInvite.findOne({
      projectId,
      invitedUser: invitedUserId
    });

    if (existingInvite) {
      return res.status(400).json({ message: 'Invite already sent to this user' });
    }


    const invite = new projectInvite({
      projectId,
      invitedBy,
      invitedUser: invitedUserId,
      status: 'requested'
    });

    await invite.save();

    res.status(201).json({success:true, message: 'Invitation sent successfully', data: invite });
  } catch (error) {
    console.error('Invite Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};



export const getInvitesByProjectId = async (req, res) => {
  const { projectId } = req.params;

  try {   
    const invites = await projectInvite
      .find({ projectId })
      .populate('invitedUser', 'username email') 
      .populate('invitedBy', 'username email')  
      .exec();

    res.status(200).json({ invites });
  } catch (error) {
    console.error('Fetch Invite Error:', error);
    res.status(500).json({ message: 'Failed to fetch invites for project' });
  }
};




export const getInvitesForUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const invites = await projectInvite.find({ invitedUser: userId })
      .populate('projectId', 'name')
      .populate('invitedBy', 'username');

    res.status(200).json(invites);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch invites', error });
  }
};




export const acceptInvite = async (req, res) => {
  try {
    // 1) Find the invite
    const invite = await projectInvite.findById(req.params.inviteId);
    if (!invite) return res.status(404).json({ message: 'Invite not found' });

    // 2) Permission check
    if (invite.invitedUser.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // 3) Mark invite as accepted
    invite.status = 'added'; 
    await invite.save();

    // 4) Add user to the project, without shadowing the model
    const project = await Project.findById(invite.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    if (!project.users.includes(invite.invitedUser)) {
      project.users.push(invite.invitedUser);
      await project.save();
    }

    // 5) Return the updated invite
    res.status(200).json({ message: 'Invite accepted', invite });
  } catch (error) {
    console.error('Accept Invite Error:', error);
    res.status(500).json({ message: 'Failed to accept invite', error });
  }
};



export const rejectInvite = async (req, res) => {
  try {
    const invite = await projectInvite.findById(req.params.inviteId);

    if (!invite) return res.status(404).json({ message: 'Invite not found' });
    if (invite.invitedUser.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    invite.status = 'rejected';
    await invite.save();

    res.status(200).json({ message: 'Invite rejected', invite });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reject invite', error });
  }
};





export const deleteInvite = async (req, res) => {
  try {
    const { inviteId } = req.params;

    // 1) Find the invite
    const invite = await projectInvite.findById(inviteId);
    if (!invite) {
      return res.status(404).json({ message: 'Invite not found' });
    }

    // 2) Authorization: only the inviter can delete
    if (invite.invitedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this invite' });
    }

    // 3) Remove the user from the project.users array
    const project = await Project.findById(invite.projectId);
    if (project) {
      project.users = project.users.filter(
        userId => userId.toString() !== invite.invitedUser.toString()
      );
      await project.save();
    }

    // 4) Delete the invite document
    await invite.deleteOne();

    res.status(200).json({ message: 'Invite deleted and user removed from project' });
  } catch (err) {
    console.error('Error deleting invite:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
