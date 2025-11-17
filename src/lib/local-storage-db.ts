// Local storage-based database for development without AWS
import { Asset, AuditLogEntry, AssetType } from './dynamodb';

const STORAGE_PREFIX = 'watersafety_';
const ASSETS_KEY = `${STORAGE_PREFIX}assets`;
const AUDIT_KEY = `${STORAGE_PREFIX}audit`;
const ASSET_TYPES_KEY = `${STORAGE_PREFIX}asset_types`;

// In-memory storage for server-side (since localStorage is browser-only)
class MemoryStorage {
  private storage: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.storage.get(key) || null;
  }

  setItem(key: string, value: string): void {
    this.storage.set(key, value);
  }

  removeItem(key: string): void {
    this.storage.delete(key);
  }

  clear(): void {
    this.storage.clear();
  }
}

// Use in-memory storage on server, localStorage on client
const storage = typeof window !== 'undefined' ? window.localStorage : new MemoryStorage();

// Sample data for initial setup
const SAMPLE_ASSETS: Asset[] = [
  {
    id: '1',
    assetBarcode: 'WT-001',
    status: 'ACTIVE',
    assetType: 'Water Tap',
    primaryIdentifier: 'WT-001',
    secondaryIdentifier: 'Main Floor',
    wing: 'North Wing',
    wingInShort: 'NW',
    room: 'Room 101',
    floor: '1',
    floorInWords: 'First',
    roomNo: '101',
    roomName: 'Consultation Room',
    filterNeeded: true,
    filtersOn: true,
    filterExpiryDate: '2025-12-31',
    filterInstalledOn: '2025-01-01',
    filterType: 'Standard',
    needFlushing: false,
    notes: 'Sample asset for local development',
    augmentedCare: false,
    lowUsageAsset: false,
    created: new Date().toISOString(),
    createdBy: 'System',
    modified: new Date().toISOString(),
    modifiedBy: 'System',
  },
  {
    id: '2',
    assetBarcode: 'WC-001',
    status: 'ACTIVE',
    assetType: 'Water Cooler',
    primaryIdentifier: 'WC-001',
    secondaryIdentifier: 'Reception Area',
    wing: 'South Wing',
    wingInShort: 'SW',
    room: 'Reception',
    floor: 'G',
    floorInWords: 'Ground',
    roomNo: 'REC',
    roomName: 'Reception',
    filterNeeded: false,
    filtersOn: false,
    filterExpiryDate: '',
    filterInstalledOn: '',
    filterType: '',
    needFlushing: false,
    notes: 'Water cooler in reception',
    augmentedCare: false,
    lowUsageAsset: false,
    created: new Date().toISOString(),
    createdBy: 'System',
    modified: new Date().toISOString(),
    modifiedBy: 'System',
  },
];

const SAMPLE_ASSET_TYPES: AssetType[] = [
  { typeId: '1', label: 'Water Tap', createdAt: new Date().toISOString(), createdBy: 'System' },
  { typeId: '2', label: 'Water Cooler', createdAt: new Date().toISOString(), createdBy: 'System' },
  { typeId: '3', label: 'LNS Outlet - TMT', createdAt: new Date().toISOString(), createdBy: 'System' },
  { typeId: '4', label: 'LNS Shower - TMT', createdAt: new Date().toISOString(), createdBy: 'System' },
];

export class LocalStorageDB {
  // Initialize with sample data if empty
  static initialize(): void {
    const assets = this.getAssets();
    if (assets.length === 0) {
      storage.setItem(ASSETS_KEY, JSON.stringify(SAMPLE_ASSETS));
      console.log('Initialized local storage with sample assets');
    }

    const assetTypes = this.getAssetTypes();
    if (assetTypes.length === 0) {
      storage.setItem(ASSET_TYPES_KEY, JSON.stringify(SAMPLE_ASSET_TYPES));
      console.log('Initialized local storage with sample asset types');
    }
  }

