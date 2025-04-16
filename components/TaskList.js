// components/TasksList.js
import { useState } from 'react';

export default function TasksList({ tasks, setTasks, projectId }) {
  const [editTask, setEditTask] = useState(null);
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' or 'desc'
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    status: '',
    urls: []
  });

  const toggleSort = () => {
    setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
  });

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (data.success) {
        setTasks(tasks.map(task => 
          task._id === taskId ? { ...task, status: newStatus } : task
        ));
      } else {
        console.error('Failed to update task status:', data.message);
      }
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success) {
        setTasks(tasks.filter(task => task._id !== taskId));
      } else {
        console.error('Failed to delete task:', data.message);
      }
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const handleAddUrl = () => {
    setEditFormData(prev => ({
      ...prev,
      urls: [...prev.urls, '']
    }));
  };

  const handleRemoveUrl = (index) => {
    setEditFormData(prev => ({
      ...prev,
      urls: prev.urls.filter((_, i) => i !== index)
    }));
  };

  const handleUrlChange = (index, value) => {
    setEditFormData(prev => ({
      ...prev,
      urls: prev.urls.map((url, i) => i === index ? value : url)
    }));
  };

  const handleEditClick = (task) => {
    setEditTask(task._id);
    setEditFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      urls: task.urls || []
    });
  };

  const handleCancelEdit = () => {
    setEditTask(null);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitEdit = async (e, taskId) => {
    e.preventDefault();
    
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      });

      const data = await res.json();

      if (data.success) {
        setTasks(tasks.map(task => 
          task._id === taskId ? { ...task, ...editFormData } : task
        ));
        setEditTask(null);
      } else {
        console.error('Failed to update task:', data.message);
      }
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <h3 className="card-title text-xl mb-2">No tasks yet</h3>
          <p className="mb-4">This project doesn't have any tasks yet. Add your first task to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-2">
        <button
          onClick={toggleSort}
          className="btn btn-ghost btn-sm gap-2"
        >
          Sort by Date
          {sortDirection === 'desc' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>
      {sortedTasks.map((task) => (
        <div 
          key={task._id} 
          className={`card bg-base-100 shadow-xl border-t-2 border-base-200 hover:border-t-accent transition-colors duration-200 ${
            task.isAiGenerated ? 'border-l-4 border-l-accent' : ''
          }`}
        >
          <div className="card-body">
            {editTask === task._id ? (
              <form onSubmit={(e) => handleSubmitEdit(e, task._id)}>
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Task Title</span>
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

                <div className="form-control mb-4">
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

                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">URLs</span>
                    <button 
                      type="button" 
                      className="btn btn-ghost btn-xs"
                      onClick={handleAddUrl}
                    >
                      + Add URL
                    </button>
                  </label>
                  {editFormData.urls.map((url, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="url"
                        className="input input-bordered flex-1"
                        value={url}
                        onChange={(e) => handleUrlChange(index, e.target.value)}
                        placeholder="https://"
                      />
                      <button 
                        type="button" 
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleRemoveUrl(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <div className="form-control mb-6">
                  <label className="label">
                    <span className="label-text">Status</span>
                  </label>
                  <select 
                    name="status" 
                    className="select select-bordered w-full"
                    value={editFormData.status}
                    onChange={handleEditFormChange}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2">
                  <button 
                    type="button" 
                    className="btn btn-outline btn-sm"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm">
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex flex-row justify-between items-start gap-2">
                  <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
                    <h3 className="card-title break-words">{task.title}</h3>
                    {task.isAiGenerated && (
                      <div className="badge badge-accent whitespace-nowrap">AI Generated</div>
                    )}
                  </div>
                  <div className="dropdown dropdown-end flex-shrink-0">
                    <label tabIndex={0} className="btn btn-ghost btn-xs">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </label>
                    <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                      <li><a onClick={() => handleEditClick(task)}>Edit</a></li>
                      <li><a onClick={() => handleDeleteTask(task._id)} className="text-error">Delete</a></li>
                    </ul>
                  </div>
                </div>
                
                {task.description && (
                  <p className="text-gray-600 mt-2">{task.description}</p>
                )}

                {task.urls && task.urls.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold mb-2">Related Links:</h4>
                    <div className="space-y-1">
                      {task.urls.map((url, index) => (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link link-primary block text-sm truncate"
                        >
                          {url}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="card-actions justify-between items-center mt-4">
                  <select 
                    className={`select select-sm ${
                      task.status === 'completed' 
                        ? 'select-success' 
                        : task.status === 'in-progress' 
                          ? 'select-warning' 
                          : 'select-bordered'
                    }`}
                    value={task.status}
                    onChange={(e) => handleStatusChange(task._id, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  
                  <span className="text-sm text-gray-500">
                    {new Date(task.createdAt).toLocaleString(undefined, {
                      year: 'numeric',
                      month: 'numeric',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}