import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import { useAuthStore } from '../store/auth';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore(s => s.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(email, password);
      setAuth(data.user, data.accessToken, data.refreshToken);
      navigate('/projects');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 to-navy-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-brand-orange rounded-xl flex items-center justify-center mx-auto mb-3">
            <span className="text-white text-xl font-bold">PM</span>
          </div>
          <h1 className="text-2xl font-bold text-navy-800">Welcome back</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to ProMan</p>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
          <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          <Button type="submit" loading={loading} className="w-full justify-center mt-2">Sign In</Button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          No account? <Link to="/register" className="text-brand-orange font-semibold hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  );
};
