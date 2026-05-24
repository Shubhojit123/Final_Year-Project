import { useState } from 'react';
import {
  Tabs, Table, Button, Modal, Form, Input, Select,
  Space, Popconfirm, message, Typography, Tag, Card,
  Row, Col, Statistic, Divider,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  ApartmentOutlined, TeamOutlined, ReloadOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;
const { Option } = Select;

const ROLES = ['ADMIN', 'HOD', 'TEACHER', 'STUDENT'];
const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'volcano', HOD: 'orange', TEACHER: 'blue', STUDENT: 'green',
};

// ─── Helper: extract array from BaseController response ───────────────
const extractList = (res: any): any[] => {
  const d = res.data?.data ?? res.data?.message ?? res.data;
  return Array.isArray(d) ? d : [];
};

// ─── Departments Panel ────────────────────────────────────────────────
function DepartmentsPanel() {
  const queryClient = useQueryClient();
  const [messageApi, ctx] = message.useMessage();
  const [form] = Form.useForm();
  const [assignForm] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [assignModal, setAssignModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [assigningDept, setAssigningDept] = useState<any>(null);

  const { token } = useAuth();
  // All departments — note: route uses POST
  const { data: depts = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-departments'],
    queryFn: async () => extractList(await api.post('/admin/all-departments')),
    enabled: !!token,
  });

  // Colleges — using the admin-accessible endpoint
  const { data: colleges = [] } = useQuery({
    queryKey: ['admin-colleges'],
    queryFn: async () => extractList(await api.get('/admin/all-colleges')),
    enabled: !!token,
  });

  const { data: users = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => extractList(await api.post('/admin/all-users')),
    enabled: !!token,
  });

  const hodUsers = (users as any[]).filter(
    (u: any) => u.role === 'HOD' || u.role === 'ADMIN',
  );

  // ── Mutations ──
  const saveMutation = useMutation({
    mutationFn: async (values: any) => {
      if (editing) {
        return api.put('/admin/department-update', { _id: editing._id, ...values });
      }
      return api.post('/admin/', values);
    },
    onSuccess: () => {
      messageApi.success(editing ? 'Department updated!' : 'Department created!');
      queryClient.invalidateQueries({ queryKey: ['admin-departments'] });
      setModalOpen(false);
      setEditing(null);
      form.resetFields();
    },
    onError: (e: any) => messageApi.error(e.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) =>
      api.delete('/admin/department', { data: { _id: id } }),
    onSuccess: () => {
      messageApi.success('Department deleted!');
      queryClient.invalidateQueries({ queryKey: ['admin-departments'] });
    },
    onError: (e: any) => messageApi.error(e.response?.data?.message || 'Failed'),
  });

  const assignHeadMutation = useMutation({
    mutationFn: async (values: any) =>
      api.put('/admin/assign-head', { _id: assigningDept._id, head: values.head }),
    onSuccess: () => {
      messageApi.success('Department head assigned!');
      queryClient.invalidateQueries({ queryKey: ['admin-departments'] });
      setAssignModal(false);
      setAssigningDept(null);
      assignForm.resetFields();
    },
    onError: (e: any) => messageApi.error(e.response?.data?.message || 'Failed'),
  });

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record: any) => {
    setEditing(record);
    form.setFieldsValue({
      name: record.name,
      slug: record.slug,
      head: record.head?._id || record.head,
      college: record.college?._id || record.college,
    });
    setModalOpen(true);
  };

  const openAssignHead = (record: any) => {
    setAssigningDept(record);
    assignForm.setFieldsValue({ head: record.head?._id || record.head });
    setAssignModal(true);
  };

  const columns = [
    { title: '#', render: (_: any, __: any, i: number) => i + 1, width: 50 },
    {
      title: 'Department Name',
      dataIndex: 'name',
      key: 'name',
      render: (t: string) => <strong>{t}</strong>,
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      render: (t: string) => <Tag color="purple">{t}</Tag>,
    },
    {
      title: 'HOD / Head',
      dataIndex: 'head',
      key: 'head',
      render: (v: any) => {
        const id = typeof v === 'object' ? v?._id : v;
        const found = (users as any[]).find((u: any) => String(u._id) === String(id));
        return found
          ? <Tag color="blue"><UserSwitchOutlined /> {found.username}</Tag>
          : v ? <Tag>{id}</Tag> : <Tag color="default">No Head</Tag>;
      },
    },
    {
      title: 'College',
      dataIndex: 'college',
      key: 'college',
      render: (v: any) => {
        const id = typeof v === 'object' ? v?._id : v;
        const found = (colleges as any[]).find((c: any) => String(c._id) === String(id));
        return found
          ? <Tag color="geekblue">{found.name}</Tag>
          : v ? <Tag>{id}</Tag> : <Tag color="default">—</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space wrap>
          <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(record)}>
            Edit
          </Button>
          <Button icon={<UserSwitchOutlined />} size="small" type="dashed"
            onClick={() => openAssignHead(record)}>
            Assign Head
          </Button>
          <Popconfirm
            title="Delete this department?"
            onConfirm={() => deleteMutation.mutate(record._id)}
            okText="Yes" cancelText="No"
          >
            <Button icon={<DeleteOutlined />} size="small" danger
              loading={deleteMutation.isPending}>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {ctx}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Departments Management</Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>Refresh</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Add Department
          </Button>
        </Space>
      </div>

      <Table
        rowKey="_id"
        dataSource={depts as any[]}
        columns={columns}
        loading={isLoading}
        bordered size="middle"
        pagination={{ pageSize: 8 }}
      />

      {/* Create / Edit Modal */}
      <Modal
        title={editing ? 'Edit Department' : 'Create Department'}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditing(null); form.resetFields(); }}
        onOk={() => form.submit()}
        confirmLoading={saveMutation.isPending}
        okText={editing ? 'Update' : 'Create'}
      >
        <Form form={form} layout="vertical" onFinish={(v) => saveMutation.mutate(v)}>
          <Form.Item name="name" label="Department Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Computer Science" />
          </Form.Item>
          <Form.Item name="slug" label="Slug" rules={[{ required: true }]}>
            <Input placeholder="e.g. cs" />
          </Form.Item>
          <Form.Item name="college" label="College" rules={[{ required: true }]}>
            <Select
              showSearch placeholder="Select a college"
              optionFilterProp="label"
              options={(colleges as any[]).map((c: any) => ({
                value: c._id, label: c.name,
              }))}
            />
          </Form.Item>
          <Form.Item name="head" label="Department Head (HOD)" rules={[{ required: true }]}>
            <Select
              showSearch placeholder="Select a HOD user"
              optionFilterProp="label"
              options={hodUsers.map((u: any) => ({
                value: u._id,
                label: `${u.username} — ${u.email} (${u.role})`,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Assign Head Modal */}
      <Modal
        title={`Assign Head — ${assigningDept?.name}`}
        open={assignModal}
        onCancel={() => { setAssignModal(false); setAssigningDept(null); assignForm.resetFields(); }}
        onOk={() => assignForm.submit()}
        confirmLoading={assignHeadMutation.isPending}
        okText="Assign"
      >
        <Form form={assignForm} layout="vertical" onFinish={(v) => assignHeadMutation.mutate(v)}>
          <Form.Item name="head" label="Select New Head" rules={[{ required: true }]}>
            <Select
              showSearch placeholder="Select a HOD/Admin user"
              optionFilterProp="label"
              options={(users as any[]).filter((u: any) =>
                ['HOD', 'ADMIN', 'SUPERADMIN'].includes(u.role)
              ).map((u: any) => ({
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

// ─── Users Panel ──────────────────────────────────────────────────────
function UsersPanel() {
  const queryClient = useQueryClient();
  const [messageApi, ctx] = message.useMessage();
  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const { token } = useAuth();
  // All users — note: route uses POST
  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => extractList(await api.post('/admin/all-users')),
    enabled: !!token,
  });

  const saveMutation = useMutation({
    mutationFn: async (values: any) => {
      if (editing) {
        return api.put('/admin/user-update', { _id: editing._id, ...values });
      }
      return api.post('/admin/create-user', values);
    },
    onSuccess: () => {
      messageApi.success(editing ? 'User updated!' : 'User created!');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setModalOpen(false);
      setEditing(null);
      form.resetFields();
    },
    onError: (e: any) => messageApi.error(e.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) =>
      api.delete('/admin/user/', { data: { _id: id } }),
    onSuccess: () => {
      messageApi.success('User deleted!');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (e: any) => messageApi.error(e.response?.data?.message || 'Failed'),
  });

  const openEdit = (record: any) => {
    setEditing(record);
    form.setFieldsValue({
      username: record.username,
      email: record.email,
      role: record.role,
    });
    setModalOpen(true);
  };

  const roleCounts = (users as any[]).reduce((acc: any, u: any) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {});

  const columns = [
    { title: '#', render: (_: any, __: any, i: number) => i + 1, width: 50 },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      render: (t: string) => <strong>{t}</strong>,
    },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      filters: ROLES.map((r) => ({ text: r, value: r })),
      onFilter: (value: any, record: any) => record.role === value,
      render: (r: string) => <Tag color={ROLE_COLORS[r] || 'default'}>{r}</Tag>,
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
          <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete this user?"
            onConfirm={() => deleteMutation.mutate(record._id)}
            okText="Yes" cancelText="No"
          >
            <Button icon={<DeleteOutlined />} size="small" danger
              loading={deleteMutation.isPending}>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {ctx}

      {/* Role count badges */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {Object.entries(roleCounts).map(([role, count]) => (
          <Tag key={role} color={ROLE_COLORS[role] || 'default'} style={{ fontSize: 13, padding: '4px 10px' }}>
            {role}: <strong>{count as number}</strong>
          </Tag>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Users Management</Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>Refresh</Button>
          <Button type="primary" icon={<PlusOutlined />}
            onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true); }}>
            Add User
          </Button>
        </Space>
      </div>

      <Table
        rowKey="_id"
        dataSource={users as any[]}
        columns={columns}
        loading={isLoading}
        bordered size="middle"
        pagination={{ pageSize: 8 }}
      />

      <Modal
        title={editing ? 'Edit User' : 'Create User'}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditing(null); form.resetFields(); }}
        onOk={() => form.submit()}
        confirmLoading={saveMutation.isPending}
        okText={editing ? 'Update' : 'Create'}
      >
        <Form form={form} layout="vertical" onFinish={(v) => saveMutation.mutate(v)}>
          <Form.Item name="username" label="Username" rules={[{ required: true }]}>
            <Input placeholder="johndoe" />
          </Form.Item>
          <Form.Item name="email" label="Email"
            rules={[{ required: true, type: 'email' }]}>
            <Input placeholder="john@college.com" />
          </Form.Item>
          {!editing && (
            <Form.Item name="password" label="Password" rules={[{ required: true, min: 6 }]}>
              <Input.Password placeholder="Min 6 characters" />
            </Form.Item>
          )}
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select placeholder="Select a role">
              {ROLES.map((r) => (
                <Option key={r} value={r}>
                  <Tag color={ROLE_COLORS[r]}>{r}</Tag>
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Divider dashed style={{ margin: '12px 0' }} />
          <Text type="secondary" style={{ fontSize: 12 }}>
            Optional: department and batch will auto-link after creation.
          </Text>
        </Form>
      </Modal>
    </div>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────
export default function AdminDashboard() {
  const { token } = useAuth();
  const { data: depts = [] } = useQuery({
    queryKey: ['admin-departments'],
    queryFn: async () => extractList(await api.post('/admin/all-departments')),
    enabled: !!token,
  });

  const { data: users = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => extractList(await api.post('/admin/all-users')),
    enabled: !!token,
  });

  const tabItems = [
    {
      key: 'departments',
      label: <span><ApartmentOutlined /> Departments</span>,
      children: <DepartmentsPanel />,
    },
    {
      key: 'users',
      label: <span><TeamOutlined /> Users</span>,
      children: <UsersPanel />,
    },
  ];

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24, fontWeight: 700, letterSpacing: '-0.5px' }}>Admin Dashboard</Title>
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} className="hover-card gradient-card-3">
            <Statistic
              title={<span style={{ color: 'rgba(0,0,0,0.6)', fontSize: 16 }}>Total Departments</span>}
              value={(depts as any[]).length}
              valueStyle={{ color: '#111827', fontSize: 36, fontWeight: 700 }}
              prefix={<ApartmentOutlined style={{ marginRight: 8 }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} className="hover-card gradient-card-4">
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16 }}>Total Users</span>}
              value={(users as any[]).length}
              valueStyle={{ color: '#fff', fontSize: 36, fontWeight: 700 }}
              prefix={<TeamOutlined style={{ marginRight: 8 }} />}
            />
          </Card>
        </Col>
      </Row>

      <Card className="hover-card" bordered={false} style={{ borderRadius: 16, padding: '8px' }}>
        <Tabs defaultActiveKey="departments" items={tabItems} size="large" />
      </Card>
    </div>
  );
}
