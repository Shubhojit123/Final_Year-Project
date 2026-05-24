import { useState } from 'react';
import { 
  Typography, Card, Row, Col, List, Table, Tag, 
  Empty, Spin, Breadcrumb, Button, Modal, Form, Select, message, Popconfirm, Space
} from 'antd';
import { 
  TeamOutlined, RightOutlined, 
  PlusOutlined, DeleteOutlined, BookOutlined, UserOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useAppSelector } from '../../redux/hooks';

const { Title, Text } = Typography;
const { Option } = Select;

export default function HodBatchAssignments() {
  const { user, token } = useAuth();
  const reduxUser = useAppSelector((state) => state.auth.user);
  const queryClient = useQueryClient();
  const [messageApi, ctx] = message.useMessage();
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const postData = async (url: string, body: any = {}) => {
    const res = await api.post(url, body);
    const d = res.data?.data ?? res.data?.message ?? res.data;
    return Array.isArray(d) ? d : [];
  };

  // ── Queries ──
  const { data: batches = [], isLoading: batchesLoading } = useQuery({ 
    queryKey: ['hod-batches'], 
    queryFn: () => postData('/hod/all-batchs'), 
    enabled: !!token 
  });

  const { data: assigns = [], isLoading: assignsLoading } = useQuery({ 
    queryKey: ['hod-assigns'], 
    queryFn: () => postData('/hod/all-teacher-assigns'), 
    enabled: !!token 
  });

  const { data: subjects = [] } = useQuery({ 
    queryKey: ['hod-subjects'], 
    queryFn: () => postData('/hod/all-subjects'), 
    enabled: !!token 
  });

  const deptId = reduxUser?.department?._id || (typeof reduxUser?.department === 'string' ? reduxUser?.department : null);

  const { data: teachers = [] } = useQuery({ 
    queryKey: ['hod-teachers'], 
    queryFn: () => postData('/hod/get-teachers-list'), 
    enabled: !!token 
  });

  // ── Mutations ──
  const assignMutation = useMutation({
    mutationFn: async (values: any) => api.post('/hod/teacher-assign', values),
    onSuccess: () => {
      messageApi.success('Subject assigned to batch!');
      queryClient.invalidateQueries({ queryKey: ['hod-assigns'] });
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: (e: any) => messageApi.error(e.response?.data?.message || 'Failed to assign'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete('/hod/teacher-assign-delete', { data: { _id: id } }),
    onSuccess: () => {
      messageApi.success('Assignment removed!');
      queryClient.invalidateQueries({ queryKey: ['hod-assigns'] });
    },
    onError: () => messageApi.error('Failed to remove assignment'),
  });

  const selectedBatch = batches.find((b: any) => b._id === selectedBatchId);
  const filteredAssigns = assigns.filter((a: any) => {
    const bId = typeof a.batch === 'object' ? a.batch?._id : a.batch;
    return bId === selectedBatchId;
  });

  const columns = [
    { 
      title: 'Subject', 
      dataIndex: 'subject', 
      key: 'subject', 
      render: (v: any) => {
        const id = typeof v === 'object' ? v?._id : v;
        const found = (subjects as any[]).find(s => String(s._id) === String(id));
        return <Tag color="purple" style={{ fontWeight: 600 }}>{found ? found.name : (typeof v === 'object' ? v?.name : id || '—')}</Tag>;
      }
    },
    { 
      title: 'Teacher', 
      dataIndex: 'teacher', 
      key: 'teacher', 
      render: (v: any) => {
        const id = typeof v === 'object' ? v?._id : v;
        const found = (teachers as any[]).find(t => String(t._id) === String(id));
        return (
          <Space>
            <UserOutlined style={{ color: '#4f46e5' }} />
            <Text strong>{found ? found.username : (typeof v === 'object' ? v?.username : id || '—')}</Text>
          </Space>
        );
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Popconfirm title="Remove this assignment?" onConfirm={() => deleteMutation.mutate(record._id)}>
          <Button icon={<DeleteOutlined />} size="small" danger ghost>Remove</Button>
        </Popconfirm>
      )
    }
  ];

  return (
    <div style={{ padding: '4px' }}>
      {ctx}
      <Breadcrumb style={{ marginBottom: 16 }} items={[
        { title: 'Dashboard', href: '/dashboard/hod' },
        { title: 'Batch Assignments' },
      ]} />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, fontWeight: 700, letterSpacing: '-0.5px' }}>
          <TeamOutlined style={{ marginRight: 12 }} /> Batch Wise Subject Assignment
        </Title>
        <Tag color="orange" style={{ fontSize: 13, padding: '4px 10px', borderRadius: '8px' }}>
          🏢 <strong>Dept:</strong> {reduxUser?.department?.name || 'Loading...'}
        </Tag>
      </div>

      <Row gutter={24}>
        {/* Left Side: Batch List */}
        <Col xs={24} md={8}>
          <Card 
            title={<span><TeamOutlined /> Batches</span>} 
            className="hover-card glass-panel" 
            bordered={false}
            style={{ borderRadius: 16 }}
          >
            {batchesLoading ? (
              <div style={{ textAlign: 'center', padding: 24 }}><Spin /></div>
            ) : batches.length === 0 ? (
              <Empty description="No batches found" />
            ) : (
              <List
                dataSource={batches}
                renderItem={(item: any) => (
                  <List.Item 
                    onClick={() => setSelectedBatchId(item._id)}
                    style={{ 
                      cursor: 'pointer', 
                      borderRadius: 8,
                      padding: '12px 16px',
                      marginBottom: 8,
                      transition: 'all 0.2s',
                      background: selectedBatchId === item._id ? '#4f46e5' : 'transparent',
                      color: selectedBatchId === item._id ? '#fff' : 'inherit',
                      border: selectedBatchId === item._id ? 'none' : '1px solid #f0f0f0'
                    }}
                    className={selectedBatchId !== item._id ? 'hover-item' : ''}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <Text style={{ color: selectedBatchId === item._id ? '#fff' : 'inherit', fontWeight: selectedBatchId === item._id ? 600 : 400 }}>
                        {item.name}
                      </Text>
                      <RightOutlined style={{ fontSize: 12, opacity: 0.6 }} />
                    </div>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

        {/* Right Side: Assignments for Selected Batch */}
        <Col xs={24} md={16}>
          <Card 
            title={selectedBatch ? `Assigned Subjects for ${selectedBatch.name}` : 'Select a Batch'} 
            extra={selectedBatchId && (
              <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
                Assign Subject
              </Button>
            )}
            className="hover-card" 
            bordered={false}
            style={{ borderRadius: 16, minHeight: 400 }}
          >
            {!selectedBatchId ? (
              <Empty description="Please select a batch from the left to view assignments" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ marginTop: 60 }} />
            ) : assignsLoading ? (
              <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div>
            ) : filteredAssigns.length === 0 ? (
              <Empty description={`No subjects assigned to ${selectedBatch?.name} yet.`} />
            ) : (
              <Table 
                dataSource={filteredAssigns} 
                columns={columns} 
                rowKey="_id" 
                pagination={false}
                bordered
                size="middle"
              />
            )}
          </Card>
        </Col>
      </Row>

      <Modal
        title="Assign Subject to Batch"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={assignMutation.isPending}
      >
        <Form form={form} layout="vertical" onFinish={(v) => assignMutation.mutate({ ...v, batch: selectedBatchId })}>
          <Form.Item name="subject" label="Subject" rules={[{ required: true }]}>
            <Select placeholder="Select Subject" showSearch optionFilterProp="children">
              {(subjects as any[]).map(s => <Option key={s._id} value={s._id}>{s.name} ({s.code})</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="teacher" label="Assign Teacher" rules={[{ required: true }]}>
            <Select placeholder="Select Teacher" showSearch optionFilterProp="children">
              {(teachers as any[]).map(t => <Option key={t._id} value={t._id}>{t.username}</Option>)}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
