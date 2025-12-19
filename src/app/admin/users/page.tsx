'use client';

import React, { useState, useMemo } from 'react';
import { Users, Search, ChevronDown, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useToast } from '@/components/ToastContainer';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/date-formatter';

interface UserRecord {
  id: string;
  wallet_address: string;
  role: 'customer' | 'seller' | 'admin';
  loyalty_points: number;
  created_at: string;
  updated_at: string;
}

export default function AdminUsersPage() {
  const { showSuccess, showError, showInfo } = useToast();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'customer' | 'seller' | 'admin'>('all');
  const [updatingRoles, setUpdatingRoles] = useState<Set<string>>(new Set());
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [bulkRoleAction, setBulkRoleAction] = useState<'customer' | 'seller' | 'admin' | null>(null);

  // Load users on mount
  React.useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
      showSuccess('Users loaded successfully');
    } catch (err) {
      console.error('Error loading users:', err);
      showError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, walletAddress: string, newRole: 'customer' | 'seller' | 'admin') => {
    try {
      setUpdatingRoles(prev => new Set(prev).add(userId));

      const { error } = await supabase
        .from('users')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev =>
        prev.map(u => (u.id === userId ? { ...u, role: newRole } : u))
      );

      showSuccess(`${walletAddress.slice(0, 6)}... updated to ${newRole}`);
    } catch (err) {
      console.error('Error updating user role:', err);
      showError('Failed to update user role');
    } finally {
      setUpdatingRoles(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const bulkUpdateRoles = async () => {
    if (selectedUsers.size === 0 || !bulkRoleAction) return;

    try {
      setUpdatingRoles(prev => new Set([...prev, ...selectedUsers]));

      const usersToUpdate = users.filter(u => selectedUsers.has(u.id));
      
      for (const user of usersToUpdate) {
        await supabase
          .from('users')
          .update({ role: bulkRoleAction, updated_at: new Date().toISOString() })
          .eq('id', user.id);
      }

      setUsers(prev =>
        prev.map(u =>
          selectedUsers.has(u.id) ? { ...u, role: bulkRoleAction } : u
        )
      );

      showSuccess(`${selectedUsers.size} users updated to ${bulkRoleAction}`);
      setSelectedUsers(new Set());
      setBulkRoleAction(null);
    } catch (err) {
      console.error('Error bulk updating roles:', err);
      showError('Failed to update some users');
    } finally {
      setUpdatingRoles(prev => {
        const newSet = new Set(prev);
        selectedUsers.forEach(id => newSet.delete(id));
        return newSet;
      });
    }
  };

  // Filter and search users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      const matchesSearch =
        searchQuery === '' ||
        user.wallet_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesRole && matchesSearch;
    });
  }, [users, filterRole, searchQuery]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-700';
      case 'seller':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-700';
      case 'customer':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700';
      default:
        return 'bg-gray-100 dark:bg-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black pt-24">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Loader className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black pt-24">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-8 h-8 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">User Management</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Manage user roles and permissions. Total users: <span className="font-semibold">{users.length}</span>
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users', value: users.length, color: 'bg-blue-500' },
            { label: 'Customers', value: users.filter(u => u.role === 'customer').length, color: 'bg-green-500' },
            { label: 'Sellers', value: users.filter(u => u.role === 'seller').length, color: 'bg-indigo-500' },
            { label: 'Admins', value: users.filter(u => u.role === 'admin').length, color: 'bg-red-500' },
          ].map((stat, idx) => (
            <div
              key={idx}
              className={`${stat.color} rounded-xl p-6 text-white shadow-lg`}
            >
              <p className="text-sm font-medium opacity-90">{stat.label}</p>
              <p className="text-3xl font-bold mt-2">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Bulk Actions */}
        {selectedUsers.size > 0 && (
          <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-indigo-900 dark:text-indigo-100">
                  {selectedUsers.size} user{selectedUsers.size !== 1 ? 's' : ''} selected
                </p>
                <p className="text-sm text-indigo-700 dark:text-indigo-300">
                  Select a role to bulk update all selected users
                </p>
              </div>
              <div className="flex gap-2">
                {(['customer', 'seller', 'admin'] as const).map(role => (
                  <button
                    key={role}
                    onClick={() => {
                      setBulkRoleAction(role);
                      bulkUpdateRoles();
                    }}
                    disabled={updatingRoles.size > 0}
                    className={`px-4 py-2 rounded-lg font-medium capitalize transition-all ${
                      bulkRoleAction === role
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-indigo-200 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/50'
                    } disabled:opacity-50`}
                  >
                    {role}
                  </button>
                ))}
                <button
                  onClick={() => setSelectedUsers(new Set())}
                  className="px-4 py-2 rounded-lg font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by wallet address or user ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2">
            {(['all', 'customer', 'seller', 'admin'] as const).map(role => (
              <button
                key={role}
                onClick={() => setFilterRole(role)}
                className={`px-4 py-2 rounded-lg font-medium capitalize transition-all ${
                  filterRole === role
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
                }`}
              >
                {role === 'all' ? 'All Roles' : role}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-800">
          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
                          } else {
                            setSelectedUsers(new Set());
                          }
                        }}
                        className="w-4 h-4 rounded"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Wallet Address
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      User ID
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Current Role
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Loyalty Points
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Joined
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.has(user.id)}
                          onChange={e => {
                            const newSelected = new Set(selectedUsers);
                            if (e.target.checked) {
                              newSelected.add(user.id);
                            } else {
                              newSelected.delete(user.id);
                            }
                            setSelectedUsers(newSelected);
                          }}
                          className="w-4 h-4 rounded"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-gray-900 dark:text-gray-100">
                          {user.wallet_address.slice(0, 10)}...{user.wallet_address.slice(-8)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-gray-600 dark:text-gray-400">
                          {user.id.slice(0, 12)}...
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold capitalize ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{user.loyalty_points}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{formatDate(user.created_at)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative group">
                          <button className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                            Change Role
                            <ChevronDown className="w-4 h-4" />
                          </button>
                          <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                            {(['customer', 'seller', 'admin'] as const).map(role => (
                              <button
                                key={role}
                                onClick={() => updateUserRole(user.id, user.wallet_address, role)}
                                disabled={updatingRoles.has(user.id)}
                                className={`w-full text-left px-4 py-3 text-sm font-medium capitalize transition-colors ${
                                  user.role === role
                                    ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-900 dark:text-indigo-100'
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                                } ${updatingRoles.has(user.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                <div className="flex items-center justify-between">
                                  <span>{role}</span>
                                  {updatingRoles.has(user.id) && role === user.role ? (
                                    <Loader className="w-4 h-4 animate-spin" />
                                  ) : user.role === role ? (
                                    <CheckCircle className="w-4 h-4" />
                                  ) : null}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-xl">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Tip:</strong> Use the checkboxes to select multiple users and then choose a role from the bulk actions bar above the table to update them all at once.
          </p>
        </div>
      </div>
    </div>
  );
}
