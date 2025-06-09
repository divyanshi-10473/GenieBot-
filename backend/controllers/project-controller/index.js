import Project from "../../models/project.js";



export const createProject = async (req, res) => {
  try {
    const { name } = req.body;
    console.log("Creating project with name:", name);

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ message: 'Project name is required.' });
    }

    const existing = await Project.findOne({ name: name.trim() , users: req.user.id });
    if (existing) {
      return res.status(400).json({ message: 'A project with that name already exists.' });
    }


    const project = new Project({
      name: name.trim(),
      users: [req.user.id],
    });

    await project.save();

    return res.status(201).json(project);
  } catch (err) {
    console.error('Error creating project:', err);
  
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Project name must be unique.' });
    }
    return res.status(500).json({ message: 'Server error.' });
  }
};


export const fetchProjects = async (req, res) => {
  try {
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

   
    const projects = await Project.find({ users: req.user.id }).populate('users', 'username email');

    return res.status(200).json({ 
      success: true,
     data: projects });
  } catch (err) {
    console.error("Error fetching projects:", err);
    return res.status(500).json({ message: "Server error while fetching projects." });
  }
};









