// pages/api/tasks/[id].js
import { getSession } from 'next-auth/react';
import dbConnect from '../../../lib/mongodb';
import { Task, Project } from '../../../models';

export default async function handler(req, res) {
  const session = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  await dbConnect();
  
  const { 
    query: { id },
    method 
  } = req;
  
  switch (method) {
    case 'GET':
      try {
        const task = await Task.findById(id);
        
        if (!task) {
          return res.status(404).json({ success: false, message: 'Task not found' });
        }
        
        // Verify the project belongs to the user
        const project = await Project.findOne({ 
          _id: task.projectId,
          userId: session.user.id 
        });
        
        if (!project) {
          return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        
        res.status(200).json({ success: true, data: task });
      } catch (error) {
        res.status(400).json({ success: false, message: error.message });
      }
      break;
      
    case 'PUT':
      try {
        const task = await Task.findById(id);
        
        if (!task) {
          return res.status(404).json({ success: false, message: 'Task not found' });
        }
        
        // Verify the project belongs to the user
        const project = await Project.findOne({ 
          _id: task.projectId,
          userId: session.user.id 
        });
        
        if (!project) {
          return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        
        const updatedTask = await Task.findByIdAndUpdate(
          id,
          { ...req.body, updatedAt: Date.now() },
          { new: true, runValidators: true }
        );
        
        res.status(200).json({ success: true, data: updatedTask });
      } catch (error) {
        res.status(400).json({ success: false, message: error.message });
      }
      break;
      
    case 'DELETE':
      try {
        const task = await Task.findById(id);
        
        if (!task) {
          return res.status(404).json({ success: false, message: 'Task not found' });
        }
        
        // Verify the project belongs to the user
        const project = await Project.findOne({ 
          _id: task.projectId,
          userId: session.user.id 
        });
        
        if (!project) {
          return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        
        await Task.deleteOne({ _id: id });
        
        res.status(200).json({ success: true, data: {} });
      } catch (error) {
        res.status(400).json({ success: false, message: error.message });
      }
      break;
      
    default:
      res.status(405).json({ success: false, message: 'Method not allowed' });
      break;
  }
}