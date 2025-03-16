import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { RootState } from '../store';
import Franchise from '../../models/Franchise';
import api from '../../utils/api';

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
            });
    }
});

export const selectFranchises = (state: RootState) => state.franchises.franchises;
export const selectFranchisesStatus = (state: RootState) => state.franchises.status;
export const selectFranchisesError = (state: RootState) => state.franchises.error;
export default franchiseSlice.reducer;
