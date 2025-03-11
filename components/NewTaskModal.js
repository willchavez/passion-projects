// components/NewTaskModal.js
import { useState } from 'react';

export default function NewTaskModal({ isOpen, onClose, projectId, onAddTask }) {
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    status: 'pending',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiOption, setAiOption] = useState('creative');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...taskData,
          projectId,
        }),
      });

      const data = await res.json();

      if (data.success) {
        onAddTask(data.data);
        handleReset();
        onClose();
      } else {
        setError(data.message || 'Failed to create task');
      }
    } catch (err) {
      console.error('Error creating task:', err);
      setError('An error occurred while creating your task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateAI = async () => {
    setIsGeneratingAI(true);
    setError('');

    try {
      const res = await fetch('/api/ai/generate-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          blockType: aiOption,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setTaskData({
          title: data.data.title,
          description: data.data.description,
          status: 'pending',
          isAiGenerated: true,
        });
      } else {
        setError(data.message || 'Failed to generate AI task');
      }
    } catch (err) {
      console.error('Error generating AI task:', err);
      setError('An error occurred while generating an AI task');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleReset = () => {
    setTaskData({
      title: '',
      description: '',
      status: 'pending',
    });
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
      <div className="modal-box relative w-full max-w-lg">
        <button 
          className="btn btn-sm btn-circle absolute right-2 top-2"
          onClick={onClose}
        >
          ✕
        </button>
        <h3 className="font-bold text-lg mb-4">Add New Task</h3>
        
        {error && (
          <div className="alert alert-error mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}
        
        <div className="card bg-base-200 mb-6">
          <div className="card-body p-4">
            <h3 className="card-title text-sm mb-2">Feeling Stuck?</h3>
            <p className="text-sm mb-3">Let AI suggest a task to help you move forward with your project</p>
            
            <div className="flex flex-wrap gap-2 mb-3">
              <label className="cursor-pointer flex items-center gap-1">
                <input 
                  type="radio" 
                  name="aiOption" 
                  className="radio radio-xs radio-accent" 
                  value="creative"
                  checked={aiOption === 'creative'}
                  onChange={(e) => setAiOption(e.target.value)}
                />
                <span className="text-sm">Creative unblocking</span>
              </label>
              <label className="cursor-pointer flex items-center gap-1">
                <input 
                  type="radio" 
                  name="aiOption" 
                  className="radio radio-xs radio-accent" 
                  value="regimen"
                  checked={aiOption === 'regimen'}
                  onChange={(e) => setAiOption(e.target.value)}
                />
                <span className="text-sm">Regular practice</span>
              </label>
            </div>
            
            <button 
              className={`btn btn-accent btn-sm ${isGeneratingAI ? 'loading' : ''}`}
              onClick={handleGenerateAI}
              disabled={isGeneratingAI}
            >
              {isGeneratingAI ? 'Generating...' : 'Generate AI Task'}
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Task Title</span>
            </label>
            <input
              type="text"
              name="title"
              className="input input-bordered"
              placeholder="What needs to be done?"
              value={taskData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Description (Optional)</span>
            </label>
            <textarea
              name="description"
              className="textarea textarea-bordered h-24"
              placeholder="Add more details about this task..."
              value={taskData.description}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="form-control mb-6">
            <label className="label">
              <span className="label-text">Status</span>
            </label>
            <select 
              name="status" 
              className="select select-bordered w-full"
              value={taskData.status}
              onChange={handleChange}
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="modal-action">
            <button 
              type="button" 
              className="btn btn-outline"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Adding...' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}