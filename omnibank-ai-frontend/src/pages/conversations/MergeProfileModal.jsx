import { useState, useEffect } from 'react';
import api from '../../services/apiClient';
import { X, Search, User, Check, AlertCircle, Phone, Mail, Globe, MessageSquare } from 'lucide-react';

export default function MergeProfileModal({ isOpen, onClose, primaryUser, onMergeSuccess }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [isMerging, setIsMerging] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      setSelectedUser(null);
      setError('');
    } else {
      // When modal opens, fetch default recent users
      searchUsers();
    }
  }, [isOpen]);

  useEffect(() => {
    // Only debounce if the user is actively typing a query or clearing it
    const delayDebounceFn = setTimeout(() => {
      searchUsers();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const searchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
      // Filter out the primary user from the results safely
      const fetchedUsers = res.data.users || [];
      const validUsers = fetchedUsers.filter(u => u._id !== primaryUser._id);
      setResults(validUsers);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to search users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMerge = async () => {
    if (!selectedUser) return;
    setIsMerging(true);
    setError('');
    try {
      const res = await api.post('/users/merge/manual', {
        primaryUserId: primaryUser._id,
        duplicateUserId: selectedUser._id
      });

      onMergeSuccess(res.data.user);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to merge profiles.');
    } finally {
      setIsMerging(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#0F2F55]/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-lg font-bold text-[#0F2F55]">Merge Profiles</h2>
            <p className="text-xs text-gray-500 mt-1 font-medium">
              Search for an existing account to merge into <b>{primaryUser.name || 'this profile'}</b>.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-6">
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, email, or phone number..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-[#00CCA3] focus:ring-2 focus:ring-[#00CCA3]/20 transition-all placeholder:text-gray-400"
              autoFocus
            />
            {loading && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-gray-200 border-t-[#00CCA3] animate-spin" />}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-xs font-bold">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <div className="flex-1">
            {query.length > 1 && results.length === 0 && !loading && !error && (
              <div className="text-center py-12 text-gray-400">
                <p className="text-sm font-medium">No identical profiles found</p>
                <p className="text-xs mt-1">Try searching a different phone or email</p>
              </div>
            )}

            {results.length > 0 && (
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Select Duplicate Profile (Will be deleted & merged)</label>
                {results.map(user => {
                  const isSelected = selectedUser?._id === user._id;
                  return (
                    <button
                      key={user._id}
                      onClick={() => setSelectedUser(user)}
                      className={`w-full text-left p-4 rounded-xl border flex items-start gap-4 transition-all ${
                        isSelected 
                        ? 'bg-[#00CCA3]/5 border-[#00CCA3] shadow-[0_0_0_1px_#00CCA3]' 
                        : 'bg-white border-gray-200 hover:border-[#00CCA3]/50 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${
                        isSelected ? 'bg-[#00CCA3] text-white' : 'bg-[#E5F5EF] text-[#0F7A5E]'
                      }`}>
                        {(user.name || 'U')[0].toUpperCase()}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-sm truncate">{user.name || 'Unknown User'}</h4>
                        
                        <div className="flex flex-col gap-1 mt-2">
                          {user.email && (
                            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium truncate">
                              <Mail size={12} className="text-blue-400 shrink-0"/> {user.email}
                            </div>
                          )}
                          {user.phone && (
                            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium truncate">
                              <Phone size={12} className="text-green-400 shrink-0"/> {user.phone}
                            </div>
                          )}
                        </div>

                      </div>
                      
                      {isSelected && (
                        <div className="bg-[#00CCA3] text-[#0F2F55] p-1 rounded-full shrink-0">
                          <Check size={14} strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
          <div className="text-xs text-gray-500 font-medium max-w-md">
            {selectedUser ? (
              <span><b>Warning:</b> {selectedUser.name}'s entire history will be absorbed into {primaryUser.name}. This is irreversible.</span>
            ) : (
              "Select a matching profile from the list above."
            )}
          </div>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              disabled={isMerging}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleMerge}
              disabled={!selectedUser || isMerging}
              className="px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest bg-[#00CCA3] text-[#0F2F55] hover:brightness-105 disabled:opacity-50 disabled:hover:brightness-100 transition-all flex items-center justify-center min-w-[140px] shadow-[0_2px_10px_rgba(0,204,163,0.3)]"
            >
              {isMerging ? (
                <div className="w-4 h-4 rounded-full border-2 border-[#0F2F55]/30 border-t-[#0F2F55] animate-spin" />
              ) : (
                'Merge Profiles'
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
