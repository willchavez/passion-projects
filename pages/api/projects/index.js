// pages/api/projects/index.js
import { getToken } from 'next-auth/jwt';
import dbConnect from '../../../lib/dbConnect';
import { Project } from '../../../models';

export default async function handler(req, res) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    await dbConnect();
    
    const { method } = req;
    
    switch (method) {
      case 'GET':
        try {
          const projects = await Project.find({ userId: token.id });
          res.status(200).json({ success: true, data: projects });
        } catch (error) {
          res.status(400).json({ success: false, message: error.message });
        }
        break;
        
      case 'POST':
        try {
          const { title, description, type } = req.body;
          
          if (!title || !type || !['structured', 'freestyle'].includes(type)) {
            return res.status(400).json({ 
              success: false, 
              message: 'Title and valid project type are required' 
            });
          }
          
          const project = await Project.create({
            title,
            description,
            type,
            userId: token.id,
          });
          
          res.status(201).json({ success: true, data: project });
        } catch (error) {
          res.status(400).json({ success: false, message: error.message });
        }
        break;
        
      default:
        res.status(405).json({ success: false, message: 'Method not allowed' });
        break;
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}