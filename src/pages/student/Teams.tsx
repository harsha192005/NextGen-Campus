import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  Bot,
  Crown,
  Lock,
  LogOut,
  MessageSquare,
  Plus,
  Send,
  ShieldCheck,
  Upload,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import api from '../../lib/api';
import { getSocket } from '../../lib/socket';
import { useAuthStore } from '../../store/authStore';

const Teams = () => {
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const [teams, setTeams] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [selectedTeamData, setSelectedTeamData] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [createForm, setCreateForm] = useState({ name: '', hackathonId: '', logo: '', maxTeamSize: 4, projectTitle: '' });
  const [joinForm, setJoinForm] = useState({ joinCode: '', teamId: '', leaderEmail: '', invitationToken: searchParams.get('invite') || '', message: '' });
  const [inviteEmail, setInviteEmail] = useState('');
  const [chatText, setChatText] = useState('');
  const [submission, setSubmission] = useState({ projectTitle: '', description: '', githubUrl: '', demoUrl: '', pptUrl: '', fileUrl: '' });
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const selectedTeam = selectedTeamData?.team;
  const isLeader = selectedTeam?.leaderId?._id === user?.id || selectedTeam?.leaderId?.id === user?.id;

  const loadTeams = async () => {
    setLoading(true);
    try {
      const [teamsResponse, eventsResponse] = await Promise.all([api.get('/team/mine'), api.get('/events')]);
      setTeams(teamsResponse.data.teams || []);
      setRequests(teamsResponse.data.requests || []);
      setInvites(teamsResponse.data.invites || []);
      const eventItems = (eventsResponse.data.events || []).filter((event: any) => event.category === 'hackathon');
      setHackathons(eventItems);
      if (!createForm.hackathonId && eventItems[0]) {
        setCreateForm((current) => ({ ...current, hackathonId: eventItems[0].id }));
      }
      if (!selectedTeamId && teamsResponse.data.teams?.[0]) {
        setSelectedTeamId(teamsResponse.data.teams[0]._id);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Unable to load teams');
    } finally {
      setLoading(false);
    }
  };

  const loadTeamDetails = async (teamId: string) => {
    if (!teamId) return;
    const [teamResponse, analyticsResponse] = await Promise.all([
      api.get(`/team/${teamId}`),
      api.get(`/team/${teamId}/analytics`),
    ]);
    setSelectedTeamData(teamResponse.data);
    setAnalytics(analyticsResponse.data.analytics);
    getSocket().emit('team:join', teamId);
  };

  useEffect(() => {
    loadTeams();
  }, []);

  useEffect(() => {
    if (selectedTeamId) loadTeamDetails(selectedTeamId);
  }, [selectedTeamId]);

  useEffect(() => {
    const socket = getSocket();
    const refresh = () => {
      loadTeams();
      if (selectedTeamId) loadTeamDetails(selectedTeamId);
    };
    socket.on('team:updated', refresh);
    socket.on('team:join-request', refresh);
    socket.on('team:message', refresh);
    socket.on('team:submission', refresh);
    return () => {
      socket.off('team:updated', refresh);
      socket.off('team:join-request', refresh);
      socket.off('team:message', refresh);
      socket.off('team:submission', refresh);
    };
  }, [selectedTeamId]);

  const createTeam = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const { data } = await api.post('/team/create', createForm);
      toast.success(`Team created. Invite code: ${data.team.joinCode}`);
      setSelectedTeamId(data.team._id);
      await loadTeams();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Unable to create team');
    }
  };

  const joinTeam = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const { data } = await api.post('/team/join', joinForm);
      toast.success(data.message || 'Join request sent');
      await loadTeams();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Unable to join team');
    }
  };

  const inviteMember = async () => {
    if (!selectedTeam || !inviteEmail) return;
    const { data } = await api.post(`/team/${selectedTeam._id}/invite`, { email: inviteEmail });
    await navigator.clipboard.writeText(data.invitationLink);
    toast.success('Invitation created and link copied');
    setInviteEmail('');
  };

  const approve = async (id: string) => {
    await api.post(`/team/requests/${id}/accept`);
    toast.success('Request accepted');
    await loadTeamDetails(selectedTeamId);
  };

  const reject = async (id: string) => {
    await api.post(`/team/requests/${id}/reject`);
    toast.success('Request rejected');
    await loadTeamDetails(selectedTeamId);
  };

  const sendMessage = async () => {
    if (!chatText.trim()) return;
    await api.post(`/team/${selectedTeam._id}/messages`, { content: chatText });
    setChatText('');
    await loadTeamDetails(selectedTeamId);
  };

  const submitProject = async (event: React.FormEvent) => {
    event.preventDefault();
    await api.post(`/team/${selectedTeam._id}/submission`, submission);
    toast.success('Submission saved');
    await loadTeamDetails(selectedTeamId);
  };

  const updateTeam = async (patch: any) => {
    await api.put(`/team/${selectedTeam._id}`, { ...selectedTeam, ...patch });
    toast.success('Team updated');
    await loadTeamDetails(selectedTeamId);
  };

  const loadRecommendations = async () => {
    const eventId = createForm.hackathonId || selectedTeam?.hackathonId?._id;
    if (!eventId) return;
    const { data } = await api.get(`/team/recommendations/${eventId}`);
    setRecommendations(data.recommendations || []);
  };

  const pendingRequests = useMemo(
    () => (selectedTeamData?.requests || []).filter((request: any) => request.status === 'pending'),
    [selectedTeamData],
  );

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-cyan-300 text-sm font-medium">Hackathon Team System</p>
            <h1 className="text-3xl font-bold">Team Management</h1>
            <p className="text-slate-300">Create, join, chat, submit, and manage teams with live MongoDB updates.</p>
          </div>
          <Button onClick={loadRecommendations} variant="secondary">
            <Bot className="w-4 h-4 mr-2" /> AI Team Recommendations
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="bg-white/10 border border-white/10 backdrop-blur-xl">
            <h2 className="text-xl font-bold text-white mb-4"><Plus className="inline w-5 h-5 mr-2" />Create Team</h2>
            <form onSubmit={createTeam} className="space-y-3">
              <Input label="Team Name" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} required />
              <select className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-white/20 text-white" value={createForm.hackathonId} onChange={(e) => setCreateForm({ ...createForm, hackathonId: e.target.value })}>
                {hackathons.map((event) => <option key={event.id} value={event.id}>{event.title}</option>)}
              </select>
              <Input label="Team Logo URL" value={createForm.logo} onChange={(e) => setCreateForm({ ...createForm, logo: e.target.value })} />
              <Input label="Project Title" value={createForm.projectTitle} onChange={(e) => setCreateForm({ ...createForm, projectTitle: e.target.value })} />
              <Input label="Max Team Size" type="number" value={createForm.maxTeamSize} onChange={(e) => setCreateForm({ ...createForm, maxTeamSize: Number(e.target.value) })} />
              <Button type="submit" className="w-full">Create Team</Button>
            </form>
          </Card>

          <Card className="bg-white/10 border border-white/10 backdrop-blur-xl">
            <h2 className="text-xl font-bold text-white mb-4"><Users className="inline w-5 h-5 mr-2" />Join Existing Team</h2>
            <form onSubmit={joinTeam} className="space-y-3">
              <Input label="Invite Code" value={joinForm.joinCode} onChange={(e) => setJoinForm({ ...joinForm, joinCode: e.target.value })} />
              <Input label="Team ID" value={joinForm.teamId} onChange={(e) => setJoinForm({ ...joinForm, teamId: e.target.value })} />
              <Input label="Team Leader Email" value={joinForm.leaderEmail} onChange={(e) => setJoinForm({ ...joinForm, leaderEmail: e.target.value })} />
              <Input label="Invitation Token" value={joinForm.invitationToken} onChange={(e) => setJoinForm({ ...joinForm, invitationToken: e.target.value })} />
              <Input label="Message to Leader" value={joinForm.message} onChange={(e) => setJoinForm({ ...joinForm, message: e.target.value })} />
              <Button type="submit" className="w-full">Send Join Request</Button>
            </form>
          </Card>
        </div>

        {recommendations.length ? (
          <Card className="bg-white/10 border border-white/10 backdrop-blur-xl">
            <h2 className="text-xl font-bold text-white mb-4">AI Recommendations</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {recommendations.map((item) => (
                <div key={item.team._id} className="p-4 rounded-xl bg-slate-900 border border-white/10">
                  <p className="font-bold">{item.team.name}</p>
                  <p className="text-cyan-300">{item.compatibilityScore}% compatibility</p>
                  <p className="text-sm text-slate-400">{item.reason}</p>
                </div>
              ))}
            </div>
          </Card>
        ) : null}

        <div className="grid lg:grid-cols-[320px_1fr] gap-6">
          <Card className="bg-white/10 border border-white/10 backdrop-blur-xl">
            <h2 className="text-xl font-bold text-white mb-4">My Teams</h2>
            {loading ? <div className="h-20 bg-white/10 rounded-lg animate-pulse" /> : null}
            <div className="space-y-3">
              {teams.map((team) => (
                <button
                  key={team._id}
                  onClick={() => setSelectedTeamId(team._id)}
                  className={`w-full text-left p-4 rounded-xl border ${selectedTeamId === team._id ? 'border-cyan-400 bg-cyan-400/10' : 'border-white/10 bg-slate-900'}`}
                >
                  <p className="font-bold">{team.name}</p>
                  <p className="text-xs text-slate-400">{team.teamId} - {team.members.length}/{team.maxTeamSize}</p>
                </button>
              ))}
              {!teams.length ? <p className="text-sm text-slate-400">No teams yet.</p> : null}
            </div>
            {invites.length ? (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Invitations</h3>
                {invites.map((invite) => <p key={invite._id} className="text-sm text-cyan-200">{invite.teamId?.name}</p>)}
              </div>
            ) : null}
            {requests.length ? (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">My Requests</h3>
                {requests.map((request) => <p key={request._id} className="text-sm text-slate-300">{request.teamId?.name}: {request.status}</p>)}
              </div>
            ) : null}
          </Card>

          {selectedTeam ? (
            <div className="space-y-6">
              <Card className="bg-white/10 border border-white/10 backdrop-blur-xl">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-fuchsia-500 overflow-hidden flex items-center justify-center">
                      {selectedTeam.logo ? <img src={selectedTeam.logo} className="w-full h-full object-cover" /> : <ShieldCheck className="w-8 h-8" />}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{selectedTeam.name}</h2>
                      <p className="text-slate-300">Team ID: {selectedTeam.teamId} | Invite Code: {selectedTeam.joinCode}</p>
                      <p className="text-sm text-cyan-200">Event: {selectedTeam.hackathonId?.title}</p>
                    </div>
                  </div>
                  {isLeader ? (
                    <Button variant={selectedTeam.isLocked ? 'secondary' : 'outline'} onClick={() => updateTeam({ isLocked: !selectedTeam.isLocked })}>
                      <Lock className="w-4 h-4 mr-2" /> {selectedTeam.isLocked ? 'Unlock Joining' : 'Lock Joining'}
                    </Button>
                  ) : (
                    <Button variant="danger" onClick={() => api.post(`/team/${selectedTeam._id}/leave`).then(loadTeams)}>
                      <LogOut className="w-4 h-4 mr-2" /> Leave Team
                    </Button>
                  )}
                </div>
              </Card>

              <div className="grid md:grid-cols-4 gap-4">
                {[
                  ['Progress', `${analytics?.progress || 0}%`],
                  ['Members', `${selectedTeam.members.length}/${selectedTeam.maxTeamSize}`],
                  ['Compatibility', `${analytics?.compatibilityScore || 0}%`],
                  ['Status', analytics?.availability || 'open'],
                ].map(([label, value]) => (
                  <Card key={label} className="bg-white/10 border border-white/10">
                    <p className="text-sm text-slate-400">{label}</p>
                    <h3 className="text-2xl font-bold">{value}</h3>
                  </Card>
                ))}
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="bg-white/10 border border-white/10 backdrop-blur-xl">
                  <h3 className="text-xl font-bold mb-4">Members</h3>
                  <div className="space-y-3">
                    {selectedTeam.members.map((member: any) => (
                      <motion.div key={member.userId._id} whileHover={{ x: 4 }} className="flex items-center justify-between p-3 rounded-xl bg-slate-900">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-fuchsia-500 flex items-center justify-center font-bold">
                            {member.userId.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold">{member.userId.name} {member.role === 'leader' ? <Crown className="inline w-4 h-4 text-yellow-300" /> : null}</p>
                            <p className="text-xs text-slate-400">{member.userId.email} - {member.role} - {member.status}</p>
                          </div>
                        </div>
                        {isLeader && member.role !== 'leader' ? (
                          <div className="flex gap-2">
                            <select className="bg-slate-800 rounded px-2 text-sm" value={member.role} onChange={(e) => api.put(`/team/${selectedTeam._id}/members/${member.userId._id}/role`, { role: e.target.value }).then(() => loadTeamDetails(selectedTeamId))}>
                              {['member', 'developer', 'designer', 'presenter'].map((role) => <option key={role}>{role}</option>)}
                            </select>
                            <Button size="sm" variant="danger" onClick={() => api.delete(`/team/${selectedTeam._id}/members/${member.userId._id}`).then(() => loadTeamDetails(selectedTeamId))}>Remove</Button>
                          </div>
                        ) : null}
                      </motion.div>
                    ))}
                  </div>
                </Card>

                <Card className="bg-white/10 border border-white/10 backdrop-blur-xl">
                  <h3 className="text-xl font-bold mb-4">Leader Controls</h3>
                  {isLeader ? (
                    <div className="space-y-4">
                      <div className="grid sm:grid-cols-[1fr_auto] gap-3">
                        <Input label="Invite student email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
                        <Button className="self-end" onClick={inviteMember}>Invite</Button>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Pending Requests</h4>
                        {pendingRequests.map((request: any) => (
                          <div key={request._id} className="flex items-center justify-between p-3 rounded-xl bg-slate-900 mb-2">
                            <div>
                              <p>{request.studentId?.name}</p>
                              <p className="text-xs text-slate-400">{request.studentId?.email}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => approve(request._id)}>Accept</Button>
                              <Button size="sm" variant="danger" onClick={() => reject(request._id)}>Reject</Button>
                            </div>
                          </div>
                        ))}
                        {!pendingRequests.length ? <p className="text-sm text-slate-400">No pending requests.</p> : null}
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-400">Only the team leader can manage requests, invites, roles, and team locking.</p>
                  )}
                </Card>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="bg-white/10 border border-white/10 backdrop-blur-xl">
                  <h3 className="text-xl font-bold mb-4"><MessageSquare className="inline w-5 h-5 mr-2" />Team Chat</h3>
                  <div className="h-72 overflow-y-auto space-y-3 p-3 rounded-xl bg-slate-900 mb-3">
                    {(selectedTeamData.messages || []).map((message: any) => (
                      <div key={message._id} className="p-3 rounded-xl bg-white/10">
                        <p className="text-sm text-cyan-200">{message.senderId?.name}</p>
                        <p>{message.content}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-[1fr_auto] gap-3">
                    <Input value={chatText} onChange={(e) => setChatText(e.target.value)} placeholder="Message, announcement, file URL, emoji..." onKeyDown={() => getSocket().emit('team:typing', { teamId: selectedTeam._id, userName: user?.name })} />
                    <Button onClick={sendMessage}><Send className="w-4 h-4" /></Button>
                  </div>
                </Card>

                <Card className="bg-white/10 border border-white/10 backdrop-blur-xl">
                  <h3 className="text-xl font-bold mb-4"><Upload className="inline w-5 h-5 mr-2" />Hackathon Submission</h3>
                  <form onSubmit={submitProject} className="space-y-3">
                    <Input label="Project Title" value={submission.projectTitle} onChange={(e) => setSubmission({ ...submission, projectTitle: e.target.value })} required />
                    <Input label="GitHub Repository" value={submission.githubUrl} onChange={(e) => setSubmission({ ...submission, githubUrl: e.target.value })} />
                    <Input label="Live Demo Link" value={submission.demoUrl} onChange={(e) => setSubmission({ ...submission, demoUrl: e.target.value })} />
                    <Input label="PPT URL" value={submission.pptUrl} onChange={(e) => setSubmission({ ...submission, pptUrl: e.target.value })} />
                    <Input label="Project File/Image URL" value={submission.fileUrl} onChange={(e) => setSubmission({ ...submission, fileUrl: e.target.value })} />
                    <textarea className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-white/20 text-white" placeholder="Description" value={submission.description} onChange={(e) => setSubmission({ ...submission, description: e.target.value })} />
                    <Button type="submit" className="w-full">Submit Project</Button>
                  </form>
                </Card>
              </div>

              <Card className="bg-white/10 border border-white/10 backdrop-blur-xl">
                <h3 className="text-xl font-bold mb-4"><Bell className="inline w-5 h-5 mr-2" />Activity Feed</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {(selectedTeam.activityFeed || []).slice().reverse().map((item: string, index: number) => (
                    <div key={`${item}-${index}`} className="p-3 rounded-xl bg-slate-900 text-sm text-slate-300">{item}</div>
                  ))}
                </div>
              </Card>
            </div>
          ) : (
            <Card className="bg-white/10 border border-white/10 backdrop-blur-xl">
              <p className="text-slate-300">Create or join a team to open the team dashboard.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Teams;
