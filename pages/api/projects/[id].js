// pages/api/projects/[id].js
import { getToken } from 'next-auth/jwt';
import dbConnect from '../../../lib/dbConnect';
import { Project, Task } from '../../../models';

export default async function handler(req, res) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const {
    query: { id },
    method,
  } = req;
  
  await dbConnect();
  
  try {
    // First verify the project belongs to the user
    const project = await Project.findOne({
      _id: id,
      userId: token.id
    });
    
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found or unauthorized' 
      });
    }
    
    switch (method) {
      case 'GET':
        // Get project with its tasks
        const projectWithTasks = await Project.findById(id);
        const tasks = await Task.find({ projectId: id });
        res.status(200).json({ 
          success: true, 
          data: { ...projectWithTasks.toObject(), tasks } 
        });
        break;
        
      case 'PUT':
        const updatedProject = await Project.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true
        });
        res.status(200).json({ success: true, data: updatedProject });
        break;
        
      case 'DELETE':
        // Delete all tasks associated with this project
        await Task.deleteMany({ projectId: id });
        // Then delete the project
        await Project.deleteOne({ _id: id });
        res.status(200).json({ success: true, data: {} });
        break;
        
      default:
        res.status(405).json({ success: false, message: 'Method not allowed' });
        break;
    }
  } catch (error) {
    console.error('Project API Error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
}