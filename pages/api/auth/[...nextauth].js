// pages/api/auth/[...nextauth].js
import NextAuth from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from '../../../lib/mongodb-client';
import Mailgun from 'mailgun.js';
import formData from 'form-data';

// Configure Mailgun
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY,
});

export default NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
      sendVerificationRequest: async ({ identifier: email, url, provider }) => {
        // Custom email sending logic with Mailgun
        const { host } = new URL(url);
        
        try {
          await mg.messages.create(process.env.MAILGUN_DOMAIN, {
            from: `Passion Projects <no-reply@${process.env.MAILGUN_DOMAIN}>`,
            to: email,
            subject: `Sign in to Passion Projects`,
            text: `Click the link below to sign in to your Passion Projects account:\n\n${url}\n\nIf you did not request this email, you can safely ignore it.`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                <h2 style="color: #5c6ac4;">Sign in to Passion Projects</h2>
                <p>Hello there! Click the button below to sign in to your account:</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${url}" style="background-color: #5c6ac4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Sign In</a>
                </div>
                <p style="color: #666; font-size: 14px;">If you did not request this email, you can safely ignore it.</p>
                <p style="color: #999; font-size: 12px;">Link valid for 24 hours. Sent from Passion Projects.</p>
              </div>
            `,
          });
        } catch (error) {
          console.error('Error sending email with Mailgun:', error);
          throw new Error('Failed to send verification email');
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify-request',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
});