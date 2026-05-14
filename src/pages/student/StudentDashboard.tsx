import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Calendar, CheckCircle, TrendingUp, Users, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import api from '../../lib/api';
import { formatDate } from '../../lib/format';
import { Event } from '../../types';

interface DashboardData {
  stats: {
    registeredEvents: number;
    attendedEvents?: number;
    certificates: number;
    xp: number;
    level: number;
  };
  registrations: any[];
  certificates: any[];
  upcomingEvents: Event[];
}

const StudentDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const response = await api.get('/student/dashboard');
      setData(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Unable to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const stats = [
    { label: 'Registered Events', value: data?.stats.registeredEvents || 0, icon: Calendar, color: 'from-blue-500 to-cyan-500' },
    { label: 'Certificates', value: data?.stats.certificates || 0, icon: Award, color: 'from-green-500 to-emerald-500' },
    { label: 'XP Points', value: data?.stats.xp || user?.xp || 0, icon: Zap, color: 'from-purple-500 to-pink-500' },
    { label: 'Current Level', value: data?.stats.level || user?.level || 1, icon: TrendingUp, color: 'from-orange-500 to-red-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome, {user?.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {user?.department || 'Department not set'} {user?.year ? `- Year ${user.year}` : ''}
          </p>
        </div>

        {loading ? (
          <Card className="text-center py-12">Loading dashboard...</Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card>
                    <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${stat.color} mb-4`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Registered Events</h2>
                  <Button size="sm" onClick={() => navigate('/student/events')}>Browse Events</Button>
                </div>
                <div className="space-y-4">
                  {(data?.registrations || []).map((registration) => {
                    const event = registration.eventId;
                    return (
                      <div key={registration._id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{event?.title || 'Event'}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {formatDate(event?.startDate)} - {event?.venue || 'Online'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Registration ID: {registration.registrationId}</p>
                          </div>
                          <div className="flex gap-2">
                            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs">
                              {registration.status}
                            </span>
                            <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs">
                              {registration.paymentStatus}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {data?.registrations.length === 0 ? (
                    <div className="text-center py-10 text-gray-600 dark:text-gray-400">
                      No registrations yet.
                    </div>
                  ) : null}
                </div>
              </Card>

              <div className="space-y-6">
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Certificates</h2>
                    <Award className="w-5 h-5 text-yellow-500" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    {data?.certificates.length || 0}
                  </p>
                  <Button variant="outline" className="w-full" onClick={() => navigate('/student/certificates')}>
                    View Certificates
                  </Button>
                </Card>

                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Upcoming Events</h2>
                    <Users className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="space-y-3">
                    {(data?.upcomingEvents || []).slice(0, 4).map((event) => (
                      <button
                        key={event.id}
                        onClick={() => navigate('/student/events')}
                        className="w-full text-left p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                      >
                        <p className="font-medium text-gray-900 dark:text-white">{event.title}</p>
                        <p className="text-xs text-gray-500">{formatDate(event.startDate)}</p>
                      </button>
                    ))}
                  </div>
                </Card>

                <Card>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Dashboard data updates from MongoDB after registration.
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
