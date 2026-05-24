import { useState } from 'react';
import {
  Tabs,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Popconfirm,
  message,
  Typography,
  Tag,
  Card,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BankOutlined,
  TeamOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

const { Title } = Typography;
const { Option } = Select;

const ROLES = ['SUPERADMIN', 'ADMIN', 'HOD', 'TEACHER', 'STUDENT'];

const ROLE_COLORS: Record<string, string> = {
  SUPERADMIN: 'red',
  ADMIN: 'volcano',
  HOD: 'orange',
  TEACHER: 'blue',
  STUDENT: 'green',
};

// ─── Colleges Panel ─────────────────────────────────────────────────
function CollegesPanel() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [messageApi, ctx] = message.useMessage();
  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  // States & forms for User creation directly from Colleges Panel
  const [userForm] = Form.useForm();
  const [userModalOpen, setUserModalOpen] = useState(false);

  const createUserMutation = useMutation({
    mutationFn: async (values: any) => {
      return api.post('/super-admin/create-user', values);
    },
    onSuccess: () => {
      messageApi.success('User created successfully!');
      // Invalidate both users list and colleges list queries so everything is updated and populated
      queryClient.invalidateQueries({ queryKey: ['super-admin-users'] });
      setUserModalOpen(false);
      userForm.resetFields();
    },
    onError: (err: any) => {
      messageApi.error(err.response?.data?.message || 'Failed to create user');
    },
  });

  const openCreateUser = () => {
    userForm.resetFields();
    setUserModalOpen(true);
  };

  const { data: collegesData, isLoading, refetch } = useQuery({
    queryKey: ['super-admin-colleges'],
    queryFn: async () => {
      const res = await api.get('/super-admin/get-all-colleges');
      const d = res.data?.data ?? res.data?.message ?? res.data;
      return Array.isArray(d) ? d : [];
    },
    enabled: !!token,
  });

  // Fetch users with ADMIN role to populate the adminId dropdown
  const { data: usersData } = useQuery({
    queryKey: ['super-admin-users'],
    queryFn: async () => {
      const res = await api.get('/super-admin/get-all-users');
      const d = res.data?.data ?? res.data?.message ?? res.data;
      return Array.isArray(d) ? d : [];
    },
    enabled: !!token,
  });

  const adminUsers: any[] = Array.isArray(usersData)
    ? usersData.filter((u: any) => u.role === 'ADMIN' || u.role === 'SUPERADMIN')
    : [];

  const colleges: any[] = Array.isArray(collegesData) ? collegesData : [];

  const createMutation = useMutation({
    mutationFn: async (values: any) => {
      if (editing) {
        return api.put('/super-admin/update-college', { _id: editing._id, ...values });
      }
      return api.post('/super-admin/create-college', values);
    },
    onSuccess: () => {
      messageApi.success(editing ? 'College updated!' : 'College created!');
      queryClient.invalidateQueries({ queryKey: ['super-admin-colleges'] });
      setModalOpen(false);
      setEditing(null);
      form.resetFields();
    },
    onError: (err: any) => {
      messageApi.error(err.response?.data?.message || 'Operation failed');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete('/super-admin/delete-college', { data: { _id: id } });
    },
    onSuccess: () => {
      messageApi.success('College deleted!');
      queryClient.invalidateQueries({ queryKey: ['super-admin-colleges'] });
    },
    onError: (err: any) => {
      messageApi.error(err.response?.data?.message || 'Delete failed');
    },
  });

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record: any) => {
    setEditing(record);
    // adminId may be a populated object or a plain string ID
    const adminIdValue = record.adminId?._id || record.adminId || undefined;
    form.setFieldsValue({ name: record.name, adminId: adminIdValue });
    setModalOpen(true);
  };

  // Helper: find username by id from usersData
  const getAdminLabel = (v: any) => {
    if (!v) return null;
    const id = typeof v === 'object' ? v._id : v;
    const found = (usersData as any[] || []).find((u: any) => u._id === id || String(u._id) === String(id));
    if (found) return `${found.username} (${found.role})`;
    return id;
  };

  const columns = [
    {
      title: '#',
      render: (_: any, __: any, i: number) => i + 1,
      width: 60,
    },
    {
      title: 'College Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Assigned Admin',
      dataIndex: 'adminId',
      key: 'adminId',
      render: (v: any) => {
        const label = getAdminLabel(v);
        return label
          ? <Tag color="blue">{label}</Tag>
          : <Tag color="default">Not Assigned</Tag>;
      },
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v: string) => v ? new Date(v).toLocaleDateString() : '—',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(record)}>Edit</Button>
          <Popconfirm
            title="Delete this college?"
            onConfirm={() => deleteMutation.mutate(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} size="small" danger loading={deleteMutation.isPending}>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {ctx}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Colleges Management</Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>Refresh</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateUser}>Add User</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Add College</Button>
        </Space>
      </div>

      <Table
        rowKey="_id"
        dataSource={colleges}
        columns={columns}
        loading={isLoading}
        bordered
        size="middle"
        pagination={{ pageSize: 8 }}
      />

      <Modal
        title="Create User"
        open={userModalOpen}
        onCancel={() => { setUserModalOpen(false); userForm.resetFields(); }}
        onOk={() => userForm.submit()}
        confirmLoading={createUserMutation.isPending}
        okText="Create"
      >
        <Form form={userForm} layout="vertical" onFinish={(v) => createUserMutation.mutate(v)}>
          <Form.Item name="username" label="Username" rules={[{ required: true, message: 'Required' }]}>
            <Input placeholder="johndoe" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Valid email required' }]}>
            <Input placeholder="john@example.com" />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Required' }]}>
            <Input.Password placeholder="Min 6 characters" />
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true, message: 'Required' }]}>
            <Select placeholder="Select a role">
              {ROLES.map((r) => (
                <Option key={r} value={r}>
                  <Tag color={ROLE_COLORS[r]}>{r}</Tag>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editing ? 'Edit College' : 'Create College'}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditing(null); form.resetFields(); }}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending}
        okText={editing ? 'Update' : 'Create'}
      >
        <Form form={form} layout="vertical" onFinish={(v) => createMutation.mutate(v)}>
          <Form.Item name="name" label="College Name" rules={[{ required: true, message: 'Please enter the college name' }]}>
            <Input placeholder="e.g. Haldia Institute of Technology" />
          </Form.Item>

          <Form.Item
            name="adminId"
            label="Assign Admin"
            help={adminUsers.length === 0 ? 'No ADMIN/SUPERADMIN users found. Create one first.' : undefined}
          >
            <Select
              allowClear
              showSearch
              placeholder="Select an admin user (optional)"
              optionFilterProp="label"
              options={adminUsers.map((u: any) => ({
                value: u._id,
                label: `${u.username} — ${u.email} (${u.role})`,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

// ─── Users Panel ─────────────────────────────────────────────────────
function UsersPanel() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [messageApi, ctx] = message.useMessage();
  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const { data: usersData, isLoading, refetch } = useQuery({
    queryKey: ['super-admin-users'],
    queryFn: async () => {
      const res = await api.get('/super-admin/get-all-users');
      const d = res.data?.data ?? res.data?.message ?? res.data;
      return Array.isArray(d) ? d : [];
    },
    enabled: !!token,
  });

  const users: any[] = Array.isArray(usersData) ? usersData : [];

  const createMutation = useMutation({
    mutationFn: async (values: any) => {
      if (editing) {
        return api.put('/super-admin/update-user', { _id: editing._id, ...values });
      }
      return api.post('/super-admin/create-user', values);
    },
    onSuccess: () => {
      messageApi.success(editing ? 'User updated!' : 'User created!');
      queryClient.invalidateQueries({ queryKey: ['super-admin-users'] });
      setModalOpen(false);
      setEditing(null);
      form.resetFields();
    },
    onError: (err: any) => {
      messageApi.error(err.response?.data?.message || 'Operation failed');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete('/super-admin/delete-user', { data: { _id: id } });
    },
    onSuccess: () => {
      messageApi.success('User deleted!');
      queryClient.invalidateQueries({ queryKey: ['super-admin-users'] });
    },
    onError: (err: any) => {
      messageApi.error(err.response?.data?.message || 'Delete failed');
    },
  });

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record: any) => {
    setEditing(record);
    form.setFieldsValue({
      username: record.username,
      email: record.email,
      role: record.role,
    });
    setModalOpen(true);
  };

  const columns = [
    {
      title: '#',
      render: (_: any, __: any, i: number) => i + 1,
      width: 60,
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => <Tag color={ROLE_COLORS[role] || 'default'}>{role}</Tag>,
      filters: ROLES.map((r) => ({ text: r, value: r })),
      onFilter: (value: any, record: any) => record.role === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(record)}>Edit</Button>
          <Popconfirm
            title="Delete this user?"
            onConfirm={() => deleteMutation.mutate(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} size="small" danger loading={deleteMutation.isPending}>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {ctx}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Users Management</Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>Refresh</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Add User</Button>
        </Space>
      </div>

      <Table
        rowKey="_id"
        dataSource={users}
        columns={columns}
        loading={isLoading}
        bordered
        size="middle"
        pagination={{ pageSize: 8 }}
      />

      <Modal
        title={editing ? 'Edit User' : 'Create User'}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditing(null); form.resetFields(); }}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending}
        okText={editing ? 'Update' : 'Create'}
      >
        <Form form={form} layout="vertical" onFinish={(v) => createMutation.mutate(v)}>
          <Form.Item name="username" label="Username" rules={[{ required: true, message: 'Required' }]}>
            <Input placeholder="johndoe" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Valid email required' }]}>
            <Input placeholder="john@example.com" />
          </Form.Item>
          {!editing && (
            <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Required' }]}>
              <Input.Password placeholder="Min 6 characters" />
            </Form.Item>
          )}
          <Form.Item name="role" label="Role" rules={[{ required: true, message: 'Required' }]}>
            <Select placeholder="Select a role">
              {ROLES.map((r) => (
                <Option key={r} value={r}>
                  <Tag color={ROLE_COLORS[r]}>{r}</Tag>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

// ─── Main SuperAdmin Dashboard ────────────────────────────────────────
export default function SuperAdminDashboard() {
  const { token } = useAuth();
  const { data: collegesData } = useQuery({
    queryKey: ['super-admin-colleges'],
    queryFn: async () => {
      const res = await api.get('/super-admin/get-all-colleges');
      const d = res.data?.data ?? res.data?.message ?? res.data;
      return Array.isArray(d) ? d : [];
    },
    enabled: !!token,
  });

  const { data: usersData } = useQuery({
    queryKey: ['super-admin-users'],
    queryFn: async () => {
      const res = await api.get('/super-admin/get-all-users');
      const d = res.data?.data ?? res.data?.message ?? res.data;
      return Array.isArray(d) ? d : [];
    },
    enabled: !!token,
  });

  const totalColleges = Array.isArray(collegesData) ? collegesData.length : 0;
  const totalUsers = Array.isArray(usersData) ? usersData.length : 0;
  const roleCount = Array.isArray(usersData)
    ? usersData.reduce((acc: any, u: any) => { acc[u.role] = (acc[u.role] || 0) + 1; return acc; }, {})
    : {};

  const tabItems = [
    {
      key: 'colleges',
      label: (
        <span><BankOutlined /> Colleges</span>
      ),
      children: <CollegesPanel />,
    },
    {
      key: 'users',
      label: (
        <span><TeamOutlined /> Users</span>
      ),
      children: <UsersPanel />,
    },
  ];

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24, fontWeight: 700, letterSpacing: '-0.5px' }}>Super Admin Dashboard</Title>

      {/* Stats Row */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} className="hover-card gradient-card-1">
            <Statistic title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16 }}>Total Colleges</span>} value={totalColleges} valueStyle={{ color: '#fff', fontSize: 36, fontWeight: 700 }} prefix={<BankOutlined style={{ marginRight: 8 }} />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} className="hover-card gradient-card-2">
            <Statistic title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16 }}>Total Users</span>} value={totalUsers} valueStyle={{ color: '#fff', fontSize: 36, fontWeight: 700 }} prefix={<TeamOutlined style={{ marginRight: 8 }} />} />
          </Card>
        </Col>
        {Object.entries(roleCount).map(([role, count]) => (
          <Col xs={24} sm={12} md={6} key={role}>
            <Card bordered={false} className="hover-card glass-panel">
              <Statistic title={<span style={{ fontWeight: 600, fontSize: 14 }}>{role}</span>} value={count as number} valueStyle={{ color: ROLE_COLORS[role] || '#4f46e5', fontSize: 32, fontWeight: 700 }} />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Management Tabs */}
      <Card className="hover-card" bordered={false} style={{ borderRadius: 16, padding: '8px' }}>
        <Tabs defaultActiveKey="colleges" items={tabItems} size="large" />
      </Card>
    </div>
  );
}
