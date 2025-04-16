// pages/api/auth/[...nextauth].js
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from '../../../lib/mongodb-client';
import User from '../../../models/User';
import dbConnect from '../../../lib/dbConnect';

export default NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        await dbConnect();
        
        try {
          const user = await User.findOne({ username: credentials.username });
          
          if (!user) {
            throw new Error('No user found with this username');
          }
          
          const isValid = await user.comparePassword(credentials.password);
          
          if (!isValid) {
            throw new Error('Invalid password');
          }
          
          return {
            id: user._id.toString(),
            username: user.username,
            email: user.email
          };
        } catch (error) {
          throw new Error(error.message);
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id;
        session.user.username = token.username;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
      }
      return token;
    },
  },
});