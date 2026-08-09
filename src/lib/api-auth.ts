import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_destin_key_123';

export function getToken(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.slice(7);
}

export async function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
  } catch {
    return null;
  }
}

export async function requireAuth(request: Request) {
  const token = getToken(request);
  if (!token) return { error: 'Unauthorized', status: 401 };
  const decoded = await verifyToken(token);
  if (!decoded) return { error: 'Unauthorized', status: 401 };
  return { user: decoded };
}

export async function requireAdmin(request: Request) {
  const token = getToken(request);
  if (!token) return { error: 'Unauthorized', status: 401 };
  const decoded = await verifyToken(token);
  if (!decoded || decoded.role !== 'admin') return { error: 'Forbidden', status: 403 };
  return { user: decoded };
}
