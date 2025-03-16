import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import api from '../../utils/api';

interface UserData {
    id: string;
    username: string;
    owned_products: string[];
    followed_franchises: string[];
}

interface UserState {
    data: UserData | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: UserState = {
    data: null,
    status: 'idle',
    error: null
};

export const fetchUserData = createAsyncThunk(
    'user/fetchUserData',
    async () => {
        const response = await api.get('/api/user/data/');
        return response.data;
    }
);

export const toggleProductOwned = createAsyncThunk(
    'user/toggleProductOwned',
    async (productId: string, { dispatch }) => {
        const response = await api.post(`/api/products/${productId}/toggle-owned/`);
        // Refresh user data to get updated owned_products list
        await dispatch(fetchUserData());
        return response.data;
    }
);

export const toggleFranchiseFollow = createAsyncThunk(
    'user/toggleFranchiseFollow',
    async (franchiseId: string, { rejectWithValue, dispatch }) => {
        try {
            const response = await api.post<{ detail: string }>(`/api/franchises/${franchiseId}/follow/`);
            // Refresh user data to get updated followed_franchises list
            await dispatch(fetchUserData());
            return { franchiseId, detail: response.data.detail };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.detail || 'Failed to toggle franchise follow status');
        }
    }
);

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        clearUserData: (state) => {
            state.data = null;
            state.status = 'idle';
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserData.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchUserData.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.data = action.payload;
                state.error = null;
            })
            .addCase(fetchUserData.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || null;
            });
    }
});

export const { clearUserData } = userSlice.actions;

// Selectors
export const selectUserData = (state: RootState) => state.user.data;
export const selectUserStatus = (state: RootState) => state.user.status;
export const selectUserError = (state: RootState) => state.user.error;
export const selectOwnedProductIds = (state: RootState) => state.user.data?.owned_products ?? [];
export const selectFollowedFranchiseIds = (state: RootState) => state.user.data?.followed_franchises ?? [];
export const selectFollowedFranchisesStatus = (state: RootState) => state.user.status;

export default userSlice.reducer;