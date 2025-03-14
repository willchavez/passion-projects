// pages/projects/[id].js
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import TasksList from '../../components/TaskList';
import NewTaskModal from '../../components/NewTaskModal';

export default function ProjectDetail() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = router.query;

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Fetch project and tasks
  useEffect(() => {
    const fetchProjectData = async () => {
      if (!id || status !== 'authenticated') return;
      
      try {
        // Fetch project details
        const projectRes = await fetch(`/api/projects/${id}`);
        const projectData = await projectRes.json();
        
        if (!projectData.success) {
          setError(projectData.message || 'Failed to load project');
          setIsLoading(false);
          return;
        }
        
        setProject(projectData.data);
        setEditFormData({
          title: projectData.data.title,
          description: projectData.data.description || '',
        });
        
        // Fetch project tasks
        const tasksRes = await fetch(`/api/tasks?projectId=${id}`);
        const tasksData = await tasksRes.json();
        
        if (tasksData.success) {
          setTasks(tasksData.data);
        } else {
          console.error('Failed to load tasks:', tasksData.message);
        }
      } catch (err) {
        console.error('Error fetching project data:', err);
        setError('An error occurred while fetching project data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectData();
  }, [id, status]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAddTask = (newTask) => {
    setTasks([...tasks, newTask]);
  };

  const handleEditProject = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditFormData({
      title: project.title,
      description: project.description || '',
    });
    setIsEditMode(false);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      });

      const data = await res.json();

      if (data.success) {
        setProject(data.data);
        setIsEditMode(false);
      } else {
        setError(data.message || 'Failed to update project');
      }
    } catch (err) {
      console.error('Error updating project:', err);
      setError('An error occurred while updating your project');
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }
    
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success) {
        router.push('/projects');
      } else {
        setError(data.message || 'Failed to delete project');
      }
    } catch (err) {
      console.error('Error deleting project:', err);
      setError('An error occurred while deleting your project');
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <Layout title="Project Details">
        <div className="flex justify-center items-center min-h-[60vh]">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Error">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body items-center text-center">
            <h2 className="card-title text-xl text-error mb-4">Error</h2>
            <p className="mb-6">{error}</p>
            <div className="card-actions">
              <Link href="/projects" className="btn btn-primary">
                Back to Projects
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout title="Project Not Found">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body items-center text-center">
            <h2 className="card-title text-xl mb-4">Project Not Found</h2>
            <p className="mb-6">The project you're looking for doesn't exist or you don't have access to it.</p>
            <div className="card-actions">
              <Link href="/projects" className="btn btn-primary">
                Back to Projects
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={project.title}>
      <div className="mb-8">
        <div className="flex items-center mb-1">
          <Link href="/projects" className="btn btn-ghost btn-sm mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </Link>
          <div className="badge badge-accent">{project.type}</div>
        </div>
        
        {isEditMode ? (
          <div className="card bg-base-100 shadow-xl mb-8">
            <div className="card-body">
              <h2 className="card-title">Edit Project</h2>
              <form onSubmit={handleSubmitEdit}>
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Project Title</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    className="input input-bordered"
                    value={editFormData.title}
                    onChange={handleEditFormChange}
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
                    value={editFormData.description}
                    onChange={handleEditFormChange}
                  ></textarea>
                </div>

                <div className="flex justify-end gap-2">
                  <button 
                    type="button" 
                    className="btn btn-outline"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">{project.title}</h1>
              {project.description && (
                <p className="text-gray-600 mt-2">{project.description}</p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                Created on {new Date(project.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-circle">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </label>
              <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                <li><a onClick={handleEditProject}>Edit Project</a></li>
                <li><a onClick={handleDeleteProject} className="text-error">Delete Project</a></li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Tasks</h2>
          <button onClick={handleOpenModal} className="btn btn-primary btn-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Task
          </button>
        </div>
        
        <TasksList tasks={tasks} setTasks={setTasks} projectId={id} />
      </div>

      <NewTaskModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        projectId={id} 
        onAddTask={handleAddTask} 
      />
    </Layout>
  );
}