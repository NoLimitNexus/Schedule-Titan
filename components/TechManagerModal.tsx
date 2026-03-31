
import React, { useState, useEffect } from 'react';
import { Technician, UserProfile } from '../types';
import { db, resetPassword } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

interface TechManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  technicians: Technician[];
  onSave: (updatedTechs: Technician[], idMap: Record<string, string>) => void;
}

const TechManagerModal: React.FC<TechManagerModalProps> = ({ isOpen, onClose, technicians, onSave }) => {
  const [localTechs, setLocalTechs] = useState<Technician[]>(technicians);
  const [activeTab, setActiveTab] = useState<'techs' | 'users'>('techs');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [resetStatus, setResetStatus] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && activeTab === 'users') {
      fetchUsers();
    }
  }, [isOpen, activeTab]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const fetchedUsers: UserProfile[] = [];
      querySnapshot.forEach((doc) => {
        fetchedUsers.push(doc.data() as UserProfile);
      });
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleResetPassword = async (email: string) => {
    setResetStatus({ ...resetStatus, [email]: 'Sending...' });
    try {
      await resetPassword(email);
      setResetStatus({ ...resetStatus, [email]: 'Sent!' });
      setTimeout(() => {
        setResetStatus(prev => {
          const next = { ...prev };
          delete next[email];
          return next;
        });
      }, 3000);
    } catch (error: any) {
      setResetStatus({ ...resetStatus, [email]: 'Error' });
    }
  };

  if (!isOpen) return null;

  const handleUpdate = (index: number, field: keyof Technician, value: string) => {
    const newTechs = [...localTechs];
    newTechs[index] = { ...newTechs[index], [field]: value };
    setLocalTechs(newTechs);
  };

  const handleAdd = () => {
    setLocalTechs([...localTechs, { id: '', name: '', code: '' }]);
  };

  const handleRemove = (index: number) => {
    if (confirm('Are you sure? All shifts for this ID will be orphaned unless you re-assign them.')) {
      setLocalTechs(localTechs.filter((_, i) => i !== index));
    }
  };

  const handleFinalSave = () => {
    // Create a mapping of old ID to new ID for shift migration
    const idMap: Record<string, string> = {};
    localTechs.forEach((newTech, index) => {
      const oldTech = technicians[index];
      if (oldTech && oldTech.id !== newTech.id && newTech.id.trim() !== '') {
        idMap[oldTech.id] = newTech.id;
      }
    });

    onSave(localTechs.filter(t => t.id.trim() !== '' && t.name.trim() !== ''), idMap);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex gap-4">
            <button 
              onClick={() => setActiveTab('techs')}
              className={`text-sm font-black uppercase tracking-tight pb-1 border-b-2 transition-all ${activeTab === 'techs' ? 'border-indigo-600 text-slate-800' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              Technicians
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={`text-sm font-black uppercase tracking-tight pb-1 border-b-2 transition-all ${activeTab === 'users' ? 'border-indigo-600 text-slate-800' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              User Accounts
            </button>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {activeTab === 'techs' ? (
            <>
              <div className="grid grid-cols-12 gap-4 px-2 mb-2">
                <div className="col-span-2 text-[10px] font-black text-slate-400 uppercase">ID</div>
                <div className="col-span-7 text-[10px] font-black text-slate-400 uppercase">Full Name</div>
                <div className="col-span-2 text-[10px] font-black text-slate-400 uppercase">Code</div>
                <div className="col-span-1"></div>
              </div>
              {localTechs.map((tech, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2 rounded-xl group hover:bg-slate-100 transition-colors">
                  <div className="col-span-2">
                    <input
                      type="text"
                      value={tech.id}
                      onChange={(e) => handleUpdate(idx, 'id', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="ID"
                    />
                  </div>
                  <div className="col-span-7">
                    <input
                      type="text"
                      value={tech.name}
                      onChange={(e) => handleUpdate(idx, 'name', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="Name"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      value={tech.code}
                      onChange={(e) => handleUpdate(idx, 'code', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="Code"
                    />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <button 
                      onClick={() => handleRemove(idx)}
                      className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
              <button 
                onClick={handleAdd}
                className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs font-bold hover:border-indigo-300 hover:text-indigo-500 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Technician
              </button>
            </>
          ) : (
            <div className="space-y-4">
              {loadingUsers ? (
                <div className="text-center py-8 text-slate-400 font-bold animate-pulse uppercase tracking-widest text-xs">Loading accounts...</div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-4 px-2 mb-2">
                    <div className="col-span-5 text-[10px] font-black text-slate-400 uppercase">User Email</div>
                    <div className="col-span-3 text-[10px] font-black text-slate-400 uppercase">Role</div>
                    <div className="col-span-4 text-[10px] font-black text-slate-400 uppercase text-right">Actions</div>
                  </div>
                  {users.map((user) => (
                    <div key={user.uid} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="col-span-5 text-xs font-bold text-slate-700 truncate">{user.email}</div>
                      <div className="col-span-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${user.role === 'manager' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'}`}>
                          {user.role}
                        </span>
                      </div>
                      <div className="col-span-4 flex justify-end">
                        <button 
                          onClick={() => handleResetPassword(user.email)}
                          disabled={resetStatus[user.email] === 'Sent!'}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all
                            ${resetStatus[user.email] === 'Sent!' ? 'bg-emerald-100 text-emerald-700' : 
                              resetStatus[user.email] === 'Error' ? 'bg-rose-100 text-rose-700' :
                              'bg-white border border-slate-200 text-slate-600 hover:border-indigo-500 hover:text-indigo-600'}
                          `}
                        >
                          {resetStatus[user.email] || 'Clear/Reset Password'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-[10px] text-slate-400 font-medium italic px-2">
                * Clearing/Resetting a password will send a secure link to the user's work email allowing them to set a new password.
              </p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 flex gap-3 bg-white">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50 transition-colors uppercase tracking-widest"
          >
            Cancel
          </button>
          <button
            onClick={handleFinalSave}
            className="flex-1 px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-black transition-colors shadow-lg uppercase tracking-widest"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default TechManagerModal;
