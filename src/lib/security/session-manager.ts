import { prisma } from '@/lib/prisma';

export interface SessionData {
  sessionId: string;
  userId: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
  createdAt: Date;
  lastActiveAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

export async function createSession(data: Omit<SessionData, "sessionId" | "createdAt" | "lastActiveAt">): Promise<SessionData> {
  const session: SessionData = {
    sessionId: crypto.randomUUID(),
    userId: data.userId,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    expiresAt: data.expiresAt,
    createdAt: new Date(),
    lastActiveAt: new Date(),
    ipAddress: data.ipAddress,
    userAgent: data.userAgent
  };

  await prisma.session.create({
    data: {
      sessionId: session.sessionId,
      userId: session.userId,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      expiresAt: session.expiresAt,
      createdAt: session.createdAt,
      lastActiveAt: session.lastActiveAt,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent
    }
  });
  
  return session;
}

export async function deleteSession(sessionId: string): Promise<void> {
  try {
    await prisma.session.delete({
      where: { sessionId }
    });
  } catch (error) {
    console.error("[SESSION] Error deleting session:", error);
  }
}

export async function validateSession(sessionId: string): Promise<boolean> {
  try {
    const session = await prisma.session.findUnique({
      where: { sessionId }
    });    if (!session) {
      return false;
    }

    if (session.expiresAt && new Date() > session.expiresAt) {
      await deleteSession(sessionId);
      return false;
    }

    await prisma.session.update({
      where: { sessionId },
      data: { lastActiveAt: new Date() }
    });

    return true;
  } catch (error) {
    console.error("[SESSION] Error validating session:", error);
    return false;
  }
}

export async function getUserSessions(userId: string): Promise<SessionData[]> {
  try {
    const sessions = await prisma.session.findMany({
      where: { userId },
      orderBy: { lastActiveAt: 'desc' }
    });
    
    return sessions.map(session => ({
      userId: session.userId,
      sessionId: session.sessionId,
      createdAt: session.createdAt,
      lastActiveAt: session.lastActiveAt,
      expiresAt: session.expiresAt,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent
    }));
  } catch (error) {
    console.error("[SESSION] Error getting user sessions:", error);
    return [];
  }
}

export async function refreshGoogleToken(refreshToken: string): Promise<{ accessToken: string; expiresAt: Date } | null> {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000)
    };
  } catch (error) {
    console.error("[SESSION] Error refreshing Google token:", error);
    return null;
  }
}
