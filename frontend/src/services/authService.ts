export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  };
  message?: string;
}

export const authService = {
  async sendOTP(email: string): Promise<AuthResponse> {
    // Mock API call
    console.log(`Sending OTP to ${email}`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { success: true, message: 'OTP sent' };
  },

  async verifyOTP(email: string, otp: string): Promise<AuthResponse> {
    // Mock API call
    console.log(`Verifying OTP ${otp} for ${email}`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    if (otp === '123456') { // Mock OTP
      return {
        success: true,
        token: 'mock-jwt-token',
        user: {
          id: 'user-' + Math.random().toString(36).substr(2, 9),
          email,
          name: email.split('@')[0],
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        },
      };
    }
    
    return { success: false, message: 'Invalid OTP' };
  },

  async googleLogin(): Promise<AuthResponse> {
    // Mock Google Login
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      success: true,
      token: 'mock-google-token',
      user: {
        id: 'google-' + Math.random().toString(36).substr(2, 9),
        email: 'user@gmail.com',
        name: 'Google User',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=google',
      },
    };
  },

  async updateProfile(name: string): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { success: true, message: 'Profile updated' };
  }
};
