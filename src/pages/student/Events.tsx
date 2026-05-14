import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Copy,
  DollarSign,
  Download,
  Filter,
  MapPin,
  QrCode,
  Search,
  Share2,
  Users,
} from 'lucide-react';
import QRCode from 'react-qr-code';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import api from '../../lib/api';
import { formatCurrency, formatDate } from '../../lib/format';
import { Event, EventCategory } from '../../types';

interface Confirmation {
  studentName: string;
  eventName: string;
  registrationId: string;
  qrCode: string;
  eventDate: string;
  venue: string;
  paymentStatus: string;
  amount: number;
  emailSent: boolean;
  paymentId?: string;
}

const Events = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'all'>('all');
  const [selectedMode, setSelectedMode] = useState<'all' | 'online' | 'offline' | 'hybrid'>('all');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [teamEvent, setTeamEvent] = useState<Event | null>(null);
  const [teamMode, setTeamMode] = useState<'create' | 'join'>('create');
  const [teamForm, setTeamForm] = useState({ name: '', logo: '', maxTeamSize: 4, projectTitle: '', joinCode: '', teamId: '', leaderEmail: '', invitationToken: '', message: '' });
  const [loading, setLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState<string | null>(null);

  const categories: { value: EventCategory | 'all'; label: string }[] = [
    { value: 'all', label: 'All Events' },
    { value: 'hackathon', label: 'Hackathons' },
    { value: 'technical', label: 'Technical' },
    { value: 'non-tech', label: 'Non-Tech' },
    { value: 'career', label: 'Career' },
    { value: 'sports', label: 'Sports' },
  ];

  const loadEvents = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/events');
      setEvents(data.events || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Unable to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const filteredEvents = useMemo(
    () =>
      events.filter((event) => {
        const matchesSearch =
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
        const matchesMode = selectedMode === 'all' || event.mode === selectedMode;
        return matchesSearch && matchesCategory && matchesMode;
      }),
    [events, searchQuery, selectedCategory, selectedMode],
  );

  const handleRegister = async (event: Event) => {
    setRegisteringId(event.id);
    try {
      const { data } = await api.post(`/events/${event.id}/register`);
      setEvents((current) => current.map((item) => (item.id === event.id ? data.event : item)));
      setConfirmation({
        ...data.confirmation,
        paymentId: data.payment?._id,
      });
      toast.success('Registration successful');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setRegisteringId(null);
    }
  };

  const handleShare = async (event: Event) => {
    const url = `${window.location.origin}/student/events?event=${event.id}`;
    await navigator.clipboard.writeText(url);
    toast.success('Event link copied');
  };

  const openTeamModal = (event: Event) => {
    if (event.category !== 'hackathon') {
      toast.error('Teams are available for hackathon events only');
      return;
    }
    setTeamEvent(event);
    setTeamForm((current) => ({
      ...current,
      maxTeamSize: event.maxTeamSize || 4,
    }));
  };

  const createTeam = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!teamEvent) return;
    try {
      const { data } = await api.post('/team/create', {
        name: teamForm.name,
        logo: teamForm.logo,
        maxTeamSize: teamForm.maxTeamSize,
        projectTitle: teamForm.projectTitle,
        hackathonId: teamEvent.id,
      });
      toast.success(`Team created. Invite code: ${data.team.joinCode}`);
      navigate('/student/teams');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Unable to create team');
    }
  };

  const joinTeam = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const { data } = await api.post('/team/join', {
        joinCode: teamForm.joinCode,
        teamId: teamForm.teamId,
        leaderEmail: teamForm.leaderEmail,
        invitationToken: teamForm.invitationToken,
        message: teamForm.message,
      });
      toast.success(data.message || 'Join request sent');
      navigate('/student/teams');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Unable to join team');
    }
  };

  const list = (title: string, values?: string[]) =>
    values && values.length > 0 ? (
      <div>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h4>
        <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-1">
          {values.map((value) => (
            <li key={value}>{value}</li>
          ))}
        </ul>
      </div>
    ) : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Events</h1>
          <p className="text-gray-600 dark:text-gray-400">Live events from MongoDB</p>
        </div>

        <Card className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                    selectedCategory === category.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {['all', 'online', 'offline', 'hybrid'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSelectedMode(mode as typeof selectedMode)}
                  className={`px-3 py-2 rounded-lg capitalize ${
                    selectedMode === mode
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {loading ? (
          <Card className="text-center py-12">Loading events...</Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event, index) => {
              const full = Boolean(event.maxParticipants && event.currentParticipants >= event.maxParticipants);
              const seats = event.maxParticipants
                ? Math.max(event.maxParticipants - event.currentParticipants, 0)
                : null;
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Card hover className="h-full flex flex-col overflow-hidden">
                    <button onClick={() => setSelectedEvent(event)} className="text-left">
                      <div className="relative h-44 overflow-hidden rounded-t-lg -m-6 mb-4 bg-gray-200">
                        {event.banner ? (
                          <img src={event.banner} alt={event.title} className="w-full h-full object-cover" />
                        ) : null}
                        <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium bg-blue-600 text-white">
                          {event.category}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{event.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{event.description}</p>
                    </button>

                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatDate(event.startDate)}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {event.venue || 'Online'} - {event.mode}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {event.currentParticipants}/{event.maxParticipants || 'Unlimited'} registered
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        {event.isFree ? 'Free' : formatCurrency(event.fee)}
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Seats available: {seats === null ? 'Unlimited' : seats}
                    </p>

                    <div className="grid grid-cols-2 gap-2 mt-auto">
                      <Button onClick={() => setSelectedEvent(event)} variant="outline" size="sm">
                        Details
                      </Button>
                      <Button
                        onClick={() => handleRegister(event)}
                        disabled={full}
                        isLoading={registeringId === event.id}
                        size="sm"
                      >
                        {full ? 'Full' : 'Register'}
                      </Button>
                      <Button onClick={() => handleShare(event)} variant="ghost" size="sm">
                        <Share2 className="w-4 h-4 mr-1" /> Share
                      </Button>
                      {event.brochureUrl ? (
                        <Button onClick={() => window.open(event.brochureUrl, '_blank')} variant="ghost" size="sm">
                          <Download className="w-4 h-4 mr-1" /> Brochure
                        </Button>
                      ) : null}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {!loading && filteredEvents.length === 0 ? (
          <Card className="text-center py-12 mt-6">
            <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No events found</h3>
            <p className="text-gray-600 dark:text-gray-400">Create events from the admin dashboard.</p>
          </Card>
        ) : null}
      </div>

      {selectedEvent ? (
        <div className="fixed inset-0 z-50 bg-black/60 p-4 overflow-y-auto" onClick={() => setSelectedEvent(null)}>
          <div
            className="max-w-5xl mx-auto bg-white dark:bg-gray-900 rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedEvent.banner ? (
              <img src={selectedEvent.banner} alt={selectedEvent.title} className="w-full h-64 object-cover" />
            ) : null}
            <div className="p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{selectedEvent.title}</h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">{selectedEvent.description}</p>
                </div>
                <Button onClick={() => handleRegister(selectedEvent)} isLoading={registeringId === selectedEvent.id}>
                  Register Now
                </Button>
              </div>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <Card>Venue: {selectedEvent.venue || 'Online'}</Card>
                <Card>Schedule: {formatDate(selectedEvent.startDate)} to {formatDate(selectedEvent.endDate)}</Card>
                <Card>Status: {selectedEvent.status}</Card>
                <Card>Category: {selectedEvent.category}</Card>
                <Card>Registrations: {selectedEvent.currentParticipants}</Card>
                <Card>Seats: {selectedEvent.seatsAvailable ?? 'Unlimited'}</Card>
                <Card>Team size: {selectedEvent.minTeamSize || 1}-{selectedEvent.maxTeamSize || 1}</Card>
                <Card>Deadline: {formatDate(selectedEvent.submissionDeadline || selectedEvent.registrationDeadline)}</Card>
                <Card>Payment: {selectedEvent.isFree ? 'Free' : formatCurrency(selectedEvent.fee)}</Card>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {list('Rules', selectedEvent.rules)}
                {list('Speakers', selectedEvent.speakers)}
                {list('Sponsors', selectedEvent.sponsors)}
                {list('Prizes', selectedEvent.prizes)}
                {list('Mentors', selectedEvent.mentors)}
                {list('Jury Members', selectedEvent.juryMembers)}
                {list('Problem Statements', selectedEvent.problemStatements)}
              </div>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => handleRegister(selectedEvent)}>Register Now</Button>
                <Button variant="outline" onClick={() => openTeamModal(selectedEvent)}>
                  Join Team
                </Button>
                <Button variant="ghost" onClick={() => handleShare(selectedEvent)}>
                  <Copy className="w-4 h-4 mr-2" /> Share Event
                </Button>
                {selectedEvent.brochureUrl ? (
                  <Button variant="ghost" onClick={() => window.open(selectedEvent.brochureUrl, '_blank')}>
                    Download Brochure
                  </Button>
                ) : null}
                <Button variant="ghost" onClick={() => setSelectedEvent(null)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {confirmation ? (
        <div className="fixed inset-0 z-50 bg-black/60 p-4 flex items-center justify-center">
          <Card className="max-w-xl w-full">
            <div className="flex items-center gap-3 mb-4">
              <QrCode className="w-8 h-8 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Registration Successful</h2>
            </div>
            <div className="grid md:grid-cols-[160px_1fr] gap-5">
              <div className="bg-white p-3 rounded-lg">
                <QRCode value={confirmation.registrationId} size={136} />
              </div>
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <p><strong>Student:</strong> {confirmation.studentName}</p>
                <p><strong>Event:</strong> {confirmation.eventName}</p>
                <p><strong>Registration ID:</strong> {confirmation.registrationId}</p>
                <p><strong>Date:</strong> {formatDate(confirmation.eventDate)}</p>
                <p><strong>Venue:</strong> {confirmation.venue || 'Online'}</p>
                <p><strong>Payment:</strong> {confirmation.paymentStatus}</p>
                <p><strong>Email:</strong> {confirmation.emailSent ? 'Sent' : 'Not configured'}</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              {confirmation.paymentStatus === 'pending' && confirmation.paymentId ? (
                <Button onClick={() => navigate(`/student/payments/${confirmation.paymentId}`)}>
                  Pay Now
                </Button>
              ) : null}
              <Button variant="outline" onClick={() => navigate('/student/dashboard')}>
                Dashboard
              </Button>
              <Button variant="ghost" onClick={() => setConfirmation(null)}>
                Close
              </Button>
            </div>
          </Card>
        </div>
      ) : null}

      {teamEvent ? (
        <div className="fixed inset-0 z-50 bg-black/70 p-4 flex items-center justify-center" onClick={() => setTeamEvent(null)}>
          <Card className="max-w-2xl w-full bg-slate-950 border border-white/10 text-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-cyan-300 text-sm font-medium">Hackathon Team</p>
                <h2 className="text-2xl font-bold">{teamEvent.title}</h2>
              </div>
              <Button variant="ghost" onClick={() => setTeamEvent(null)}>Close</Button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button className={`p-3 rounded-xl ${teamMode === 'create' ? 'bg-cyan-500 text-white' : 'bg-white/10'}`} onClick={() => setTeamMode('create')}>
                Create Team
              </button>
              <button className={`p-3 rounded-xl ${teamMode === 'join' ? 'bg-fuchsia-500 text-white' : 'bg-white/10'}`} onClick={() => setTeamMode('join')}>
                Join Existing Team
              </button>
            </div>
            {teamMode === 'create' ? (
              <form onSubmit={createTeam} className="space-y-4">
                <Input label="Team Name" value={teamForm.name} onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })} required />
                <Input label="Team Logo URL" value={teamForm.logo} onChange={(e) => setTeamForm({ ...teamForm, logo: e.target.value })} />
                <Input label="Project Title" value={teamForm.projectTitle} onChange={(e) => setTeamForm({ ...teamForm, projectTitle: e.target.value })} />
                <Input label="Max Team Size" type="number" value={teamForm.maxTeamSize} onChange={(e) => setTeamForm({ ...teamForm, maxTeamSize: Number(e.target.value) })} />
                <Button type="submit" className="w-full">Create Team</Button>
              </form>
            ) : (
              <form onSubmit={joinTeam} className="space-y-4">
                <Input label="Team Invite Code" value={teamForm.joinCode} onChange={(e) => setTeamForm({ ...teamForm, joinCode: e.target.value })} />
                <Input label="Team ID" value={teamForm.teamId} onChange={(e) => setTeamForm({ ...teamForm, teamId: e.target.value })} />
                <Input label="Team Leader Email" value={teamForm.leaderEmail} onChange={(e) => setTeamForm({ ...teamForm, leaderEmail: e.target.value })} />
                <Input label="Invitation Token" value={teamForm.invitationToken} onChange={(e) => setTeamForm({ ...teamForm, invitationToken: e.target.value })} />
                <Input label="Message to Leader" value={teamForm.message} onChange={(e) => setTeamForm({ ...teamForm, message: e.target.value })} />
                <Button type="submit" className="w-full">Send Join Request</Button>
              </form>
            )}
          </Card>
        </div>
      ) : null}
    </div>
  );
};

export default Events;
