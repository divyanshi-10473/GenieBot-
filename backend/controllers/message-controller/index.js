import Message from '../../models/message.js'
import Project from '../../models/project.js'


export const sendMessage = async (req, res) => {
  try {
    const { projectId, content, type } = req.body;

    const sender = req.user.id;

   
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const message = await Message.create({
      projectId,
      sender,
      content,
      type: type || 'text',
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error while sending message' });
  }
};


export const getMessagesForProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const messages = await Message.find({ projectId })
      .populate('sender', 'username email') // Optional
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error('Fetch messages error:', error);
    res.status(500).json({ message: 'Server error while fetching messages' });
  }
};

export const deleteConversation = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.id;
  
  try {
    //   // 1. Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!userId) {
      return res.status(403).json({ message: 'Not authorized to delete this conversation' });
    }

    await Message.deleteMany({ projectId });

    return res.status(200).json({success:true, message: 'Conversation cleared successfully' });
  } catch (error) {
    console.error('Delete conversation error:', error);
    return res.status(500).json({ message: 'Server error while deleting conversation' });
  }
};




