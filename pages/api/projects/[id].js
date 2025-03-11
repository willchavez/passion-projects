// pages/api/projects/[id].js
import { getSession } from 'next-auth/react';
import dbConnect from '../../../lib/mongodb';
import { Project } from '../../../models';

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
        const project = await Project.findOne({ 
          _id: id,
          userId: session.user.id 
        });
        
        if (!project) {
          return res.status(404).json({ success: false, message: 'Project not found' });
        }
        
        res.status(200).json({ success: true, data: project });
      } catch (error) {
        res.status(400).json({ success: false, message: error.message });
      }
      break;
      
    case 'PUT':
      try {
        const project = await Project.findOneAndUpdate(
          { _id: id, userId: session.user.id },
          { ...req.body, updatedAt: Date.now() },
          { new: true, runValidators: true }
        );
        
        if (!project) {
          return res.status(404).json({ success: false, message: 'Project not found' });
        }
        
        res.status(200).json({ success: true, data: project });
      } catch (error) {
        res.status(400).json({ success: false, message: error.message });
      }
      break;
      
    case 'DELETE':
      try {
        const deletedProject = await Project.deleteOne({ 
          _id: id,
          userId: session.user.id 
        });
        
        if (deletedProject.deletedCount === 0) {
          return res.status(404).json({ success: false, message: 'Project not found' });
        }
        
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