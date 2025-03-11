// pages/api/ai/generate-task.js
import { getSession } from 'next-auth/react';
import { OpenAI } from 'openai';
import dbConnect from '../../../lib/mongodb';
import { Project } from '../../../models';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  
  const session = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  await dbConnect();
  
  try {
    const { projectId, blockType } = req.body;
    
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
    
    // Create prompt based on project type and block type
    let prompt = '';
    
    if (blockType === 'creative') {
      prompt = `You are a creative coach helping with a ${project.type} project called "${project.title}". ${project.description ? `The project is about: ${project.description}` : ''} 
      
      Generate a creative task that will help the user get unstuck and make progress on their project. Be specific and quirky. The task should be unexpected but relevant.`;
    } else if (blockType === 'regimen') {
      prompt = `You are a productivity coach helping with a ${project.type} project called "${project.title}". ${project.description ? `The project is about: ${project.description}` : ''} 
      
      Generate a focused, actionable task that will create a regular practice or regiment for the user to follow for this project. It should help build consistency and momentum.`;
    } else {
      prompt = `You are a project assistant helping with a ${project.type} project called "${project.title}". ${project.description ? `The project is about: ${project.description}` : ''} 
      
      Generate an insightful task that will help the user make meaningful progress. Be specific and practical.`;
    }
    
    // Generate AI response
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      max_tokens: 200,
    });
    
    const aiTask = completion.choices[0].message.content.trim();
    
    // Generate a descriptive title from the task
    const titleCompletion = await openai.chat.completions.create({
      messages: [{ 
        role: "user", 
        content: `Create a short, catchy title (max 10 words) for this task: ${aiTask}` 
      }],
      model: "gpt-3.5-turbo",
      max_tokens: 30,
    });
    
    const taskTitle = titleCompletion.choices[0].message.content.trim().replace(/^"(.*)"$/, '$1');
    
    res.status(200).json({ 
      success: true, 
      data: {
        title: taskTitle,
        description: aiTask,
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