import { useState } from 'react';
import { Card, Form, Input, Button, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../context/AuthContext';
import { useMutation } from '@tanstack/react-query';
import api from '../lib/api';

const { Title } = Typography;

export default function Login() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [messageApi, contextHolder] = message.useMessage();

  const [mode, setMode] = useState<'login' | 'forgot' | 'reset'>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.has('token') ? 'reset' : 'login';
  });
  const [token] = useState(() => {
    return new URLSearchParams(window.location.search).get('token') || '';
  });

  const mutation = useMutation({
    mutationFn: async (values: any) => {
      const response = await api.post('/auth/login', values);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success && data.data) {
        login(data.data.user, data.data.token);
        
        const rolePathMap: Record<string, string> = {
          SUPERADMIN: '/dashboard/super-admin',
          ADMIN: '/dashboard/admin',
          HOD: '/dashboard/hod',
          TEACHER: '/dashboard/teacher',
          STUDENT: '/dashboard/student',
        };

        const targetUrl = rolePathMap[data.data.user.role] || '/';
        navigate({ to: targetUrl });
      }
    },
    onError: (error: any) => {
      messageApi.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    },
  });

  const forgotMutation = useMutation({
    mutationFn: async (values: { email: string }) => {
      const response = await api.post('/auth/forgot-password', values);
      return response.data;
    },
    onSuccess: (data) => {
      messageApi.success(data.message || 'Password reset email sent successfully!');
      setMode('login');
      form.resetFields();
    },
    onError: (error: any) => {
      messageApi.error(error.response?.data?.message || 'Failed to send reset link.');
    },
  });

  const resetMutation = useMutation({
    mutationFn: async (values: any) => {
      const response = await api.post('/auth/reset-password', {
        token,
        password: values.password,
      });
      return response.data;
    },
    onSuccess: (data) => {
      messageApi.success(data.message || 'Password reset successfully! You can now login.');
      window.history.replaceState({}, document.title, window.location.pathname);
      setMode('login');
      form.resetFields();
    },
    onError: (error: any) => {
      messageApi.error(error.response?.data?.message || 'Failed to reset password.');
    },
  });

  const onFinish = (values: any) => {
    mutation.mutate(values);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {contextHolder}
      <Card className="glass-panel hover-card" style={{ width: 400, borderRadius: 16, padding: '24px 8px' }} bordered={false}>
        
        {mode === 'login' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <Title level={2} style={{ margin: 0, fontWeight: 700, letterSpacing: '-0.5px' }}>Welcome Back</Title>
              <Typography.Text type="secondary" style={{ fontSize: 16 }}>Please login to continue</Typography.Text>
            </div>
            
            <Form form={form} name="login" onFinish={onFinish} layout="vertical" size="large">
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'Please input your Email!' },
                  { type: 'email', message: 'Please enter a valid email!' }
                ]}
              >
                <Input prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Email Address" />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: 'Please input your Password!' }]}
              >
                <Input.Password prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Password" />
              </Form.Item>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
                <Button type="link" onClick={() => { form.resetFields(); setMode('forgot'); }} style={{ padding: 0, height: 'auto' }}>
                  Forgot Password?
                </Button>
              </div>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button type="primary" htmlType="submit" block loading={mutation.isPending} style={{ height: 44, fontSize: 16, fontWeight: 600 }}>
                  Sign In
                </Button>
              </Form.Item>
            </Form>
          </>
        )}

        {mode === 'forgot' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <Title level={2} style={{ margin: 0, fontWeight: 700, letterSpacing: '-0.5px' }}>Forgot Password</Title>
              <Typography.Text type="secondary" style={{ fontSize: 16 }}>Enter your email to request a reset link</Typography.Text>
            </div>
            
            <Form form={form} name="forgot" onFinish={(v) => forgotMutation.mutate(v)} layout="vertical" size="large">
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'Please input your Email!' },
                  { type: 'email', message: 'Please enter a valid email!' }
                ]}
              >
                <Input prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Email Address" />
              </Form.Item>

              <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
                <Button type="primary" htmlType="submit" block loading={forgotMutation.isPending} style={{ height: 44, fontSize: 16, fontWeight: 600 }}>
                  Send Reset Link
                </Button>
              </Form.Item>

              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Button type="link" onClick={() => { form.resetFields(); setMode('login'); }}>
                  Back to Login
                </Button>
              </div>
            </Form>
          </>
        )}

        {mode === 'reset' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <Title level={2} style={{ margin: 0, fontWeight: 700, letterSpacing: '-0.5px' }}>Reset Password</Title>
              <Typography.Text type="secondary" style={{ fontSize: 16 }}>Enter your new password below</Typography.Text>
            </div>
            
            <Form form={form} name="reset" onFinish={(v) => resetMutation.mutate(v)} layout="vertical" size="large">
              <Form.Item
                name="password"
                label="New Password"
                rules={[
                  { required: true, message: 'Please enter your new password!' },
                  { min: 6, message: 'Password must be at least 6 characters!' }
                ]}
              >
                <Input.Password prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="New Password" />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Confirm New Password"
                dependencies={['password']}
                rules={[
                  { required: true, message: 'Please confirm your password!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('The two passwords do not match!'));
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Confirm Password" />
              </Form.Item>

              <Form.Item style={{ marginTop: 32, marginBottom: 0 }}>
                <Button type="primary" htmlType="submit" block loading={resetMutation.isPending} style={{ height: 44, fontSize: 16, fontWeight: 600 }}>
                  Update Password
                </Button>
              </Form.Item>

              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Button type="link" onClick={() => {
                  window.history.replaceState({}, document.title, window.location.pathname);
                  form.resetFields();
                  setMode('login');
                }}>
                  Cancel
                </Button>
              </div>
            </Form>
          </>
        )}

      </Card>
    </div>
  );
}
