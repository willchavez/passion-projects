// pages/api/tasks/index.js
import { getToken } from 'next-auth/jwt';
import dbConnect from '../../../lib/dbConnect';
import { Task, Project } from '../../../models';

export default async function handler(req, res) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  await dbConnect();
  
  const { method } = req;
  
  switch (method) {
    case 'GET':
      try {
        // First get all projects owned by the user
        const userProjects = await Project.find({ userId: token.id });
        const projectIds = userProjects.map(project => project._id);
        
        // Build the query - if projectId is provided, filter by it
        const query = {
          projectId: req.query.projectId 
            ? req.query.projectId 
            : { $in: projectIds }
        };
        
        // Then get tasks based on the query
        const tasks = await Task.find(query).populate('projectId');
        
        res.status(200).json({ success: true, data: tasks });
      } catch (error) {
        res.status(400).json({ success: false, message: error.message });
      }
      break;
      
    case 'POST':
      try {
        const { projectId } = req.body;
        
        // Verify project belongs to user
        const project = await Project.findOne({
          _id: projectId,
          userId: token.id
        });
        
        if (!project) {
          return res.status(404).json({
            success: false,
            message: 'Project not found or unauthorized'
          });
        }
        
        const task = await Task.create(req.body);
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