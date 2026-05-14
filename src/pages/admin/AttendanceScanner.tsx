import { useEffect, useMemo, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Download, FileText, QrCode, RefreshCw, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import api from '../../lib/api';
import { formatDate } from '../../lib/format';

const scannerId = 'admin-qr-scanner';

const AttendanceScanner = () => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScanRef = useRef('');
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [scanResult, setScanResult] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const [analyticsResponse, recordsResponse] = await Promise.all([
        api.get('/admin/attendance/analytics'),
        api.get('/admin/attendance/records'),
      ]);
      setAnalytics(analyticsResponse.data.analytics);
      setRecords(recordsResponse.data.records || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Unable to load attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
    return () => {
      scannerRef.current?.stop().catch(() => undefined);
      scannerRef.current?.clear().catch(() => undefined);
    };
  }, []);

  const markAttendance = async (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return;

    if (lastScanRef.current === trimmed) {
      return;
    }
    lastScanRef.current = trimmed;

    try {
      const { data } = await api.post('/admin/attendance/scan', { qrCode: trimmed });
      setScanResult(data);
      toast.success(data.duplicate ? 'Attendance already marked' : 'Attendance marked');
      await loadAttendance();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid QR code');
    } finally {
      setTimeout(() => {
        lastScanRef.current = '';
      }, 2500);
    }
  };

  const startScanner = async () => {
    if (isScanning) return;

    try {
      const scanner = new Html5Qrcode(scannerId);
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 260, height: 260 } },
        (decodedText) => markAttendance(decodedText),
        () => undefined,
      );
      setIsScanning(true);
    } catch (error: any) {
      toast.error(error.message || 'Unable to start camera scanner');
    }
  };

  const stopScanner = async () => {
    await scannerRef.current?.stop().catch(() => undefined);
    await scannerRef.current?.clear().catch(() => undefined);
    scannerRef.current = null;
    setIsScanning(false);
  };

  const exportCsv = async () => {
    const response = await api.get('/admin/attendance/export.csv', { responseType: 'blob' });
    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'attendance.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Attendance Report', 14, 18);
    doc.setFontSize(10);
    doc.text(`Present: ${analytics?.totalPresent || 0}`, 14, 30);
    doc.text(`Absent: ${analytics?.totalAbsent || 0}`, 70, 30);
    doc.text(`Attendance: ${analytics?.attendancePercentage || 0}%`, 125, 30);
    let y = 44;
    records.slice(0, 30).forEach((record, index) => {
      const user = record.userId;
      const event = record.eventId;
      doc.text(
        `${index + 1}. ${user?.name || '-'} | ${user?.department || '-'} | ${event?.title || '-'} | ${formatDate(record.checkInTime)}`,
        14,
        y,
      );
      y += 8;
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
    });
    doc.save('attendance-report.pdf');
  };

  const selectedDetails = useMemo(() => {
    const registration = scanResult?.registration;
    return {
      student: registration?.userId,
      event: registration?.eventId,
      attendance: scanResult?.attendance,
      duplicate: scanResult?.duplicate,
    };
  }, [scanResult]);

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-cyan-300 text-sm font-medium">Secure QR Attendance</p>
            <h1 className="text-3xl font-bold">Attendance Scanner</h1>
            <p className="text-slate-300">Validate registrations, prevent duplicates, and sync attendance to MongoDB.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="bg-white/10 border-white/20 text-white" onClick={loadAttendance}>
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
            <Button onClick={exportCsv}><Download className="w-4 h-4 mr-2" /> CSV</Button>
            <Button variant="secondary" onClick={exportPdf}><FileText className="w-4 h-4 mr-2" /> PDF</Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
          <Card className="bg-white/10 border border-white/10 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-4">
              <QrCode className="w-6 h-6 text-cyan-300" />
              <h2 className="text-xl font-bold text-white">Webcam Scanner</h2>
            </div>
            <div id={scannerId} className="min-h-[320px] rounded-lg overflow-hidden bg-slate-900 border border-white/10" />
            <div className="flex flex-wrap gap-3 mt-4">
              <Button onClick={startScanner} disabled={isScanning}>Start Camera</Button>
              <Button variant="outline" className="bg-white/10 border-white/20 text-white" onClick={stopScanner} disabled={!isScanning}>
                Stop Camera
              </Button>
            </div>
            <div className="mt-5 grid sm:grid-cols-[1fr_auto] gap-3">
              <Input
                label="Manual Registration ID"
                value={manualCode}
                onChange={(event) => setManualCode(event.target.value)}
                placeholder="REG-..."
                className="bg-slate-900 border-white/20"
              />
              <Button className="self-end" onClick={() => markAttendance(manualCode)} disabled={!manualCode}>
                Validate
              </Button>
            </div>
          </Card>

          <Card className="bg-white/10 border border-white/10 backdrop-blur-xl">
            <h2 className="text-xl font-bold text-white mb-4">Scan Result</h2>
            {scanResult ? (
              <div className="space-y-3 text-sm">
                <div className={`p-4 rounded-lg ${selectedDetails.duplicate ? 'bg-amber-500/15 border border-amber-400/30' : 'bg-emerald-500/15 border border-emerald-400/30'}`}>
                  <p className="font-semibold text-white">
                    {selectedDetails.duplicate ? 'Attendance Already Marked' : 'Attendance Marked Successfully'}
                  </p>
                </div>
                <p><span className="text-slate-400">Student:</span> {selectedDetails.student?.name}</p>
                <p><span className="text-slate-400">Email:</span> {selectedDetails.student?.email}</p>
                <p><span className="text-slate-400">Department:</span> {selectedDetails.student?.department || 'Unknown'}</p>
                <p><span className="text-slate-400">Event:</span> {selectedDetails.event?.title}</p>
                <p><span className="text-slate-400">Registration ID:</span> {scanResult.registration?.registrationId}</p>
                <p><span className="text-slate-400">Check-in:</span> {formatDate(selectedDetails.attendance?.checkInTime)}</p>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400 border border-dashed border-white/20 rounded-lg">
                Scan a registered student's QR pass.
              </div>
            )}
          </Card>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          {[
            ['Present', analytics?.totalPresent || 0],
            ['Absent', analytics?.totalAbsent || 0],
            ['Registrations', analytics?.totalRegistrations || 0],
            ['Attendance %', `${analytics?.attendancePercentage || 0}%`],
          ].map(([label, value]) => (
            <Card key={label} className="bg-white/10 border border-white/10 backdrop-blur-xl">
              <Users className="w-6 h-6 text-cyan-300 mb-3" />
              <p className="text-sm text-slate-300">{label}</p>
              <h3 className="text-3xl font-bold text-white">{value}</h3>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="bg-white/10 border border-white/10 backdrop-blur-xl">
            <h2 className="text-xl font-bold text-white mb-4">Present vs Absent</h2>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={analytics?.summary || []} dataKey="value" nameKey="name" outerRadius={90} label>
                  <Cell fill="#22c55e" />
                  <Cell fill="#f97316" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
          <Card className="bg-white/10 border border-white/10 backdrop-blur-xl">
            <h2 className="text-xl font-bold text-white mb-4">Department-wise Attendance</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={analytics?.departmentWiseAttendance || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="department" stroke="#cbd5e1" />
                <YAxis stroke="#cbd5e1" />
                <Tooltip />
                <Bar dataKey="present" fill="#06b6d4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <Card className="bg-white/10 border border-white/10 backdrop-blur-xl">
          <h2 className="text-xl font-bold text-white mb-4">Recent Attendance</h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-12 rounded-lg bg-white/10 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-slate-300">
                    <th className="text-left py-3">Student</th>
                    <th className="text-left py-3">Department</th>
                    <th className="text-left py-3">Event</th>
                    <th className="text-left py-3">Check-in</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record._id} className="border-b border-white/5">
                      <td className="py-3">{record.userId?.name}</td>
                      <td className="py-3 text-slate-300">{record.userId?.department || 'Unknown'}</td>
                      <td className="py-3 text-slate-300">{record.eventId?.title}</td>
                      <td className="py-3 text-slate-300">{formatDate(record.checkInTime)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AttendanceScanner;
