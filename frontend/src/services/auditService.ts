import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import type { AuditAction, AuditLog } from '../types/auth';

const AUDIT_COLLECTION = 'audit_logs';

export const logAuditEvent = async (
  action: AuditAction,
  targetUserId?: string,
  performedBy?: { uid: string; email: string; name?: string },
  details?: string,
  targetUserMeta?: { name?: string; email?: string }
): Promise<void> => {
  try {
    await addDoc(collection(db, AUDIT_COLLECTION), {
      action,
      targetUserId: targetUserId || null,
      targetUserName: targetUserMeta?.name || null,
      targetUserEmail: targetUserMeta?.email || null,
      performedByUid: performedBy?.uid || 'system',
      performedByName: performedBy?.name || 'System',
      performedByEmail: performedBy?.email || 'system@ksp.gov.in',
      details: details || null,
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Failed to record audit event in Firestore:', err);
  }
};

export const fetchAuditLogs = async (maxLogs: number = 50): Promise<AuditLog[]> => {
  try {
    const q = query(
      collection(db, AUDIT_COLLECTION),
      orderBy('timestamp', 'desc'),
      limit(maxLogs)
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<AuditLog, 'id'>)
    }));
  } catch (err) {
    console.error('Error fetching audit logs:', err);
    return [];
  }
};
