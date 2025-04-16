// pages/api/tasks/[id].js
import { getToken } from 'next-auth/jwt';
import dbConnect from '../../../lib/dbConnect';
import { Task, Project } from '../../../models';

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
    // First get the task
    const task = await Task.findById(id).populate('projectId');
    
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    
    // Then verify the project belongs to the user
    const project = await Project.findOne({
      _id: task.projectId,
      userId: token.id
    });
    
    if (!project) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized - This task does not belong to you' 
      });
    }
    
    switch (method) {
      case 'GET':
        res.status(200).json({ success: true, data: task });
        break;
        
      case 'PUT':
        const updatedTask = await Task.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true
        });
        res.status(200).json({ success: true, data: updatedTask });
        break;
        
      case 'DELETE':
        await Task.deleteOne({ _id: id });
        res.status(200).json({ success: true, data: {} });
        break;
        
      default:
        res.status(405).json({ success: false, message: 'Method not allowed' });
        break;
    }
  } catch (error) {
    console.error('Task API Error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
}