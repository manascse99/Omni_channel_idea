import React, { useState, useEffect } from 'react';
import api from '../../services/apiClient';
import {
  Radio, Send, Clock, CheckCircle2, XCircle, Loader2, 
  Calendar, Users, Mail, ChevronRight, Trash2, AlertCircle,
  Megaphone, Sparkles, BarChart2
} from 'lucide-react';

const STATUS_CONFIG = {
  queued:    { label: 'Queued',    color: '#6B7280', bg: '#F3F4F6', icon: Clock },
  scheduled: { label: 'Scheduled', color: '#F59E0B', bg: '#FFFBEB', icon: Calendar },
  sending:   { label: 'Sending',   color: '#3B82F6', bg: '#EFF6FF', icon: Loader2 },
  sent:      { label: 'Sent',      color: '#10B981', bg: '#F0FDF4', icon: CheckCircle2 },
  failed:    { label: 'Failed',    color: '#EF4444', bg: '#FEF2F2', icon: XCircle },
  cancelled: { label: 'Cancelled', color: '#9CA3AF', bg: '#F9FAFB', icon: XCircle },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.queued;
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border"
      style={{ color: cfg.color, background: cfg.bg, borderColor: `${cfg.color}30` }}
    >
      <Icon size={10} className={status === 'sending' ? 'animate-spin' : ''} />
      {cfg.label}
    </span>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function BroadcastPage() {
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [sendType, setSendType] = useState('now'); // 'now' | 'scheduled'

  const [form, setForm] = useState({ subject: '', body: '', scheduledAt: '' });

  const fetchBroadcasts = () => {
    api.get('/broadcasts').then(res => {
      setBroadcasts(res.data.broadcasts || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchBroadcasts();
    const interval = setInterval(fetchBroadcasts, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.body.trim()) {
      setError('Subject and message body are required.');
      return;
    }
    setSending(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        subject: form.subject,
        body: form.body,
        scheduledAt: sendType === 'scheduled' ? form.scheduledAt : null,
      };
      await api.post('/broadcasts', payload);
      setSuccess(sendType === 'scheduled' ? 'Broadcast scheduled successfully!' : 'Broadcast queued! Emails are being sent.');
      setForm({ subject: '', body: '', scheduledAt: '' });
      setSendType('now');
      fetchBroadcasts();
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to create broadcast.');
    } finally {
      setSending(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this scheduled broadcast?')) return;
    try {
      await api.delete(`/broadcasts/${id}`);
      fetchBroadcasts();
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to cancel.');
    }
  };

  const stats = {
    total: broadcasts.length,
    sent: broadcasts.filter(b => b.status === 'sent').length,
    scheduled: broadcasts.filter(b => b.status === 'scheduled').length,
    totalReached: broadcasts.reduce((a, b) => a + (b.sentCount || 0), 0),
  };

  // Minimum datetime for schedule input (now + 1 min)
  const minSchedule = new Date(Date.now() + 60000).toISOString().slice(0, 16);

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#F4F6F9]">
      <div className="max-w-[1200px] mx-auto">

        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 mb-1.5 uppercase">Communications</p>
            <h1 className="text-[32px] font-extrabold text-primary tracking-tight leading-none flex items-center gap-3">
              <div className="w-10 h-10 bg-teal rounded-xl flex items-center justify-center">
                <Megaphone size={20} className="text-primary" />
              </div>
              Broadcast Center
            </h1>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-teal bg-teal/10 px-4 py-2 rounded-xl border border-teal/20">
            <Sparkles size={14} />
            Email broadcast via SMTP
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Broadcasts', value: stats.total, icon: Radio, color: '#1A2B4A' },
            { label: 'Sent', value: stats.sent, icon: CheckCircle2, color: '#10B981' },
            { label: 'Scheduled', value: stats.scheduled, icon: Calendar, color: '#F59E0B' },
            { label: 'Total Reached', value: stats.totalReached, icon: Users, color: '#00C9A7' },
          ].map(stat => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-[16px] p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${stat.color}15` }}>
                  <Icon size={18} style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-[24px] font-extrabold text-primary leading-none">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-[1.1fr_1.9fr] gap-6">

          {/* Compose Panel */}
          <div className="bg-white rounded-[16px] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 pt-6 pb-4 border-b border-gray-50">
              <h2 className="text-[16px] font-black text-primary flex items-center gap-2">
                <Mail size={16} className="text-teal" /> New Broadcast
              </h2>
              <p className="text-[12px] text-gray-400 mt-1">Send an email to all users in the database.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6 flex-1">
              {/* Send Type Toggle */}
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Send Type</label>
                <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
                  {[
                    { val: 'now', label: 'Send Now', icon: Send },
                    { val: 'scheduled', label: 'Schedule', icon: Clock },
                  ].map(opt => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => setSendType(opt.val)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[12px] font-black transition-all ${
                          sendType === opt.val
                            ? 'bg-white text-primary shadow-sm'
                            : 'text-gray-400 hover:text-primary'
                        }`}
                      >
                        <Icon size={13} /> {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Subject *</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  placeholder="e.g. Important Platform Update"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all"
                  required
                />
              </div>

              {/* Scheduled At */}
              {sendType === 'scheduled' && (
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Schedule Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={form.scheduledAt}
                    min={minSchedule}
                    onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all"
                    required={sendType === 'scheduled'}
                  />
                </div>
              )}

              {/* Body */}
              <div className="flex-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Message Body *</label>
                <textarea
                  value={form.body}
                  onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                  placeholder="Write your broadcast message here..."
                  rows={7}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[13px] outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all resize-none"
                  required
                />
              </div>

              {/* Alerts */}
              {error && (
                <div className="flex items-center gap-2 text-[12px] text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-100">
                  <AlertCircle size={14} /> {error}
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2 text-[12px] text-green-700 bg-green-50 px-4 py-3 rounded-xl border border-green-100">
                  <CheckCircle2 size={14} /> {success}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={sending}
                className="w-full bg-primary text-teal py-3 rounded-xl text-[13px] font-black flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-60 transition-all shadow-sm"
              >
                {sending ? <Loader2 size={16} className="animate-spin" /> : (sendType === 'scheduled' ? <Clock size={16} /> : <Send size={16} />)}
                {sending ? 'Processing...' : sendType === 'scheduled' ? 'Schedule Broadcast' : 'Send Broadcast Now'}
              </button>
            </form>
          </div>

          {/* History Panel */}
          <div className="bg-white rounded-[16px] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 pt-6 pb-4 border-b border-gray-50 flex items-center justify-between">
              <div>
                <h2 className="text-[16px] font-black text-primary flex items-center gap-2">
                  <BarChart2 size={16} className="text-teal" /> Broadcast History
                </h2>
                <p className="text-[12px] text-gray-400 mt-1">Live updates every 15 seconds</p>
              </div>
              <button onClick={fetchBroadcasts} className="text-[11px] font-black text-teal uppercase tracking-widest hover:underline">
                Refresh
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 size={28} className="animate-spin text-gray-300" />
                </div>
              ) : broadcasts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-300">
                  <Radio size={36} className="mb-3" />
                  <p className="text-[13px] font-bold">No broadcasts yet</p>
                  <p className="text-[11px]">Create your first broadcast!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {broadcasts.map(b => (
                    <div key={b._id} className="px-6 py-4 hover:bg-gray-50/50 transition-all group">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1.5">
                            <StatusBadge status={b.status} />
                          </div>
                          <p className="text-[14px] font-bold text-primary truncate">{b.subject}</p>
                          <p className="text-[12px] text-gray-400 truncate mt-0.5">{b.body.slice(0, 80)}…</p>
                          
                          <div className="flex items-center gap-4 mt-2.5 flex-wrap">
                            {b.status === 'scheduled' && b.scheduledAt && (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                <Calendar size={9} /> {formatDate(b.scheduledAt)}
                              </span>
                            )}
                            {b.status === 'sent' && (
                              <>
                                <span className="flex items-center gap-1 text-[10px] font-bold text-gray-500">
                                  <Users size={10} /> {b.sentCount}/{b.totalRecipients} delivered
                                </span>
                                {b.sentAt && (
                                  <span className="flex items-center gap-1 text-[10px] text-gray-400">
                                    <Clock size={9} /> {formatDate(b.sentAt)}
                                  </span>
                                )}
                              </>
                            )}
                            {(b.status === 'queued' || b.status === 'sending') && (
                              <span className="text-[10px] text-gray-400">
                                Created {formatDate(b.createdAt)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {b.status === 'scheduled' && (
                            <button
                              onClick={() => handleCancel(b._id)}
                              className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                          {b.status === 'sent' && b.failedCount > 0 && (
                            <span className="text-[10px] font-bold text-red-400">{b.failedCount} failed</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
