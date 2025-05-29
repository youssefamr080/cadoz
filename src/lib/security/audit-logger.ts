import { connectToDatabase } from '@/lib/mongodb';

export interface AuditLog {
  userId?: string;
  action: string;
  category: 'auth' | 'data' | 'admin' | 'security';
  status: 'success' | 'failure';  details: Record<string, string | number | boolean | null | undefined>;
  ip?: string;
  userAgent?: string;
  timestamp: Date;
}

export async function logAuditEvent(event: Omit<AuditLog, 'timestamp'>) {
  try {
    const { db } = await connectToDatabase();
    
    const logEntry = {
      ...event,
      timestamp: new Date(),
    };

    await db.collection('auditLogs').insertOne(logEntry);

    // If it's a security-related failure, also store in a separate collection
    if (event.category === 'security' && event.status === 'failure') {
      await db.collection('securityIncidents').insertOne({
        ...logEntry,
        reviewed: false,
        severity: 'medium', // Default severity
        resolution: null,
      });
    }
  } catch (error) {
    console.error('Failed to write audit log:', error);
    // Don't throw - audit logging should not interrupt the main flow
  }
}

interface QueryFilters {
  userId?: string;
  action?: string;
  category?: 'auth' | 'data' | 'admin' | 'security';
  status?: 'success' | 'failure';
  timestamp?: Date;
  ip?: string;
  userAgent?: string;
}

export async function getAuditLogs(
  filters: Partial<AuditLog> = {},
  limit = 100,
  skip = 0
) {
  try {
    const { db } = await connectToDatabase();
    
    const query = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as QueryFilters);

    const logs = await db.collection('auditLogs')
      .find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return logs;
  } catch (error) {
    console.error('Failed to retrieve audit logs:', error);
    throw error;
  }
}
