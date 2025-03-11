// pages/auth/verify-request.js
import Link from 'next/link';
import Layout from '../../components/Layout';

export default function VerifyRequest() {
  return (
    <Layout title="Check Your Email">
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="card w-full max-w-md bg-base-100 shadow-xl">
          <div className="card-body items-center text-center">
            <h2 className="card-title text-2xl font-bold mb-6">
              Check your email
            </h2>
            
            <div className="text-5xl mb-6">📧</div>
            
            <p className="mb-4">
              A sign in link has been sent to your email address.
            </p>
            
            <p className="mb-6">
              Click the link in the email to sign in to your account.
            </p>
            
            <div className="alert alert-info mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>The link is only valid for 24 hours.</span>
            </div>
            
            <div className="card-actions">
              <Link href="/auth/signin" className="btn btn-outline">
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}