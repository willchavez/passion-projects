// pages/api/ai/generate-task.js
import { getToken } from 'next-auth/jwt';
import { OpenAI } from 'openai';
import dbConnect from '../../../lib/dbConnect';
import { Project } from '../../../models';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  await dbConnect();
  
  try {
    const { projectId, blockType, userDescription } = req.body;
    
    if (!projectId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Project ID is required' 
      });
    }
    
    // Verify project belongs to user
    const project = await Project.findOne({ 
      _id: projectId,
      userId: token.id 
    });
    
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found' 
      });
    }
    
    // Create prompt based on project type, block type, and user description
    let prompt = '';
    const projectContext = `${project.type} project called "${project.title}". ${project.description ? `The project is about: ${project.description}` : ''}`;
    const userContext = userDescription ? `The user wants to: ${userDescription}` : '';
    
    if (blockType === 'creative') {
      prompt = `You are a creative coach helping with a ${projectContext}
      ${userContext}
      
      Generate a creative task that will help the user get unstuck and make progress on their project. Be specific and quirky. The task should be unexpected but relevant to their goals.`;
    } else if (blockType === 'regimen') {
      prompt = `You are a productivity coach helping with a ${projectContext}
      ${userContext}
      
      Generate a focused, actionable task that will create a regular practice or regiment for the user to follow for this project. It should help build consistency and momentum while considering their specific goals.`;
    } else {
      prompt = `You are a project assistant helping with a ${projectContext}
      ${userContext}
      
      Generate an insightful task that will help the user make meaningful progress towards their specific goals. Be specific and practical.`;
    }
    
    // Generate AI response
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      max_tokens: 200,
    });
    
    const aiTask = completion.choices[0].message.content.trim();
    
    // Extract URLs from the AI task using a regex pattern
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    const urls = aiTask.match(urlPattern) || [];
    
    // Clean up the task description by removing the raw URLs
    const cleanDescription = aiTask.replace(urlPattern, '').trim();
    
    // Generate a descriptive title from the task
    const titleCompletion = await openai.chat.completions.create({
      messages: [{ 
        role: "user", 
        content: `Create a short, catchy title (max 10 words) for this task: ${cleanDescription}` 
      }],
      model: "gpt-3.5-turbo",
      max_tokens: 30,
    });
    
    const taskTitle = titleCompletion.choices[0].message.content.trim().replace(/^"(.*)"$/, '$1');
    
    res.status(200).json({ 
      success: true, 
      data: {
        title: taskTitle,
        description: cleanDescription,
        urls: urls,
        isAiGenerated: true
      }
    });
  } catch (error) {
    console.error('Error generating AI task:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate AI task'
    });
  }
}