// Database abstraction layer - uses local storage in dev mode, DynamoDB in production
import { Asset, AuditLogEntry, AssetType } from './dynamodb';
import { LocalStorageDB } from './local-storage-db';

// Check if we're in local development mode
const USE_LOCAL_STORAGE = process.env.USE_LOCAL_STORAGE === 'true' ||
                          process.env.NODE_ENV === 'development' && !process.env.AMPLIFY_ACCESS_KEY_ID;

// Lazy load DynamoDB service only when needed
let DynamoDBServiceInstance: any = null;

async function getDynamoDBService() {
  if (!DynamoDBServiceInstance) {
    const { DynamoDBService } = await import('./dynamodb');
    DynamoDBServiceInstance = DynamoDBService;
  }
  return DynamoDBServiceInstance;
}

export class DatabaseService {
  // Initialize database (create tables if using DynamoDB, or init local storage)
  static async createTableIfNotExists(): Promise<void> {
    if (USE_LOCAL_STORAGE) {
      console.log('Using local storage for development');
      LocalStorageDB.initialize();
      return;
    }
    const DynamoDBService = await getDynamoDBService();
    return DynamoDBService.createTableIfNotExists();
  }

  // Asset operations
  static async getAllAssets(): Promise<Asset[]> {
    if (USE_LOCAL_STORAGE) {
      console.log('Fetching assets from local storage');
      return LocalStorageDB.getAssets();
    }
    const DynamoDBService = await getDynamoDBService();
    return DynamoDBService.getAllAssets();
  }

  static async getAssetById(id: string): Promise<Asset | null> {
    if (USE_LOCAL_STORAGE) {
      return LocalStorageDB.getAssetById(id) || null;
    }
    const DynamoDBService = await getDynamoDBService();
    return DynamoDBService.getAssetById(id);
  }

  static async createAsset(asset: Partial<Asset>): Promise<Asset> {
    if (USE_LOCAL_STORAGE) {
      return LocalStorageDB.createAsset(asset as any);
    }
    const DynamoDBService = await getDynamoDBService();
    return DynamoDBService.createAsset(asset);
  }

  static async updateAsset(id: string, updates: Partial<Asset>): Promise<Asset | null> {
    if (USE_LOCAL_STORAGE) {
      return LocalStorageDB.updateAsset(id, updates);
    }
    const DynamoDBService = await getDynamoDBService();
    return DynamoDBService.updateAsset(id, updates);
  }

  static async deleteAsset(id: string): Promise<boolean> {
    if (USE_LOCAL_STORAGE) {
      return LocalStorageDB.deleteAsset(id);
    }
    const DynamoDBService = await getDynamoDBService();
    return DynamoDBService.deleteAsset(id);
  }

  static async bulkCreateAssets(assets: Partial<Asset>[]): Promise<Asset[]> {
    if (USE_LOCAL_STORAGE) {
      return LocalStorageDB.bulkCreateAssets(assets as any);
    }
    const DynamoDBService = await getDynamoDBService();
    return DynamoDBService.bulkCreateAssets(assets);
  }

  static async cleanupBlankAssets(): Promise<{ deletedCount: number }> {
    if (USE_LOCAL_STORAGE) {
      const assets = LocalStorageDB.getAssets();
      const blankAssets = assets.filter(
        a => !a.assetBarcode || a.assetBarcode.trim() === ''
      );
      blankAssets.forEach(a => LocalStorageDB.deleteAsset(a.id));
      return { deletedCount: blankAssets.length };
    }
    const DynamoDBService = await getDynamoDBService();
    return DynamoDBService.cleanupBlankAssets();
  }

  // Audit log operations
  static async logAuditEntry(entry: AuditLogEntry): Promise<void> {
    if (USE_LOCAL_STORAGE) {
      LocalStorageDB.addAuditLog(entry);
      return;
    }
    const DynamoDBService = await getDynamoDBService();
    return DynamoDBService.logAuditEntry(entry);
  }

  static async getAuditLogs(assetId?: string): Promise<AuditLogEntry[]> {
    if (USE_LOCAL_STORAGE) {
      if (assetId) {
        return LocalStorageDB.getAuditLogsForAsset(assetId);
      }
      return LocalStorageDB.getAuditLogs();
    }
    const DynamoDBService = await getDynamoDBService();
    return DynamoDBService.getAuditLogs(assetId);
  }

  // Asset type operations
  static async getAllAssetTypes(): Promise<AssetType[]> {
    if (USE_LOCAL_STORAGE) {
      return LocalStorageDB.getAssetTypes();
    }
    const DynamoDBService = await getDynamoDBService();
    return DynamoDBService.getAllAssetTypes();
  }

  static async createAssetType(label: string, createdBy?: string): Promise<AssetType> {
    if (USE_LOCAL_STORAGE) {
      return LocalStorageDB.createAssetType(label, createdBy);
    }
    const DynamoDBService = await getDynamoDBService();
    return DynamoDBService.createAssetType(label, createdBy);
  }

  static async deleteAssetType(typeId: string): Promise<boolean> {
    if (USE_LOCAL_STORAGE) {
      return LocalStorageDB.deleteAssetType(typeId);
    }
    const DynamoDBService = await getDynamoDBService();
    return DynamoDBService.deleteAssetType(typeId);
  }

  // Utility
  static isUsingLocalStorage(): boolean {
    return USE_LOCAL_STORAGE;
  }
}

// Re-export types for convenience
export type { Asset, AuditLogEntry, AssetType };
