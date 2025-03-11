// pages/inspiration.js
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';

export default function Inspiration() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [inspirationType, setInspirationType] = useState('creative');
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [inspiration, setInspiration] = useState(null);

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
          if (data.data.length > 0) {
            setSelectedProject(data.data[0]._id);
          }
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

  const handleGenerateInspiration = async () => {
    if (!selectedProject) {
      setError('Please select a project first');
      return;
    }
    
    setIsGenerating(true);
    setError('');
    setInspiration(null);

    try {
      const res = await fetch('/api/ai/generate-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: selectedProject,
          blockType: inspirationType,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setInspiration(data.data);
      } else {
        setError(data.message || 'Failed to generate inspiration');
      }
    } catch (err) {
      console.error('Error generating inspiration:', err);
      setError('An error occurred while generating inspiration');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAsTask = async () => {
    if (!inspiration) return;
    
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: inspiration.title,
          description: inspiration.description,
          projectId: selectedProject,
          status: 'pending',
          isAiGenerated: true,
        }),
      });

      const data = await res.json();

      if (data.success) {
        router.push(`/projects/${selectedProject}`);
      } else {
        setError(data.message || 'Failed to save task');
      }
    } catch (err) {
      console.error('Error saving task:', err);
      setError('An error occurred while saving the task');
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <Layout title="Inspiration">
        <div className="flex justify-center items-center min-h-[60vh]">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Get Inspired">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Creative Inspiration</h1>
        <p className="text-gray-600 mt-1">Get unstuck with AI-powered inspiration for your projects</p>
      </div>

      {error && (
        <div className="alert alert-error mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body items-center text-center">
            <h3 className="card-title text-xl mb-2">No projects yet</h3>
            <p className="mb-4">You need to create a project first before getting inspiration.</p>
            <div className="card-actions">
              <Link href="/projects/new" className="btn btn-primary">
                Create First Project
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title mb-4">Configuration</h2>
              
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Select Project</span>
                </label>
                <select 
                  className="select select-bordered w-full"
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                >
                  {projects.map(project => (
                    <option key={project._id} value={project._id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-control mb-6">
                <label className="label">
                  <span className="label-text">Inspiration Type</span>
                </label>
                <div className="flex flex-col gap-2">
                  <label className="label cursor-pointer justify-start gap-2">
                    <input 
                      type="radio" 
                      name="inspirationType" 
                      className="radio radio-primary" 
                      value="creative"
                      checked={inspirationType === 'creative'}
                      onChange={(e) => setInspirationType(e.target.value)}
                    />
                    <div>
                      <span className="label-text font-medium">Creative Unblocking</span>
                      <p className="text-xs text-gray-500">Unexpected ideas to get unstuck</p>
                    </div>
                  </label>
                  <label className="label cursor-pointer justify-start gap-2">
                    <input 
                      type="radio" 
                      name="inspirationType" 
                      className="radio radio-primary" 
                      value="regimen"
                      checked={inspirationType === 'regimen'}
                      onChange={(e) => setInspirationType(e.target.value)}
                    />
                    <div>
                      <span className="label-text font-medium">Regular Practice</span>
                      <p className="text-xs text-gray-500">Focused tasks to build consistency</p>
                    </div>
                  </label>
                  <label className="label cursor-pointer justify-start gap-2">
                    <input 
                      type="radio" 
                      name="inspirationType" 
                      className="radio radio-primary" 
                      value="general"
                      checked={inspirationType === 'general'}
                      onChange={(e) => setInspirationType(e.target.value)}
                    />
                    <div>
                      <span className="label-text font-medium">General Progress</span>
                      <p className="text-xs text-gray-500">Practical next steps for your project</p>
                    </div>
                  </label>
                </div>
              </div>
              
              <div className="card-actions">
                <button 
                  className={`btn btn-primary btn-block ${isGenerating ? 'loading' : ''}`}
                  onClick={handleGenerateInspiration}
                  disabled={isGenerating || !selectedProject}
                >
                  {isGenerating ? 'Generating...' : 'Generate Inspiration'}
                </button>
              </div>
            </div>
          </div>
          
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title mb-4">Inspiration</h2>
              
              {!inspiration ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <p className="text-gray-500">
                    Click the generate button to get AI-powered inspiration for your project
                  </p>
                </div>
              ) : (
                <div>
                  <div className="bg-base-200 p-4 rounded-lg mb-4">
                    <h3 className="font-bold text-lg mb-2">{inspiration.title}</h3>
                    <p className="whitespace-pre-line">{inspiration.description}</p>
                  </div>
                  
                  <div className="card-actions justify-between">
                    <button 
                      className="btn btn-outline btn-sm"
                      onClick={() => setInspiration(null)}
                    >
                      Clear
                    </button>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={handleSaveAsTask}
                    >
                      Save as Task
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}