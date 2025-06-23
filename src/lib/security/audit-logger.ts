import { prisma } from '@/lib/prisma';

export interface AuditLog {
  userId?: string;
  action: string;
  category: 'auth' | 'data' | 'admin' | 'security';
  status: 'success' | 'failure';
  details: Record<string, string | number | boolean | null | undefined>;
  ip?: string;
  userAgent?: string;
  timestamp: Date;
}

export async function logAuditEvent(event: Omit<AuditLog, 'timestamp'>) {
  try {
    const logEntry = {
      ...event,
      timestamp: new Date(),
    };

    await prisma.auditLog.create({
      data: {
        userId: logEntry.userId,
        action: logEntry.action,
        category: logEntry.category,
        status: logEntry.status,
        details: logEntry.details,
        ip: logEntry.ip,
        userAgent: logEntry.userAgent,
        timestamp: logEntry.timestamp,
      }
    });

    // If it's a security-related failure, also store in a separate collection
    if (event.category === 'security' && event.status === 'failure') {
      await prisma.securityIncident.create({
        data: {
          userId: logEntry.userId,
          action: logEntry.action,
          category: logEntry.category,
          status: logEntry.status,
          details: logEntry.details,
          ip: logEntry.ip,
          userAgent: logEntry.userAgent,
          timestamp: logEntry.timestamp,
          reviewed: false,
          severity: 'medium',
          resolution: null,
        }      });
    }
  } catch (error) {
    console.error('Failed to write audit log:', error);
    // Don't throw - audit logging should not interrupt the main flow
  }
}

export async function getAuditLogs(
  filters: Partial<AuditLog> = {},
  limit = 100,
  skip = 0
) {
  try {
    const whereClause = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, unknown>);

    const logs = await prisma.auditLog.findMany({
      where: whereClause,
      orderBy: { timestamp: 'desc' },
      skip,
      take: limit,
    });

    return logs;
  } catch (error) {
    console.error('Failed to retrieve audit logs:', error);
    throw error;
  }
}
