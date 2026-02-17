import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'bangbang-secret-key-change-in-production-2024';
const JWT_EXPIRES_IN = '7d';

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

export async function requireAdmin(request) {
    const user = await authenticateRequest(request);
    if (!user || user.role !== 'admin') {
        return null;
    }
    return user;
}
