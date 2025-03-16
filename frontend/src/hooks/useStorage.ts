import { storageService } from '../services/storageService';

export function useStorage() {
    return storageService.storage;
}
