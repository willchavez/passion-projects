// pages/projects/new.js
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';

export default function NewProject() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const initialType = router.query.type || 'structured';

  const [projectData, setProjectData] = useState({
    title: '',
    description: '',
    type: initialType,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Update type if router.query changes
  useEffect(() => {
    if (router.query.type) {
      setProjectData(prev => ({
        ...prev,
        type: router.query.type
      }));
    }
  }, [router.query]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProjectData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      const data = await res.json();

      if (data.success) {
        router.push(`/projects/${data.data._id}`);
      } else {
        setError(data.message || 'Failed to create project');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error creating project:', err);
      setError('An error occurred while creating your project');
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <Layout title="New Project">
        <div className="flex justify-center items-center min-h-[60vh]">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="New Project">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Project</h1>
        <p className="text-gray-600 mt-1">Start tracking your passion project</p>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          {error && (
            <div className="alert alert-error mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Project Type</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-4">
                <label className="cursor-pointer flex items-center gap-2">
                  <input 
                    type="radio" 
                    name="type" 
                    className="radio radio-primary" 
                    value="structured"
                    checked={projectData.type === 'structured'}
                    onChange={handleChange}
                  />
                  <span>Structured Project</span>
                </label>
                <label className="cursor-pointer flex items-center gap-2">
                  <input 
                    type="radio" 
                    name="type" 
                    className="radio radio-primary" 
                    value="freestyle"
                    checked={projectData.type === 'freestyle'}
                    onChange={handleChange}
                  />
                  <span>Freestyle Project</span>
                </label>
              </div>
              
              <div className="mt-2">
                <div className="text-sm text-gray-600">
                  {projectData.type === 'structured' 
                    ? 'Organized project with defined goals and tasks for tracking progress.' 
                    : 'Flexible space for creative exploration without rigid structure.'}
                </div>
              </div>
            </div>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Project Title</span>
              </label>
              <input
                type="text"
                name="title"
                className="input input-bordered"
                placeholder="My Awesome Project"
                value={projectData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-control mb-6">
              <label className="label">
                <span className="label-text">Description (Optional)</span>
              </label>
              <textarea
                name="description"
                className="textarea textarea-bordered h-24"
                placeholder="What's this project about?"
                value={projectData.description}
                onChange={handleChange}
              ></textarea>
            </div>

            <div className="form-control mt-6">
              <button 
                type="submit" 
                className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}