  // Asset operations
  static getAssets(): Asset[] {
    try {
      const data = storage.getItem(ASSETS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading assets from local storage:', error);
      return [];
    }
  }

  static saveAssets(assets: Asset[]): void {
    storage.setItem(ASSETS_KEY, JSON.stringify(assets));
  }

  static getAssetById(id: string): Asset | undefined {
    const assets = this.getAssets();
    return assets.find(a => a.id === id);
  }

  static createAsset(asset: Omit<Asset, 'id' | 'created' | 'modified'>): Asset {
    const assets = this.getAssets();
    const newAsset: Asset = {
      ...asset,
      id: Date.now().toString(),
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
    };
    assets.push(newAsset);
    this.saveAssets(assets);
    this.addAuditLog({
      assetId: newAsset.id,
      timestamp: new Date().toISOString(),
      user: asset.createdBy || 'Unknown',
      action: 'CREATE',
      details: newAsset,
    });
    return newAsset;
  }

  static updateAsset(id: string, updates: Partial<Asset>): Asset | null {
    const assets = this.getAssets();
    const index = assets.findIndex(a => a.id === id);
    if (index === -1) return null;

    assets[index] = {
      ...assets[index],
      ...updates,
      modified: new Date().toISOString(),
    };
    this.saveAssets(assets);
    this.addAuditLog({
      assetId: id,
      timestamp: new Date().toISOString(),
      user: updates.modifiedBy || 'Unknown',
      action: 'UPDATE',
      details: updates,
    });
    return assets[index];
  }

  static deleteAsset(id: string): boolean {
    const assets = this.getAssets();
    const filteredAssets = assets.filter(a => a.id !== id);
    if (filteredAssets.length === assets.length) return false;

    this.saveAssets(filteredAssets);
    this.addAuditLog({
      assetId: id,
      timestamp: new Date().toISOString(),
      user: 'System',
      action: 'DELETE',
    });
    return true;
  }

  static bulkCreateAssets(assets: Omit<Asset, 'id' | 'created' | 'modified'>[]): Asset[] {
    const existingAssets = this.getAssets();
    const newAssets = assets.map(asset => ({
      ...asset,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
    }));
    this.saveAssets([...existingAssets, ...newAssets]);
    return newAssets;
  }

  // Audit log operations
  static getAuditLogs(): AuditLogEntry[] {
    try {
      const data = storage.getItem(AUDIT_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading audit logs from local storage:', error);
      return [];
    }
  }

  static addAuditLog(entry: AuditLogEntry): void {
    const logs = this.getAuditLogs();
    logs.push(entry);
    storage.setItem(AUDIT_KEY, JSON.stringify(logs));
  }

  static getAuditLogsForAsset(assetId: string): AuditLogEntry[] {
    const logs = this.getAuditLogs();
    return logs.filter(log => log.assetId === assetId);
  }

  // Asset type operations
  static getAssetTypes(): AssetType[] {
    try {
      const data = storage.getItem(ASSET_TYPES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading asset types from local storage:', error);
      return [];
    }
  }

  static saveAssetTypes(types: AssetType[]): void {
    storage.setItem(ASSET_TYPES_KEY, JSON.stringify(types));
  }

  static createAssetType(label: string, createdBy?: string): AssetType {
    const types = this.getAssetTypes();
    const newType: AssetType = {
      typeId: Date.now().toString(),
      label,
      createdAt: new Date().toISOString(),
      createdBy,
    };
    types.push(newType);
    this.saveAssetTypes(types);
    return newType;
  }

  static deleteAssetType(typeId: string): boolean {
    const types = this.getAssetTypes();
    const filteredTypes = types.filter(t => t.typeId !== typeId);
    if (filteredTypes.length === types.length) return false;
    this.saveAssetTypes(filteredTypes);
    return true;
  }

  // Clear all data (for testing)
  static clearAll(): void {
    storage.removeItem(ASSETS_KEY);
    storage.removeItem(AUDIT_KEY);
    storage.removeItem(ASSET_TYPES_KEY);
  }
}

// Initialize on import
if (typeof window === 'undefined') {
  // Server-side: always initialize
  LocalStorageDB.initialize();
}
