import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import impulseReducer from './slices/impulseSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    impulses: impulseReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;