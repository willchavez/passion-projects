// components/TasksList.js
import { useState } from 'react';

export default function TasksList({ tasks, setTasks, projectId }) {
  const [editTask, setEditTask] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    status: ''
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

  const handleEditClick = (task) => {
    setEditTask(task._id);
    setEditFormData({
      title: task.title,
      description: task.description || '',
      status: task.status
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
      {tasks.map((task) => (
        <div key={task._id} className={`card bg-base-100 shadow-xl ${task.isAiGenerated ? 'border-l-4 border-accent' : ''}`}>
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
                <div className="flex justify-between items-start">
                  <h3 className="card-title">{task.title}</h3>
                  <div className="flex items-center">
                    {task.isAiGenerated && (
                      <div className="badge badge-accent mr-2">AI Generated</div>
                    )}
                    <div className="dropdown dropdown-end">
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
                </div>
                
                {task.description && (
                  <p className="text-gray-600 mt-2">{task.description}</p>
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
                    {new Date(task.createdAt).toLocaleDateString()}
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