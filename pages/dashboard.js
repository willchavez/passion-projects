// pages/dashboard.js
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Fetch user's projects
  useEffect(() => {
    const fetchProjects = async () => {
      if (status !== 'authenticated') return;
      
      try {
        const res = await fetch('/api/projects');
        const data = await res.json();
        
        if (data.success) {
          setProjects(data.data);
        } else {
          setError('Failed to load projects');
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('An error occurred while fetching your projects');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [status]);

  if (status === 'loading' || isLoading) {
    return (
      <Layout title="Dashboard">
        <div className="flex justify-center items-center min-h-[60vh]">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome{session?.user?.name ? `, ${session.user.name}` : ''}!</h1>
          <p className="text-gray-600 mt-1">Manage your passion projects and creative endeavors</p>
        </div>
        <Link href="/projects/new" className="btn btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          New Project
        </Link>
      </div>

      {error && (
        <div className="alert alert-error mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Recent Projects</h2>
        {projects.length === 0 ? (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body items-center text-center">
              <h3 className="card-title text-xl mb-2">No projects yet</h3>
              <p className="mb-4">You haven't created any projects yet. Start by creating your first project!</p>
              <div className="card-actions">
                <Link href="/projects/new" className="btn btn-primary">
                  Create First Project
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.slice(0, 6).map((project) => (
              <Link href={`/projects/${project._id}`} key={project._id}>
                <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300 h-full">
                  <div className="card-body">
                    <div className="flex justify-between items-start">
                      <h3 className="card-title">{project.title}</h3>
                      <div className="badge badge-accent">{project.type}</div>
                    </div>
                    {project.description && (
                      <p className="text-gray-600 mt-2 line-clamp-2">{project.description}</p>
                    )}
                    <div className="card-actions justify-end mt-4">
                      <span className="text-sm text-gray-500">
                        Created {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        
        {projects.length > 6 && (
          <div className="text-center mt-6">
            <Link href="/projects" className="btn btn-outline">
              View All Projects
            </Link>
          </div>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">Start a structured project</h3>
              <p>Track progress with defined goals and tasks</p>
              <div className="card-actions justify-end mt-4">
                <Link href="/projects/new?type=structured" className="btn btn-primary btn-sm">
                  Create
                </Link>
              </div>
            </div>
          </div>
          
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">Start a freestyle project</h3>
              <p>A flexible space for looser creative endeavors</p>
              <div className="card-actions justify-end mt-4">
                <Link href="/projects/new?type=freestyle" className="btn btn-primary btn-sm">
                  Create
                </Link>
              </div>
            </div>
          </div>
          
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">Get creative inspiration</h3>
              <p>Stuck on a project? Get AI-powered ideas</p>
              <div className="card-actions justify-end mt-4">
                <Link href="/inspiration" className="btn btn-accent btn-sm">
                  Inspire Me
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}