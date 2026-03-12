const API_URL = 'http://localhost:5000/api';

export const sendOtp = async (email: string) => {
  const res = await fetch(`${API_URL}/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return res.json();
};

export const verifyOtp = async (email: string, otp: string) => {
  const res = await fetch(`${API_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  });
  return res.json();
};

export const signUp = async (name: string, email: string, otp: string) => {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, otp }),
  });
  return res.json();
};

export const googleLogin = () => {
  window.location.href = `${API_URL}/auth/google`;
};
