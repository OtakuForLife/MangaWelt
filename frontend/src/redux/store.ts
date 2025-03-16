import { configureStore } from '@reduxjs/toolkit';
import productReducer from './slices/productSlice';
import franchiseReducer from './slices/franchiseSlice';
import authReducer from './slices/authSlice';
import deviceReducer from './slices/deviceSlice';
import userReducer from './slices/userSlice';

const rootReducer = {
  products: productReducer,
  franchises: franchiseReducer,
  auth: authReducer,
  device: deviceReducer,
  user: userReducer,
};

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // If you're having serialization issues
    }),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

export default store;
