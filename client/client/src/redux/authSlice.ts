import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: string;
  department?: {
    _id: string;
    name: string;
    college?: {
      _id: string;
      name: string;
    };
  };
}

interface AuthState {
  user: UserProfile | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: AuthState = {
  user: null,
  status: 'idle',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<UserProfile | null>) => {
      state.user = action.payload;
      state.status = 'succeeded';
    },
    clearProfile: (state) => {
      state.user = null;
      state.status = 'idle';
    },
  },
});

export const { setProfile, clearProfile } = authSlice.actions;
export default authSlice.reducer;
