import jwt from 'jsonwebtoken';
import pool from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'bangbang-secret-key-change-in-production-2024';
const JWT_EXPIRES_IN = '7d';

// Role hierarchy: customer < staff < admin < superadmin
const ROLE_LEVEL = {
    customer: 0,
    staff: 1,
    admin: 2,
    superadmin: 3,
};

export function signToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

export function getTokenFromHeaders(headers) {
    const auth = headers.get('authorization');
    if (auth && auth.startsWith('Bearer ')) {
        return auth.slice(7);
    }
    return null;
}

export async function authenticateRequest(request) {
    const token = getTokenFromHeaders(request.headers);
    if (!token) return null;
    return verifyToken(token);
}

// Require at least staff role (staff, admin, superadmin)
export async function requireStaff(request) {
    const user = await authenticateRequest(request);
    if (!user || ROLE_LEVEL[user.role] < ROLE_LEVEL.staff) {
        return null;
    }
    return user;
}

// Require at least admin role (admin, superadmin)
export async function requireAdmin(request) {
    const user = await authenticateRequest(request);
    if (!user || ROLE_LEVEL[user.role] < ROLE_LEVEL.admin) {
        return null;
    }
    return user;
}

// Require superadmin role only
export async function requireSuperAdmin(request) {
    const user = await authenticateRequest(request);
    if (!user || user.role !== 'superadmin') {
        return null;
    }
    return user;
}

// Check if a role has minimum required level
export function hasMinRole(userRole, requiredRole) {
    return (ROLE_LEVEL[userRole] || 0) >= (ROLE_LEVEL[requiredRole] || 0);
}

// Log admin action to database
export async function logAdminAction(user, action, targetType, targetId, details, request) {
    try {
        const ip = request?.headers?.get('x-forwarded-for') ||
            request?.headers?.get('x-real-ip') ||
            'unknown';
        await pool.query(
            `INSERT INTO admin_logs (user_id, user_name, user_role, action, target_type, target_id, details, ip_address) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [user.id, user.name, user.role, action, targetType, targetId || null, JSON.stringify(details), ip]
        );
    } catch (error) {
        console.error('Failed to log admin action:', error);
    }
}
