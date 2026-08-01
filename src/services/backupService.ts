import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

export interface BackupCollectionSummary {
  collectionName: string;
  documentCount: number;
  sizeBytesEstimated: number;
}

export interface SystemBackupExport {
  version: string;
  timestamp: string;
  exportedBy: string;
  environment: string;
  collections: Record<string, any[]>;
  summary: BackupCollectionSummary[];
}

export class BackupService {
  private COLLECTIONS_TO_BACKUP = [
    'workspaces',
    'users',
    'workspace_trials',
    'referrals',
    'trial_extensions',
    'billing_subscriptions',
    'invoices',
    'coupons',
    'audit_logs',
    'telemetry_events',
    'system_incidents'
  ];

  /**
   * Generates a full system JSON export of all Firestore collections
   */
  async generateFullSystemBackup(adminEmail: string = 'ahmed@zainauto.io'): Promise<SystemBackupExport> {
    const backupData: Record<string, any[]> = {};
    const summaryList: BackupCollectionSummary[] = [];

    for (const colName of this.COLLECTIONS_TO_BACKUP) {
      try {
        const colRef = collection(db, colName);
        const snap = await getDocs(colRef);
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        backupData[colName] = docs;

        const jsonStr = JSON.stringify(docs);
        summaryList.push({
          collectionName: colName,
          documentCount: docs.length,
          sizeBytesEstimated: jsonStr.length
        });
      } catch (e) {
        console.warn(`Backup collection ${colName} read warning:`, e);
        backupData[colName] = [];
        summaryList.push({
          collectionName: colName,
          documentCount: 0,
          sizeBytesEstimated: 0
        });
      }
    }

    return {
      version: '1.0.0-PROD',
      timestamp: new Date().toISOString(),
      exportedBy: adminEmail,
      environment: 'production',
      collections: backupData,
      summary: summaryList
    };
  }

  /**
   * Triggers a browser download of the backup JSON
   */
  downloadBackupFile(backup: SystemBackupExport) {
    const filename = `Zain_Backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export const backupService = new BackupService();
