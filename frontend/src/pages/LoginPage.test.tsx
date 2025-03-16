import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleLoginSubmit } from './LoginPage';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../utils/constants';

describe('handleLoginSubmit', () => {
    const mockApi = {
        post: vi.fn()
    };
    const mockStorage = {
        set: vi.fn()
    };
    const mockDispatch = vi.fn();
    const mockNavigate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('validates required fields', async () => {
        const result = await handleLoginSubmit(
            { username: '', password: '' },
            mockApi,
            mockStorage,
            mockDispatch,
            mockNavigate
        );

        expect(result.error).toBe('Username and password are required');
        expect(mockApi.post).not.toHaveBeenCalled();
    });

    it('handles successful login', async () => {
        const mockResponse = {
            status: 200,
            data: {
                access: 'fake-access-token',
                refresh: 'fake-refresh-token'
            }
        };
        mockApi.post.mockResolvedValueOnce(mockResponse);

        const result = await handleLoginSubmit(
            { username: 'testuser', password: 'testpass' },
            mockApi,
            mockStorage,
            mockDispatch,
            mockNavigate
        );

        expect(result.error).toBeUndefined();
        expect(mockApi.post).toHaveBeenCalledWith('/api/token/', {
            username: 'testuser',
            password: 'testpass'
        });
        expect(mockStorage.set).toHaveBeenCalledWith(ACCESS_TOKEN, 'fake-access-token');
        expect(mockStorage.set).toHaveBeenCalledWith(REFRESH_TOKEN, 'fake-refresh-token');
        expect(mockDispatch).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/app/followed');
    });

    it('handles API error', async () => {
        const mockError = {
            response: {
                data: {
                    detail: 'Invalid credentials'
                }
            }
        };
        mockApi.post.mockRejectedValueOnce(mockError);

        const result = await handleLoginSubmit(
            { username: 'testuser', password: 'wrongpass' },
            mockApi,
            mockStorage,
            mockDispatch,
            mockNavigate
        );

        expect(result.error).toBe('Invalid credentials');
        expect(mockStorage.set).not.toHaveBeenCalled();
        expect(mockDispatch).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
