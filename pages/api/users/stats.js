import { getToken } from 'next-auth/jwt';
import dbConnect from '../../../lib/dbConnect';
import { Project, Task, User } from '../../../models';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await dbConnect();

  try {
    // Get user data
    const user = await User.findById(token.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get all projects for the user
    const projects = await Project.find({ userId: token.id });
    const projectIds = projects.map(project => project._id);

    // Get all tasks for these projects
    const tasks = await Task.find({ projectId: { $in: projectIds } });

    // Calculate statistics
    const stats = {
      user: {
        username: user.username || user.name || user.email.split('@')[0],
        email: user.email,
        createdAt: user.createdAt
      },
      totalProjects: projects.length,
      completedTasks: tasks.filter(task => task.status === 'completed').length,
      inProgressTasks: tasks.filter(task => task.status === 'in-progress').length,
      aiGeneratedTasks: tasks.filter(task => task.isAiGenerated).length
    };

    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user statistics' });
  }
} 