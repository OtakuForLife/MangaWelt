import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import { storageService } from '../../services/storageService';
import { isTokenExpired, verifyToken } from '../../utils/api';
import { ACCESS_TOKEN } from '../../utils/constants';
//import { log } from '../../utils/logger';

export interface AuthState {
  isAuthenticated: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  status: 'idle',
  error: null
};

export const checkAuthStatus = createAsyncThunk(
  'auth/checkAuthStatus',
  async () => {
    try {
      //await log('Initializing auth status check...', 'INFO', 'Auth');
      
      await storageService.waitForInit();
      const token = await storageService.storage.get(ACCESS_TOKEN);
      
      //await log(`Token status: ${token ? 'exists' : 'not found'}`, 'INFO', 'Auth');
      
      if (token && !isTokenExpired(token)) {
        try {
          const isValid = await verifyToken(token);
          if (isValid) {
           //await log('User authenticated successfully', 'INFO', 'Auth');
            return true;
          }
        } catch (verifyError) {
          //await log(`Token verification failed: ${verifyError}`, 'ERROR', 'Auth');
        }
      }
      
      //await log('Clearing auth state...', 'INFO', 'Auth');
      await storageService.storage.clear();
      return false;
    } catch (err) {
      //await log(`Auth initialization failed: ${err}`, 'ERROR', 'Auth');
      throw err;
    } finally {
      //await log('Auth check completed', 'INFO', 'Auth');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkAuthStatus.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.isAuthenticated = action.payload;
        state.error = null;
      })
      .addCase(checkAuthStatus.rejected, (state, action) => {
        state.status = 'failed';
        state.isAuthenticated = false;
        state.error = action.error.message || 'Authentication check failed';
      });
  },
});

export const { setAuthenticated } = authSlice.actions;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectAuthError = (state: RootState) => state.auth.error;
export default authSlice.reducer;
