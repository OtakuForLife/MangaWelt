import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Device } from '@capacitor/device';
import type { RootState } from '../store';

interface DeviceState {
  platform: string;
  token: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: DeviceState = {
  platform: '',
  token: null,
  status: 'idle',
  error: null
};

export const initializePlatform = createAsyncThunk(
  'device/initializePlatform',
  async () => {
    const info = await Device.getInfo();
    return info.platform;
  }
);

const deviceSlice = createSlice({
  name: 'device',
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializePlatform.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(initializePlatform.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.platform = action.payload;
        state.error = null;
      })
      .addCase(initializePlatform.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to get platform info';
      });
  },
});

export const { setToken } = deviceSlice.actions;
export const selectPlatform = (state: RootState) => state.device.platform;
export const selectDeviceStatus = (state: RootState) => state.device.status;
export const selectDeviceToken = (state: RootState) => state.device.token;

export default deviceSlice.reducer;
