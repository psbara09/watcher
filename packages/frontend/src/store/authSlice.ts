import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, Tenant, UserRole } from '@watcher/shared';
import { authApi } from '../api/auth';
import { RootState } from './index';

interface AuthState {
  token: string | null;
  user: User | null;
  tenant: Tenant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  token: localStorage.getItem('watcher_token'),
  user: null,
  tenant: null,
  isAuthenticated: !!localStorage.getItem('watcher_token'),
  isLoading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { username: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials.username, credentials.password);
      localStorage.setItem('watcher_token', response.token);
      return response;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.getProfile();
      return response;
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } };
      if (err.response?.status === 401) {
        localStorage.removeItem('watcher_token');
      }
      return rejectWithValue('Failed to fetch profile');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      state.tenant = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('watcher_token');
    },
    clearError(state) {
      state.error = null;
    },
    setAuth(state, action: PayloadAction<{ token: string; user: User; tenant: Tenant | null }>) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.tenant = action.payload.tenant;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.tenant = action.payload.tenant;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.tenant = action.payload.tenant;
        state.isAuthenticated = true;
      })
      .addCase(fetchProfile.rejected, (state) => {
        state.token = null;
        state.user = null;
        state.tenant = null;
        state.isAuthenticated = false;
      });
  },
});

export const { logout, clearError, setAuth } = authSlice.actions;

// Selectors
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectUser = (state: RootState) => state.auth.user;
export const selectTenant = (state: RootState) => state.auth.tenant;
export const selectRole = (state: RootState) => state.auth.user?.role as UserRole | undefined;
export const selectToken = (state: RootState) => state.auth.token;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;

export default authSlice.reducer;
