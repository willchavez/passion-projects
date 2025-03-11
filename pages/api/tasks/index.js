// pages/api/tasks/index.js
import { getSession } from 'next-auth/react';
import dbConnect from '../../../lib/mongodb';
import { Task, Project } from '../../../models';

export default async function handler(req, res) {
  const session = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  await dbConnect();
  
  const { method } = req;
  
  switch (method) {
    case 'GET':
      try {
        // Get projectId from query parameters
        const { projectId } = req.query;
        
        if (!projectId) {
          return res.status(400).json({ 
            success: false, 
            message: 'Project ID is required' 
          });
        }
        
        // Verify project belongs to user
        const project = await Project.findOne({ 
          _id: projectId,
          userId: session.user.id 
        });
        
        if (!project) {
          return res.status(404).json({ 
            success: false, 
            message: 'Project not found' 
          });
        }
        
        const tasks = await Task.find({ projectId });
        res.status(200).json({ success: true, data: tasks });
      } catch (error) {
        res.status(400).json({ success: false, message: error.message });
      }
      break;
      
    case 'POST':
      try {
        const { title, description, projectId, status, dueDate, isAiGenerated } = req.body;
        
        if (!title || !projectId) {
          return res.status(400).json({ 
            success: false, 
            message: 'Title and project ID are required' 
          });
        }
        
        // Verify project belongs to user
        const project = await Project.findOne({ 
          _id: projectId,
          userId: session.user.id 
        });
        
        if (!project) {
          return res.status(404).json({ 
            success: false, 
            message: 'Project not found' 
          });
        }
        
        const task = await Task.create({
          title,
          description,
          projectId,
          status: status || 'pending',
          dueDate,
          isAiGenerated: isAiGenerated || false
        });
        
        res.status(201).json({ success: true, data: task });
      } catch (error) {
        res.status(400).json({ success: false, message: error.message });
      }
      break;
      
    default:
      res.status(405).json({ success: false, message: 'Method not allowed' });
      break;
  }
}