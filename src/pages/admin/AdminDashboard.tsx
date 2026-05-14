import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Award, Bell, Calendar, Download, FileText, RefreshCw, Trash2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import api from '../../lib/api';
import { formatCurrency, formatDate } from '../../lib/format';

const emptyEvent = {
  title: '',
  description: '',
  category: 'technical',
  banner: '',
  venue: '',
  mode: 'offline',
  startDate: '',
  endDate: '',
  registrationDeadline: '',
  maxParticipants: 100,
  fee: 0,
  tags: '',
};

const AdminDashboard = () => {
  const location = useLocation();
  const section = location.pathname.split('/').pop() || 'dashboard';
  const [analytics, setAnalytics] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [eventForm, setEventForm] = useState<any>(emptyEvent);
  const [studentForm, setStudentForm] = useState({ name: '', email: '', password: 'Student@123', department: '', year: 1, phone: '' });
  const [adminForm, setAdminForm] = useState({ name: '', email: '', password: 'Admin@123', adminRole: 'moderator', permissions: '' });
  const [notificationForm, setNotificationForm] = useState({ title: '', message: '', audience: 'all', type: 'announcement' });
  const [certificateForm, setCertificateForm] = useState({ userId: '', eventId: '' });
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    setLoading(true);
    try {
      const requests = [
        ['analytics', api.get('/admin/analytics')],
        ['events', api.get('/admin/events')],
        ['students', api.get('/admin/students')],
        ['admins', api.get('/admin/admins')],
        ['teams', api.get('/admin/teams')],
        ['payments', api.get('/admin/payments')],
        ['certificates', api.get('/admin/certificates')],
        ['notifications', api.get('/admin/notifications')],
        ['reports', api.get('/admin/reports')],
        ['logs', api.get('/admin/logs')],
      ] as const;

      const results = await Promise.allSettled(requests.map(([, request]) => request));

      results.forEach((result, index) => {
        const moduleName = requests[index][0];
        if (result.status === 'rejected') {
          const message = result.reason?.response?.data?.message || result.reason?.message || 'Request failed';
          toast.error(`${moduleName} failed: ${message}`);
          return;
        }

        const data = result.value.data;
        if (moduleName === 'analytics') setAnalytics(data.analytics);
        if (moduleName === 'events') setEvents(data.events || []);
        if (moduleName === 'students') setStudents(data.students || []);
        if (moduleName === 'admins') setAdmins(data.admins || []);
        if (moduleName === 'teams') setTeams(data.teams || []);
        if (moduleName === 'payments') setPayments(data.payments || []);
        if (moduleName === 'certificates') setCertificates(data.certificates || []);
        if (moduleName === 'notifications') setNotifications(data.notifications || []);
        if (moduleName === 'reports') setReports(data.reports || []);
        if (moduleName === 'logs') setLogs(data.logs || []);
      });

      if (results.every((result) => result.status === 'rejected')) {
        toast.error('Admin data could not be loaded. Please log in again as an admin.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const downloadBlob = async (url: string, filename: string) => {
    const response = await api.get(url, { responseType: 'blob' });
    const objectUrl = URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(objectUrl);
  };

  const downloadPdf = (title: string, rows: string[]) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(title, 14, 18);
    let y = 32;
    rows.forEach((row) => {
      doc.setFontSize(10);
      doc.text(row.slice(0, 100), 14, y);
      y += 8;
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
    });
    doc.save(`${title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
  };

  const saveEvent = async (event: React.FormEvent) => {
    event.preventDefault();
    await api.post('/events', {
      ...eventForm,
      maxParticipants: Number(eventForm.maxParticipants),
      fee: Number(eventForm.fee),
      isFree: Number(eventForm.fee) <= 0,
      tags: String(eventForm.tags).split(',').map((tag) => tag.trim()).filter(Boolean),
    });
    toast.success('Event created');
    setEventForm(emptyEvent);
    loadAll();
  };

  const eventAction = async (id: string, action: string) => {
    await api.post(`/admin/events/${id}/${action}`);
    toast.success(action.replace('-', ' '));
    loadAll();
  };

  const duplicateEvent = async (id: string) => {
    await api.post(`/admin/events/${id}/duplicate`);
    toast.success('Event duplicated');
    loadAll();
  };

  const deleteEvent = async (id: string) => {
    if (!confirm('Delete event?')) return;
    await api.delete(`/events/${id}`);
    toast.success('Event deleted');
    loadAll();
  };

  const createStudent = async (event: React.FormEvent) => {
    event.preventDefault();
    await api.post('/admin/students', studentForm);
    toast.success('Student added');
    setStudentForm({ name: '', email: '', password: 'Student@123', department: '', year: 1, phone: '' });
    loadAll();
  };

  const createAdmin = async (event: React.FormEvent) => {
    event.preventDefault();
    await api.post('/admin/admins', {
      ...adminForm,
      role: 'admin',
      permissions: adminForm.permissions.split(',').map((item) => item.trim()).filter(Boolean),
    });
    toast.success('Admin added');
    loadAll();
  };

  const sendNotification = async (event: React.FormEvent) => {
    event.preventDefault();
    await api.post('/admin/notifications', notificationForm);
    toast.success('Notification sent');
    setNotificationForm({ title: '', message: '', audience: 'all', type: 'announcement' });
    loadAll();
  };

  const generateCertificate = async () => {
    if (!certificateForm.userId || !certificateForm.eventId) {
      toast.error('Select both student and event');
      return;
    }

    try {
      const { data } = await api.post('/admin/certificate/generate', certificateForm);
      toast.success(data.existing ? 'Certificate already exists' : 'Certificate generated');
      setCertificateForm({ userId: '', eventId: '' });
      loadAll();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Certificate generation failed');
    }
  };

  const revokeCertificate = async (id: string) => {
    try {
      await api.post(`/admin/certificates/${id}/revoke`);
      toast.success('Certificate revoked');
      loadAll();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Certificate revoke failed');
    }
  };

  const statCards = [
    ['Students', analytics?.totalStudents || 0, Users],
    ['Events', analytics?.totalEvents || 0, Calendar],
    ['Registrations', analytics?.totalRegistrations || 0, FileText],
    ['Certificates', analytics?.totalCertificates || 0, Award],
  ];

  const pageTitle = useMemo(() => {
    const names: Record<string, string> = {
      dashboard: 'Admin Home',
      events: 'Event Management',
      students: 'Student Management',
      admins: 'Admin Management',
      teams: 'Team Management',
      payments: 'Payment Dashboard',
      certificates: 'Certificate Generator',
      notifications: 'Notifications Center',
      analytics: 'Analytics Dashboard',
      reports: 'Reports Dashboard',
      settings: 'Settings',
      profile: 'Profile',
      registrations: 'Registrations',
    };
    return names[section] || 'Admin Dashboard';
  }, [section]);

  const renderHome = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        {statCards.map(([label, value, Icon]: any) => (
          <Card key={label} className="bg-white/10 border border-white/10 backdrop-blur-xl">
            <Icon className="w-7 h-7 text-cyan-300 mb-3" />
            <p className="text-sm text-slate-300">{label}</p>
            <h3 className="text-3xl font-bold text-white">{value}</h3>
          </Card>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-white/10 border border-white/10">
          <h2 className="text-xl font-bold text-white mb-4">Department Participation</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={analytics?.departmentWiseData || []}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="department" stroke="#cbd5e1" />
              <YAxis stroke="#cbd5e1" />
              <Tooltip />
              <Bar dataKey="count" fill="#06b6d4" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="bg-white/10 border border-white/10">
          <h2 className="text-xl font-bold text-white mb-4">Event Categories</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={analytics?.categoryData || []} dataKey="value" nameKey="name" outerRadius={90} label>
                {(analytics?.categoryData || []).map((item: any, index: number) => (
                  <Cell key={item.name} fill={['#06b6d4', '#a855f7', '#f59e0b', '#22c55e'][index % 4]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
      <Card className="bg-white/10 border border-white/10">
        <h2 className="text-xl font-bold text-white mb-4">Admin Activity Logs</h2>
        <div className="space-y-2">
          {logs.slice(0, 8).map((log) => (
            <div key={log._id} className="p-3 rounded-lg bg-slate-900 text-sm text-slate-300">
              {log.adminId?.name} performed {log.action} in {log.module} - {formatDate(log.createdAt)}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderEvents = () => (
    <div className="space-y-6">
      <Card className="bg-white/10 border border-white/10">
        <h2 className="text-xl font-bold text-white mb-4">Create Event</h2>
        <form onSubmit={saveEvent} className="grid md:grid-cols-2 gap-3">
          <Input label="Title" value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} required />
          <Input label="Venue" value={eventForm.venue} onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })} />
          <Input label="Start" type="datetime-local" value={eventForm.startDate} onChange={(e) => setEventForm({ ...eventForm, startDate: e.target.value })} required />
          <Input label="End" type="datetime-local" value={eventForm.endDate} onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value })} required />
          <Input label="Max Participants" type="number" value={eventForm.maxParticipants} onChange={(e) => setEventForm({ ...eventForm, maxParticipants: e.target.value })} />
          <Input label="Fee" type="number" value={eventForm.fee} onChange={(e) => setEventForm({ ...eventForm, fee: e.target.value })} />
          <textarea className="md:col-span-2 px-4 py-3 rounded-lg bg-slate-900 border border-white/20 text-white" placeholder="Description" value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} required />
          <Button type="submit">Create Event</Button>
        </form>
      </Card>
      <AdminTable
        headers={['Event', 'Status', 'Registrations', 'Actions']}
        rows={events.map((event) => [
          event.title,
          event.status,
          `${event.currentParticipants}/${event.maxParticipants || 'Unlimited'}`,
          <div className="flex flex-wrap gap-2" key={event.id}>
            <Button size="sm" onClick={() => eventAction(event.id, 'publish')}>Publish</Button>
            <Button size="sm" variant="outline" onClick={() => eventAction(event.id, 'unpublish')}>Unpublish</Button>
            <Button size="sm" variant="danger" onClick={() => eventAction(event.id, 'cancel')}>Cancel</Button>
            <Button size="sm" onClick={() => duplicateEvent(event.id)}>Duplicate</Button>
            <Button size="sm" onClick={() => eventAction(event.id, 'close-registration')}>Close Reg</Button>
            <Button size="sm" onClick={() => eventAction(event.id, 'open-registration')}>Open Reg</Button>
            <Button size="sm" onClick={() => eventAction(event.id, 'feature')}>Feature</Button>
            <Button size="sm" onClick={() => api.get(`/admin/events/${event.id}/report`).then(() => toast.success('Report generated'))}>Analytics</Button>
            <Button size="sm" variant="danger" onClick={() => deleteEvent(event.id)}><Trash2 className="w-4 h-4" /></Button>
          </div>,
        ])}
      />
    </div>
  );

  const renderStudents = () => (
    <div className="space-y-6">
      <Card className="bg-white/10 border border-white/10">
        <h2 className="text-xl font-bold text-white mb-4">Add Student</h2>
        <form onSubmit={createStudent} className="grid md:grid-cols-3 gap-3">
          {(['name', 'email', 'password', 'department', 'phone'] as const).map((key) => (
            <Input key={key} label={key} value={studentForm[key]} onChange={(e) => setStudentForm({ ...studentForm, [key]: e.target.value })} required={key !== 'phone'} />
          ))}
          <Input label="Year" type="number" value={studentForm.year} onChange={(e) => setStudentForm({ ...studentForm, year: Number(e.target.value) })} />
          <Button type="submit">Add Student</Button>
          <Button type="button" onClick={() => downloadBlob('/admin/export/students.csv', 'students.csv')}><Download className="w-4 h-4 mr-2" />Export</Button>
        </form>
      </Card>
      <AdminTable
        headers={['Student', 'Department', 'Status', 'Actions']}
        rows={students.map((student) => [
          `${student.name} (${student.email})`,
          student.department || '-',
          student.status,
          <div className="flex flex-wrap gap-2" key={student.id}>
            <Button size="sm" onClick={() => toast(JSON.stringify(student, null, 2))}>Profile</Button>
            <Button size="sm" onClick={() => api.post(`/admin/students/${student.id}/status`, { status: 'active' }).then(loadAll)}>Activate</Button>
            <Button size="sm" variant="outline" onClick={() => api.post(`/admin/students/${student.id}/status`, { status: 'suspended' }).then(loadAll)}>Suspend</Button>
            <Button size="sm" onClick={() => api.post(`/admin/students/${student.id}/reset-password`).then((r) => toast.success(`Password: ${r.data.temporaryPassword}`))}>Reset Password</Button>
            <Button size="sm" variant="danger" onClick={() => api.delete(`/admin/students/${student.id}`).then(loadAll)}>Delete</Button>
          </div>,
        ])}
      />
    </div>
  );

  const renderAdmins = () => (
    <div className="space-y-6">
      <Card className="bg-white/10 border border-white/10">
        <h2 className="text-xl font-bold text-white mb-4">Add Admin</h2>
        <form onSubmit={createAdmin} className="grid md:grid-cols-3 gap-3">
          <Input label="Name" value={adminForm.name} onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })} required />
          <Input label="Email" value={adminForm.email} onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })} required />
          <Input label="Password" value={adminForm.password} onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })} required />
          <select className="px-4 py-2.5 rounded-lg bg-slate-900 border border-white/20 text-white" value={adminForm.adminRole} onChange={(e) => setAdminForm({ ...adminForm, adminRole: e.target.value })}>
            {['super_admin', 'event_admin', 'finance_admin', 'attendance_admin', 'moderator'].map((role) => <option key={role}>{role}</option>)}
          </select>
          <Input label="Permissions comma separated" value={adminForm.permissions} onChange={(e) => setAdminForm({ ...adminForm, permissions: e.target.value })} />
          <Button type="submit">Add Admin</Button>
        </form>
      </Card>
      <AdminTable
        headers={['Admin', 'Role', 'Status', 'Actions']}
        rows={admins.map((admin) => [
          `${admin.name} (${admin.email})`,
          admin.adminRole || admin.role,
          admin.status,
          <div className="flex flex-wrap gap-2" key={admin.id}>
            <Button size="sm" onClick={() => api.put(`/admin/admins/${admin.id}/role`, { role: 'admin', adminRole: 'super_admin', permissions: ['*'], status: 'active' }).then(loadAll)}>Super Admin</Button>
            <Button size="sm" onClick={() => api.put(`/admin/admins/${admin.id}/role`, { role: 'admin', adminRole: 'moderator', permissions: ['moderate'], status: 'active' }).then(loadAll)}>Moderator</Button>
            <Button size="sm" variant="outline" onClick={() => api.put(`/admin/admins/${admin.id}/role`, { status: 'blocked' }).then(loadAll)}>Block</Button>
            <Button size="sm" variant="danger" onClick={() => api.delete(`/admin/admins/${admin.id}`).then(loadAll)}>Remove</Button>
          </div>,
        ])}
      />
    </div>
  );

  const renderTeams = () => (
    <AdminTable
      headers={['Team', 'Event', 'Members', 'Actions']}
      rows={teams.map((team) => [
        `${team.name} (${team.teamId})`,
        team.hackathonId?.title || '-',
        `${team.members?.length || 0}/${team.maxTeamSize}`,
        <div className="flex flex-wrap gap-2" key={team._id}>
          <Button size="sm" onClick={() => api.put(`/admin/teams/${team._id}`, { isLocked: !team.isLocked }).then(loadAll)}>{team.isLocked ? 'Unlock' : 'Lock'}</Button>
          <Button size="sm" onClick={() => toast(JSON.stringify(team.submission || 'No submission'))}>Submissions</Button>
          <Button size="sm" variant="danger" onClick={() => api.delete(`/admin/teams/${team._id}`).then(loadAll)}>Remove Team</Button>
        </div>,
      ])}
    />
  );

  const renderPayments = () => (
    <div className="space-y-4">
      <Button onClick={() => downloadBlob('/admin/export/payments.csv', 'payments.csv')}>Export Payment Reports</Button>
      <AdminTable
        headers={['Payment', 'User', 'Amount', 'Status', 'Actions']}
        rows={payments.map((payment) => [
          payment._id,
          payment.userId?.name || '-',
          formatCurrency(payment.amount),
          payment.status,
          <div className="flex flex-wrap gap-2" key={payment._id}>
            <Button size="sm" onClick={() => api.post(`/admin/payments/${payment._id}/status`, { status: 'paid' }).then(loadAll)}>Approve</Button>
            <Button size="sm" variant="outline" onClick={() => api.post(`/admin/payments/${payment._id}/status`, { status: 'failed', reason: 'Rejected by admin' }).then(loadAll)}>Reject</Button>
            <Button size="sm" variant="danger" onClick={() => api.post(`/admin/payments/${payment._id}/status`, { status: 'refunded' }).then(loadAll)}>Refund</Button>
            <Button size="sm" onClick={() => api.get(`/admin/payments/${payment._id}/invoice`).then(() => toast.success('Invoice ready'))}>Invoice</Button>
          </div>,
        ])}
      />
    </div>
  );

  const renderCertificates = () => (
    <div className="space-y-6">
      <Card className="bg-white/10 border border-white/10">
        <h2 className="text-xl font-bold text-white mb-4">Generate Certificate</h2>
        <div className="grid md:grid-cols-3 gap-3">
          <select className="px-4 py-2.5 rounded-lg bg-slate-900 border border-white/20 text-white" value={certificateForm.userId} onChange={(e) => setCertificateForm({ ...certificateForm, userId: e.target.value })}>
            <option value="">Select student</option>
            {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select className="px-4 py-2.5 rounded-lg bg-slate-900 border border-white/20 text-white" value={certificateForm.eventId} onChange={(e) => setCertificateForm({ ...certificateForm, eventId: e.target.value })}>
            <option value="">Select event</option>
            {events.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
          </select>
          <Button onClick={generateCertificate} disabled={!certificateForm.userId || !certificateForm.eventId}>
            Generate Certificate
          </Button>
        </div>
      </Card>
      <AdminTable
        headers={['Certificate', 'Student', 'Event', 'Status', 'Actions']}
        rows={certificates.map((cert) => [
          cert.certificateNumber,
          cert.userId?.name,
          cert.eventId?.title,
          cert.status,
          <div className="flex gap-2" key={cert._id}>
            <Button size="sm" onClick={() => api.get(`/admin/certificates/verify/${cert.qrVerificationCode}`).then((r) => toast.success(r.data.valid ? 'Certificate is valid' : 'Certificate is not valid'))}>Verify</Button>
            <Button size="sm" onClick={() => downloadPdf('Certificate', [`${cert.certificateNumber} - ${cert.userId?.name}`])}>Download</Button>
            <Button size="sm" variant="danger" onClick={() => revokeCertificate(cert._id)}>Revoke</Button>
          </div>,
        ])}
      />
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <Card className="bg-white/10 border border-white/10">
        <h2 className="text-xl font-bold text-white mb-4">Send Announcement</h2>
        <form onSubmit={sendNotification} className="grid md:grid-cols-2 gap-3">
          <Input label="Title" value={notificationForm.title} onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })} required />
          <select className="px-4 py-2.5 rounded-lg bg-slate-900 border border-white/20 text-white" value={notificationForm.audience} onChange={(e) => setNotificationForm({ ...notificationForm, audience: e.target.value })}>
            {['all', 'students', 'admins', 'event'].map((item) => <option key={item}>{item}</option>)}
          </select>
          <textarea className="md:col-span-2 px-4 py-3 rounded-lg bg-slate-900 border border-white/20 text-white" placeholder="Message" value={notificationForm.message} onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })} required />
          <Button type="submit"><Bell className="w-4 h-4 mr-2" />Broadcast Message</Button>
        </form>
      </Card>
      <AdminTable headers={['Title', 'Audience', 'Type']} rows={notifications.map((n) => [n.title, n.audience, n.type])} />
    </div>
  );

  const renderReports = () => (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => api.post('/admin/reports', { type: 'analytics', title: 'Analytics Report' }).then(loadAll)}>Generate Reports</Button>
        <Button onClick={() => downloadBlob('/admin/export/events.csv', 'events.csv')}>Download CSV</Button>
        <Button onClick={() => downloadPdf('Analytics Report', [`Students: ${analytics?.totalStudents || 0}`, `Events: ${analytics?.totalEvents || 0}`])}>Download PDF Reports</Button>
      </div>
      <AdminTable headers={['Report', 'Type', 'Generated']} rows={reports.map((r) => [r.title, r.type, formatDate(r.createdAt)])} />
    </div>
  );

  const content = () => {
    if (section === 'events') return renderEvents();
    if (section === 'students') return renderStudents();
    if (section === 'admins' || section === 'settings' || section === 'profile') return renderAdmins();
    if (section === 'teams') return renderTeams();
    if (section === 'payments') return renderPayments();
    if (section === 'certificates') return renderCertificates();
    if (section === 'notifications') return renderNotifications();
    if (section === 'reports') return renderReports();
    if (section === 'analytics') return renderHome();
    if (section === 'registrations') return <AdminTable headers={['Event', 'Registrations']} rows={events.map((e) => [e.title, e.currentParticipants])} />;
    return renderHome();
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-cyan-300 text-sm font-medium">Production Admin Control</p>
            <h1 className="text-3xl font-bold">{pageTitle}</h1>
          </div>
          <Button onClick={loadAll} variant="outline" className="bg-white/10 border-white/20 text-white">
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
        </div>
        {loading ? (
          <div className="grid md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((item) => <div key={item} className="h-28 rounded-xl bg-white/10 animate-pulse" />)}
          </div>
        ) : content()}
      </div>
    </div>
  );
};

const AdminTable = ({ headers, rows }: { headers: string[]; rows: any[][] }) => (
  <Card className="bg-white/10 border border-white/10 backdrop-blur-xl">
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 text-slate-300">
            {headers.map((header) => <th key={header} className="text-left py-3 px-3">{header}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-white/5">
              {row.map((cell, cellIndex) => <td key={cellIndex} className="py-3 px-3 text-slate-100 align-top">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length ? <div className="py-8 text-center text-slate-400">No records found.</div> : null}
    </div>
  </Card>
);

export default AdminDashboard;
