import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Smartphone, BatteryCharging, Wifi, UserPlus, RefreshCw } from 'lucide-react';

export default function Devices() {
  const [devices, setDevices] = useState([]);
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [devRes, agentRes] = await Promise.all([
        API.get('/company/devices'),
        API.get('/company/agents'),
      ]);
      setDevices(devRes.data.data);
      setAgents(agentRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignAgent = async (deviceId, agentId) => {
    try {
      await API.patch(`/company/devices/${deviceId}/assign-agent`, { agentId: agentId || null });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign agent');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Registered Android SIM Devices</h2>
          <p className="text-xs text-slate-400 mt-1">Live status of connected Android phones, battery % and assigned agents</p>
        </div>
        <button
          onClick={fetchData}
          className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 flex items-center gap-1.5 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Status</span>
        </button>
      </div>

      {isLoading ? (
        <div className="text-slate-400 text-center py-8">Loading devices...</div>
      ) : devices.length === 0 ? (
        <div className="glass-panel p-8 rounded-2xl text-center text-slate-400 text-xs">
          No Android devices registered yet. Open the Opay-Personal Android App on your mobile and log in to pair device automatically.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.map((device) => (
            <div
              key={device._id}
              className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between hover:border-indigo-500/30 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        device.state ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                      }`}
                    ></span>
                    <span className="text-xs font-semibold text-slate-300">
                      {device.state ? 'ONLINE' : 'OFFLINE'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <BatteryCharging className="w-4 h-4 text-emerald-400" />
                    <span>{device.batteryLevel}%</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{device.deviceName}</h3>
                    <p className="text-xs font-mono text-slate-400 truncate max-w-[180px]">
                      ID: {device.deviceCode}
                    </p>
                  </div>
                </div>

                <div className="my-4 p-3 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1">
                      <Wifi className="w-3.5 h-3.5" /> Network:
                    </span>
                    <span className="text-slate-200 font-medium">{device.networkType || 'WiFi'}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Last Seen:</span>
                    <span className="text-slate-200">{new Date(device.lastSeen).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <label className="block text-[11px] text-slate-400 mb-1">Assigned Staff Agent:</label>
                <select
                  value={device.assignedAgent?._id || ''}
                  onChange={(e) => handleAssignAgent(device._id, e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Unassigned (Company Owner)</option>
                  {agents.map((ag) => (
                    <option key={ag._id} value={ag._id}>
                      {ag.name} ({ag.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
