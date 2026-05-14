import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/auth';
import { useAuthStore } from '../store/auth';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore(s => s.setAuth);
  const [form, setForm] = useState({ displayName: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await register(form.email, form.password, form.displayName);
      setAuth(data.user, data.accessToken, data.refreshToken);
      navigate('/projects');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
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
          <h1 className="text-2xl font-bold text-navy-800">Create account</h1>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <Input label="Display Name" value={form.displayName} onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))} required />
          <Input label="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          <Input label="Password" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} minLength={8} required />
          <Button type="submit" loading={loading} className="w-full justify-center mt-2">Create Account</Button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          Have an account? <Link to="/login" className="text-brand-orange font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};
