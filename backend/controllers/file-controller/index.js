import Project from "../../models/project.js";


export const getFileTreeByProjectId = async (req, res) => {
  const { projectId } = req.params;

  try {
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    return res.status(200).json({ fileTree: project.fileTree });
  } catch (err) {
    console.error('Error fetching fileTree:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};


export const updateFileContent = async (req, res) => {
  try {
    const { projectId, filename, content } = req.body;
    console.log(req.body, "Received file content update");

    if (!projectId || !filename) {
      return res.status(400).json({ message: 'projectId and filename are required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // If file doesn't exist, create it
    if (!project.fileTree[filename]) {
      project.fileTree[filename] = {
        file: {
          contents: content || '',
        },
      };
      console.log(`File '${filename}' did not exist — created new file.`);
    } else {
      // If file exists, update content
      project.fileTree[filename].file.contents = content;
      console.log(`File '${filename}' updated.`);
    }

    project.markModified('fileTree');
    await project.save();

    return res.status(200).json({
      message: 'File content saved successfully',
      data: project,
    });
  } catch (error) {
    console.error('Error updating/creating file:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};



export const deleteFile = async (req, res) => {
  try {
    const { projectId, filename } = req.body;

    if (!projectId || !filename) {
      return res.status(400).json({ message: "projectId and filename are required" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (!project.fileTree[filename]) {
      return res.status(404).json({ message: "File not found in fileTree" });
    }

    delete project.fileTree[filename];
    project.markModified('fileTree');
    await project.save();

    return res.status(200).json({ message: "File deleted successfully", data: project.fileTree });
  } catch (error) {
    console.error("Error deleting file:", error);
    return res.status(500).json({ message: "Server error" });
  }
};




export const renameFile = async (req, res) => {
  try {
    const { projectId, oldFilename, newFilename } = req.body;

    if (!projectId || !oldFilename || !newFilename) {
      return res.status(400).json({ message: "projectId, oldFilename, and newFilename are required" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const fileTree = project.fileTree;

    if (!fileTree[oldFilename]) {
      return res.status(404).json({ message: "Old file not found in fileTree" });
    }

    if (fileTree[newFilename]) {
      return res.status(400).json({ message: "New filename already exists" });
    }

    fileTree[newFilename] = fileTree[oldFilename];
    delete fileTree[oldFilename];

    project.markModified('fileTree');
    await project.save();

    return res.status(200).json({ message: "File renamed successfully", data: project.fileTree });
  } catch (error) {
    console.error("Error renaming file:", error);
    return res.status(500).json({ message: "Server error" });
  }
};