import { useState } from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';

export default function Register() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus({ type: 'success', message: data.message });
        setEmail('');
      } else {
        setStatus({ type: 'error', message: data.message });
      }
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: 'Something went wrong. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title="Join Waitlist">
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Join our Exclusive Waitlist
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              We're currently invite-only, but we'd love to have you join soon!
            </p>
          </motion.div>

          <motion.form 
            className="mt-8 space-y-6" 
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="rounded-md shadow-sm">
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className={`mt-4 w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Joining...
                    </span>
                  ) : 'Join Waitlist'}
                </motion.button>
              </div>
            </div>

            <AnimatePresence>
              {status.message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`rounded-md p-4 ${
                    status.type === 'success' 
                      ? 'bg-green-50 text-green-800' 
                      : 'bg-red-50 text-red-800'
                  }`}
                >
                  {status.message}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.form>

          <div className="mt-6 text-center">
            <Link href="/auth/signin" className="font-medium text-indigo-600 hover:text-indigo-500">
              Already have an account? Sign in
            </Link>
          </div>

          <motion.div 
            className="mt-8 text-center text-sm text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <p>By joining our waitlist, you'll be among the first to know when we open up new spots. We're working hard to create an amazing experience for our users!</p>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
} 