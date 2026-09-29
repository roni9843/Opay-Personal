import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Smartphone, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  Trash2, 
  X, 
  Key, 
  Mail, 
  Phone, 
  User, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import api from '../api/axios';
import { useAuthStore } from '../store/useAuthStore';

export default function Agents() {
  const { user } = useAuthStore();
  const [agents, setAgents] = useState([]);
  const [subInfo, setSubInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const [editData, setEditData] = useState({
    name: '',
    phone: '',
    password: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [agentsRes, subRes] = await Promise.all([
        api.get('/company/agents').catch(() => ({ data: { success: true, data: [] } })),
        api.get('/company/subscription').catch(() => ({ data: { success: false } })),
      ]);

      if (agentsRes.data.success) {
        setAgents(agentsRes.data.data);
      }
      if (subRes.data.success) {
        setSubInfo(subRes.data.subscription);
      }
    } catch (err) {
      console.error('Fetch agents error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await api.post('/company/agents', formData);
      if (res.data.success) {
        setCreateModalOpen(false);
        setFormData({ name: '', email: '', phone: '', password: '' });
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create staff agent');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAgent) return;
    setError('');
    setSubmitting(true);

    try {
      const res = await api.put(`/company/agents/${selectedAgent._id}`, editData);
      if (res.data.success) {
        setEditModalOpen(false);
        setSelectedAgent(null);
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update agent details');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (agentId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await api.patch(`/company/agents/${agentId}/status`, { status: newStatus });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Status change failed');
    }
  };

  const handleDeleteAgent = async (agentId, name) => {
    if (!window.confirm(`Are you sure you want to PERMANENTLY DELETE staff agent "${name}"?`)) return;
    try {
      await api.delete(`/company/agents/${agentId}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const openEditModal = (agent) => {
    setSelectedAgent(agent);
    setEditData({
      name: agent.name || '',
      phone: agent.phone || '',
      password: '',
    });
    setError('');
    setEditModalOpen(true);
  };

  const maxAgents = subInfo ? (subInfo.maxAgentsSnapshot || 0) : 0;
  const devsPerAgent = subInfo ? (subInfo.maxDevicesPerAgentSnapshot || 1) : 1;
  const hasActiveSub = Boolean(subInfo && subInfo.active);

  const filteredAgents = agents.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (a.phone && a.phone.includes(searchQuery))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Users className="w-7 h-7 text-fancyPink" />
            Staff Agents Management
          </h1>
          <p className="text-purple-200/70 text-sm mt-1 font-medium">
            Create staff accounts & manage gateway permissions (Allowed Quota: {agents.length} / {maxAgents} Max Agents)
          </p>
        </div>

        <button
          onClick={() => {
            if (!hasActiveSub) {
              alert('You must purchase a subscription package first before adding staff agents.');
              return;
            }
            if (agents.length >= maxAgents) {
              alert(`Agent quota limit reached (${agents.length}/${maxAgents}). Upgrade your package to add more staff agents.`);
              return;
            }
            setError('');
            setCreateModalOpen(true);
          }}
          className="px-5 py-3 btn-fancy-pink text-white rounded-2xl text-xs font-bold transition-all shadow-xl flex items-center gap-2 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Staff Agent</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="fancy-container rounded-3xl border border-purple-500/20 overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search agent name, email or phone..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#180f33]/80 border border-purple-500/30 rounded-2xl text-xs text-white placeholder-purple-300/40 focus:outline-none focus:border-fancyPink"
            />
          </div>

          <span className="text-xs text-purple-200/80 font-bold bg-purple-950/60 px-3.5 py-1.5 rounded-full border border-purple-500/30">
            Quota Used: {agents.length} of {maxAgents} Agents Max
          </span>
        </div>

        {loading ? (
          <div className="text-purple-300 text-center py-10 font-bold">Loading staff agents...</div>
        ) : filteredAgents.length === 0 ? (
          <div className="text-center py-12 text-purple-300/60 text-xs font-medium">
            {searchQuery ? 'No agents matching your search query.' : 'No staff agents created yet. Click "Add Staff Agent" to get started.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-purple-500/20 text-purple-300 font-bold uppercase tracking-wider bg-[#150c2d]/70">
                  <th className="py-4 px-5">Agent Name</th>
                  <th className="py-4 px-5">Email Address</th>
                  <th className="py-4 px-5">Phone Number</th>
                  <th className="py-4 px-5">Device Capacity</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-500/10 text-purple-200">
                {filteredAgents.map((agent) => (
                  <tr key={agent._id} className="hover:bg-purple-900/20 transition-colors">
                    <td className="py-4 px-5 font-bold text-white flex items-center gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-fancyPink to-fancyPurple text-white flex items-center justify-center font-extrabold text-sm shadow-md">
                        {agent.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-extrabold text-white text-sm">{agent.name}</p>
                        <p className="text-[10px] text-purple-300/60 font-normal">Role: Staff Agent</p>
                      </div>
                    </td>
                    <td className="py-4 px-5 font-medium">{agent.email}</td>
                    <td className="py-4 px-5 font-mono font-medium">{agent.phone || 'N/A'}</td>
                    <td className="py-4 px-5">
                      <span className="px-3 py-1 rounded-full bg-fancyCyan/15 text-cyan-300 text-[11px] font-bold border border-fancyCyan/30 flex items-center gap-1.5 w-fit">
                        <Smartphone className="w-3.5 h-3.5" />
                        {devsPerAgent} Device/Agent
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase flex items-center gap-1.5 w-fit ${
                          agent.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {agent.status === 'active' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {agent.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(agent)}
                        className="p-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-500/30 transition-colors"
                        title="Edit Details & Password"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(agent._id, agent.status)}
                        className={`px-3 py-1.5 rounded-xl font-bold ${
                          agent.status === 'active'
                            ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
                            : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {agent.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteAgent(agent._id, agent.name)}
                        className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition-colors"
                        title="Delete Agent"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Staff Agent Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="fancy-container w-full max-w-lg p-6 md:p-8 rounded-3xl border border-purple-500/30 relative shadow-2xl">
            <button
              onClick={() => setCreateModalOpen(false)}
              className="absolute right-4 top-4 text-purple-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-extrabold text-white mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-fancyPink" /> Add New Staff Agent
            </h3>

            {error && (
              <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-purple-200 font-bold mb-1 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Tanvir Hasan"
                    className="w-full pl-10 pr-4 py-3 bg-[#180f33] border border-purple-500/30 rounded-2xl text-white focus:outline-none focus:border-fancyPink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-purple-200 font-bold mb-1 uppercase tracking-wider">Email Address (Login ID)</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="agent@company.com"
                      className="w-full pl-10 pr-4 py-3 bg-[#180f33] border border-purple-500/30 rounded-2xl text-white focus:outline-none focus:border-fancyPink"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-purple-200 font-bold mb-1 uppercase tracking-wider">Mobile Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="01700000000"
                      className="w-full pl-10 pr-4 py-3 bg-[#180f33] border border-purple-500/30 rounded-2xl text-white focus:outline-none focus:border-fancyPink"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-purple-200 font-bold mb-1 uppercase tracking-wider">Login Password</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-10 pr-4 py-3 bg-[#180f33] border border-purple-500/30 rounded-2xl text-white focus:outline-none focus:border-fancyPink font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-purple-500/20">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-2xl bg-purple-950/60 text-purple-300 font-bold border border-purple-500/30"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 btn-fancy-pink text-white font-extrabold rounded-2xl shadow-lg flex items-center gap-2"
                >
                  {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                  <span>Create Staff Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Staff Agent Modal */}
      {editModalOpen && selectedAgent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="fancy-container w-full max-w-lg p-6 md:p-8 rounded-3xl border border-purple-500/30 relative shadow-2xl">
            <button
              onClick={() => setEditModalOpen(false)}
              className="absolute right-4 top-4 text-purple-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-extrabold text-white mb-4 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-fancyPink" /> Edit Staff Agent Profile
            </h3>

            {error && (
              <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-purple-200 font-bold mb-1 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-[#180f33] border border-purple-500/30 rounded-2xl text-white focus:outline-none focus:border-fancyPink"
                  />
                </div>
              </div>

              <div>
                <label className="block text-purple-200 font-bold mb-1 uppercase tracking-wider">Mobile Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={editData.phone}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-[#180f33] border border-purple-500/30 rounded-2xl text-white focus:outline-none focus:border-fancyPink"
                  />
                </div>
              </div>

              <div>
                <label className="block text-purple-200 font-bold mb-1 uppercase tracking-wider flex items-center justify-between">
                  <span>Change Password</span>
                  <span className="text-[10px] text-purple-400 font-normal">Leave blank if unchanged</span>
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="Enter new password (min 6 chars)"
                    value={editData.password}
                    onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-[#180f33] border border-purple-500/30 rounded-2xl text-white focus:outline-none focus:border-fancyPink font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-purple-500/20">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-2xl bg-purple-950/60 text-purple-300 font-bold border border-purple-500/30"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 btn-fancy-pink text-white font-extrabold rounded-2xl shadow-lg flex items-center gap-2"
                >
                  {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
