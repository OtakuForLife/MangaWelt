import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../index';
import Franchise from '../../models/Franchise';
import api from '../../lib/api';

export interface FranchiseState {
    franchises: { [id: string]: Franchise };
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: FranchiseState = {
    franchises: {},
    status: 'idle',
    error: null
};

export const fetchFranchises = createAsyncThunk('franchises/fetchFranchises', async () => {
    const response = await api.get('/api/franchises/list/');
    return response.data;
});

export const toggleFranchiseFollow = createAsyncThunk(
    'franchises/toggleFranchiseFollow',
    async (franchiseId: string, { dispatch }) => {
        const response = await api.post<{ detail: string; is_followed: boolean }>(`/api/franchises/${franchiseId}/follow/`);
        // Refresh franchises to get updated is_followed field
        await dispatch(fetchFranchises());
        return { franchiseId, detail: response.data.detail, is_followed: response.data.is_followed };
    }
);

export const franchiseSlice = createSlice({
    name: 'franchises',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchFranchises.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchFranchises.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.franchises = action.payload.reduce((acc: { [key: string]: Franchise }, franchise: Franchise) => {
                    acc[franchise.id] = franchise;
                    return acc;
                }, {});
            })
            .addCase(fetchFranchises.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || null;
            })
            .addCase(toggleFranchiseFollow.pending, (state) => {
                // Keep current status, just updating in background
            })
            .addCase(toggleFranchiseFollow.fulfilled, (state) => {
                state.error = null;
            })
            .addCase(toggleFranchiseFollow.rejected, (state, action) => {
                state.error = action.error.message || 'Failed to toggle franchise follow';
            });
    }
});

export const selectFranchises = (state: RootState) => state.franchises.franchises;
export const selectFranchisesStatus = (state: RootState) => state.franchises.status;
export const selectFranchisesError = (state: RootState) => state.franchises.error;

// Selector to get followed franchise IDs
export const selectFollowedFranchiseIds = createSelector(
    [selectFranchises],
    (franchises) => {
        return Object.values(franchises)
            .filter(franchise => franchise.is_followed)
            .map(franchise => franchise.id);
    }
);

export default franchiseSlice.reducer;

