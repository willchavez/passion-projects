// pages/projects/index.js
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';

export default function ProjectsList() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

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

  // Filter projects based on type
  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(project => project.type === filter);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  if (status === 'loading' || isLoading) {
    return (
      <Layout title="My Projects">
        <div className="flex justify-center items-center min-h-[60vh]">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="My Projects">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Projects</h1>
          <p className="text-gray-600 mt-1">Manage and track your passion projects</p>
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

      <div className="mb-6">
        <div className="tabs">
          <a 
            className={`tab tab-bordered ${filter === 'all' ? 'tab-active' : ''}`}
            onClick={() => handleFilterChange('all')}
          >
            All
          </a>
          <a 
            className={`tab tab-bordered ${filter === 'structured' ? 'tab-active' : ''}`}
            onClick={() => handleFilterChange('structured')}
          >
            Structured
          </a>
          <a 
            className={`tab tab-bordered ${filter === 'freestyle' ? 'tab-active' : ''}`}
            onClick={() => handleFilterChange('freestyle')}
          >
            Freestyle
          </a>
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body items-center text-center">
            <h3 className="card-title text-xl mb-2">No projects found</h3>
            <p className="mb-4">
              {filter === 'all' 
                ? "You haven't created any projects yet." 
                : `You don't have any ${filter} projects yet.`}
            </p>
            <div className="card-actions">
              <Link href={`/projects/new${filter !== 'all' ? `?type=${filter}` : ''}`} className="btn btn-primary">
                Create {filter !== 'all' ? filter : ''} Project
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
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
                  <div className="card-actions justify-between items-center mt-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      {project.taskCount} {project.taskCount === 1 ? 'task' : 'tasks'}
                    </div>
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
    </Layout>
  );
}