import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { isTokenExpired, verifyToken, refreshToken } from '../api';
import { storageService } from '../../services/storageService';
import { ACCESS_TOKEN } from '../constants';

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
      post: vi.fn(),
    })),
  },
}));

// Mock storage service
vi.mock('../../services/storageService', () => ({
  storageService: {
    waitForInit: vi.fn().mockResolvedValue(undefined),
    storage: {
      get: vi.fn(),
      set: vi.fn(),
      clear: vi.fn(),
    },
  },
}));

// Mock redux store
vi.mock('../../redux/store', () => ({
  default: {
    dispatch: vi.fn(),
  },
}));

describe('API Utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('isTokenExpired', () => {
    it('should return true for expired token', () => {
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1MTYyMzkwMjJ9.tkpD3iCPQPVvEJY2VZTq8k9ohBsTNtz_8JNdNIBsGJ4';
      expect(isTokenExpired(expiredToken)).toBe(true);
    });

    it('should return true for invalid token', () => {
      const invalidToken = 'invalid-token';
      expect(isTokenExpired(invalidToken)).toBe(true);
    });
  });

  describe('verifyToken', () => {
    const mockAxiosInstance = axios.create() as jest.Mocked<typeof axios>;
    const mockAxiosPost = mockAxiosInstance.post as jest.Mock;

    it('should return true for valid token', async () => {
      mockAxiosPost.mockResolvedValueOnce({ status: 200 });
      const result = await verifyToken('valid-token');
      expect(result).toBe(true);
    });

    it('should return false for invalid token', async () => {
      mockAxiosPost.mockRejectedValueOnce(new Error('Invalid token'));
      const result = await verifyToken('invalid-token');
      expect(result).toBe(false);
    });
  });

  describe('refreshToken', () => {
    const mockAxiosInstance = axios.create() as jest.Mocked<typeof axios>;
    const mockAxiosPost = mockAxiosInstance.post as jest.Mock;
    const mockStorageGet = storageService.storage.get as jest.Mock;
    const mockStorageSet = storageService.storage.set as jest.Mock;

    it('should successfully refresh token', async () => {
      const newAccessToken = 'new-access-token';
      mockStorageGet.mockResolvedValueOnce('refresh-token');
      mockAxiosPost.mockResolvedValueOnce({
        status: 200,
        data: { access: newAccessToken },
      });

      const result = await refreshToken();

      expect(result).toBe(newAccessToken);
      expect(mockStorageSet).toHaveBeenCalledWith(ACCESS_TOKEN, newAccessToken);
    });

    it('should return null when no refresh token is available', async () => {
      mockStorageGet.mockResolvedValueOnce(null);
      const result = await refreshToken();
      expect(result).toBe(null);
    });

    it('should return null when refresh fails', async () => {
      mockStorageGet.mockResolvedValueOnce('refresh-token');
      mockAxiosPost.mockRejectedValueOnce(new Error('Refresh failed'));
      const result = await refreshToken();
      expect(result).toBe(null);
    });
  });

  describe('API Instance', () => {
    it('should be configured with base URL from environment', () => {
      expect(axios.create).toHaveBeenCalledWith({
        baseURL: import.meta.env.VITE_API_URL,
      });
    });
  });
});
