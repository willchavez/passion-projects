// pages/index.js
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);

  return (
    <Layout title="Welcome">
      <div className="hero min-h-[70vh]">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">Project Hub</h1>
            <p className="py-6">
              A quirky project management tool to help you organize your passion projects 
              and overcome creative blocks with AI-powered inspiration.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signin" className="btn btn-primary">Get Started</Link>
              <a href="#features" className="btn btn-outline">Learn More</a>
            </div>
          </div>
        </div>
      </div>

      <section id="features" className="py-12">
        <h2 className="text-3xl font-bold text-center mb-8">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">Structured Projects</h3>
              <p>Create organized projects with goals and tasks to track your progress efficiently.</p>
            </div>
          </div>
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">Freestyle Projects</h3>
              <p>Loose creative endeavors that don't fit the traditional project management mold.</p>
            </div>
          </div>
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">AI Inspiration</h3>
              <p>Get unstuck with AI-generated tasks and creative prompts tailored to your project.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <ol className="steps steps-vertical">
              <li className="step step-primary">Sign up for an account</li>
              <li className="step step-primary">Create your first project</li>
              <li className="step step-primary">Add tasks or get AI suggestions</li>
              <li className="step step-primary">Track your progress</li>
              <li className="step step-primary">Overcome creative blocks</li>
            </ol>
          </div>
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">Feeling Stuck?</h3>
              <p className="mb-4">
                The unique AI assistant in Project Hub can help you break through creative blocks
                by suggesting unexpected but relevant tasks to keep your momentum going.
              </p>
              <p>
                Whether you need a creative spark or help establishing a productive regimen,
                our AI is here to help keep your passion projects moving forward.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="card bg-primary text-primary-content">
          <div className="card-body items-center text-center">
            <h2 className="card-title text-2xl">Ready to start your journey?</h2>
            <p>Sign up today and turn your passion into progress.</p>
            <div className="card-actions justify-center mt-4">
              <Link href="/auth/signin" className="btn">Get Started</Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}