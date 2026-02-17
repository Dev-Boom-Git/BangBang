'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Users, Plus, Trash2, Shield, ShieldCheck, ShieldAlert, User, X, Eye, EyeOff } from 'lucide-react';

const ROLE_LABELS = {
    customer: { label: 'ลูกค้า', color: 'bg-gray-100 text-gray-700', icon: User },
    staff: { label: 'พนักงาน', color: 'bg-blue-100 text-blue-700', icon: Shield },
    admin: { label: 'แอดมิน', color: 'bg-amber-100 text-amber-700', icon: ShieldCheck },
    superadmin: { label: 'Super Admin', color: 'bg-red-100 text-red-700', icon: ShieldAlert },
};

export default function UsersPage() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'staff' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const token = typeof window !== 'undefined' ? localStorage.getItem('bangbang_token') : null;
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

    const isSuperAdmin = currentUser?.role === 'superadmin';

    useEffect(() => { fetchUsers(); }, []);

    async function fetchUsers() {
        try {
            const res = await fetch('/api/admin/users', { headers });
            if (res.ok) setUsers(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }

    async function createUser(e) {
        e.preventDefault();
        setError('');
        try {
            const res = await fetch('/api/admin/users', { method: 'POST', headers, body: JSON.stringify(form) });
            const data = await res.json();
            if (!res.ok) { setError(data.error); return; }
            setShowForm(false);
            setForm({ name: '', email: '', password: '', phone: '', role: 'staff' });
            fetchUsers();
        } catch (e) { setError('เกิดข้อผิดพลาด'); }
    }

    async function updateRole(id, newRole) {
        try {
            await fetch(`/api/admin/users/${id}`, { method: 'PUT', headers, body: JSON.stringify({ role: newRole }) });
            setEditingRole(null);
            fetchUsers();
        } catch (e) { console.error(e); }
    }

    async function deleteUser(id, name) {
        if (!confirm(`ยืนยันลบผู้ใช้ "${name}" ?`)) return;
        try {
            await fetch(`/api/admin/users/${id}`, { method: 'DELETE', headers });
            fetchUsers();
        } catch (e) { console.error(e); }
    }

    if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full" /></div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="w-6 h-6" /> จัดการผู้ใช้</h1>
                    <p className="text-gray-500 mt-1">ผู้ใช้ทั้งหมด {users.length} คน</p>
                </div>
                {isSuperAdmin && (
                    <button onClick={() => setShowForm(true)} className="bg-amber-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-amber-700 transition">
                        <Plus className="w-4 h-4" /> เพิ่มพนักงาน
                    </button>
                )}
            </div>

            {/* Add User Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold">เพิ่มพนักงาน/แอดมิน</h2>
                            <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}
                        <form onSubmit={createUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">ชื่อ</label>
                                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">อีเมล</label>
                                <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">รหัสผ่าน</label>
                                <div className="relative">
                                    <input required type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm pr-10" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-gray-400">
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">เบอร์โทร</label>
                                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">ระดับสิทธิ์</label>
                                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                                    <option value="staff">พนักงาน (Staff)</option>
                                    <option value="admin">แอดมิน (Admin)</option>
                                    <option value="superadmin">Super Admin</option>
                                </select>
                            </div>
                            <button type="submit" className="w-full bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 transition">สร้างบัญชี</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">ผู้ใช้</th>
                            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">อีเมล</th>
                            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">เบอร์โทร</th>
                            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">ระดับสิทธิ์</th>
                            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">สมัครเมื่อ</th>
                            {isSuperAdmin && <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">จัดการ</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map(u => {
                            const roleInfo = ROLE_LABELS[u.role] || ROLE_LABELS.customer;
                            const RoleIcon = roleInfo.icon;
                            const isMe = u.id === currentUser?.id;
                            return (
                                <tr key={u.id} className={`hover:bg-gray-50 ${isMe ? 'bg-amber-50/50' : ''}`}>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-sm">{u.name} {isMe && <span className="text-xs text-amber-600">(คุณ)</span>}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{u.phone || '-'}</td>
                                    <td className="px-6 py-4">
                                        {editingRole === u.id ? (
                                            <select
                                                value={u.role}
                                                onChange={e => updateRole(u.id, e.target.value)}
                                                onBlur={() => setEditingRole(null)}
                                                autoFocus
                                                className="border rounded px-2 py-1 text-sm"
                                            >
                                                <option value="customer">ลูกค้า</option>
                                                <option value="staff">พนักงาน</option>
                                                <option value="admin">แอดมิน</option>
                                                <option value="superadmin">Super Admin</option>
                                            </select>
                                        ) : (
                                            <button
                                                onClick={() => isSuperAdmin && !isMe && setEditingRole(u.id)}
                                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${roleInfo.color} ${isSuperAdmin && !isMe ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                                            >
                                                <RoleIcon className="w-3 h-3" /> {roleInfo.label}
                                            </button>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(u.created_at).toLocaleDateString('th-TH')}</td>
                                    {isSuperAdmin && (
                                        <td className="px-6 py-4">
                                            {!isMe && (
                                                <button onClick={() => deleteUser(u.id, u.name)} className="text-red-400 hover:text-red-600 transition">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
