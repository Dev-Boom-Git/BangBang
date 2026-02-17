'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { ScrollText, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

const ACTION_LABELS = {
    create_product: { label: 'เพิ่มสินค้า', color: 'text-green-600 bg-green-50' },
    update_product: { label: 'แก้ไขสินค้า', color: 'text-blue-600 bg-blue-50' },
    delete_product: { label: 'ลบสินค้า', color: 'text-red-600 bg-red-50' },
    update_order_status: { label: 'อัพเดทออเดอร์', color: 'text-purple-600 bg-purple-50' },
    update_settings: { label: 'แก้ไขตั้งค่า', color: 'text-amber-600 bg-amber-50' },
    create_user: { label: 'เพิ่มผู้ใช้', color: 'text-green-600 bg-green-50' },
    update_user: { label: 'แก้ไขผู้ใช้', color: 'text-blue-600 bg-blue-50' },
    delete_user: { label: 'ลบผู้ใช้', color: 'text-red-600 bg-red-50' },
};

export default function LogsPage() {
    const [logs, setLogs] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [actionFilter, setActionFilter] = useState('');
    const limit = 20;

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => { fetchLogs(); }, [page, actionFilter]);

    async function fetchLogs() {
        setLoading(true);
        try {
            const params = new URLSearchParams({ limit, offset: page * limit });
            if (actionFilter) params.set('action', actionFilter);
            const res = await fetch(`/api/admin/logs?${params}`, { headers });
            if (res.ok) {
                const data = await res.json();
                setLogs(data.logs);
                setTotal(data.total);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }

    const totalPages = Math.ceil(total / limit);

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2"><ScrollText className="w-6 h-6" /> Activity Log</h1>
                    <p className="text-gray-500 mt-1">ประวัติการใช้งานระบบหลังบ้าน ({total} รายการ)</p>
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(0); }} className="border rounded-lg px-3 py-2 text-sm">
                        <option value="">ทั้งหมด</option>
                        <option value="product">🛍️ สินค้า</option>
                        <option value="order">📦 ออเดอร์</option>
                        <option value="settings">⚙️ ตั้งค่า</option>
                        <option value="user">👤 ผู้ใช้</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full" /></div>
            ) : logs.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                    <ScrollText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>ยังไม่มีประวัติ</p>
                </div>
            ) : (
                <>
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">เวลา</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">ผู้ดำเนินการ</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">การกระทำ</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">รายละเอียด</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">IP</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {logs.map(log => {
                                    const actionInfo = ACTION_LABELS[log.action] || { label: log.action, color: 'text-gray-600 bg-gray-50' };
                                    let details = '';
                                    try {
                                        const d = JSON.parse(log.details);
                                        details = Object.entries(d).map(([k, v]) => `${k}: ${v}`).join(', ');
                                    } catch { details = log.details; }
                                    return (
                                        <tr key={log.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-3 text-sm text-gray-500 whitespace-nowrap">
                                                {new Date(log.created_at).toLocaleString('th-TH', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="px-6 py-3">
                                                <div className="text-sm font-medium">{log.user_name}</div>
                                                <div className="text-xs text-gray-400">{log.user_role}</div>
                                            </td>
                                            <td className="px-6 py-3">
                                                <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${actionInfo.color}`}>
                                                    {actionInfo.label}
                                                </span>
                                                {log.target_id && <span className="text-xs text-gray-400 ml-1">#{log.target_id}</span>}
                                            </td>
                                            <td className="px-6 py-3 text-sm text-gray-500 max-w-xs truncate">{details}</td>
                                            <td className="px-6 py-3 text-xs text-gray-400 font-mono">{log.ip_address}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4 px-2">
                            <p className="text-sm text-gray-500">หน้า {page + 1} / {totalPages}</p>
                            <div className="flex gap-2">
                                <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-30">
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-30">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
