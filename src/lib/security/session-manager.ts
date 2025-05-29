import { connectToDatabase } from '@/lib/mongodb';
import { logAuditEvent } from './audit-logger';

export interface SessionMetadata {
  userId: string;
  sessionId: string;
  createdAt: Date;
  lastActiveAt: Date;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
  isRevoked: boolean;
  revokedAt?: Date;
  revokedReason?: string;
}

export async function trackSession(metadata: Omit<SessionMetadata, 'isRevoked' | 'createdAt'>) {
  const { db } = await connectToDatabase();
  
  const session = {
    ...metadata,
    createdAt: new Date(),
    isRevoked: false,
  };

  await db.collection('sessions').insertOne(session);

  await logAuditEvent({
    userId: metadata.userId,
    action: 'session_created',
    category: 'auth',
    status: 'success',
    details: {
      sessionId: metadata.sessionId,
      ipAddress: metadata.ipAddress,
    },
  });

  // Enforce max sessions per user (e.g., 5)
  const sessions = await db.collection('sessions').find({
    userId: metadata.userId,
    isRevoked: false,
  }).sort({ createdAt: -1 }).toArray();

  if (sessions.length > 5) {
    // Revoke oldest sessions
    const oldestSessions = sessions.slice(5);
    await Promise.all(oldestSessions.map(s => 
      revokeSession(s.sessionId, 'max_sessions_exceeded')
    ));
  }
}

export async function updateSessionActivity(sessionId: string) {
  const { db } = await connectToDatabase();
  
  await db.collection('sessions').updateOne(
    { sessionId },
    { 
      $set: { 
        lastActiveAt: new Date() 
      } 
    }
  );
}

export async function revokeSession(
  sessionId: string,
  reason: string = 'manual_revocation'
) {
  const { db } = await connectToDatabase();
  
  const session = await db.collection('sessions').findOne({ sessionId });
  
  if (!session) {
    throw new Error('Session not found');
  }

  await db.collection('sessions').updateOne(
    { sessionId },
    { 
      $set: { 
        isRevoked: true,
        revokedAt: new Date(),
        revokedReason: reason
      } 
    }
  );

  await logAuditEvent({
    userId: session.userId,
    action: 'session_revoked',
    category: 'auth',
    status: 'success',
    details: {
      sessionId,
      reason,
    },
  });
}

export async function validateSession(sessionId: string): Promise<boolean> {
  const { db } = await connectToDatabase();
  
  const session = await db.collection('sessions').findOne({ 
    sessionId,
    isRevoked: false,
    expiresAt: { $gt: new Date() }
  });

  return !!session;
}

export async function revokeAllUserSessions(
  userId: string,
  reason: string = 'security_measure',
  exceptSessionId?: string
) {
  const { db } = await connectToDatabase();
  
  const query = { 
    userId, 
    isRevoked: false,
    ...(exceptSessionId && { sessionId: { $ne: exceptSessionId } })
  };

  const sessions = await db.collection('sessions').find(query).toArray();
  
  await Promise.all(sessions.map(session => 
    revokeSession(session.sessionId, reason)
  ));

  return sessions.length;
}
