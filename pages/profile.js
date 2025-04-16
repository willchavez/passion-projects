import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    user: {
      username: '',
      email: '',
      createdAt: null
    },
    totalProjects: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    aiGeneratedTasks: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!session?.user) return;

      try {
        const res = await fetch('/api/users/stats');
        const data = await res.json();

        if (data.success) {
          setStats(data.data);
        }
      } catch (error) {
        console.error('Error fetching user stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserStats();
  }, [session]);

  if (status === 'loading' || isLoading) {
    return (
      <Layout title="Profile">
        <div className="flex justify-center items-center min-h-[60vh]">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </Layout>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <Layout title="Profile">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-base-200 rounded-box p-8 mb-8 flex items-center gap-8">
          <div className="avatar">
            <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
              {session.user?.image ? (
                <img src={session.user.image} alt={stats.user.username} />
              ) : (
                <div className="bg-primary text-primary-content w-24 h-24 flex items-center justify-center text-3xl">
                  {stats.user.username?.[0] || '?'}
                </div>
              )}
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {stats.user.username}
            </h1>
            <p className="text-base-content/70">
              {stats.user.email}
            </p>
            <p className="text-sm text-base-content/60 mt-1">
              Member since {new Date(stats.user.createdAt || Date.now()).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-figure text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <div className="stat-title">Total Projects</div>
              <div className="stat-value text-primary">{stats.totalProjects}</div>
              <div className="stat-desc">Your creative endeavors</div>
            </div>
          </div>

          <div className="stats shadow">
            <div className="stat">
              <div className="stat-figure text-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                </svg>
              </div>
              <div className="stat-title">AI Generated Tasks</div>
              <div className="stat-value text-secondary">{stats.aiGeneratedTasks}</div>
              <div className="stat-desc">Creative assistance</div>
            </div>
          </div>
        </div>

        {/* Task Progress */}
        <div className="bg-base-200 rounded-box p-6">
          <h2 className="text-xl font-semibold mb-4">Task Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card bg-base-100">
              <div className="card-body">
                <h3 className="card-title text-success">
                  Completed Tasks
                </h3>
                <div className="flex items-center gap-4">
                  <div className="radial-progress text-success" style={{ "--value": (stats.completedTasks / (stats.completedTasks + stats.inProgressTasks)) * 100 }}>
                    {stats.completedTasks}
                  </div>
                  <div className="text-sm">
                    Great job on completing these tasks!
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-base-100">
              <div className="card-body">
                <h3 className="card-title text-warning">
                  In Progress
                </h3>
                <div className="flex items-center gap-4">
                  <div className="radial-progress text-warning" style={{ "--value": (stats.inProgressTasks / (stats.completedTasks + stats.inProgressTasks)) * 100 }}>
                    {stats.inProgressTasks}
                  </div>
                  <div className="text-sm">
                    Keep up the momentum!
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 