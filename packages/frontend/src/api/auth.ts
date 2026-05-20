import { authClient } from './client';
import { LoginResponse, ProfileResponse } from '@watcher/shared';

export const authApi = {
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await authClient.post<LoginResponse>('/api/auth/login', {
      username,
      password,
    });
    return response.data;
  },

  async getProfile(): Promise<ProfileResponse> {
    const response = await authClient.get<ProfileResponse>('/api/auth/me');
    return response.data;
  },

  async logout(): Promise<void> {
    await authClient.post('/api/auth/logout');
  },
};
