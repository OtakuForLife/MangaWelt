import { Storage } from '@ionic/storage';

class StorageService {
    private static instance: StorageService;
    private _storage: Storage | null = null;
    private _initPromise: Promise<void> | null = null;

    private constructor() {
        // Initialize storage when service is constructed
        this._initPromise = this.init();
    }

    static getInstance(): StorageService {
        if (!StorageService.instance) {
            StorageService.instance = new StorageService();
        }
        return StorageService.instance;
    }

    private async init() {
        if (!this._storage) {
            const storage = new Storage({
                name: 'mydb'
            });
            this._storage = await storage.create();
        }
    }

    async waitForInit() {
        await this._initPromise;
    }

    get storage(): Storage {
        if (!this._storage) {
            throw new Error('Storage not initialized. Call waitForInit() first');
        }
        return this._storage;
    }
}

export const storageService = StorageService.getInstance();
