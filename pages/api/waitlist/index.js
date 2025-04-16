import dbConnect from '../../../lib/dbConnect';
import { Waitlist } from '../../../models';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  await dbConnect();

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    // Check if email already exists
    const existingEmail = await Waitlist.findOne({ email });
    if (existingEmail) {
      return res.status(200).json({ 
        success: true,
        alreadyExists: true,
        message: 'You\'re already on our waitlist! We\'ll notify you when spots open up.' 
      });
    }

    // Create new waitlist entry
    await Waitlist.create({ email });

    res.status(201).json({ 
      success: true,
      message: 'Welcome to the waitlist! We\'ll notify you when spots open up.'
    });
  } catch (error) {
    console.error('Waitlist API Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Something went wrong while joining the waitlist' 
    });
  }
} 