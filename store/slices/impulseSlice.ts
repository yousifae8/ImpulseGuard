import { createSlice, PayloadAction } from '@reduxjs/toolkit';


export interface ImpulseItem {
  id: string;
  userId: string;
  itemName: string;
  price: number;
  reason: string;
  imageUrl?: string | undefined;
  loggedAt: string;
  releaseAt: string;
  status: 'pending' | 'ready' | 'purchased' | 'dismissed';
}

export interface ImpulseState {
  items: ImpulseItem[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ImpulseState = {
  items: [],
  status: 'idle',
  error: null,
};

const impulseSlice = createSlice({
  name: 'impulses',
  initialState,
  reducers: {
    addImpulse: (state, action: PayloadAction<ImpulseItem>) => {
      state.items.push(action.payload);
      state.status = 'succeeded';
    },
    updateImpulse: (state, action: PayloadAction<ImpulseItem>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
      state.status = 'succeeded';
    },
    deleteImpulse: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      state.status = 'succeeded';
    },
    setImpulses: (state, action: PayloadAction<ImpulseItem[]>) => {
      state.items = action.payload;
      state.status = 'succeeded';
    },
    setLoading: (state) => {
      state.status = 'loading';
    },
    setSuccess: (state) => {
      state.status = 'succeeded';
      state.error = null;
    },
    resetStatus: (state) => {
      state.status = 'idle';
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.status = 'failed';
      state.error = action.payload;
    },
  },
});

export const { addImpulse, updateImpulse, deleteImpulse, setImpulses, setLoading, setSuccess, resetStatus, setError } = impulseSlice.actions;
export default impulseSlice.reducer;