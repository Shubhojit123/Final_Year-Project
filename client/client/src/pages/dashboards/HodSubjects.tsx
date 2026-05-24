import { useState } from 'react';
import { 
  Typography, Card, Row, Col, List, Table, Tag, 
  Empty, Spin, Breadcrumb, Button, Modal, Form, Input, Select, message
} from 'antd';
import { 
  BookOutlined, RightOutlined, 
  ScheduleOutlined, PlusOutlined, ReloadOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useAppSelector } from '../../redux/hooks';

const { Title, Text } = Typography;
const { Option } = Select;

export default function HodSubjects() {
  const { user, token } = useAuth();
  const reduxUser = useAppSelector((state) => state.auth.user);
  const queryClient = useQueryClient();
  const [messageApi, ctx] = message.useMessage();
  const [selectedSemId, setSelectedSemId] = useState<string | null>(null);

  // ── Modal/Form state ──
  const [form] = Form.useForm();
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const openModal = (key: string) => {
    setActiveModal(key);
    form.resetFields();
    if (key === 'subject' && selectedSemId) {
      form.setFieldsValue({ sem: selectedSemId });
    }
  };
  const closeModal = () => { setActiveModal(null); form.resetFields(); };

  const postData = async (url: string, body: any = {}) => {
    const res = await api.post(url, body);
    const d = res.data?.data ?? res.data?.message ?? res.data;
    return Array.isArray(d) ? d : [];
  };

  const { data: sems = [], isLoading: semsLoading, refetch: refetchSems } = useQuery({ 
    queryKey: ['hod-sems'], 
    queryFn: () => postData('/hod/all-sems'), 
    enabled: !!token 
  });

  const { data: subjects = [], isLoading: subjectsLoading, refetch: refetchSubjects } = useQuery({ 
    queryKey: ['hod-subjects'], 
    queryFn: () => postData('/hod/all-subjects'), 
    enabled: !!token 
  });

  // ── Mutations ──
  const createSem = useMutation({
    mutationFn: async (values: any) => api.post('/hod/sem-create', { ...values, department: user?.department?._id || user?.department }),
    onSuccess: () => { 
      messageApi.success('Semester created!'); 
      queryClient.invalidateQueries({ queryKey: ['hod-sems'] }); 
      closeModal(); 
    },
    onError: () => messageApi.error('Failed to create semester'),
  });

  const createSubject = useMutation({
    mutationFn: async (values: any) => api.post('/hod/subject-create', { ...values, department: user?.department?._id || user?.department }),
    onSuccess: () => { 
      messageApi.success('Subject created!'); 
      queryClient.invalidateQueries({ queryKey: ['hod-subjects'] }); 
      closeModal(); 
    },
    onError: () => messageApi.error('Failed to create subject'),
  });

  const selectedSem = sems.find((s: any) => s._id === selectedSemId);
  const filteredSubjects = subjects.filter((s: any) => {
    const semId = typeof s.sem === 'object' ? s.sem?._id : s.sem;
    return semId === selectedSemId;
  });

  const columns = [
    { title: 'Code', dataIndex: 'code', key: 'code', render: (t: string) => <Tag color="purple">{t}</Tag> },
    { title: 'Subject Name', dataIndex: 'name', key: 'name', render: (t: string) => <strong>{t}</strong> },
    { title: 'Department', dataIndex: 'department', key: 'department', render: () => <Tag>{reduxUser?.department?.name || '—'}</Tag> },
  ];

  return (
    <div style={{ padding: '4px' }}>
      {ctx}
      <Breadcrumb style={{ marginBottom: 16 }} items={[
        { title: 'Dashboard', href: '/dashboard/hod' },
        { title: 'Subjects' },
      ]} />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, fontWeight: 700, letterSpacing: '-0.5px' }}>
          <BookOutlined style={{ marginRight: 12 }} /> Subjects Explorer
        </Title>
        <Tag color="orange" style={{ fontSize: 13, padding: '4px 10px', borderRadius: '8px' }}>
          🏢 <strong>Dept:</strong> {reduxUser?.department?.name || 'Loading...'}
        </Tag>
      </div>

      <Row gutter={24}>
        {/* Left Side: Semester List */}
        <Col xs={24} md={8}>
          <Card 
            title={<span><ScheduleOutlined /> Semesters</span>} 
            extra={<Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => openModal('sem')}>Add Sem</Button>}
            className="hover-card glass-panel" 
            bordered={false}
            style={{ borderRadius: 16 }}
          >
            {semsLoading ? (
              <div style={{ textAlign: 'center', padding: 24 }}><Spin /></div>
            ) : sems.length === 0 ? (
              <Empty description="No semesters found" />
            ) : (
              <List
                dataSource={sems}
                renderItem={(item: any) => (
                  <List.Item 
                    onClick={() => setSelectedSemId(item._id)}
                    style={{ 
                      cursor: 'pointer', 
                      borderRadius: 8,
                      padding: '12px 16px',
                      marginBottom: 8,
                      transition: 'all 0.2s',
                      background: selectedSemId === item._id ? '#4f46e5' : 'transparent',
                      color: selectedSemId === item._id ? '#fff' : 'inherit',
                      border: selectedSemId === item._id ? 'none' : '1px solid #f0f0f0'
                    }}
                    className={selectedSemId !== item._id ? 'hover-item' : ''}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <Text style={{ color: selectedSemId === item._id ? '#fff' : 'inherit', fontWeight: selectedSemId === item._id ? 600 : 400 }}>
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

        {/* Right Side: Subjects for Selected Semester */}
        <Col xs={24} md={16}>
          <Card 
            title={selectedSem ? `Subjects for ${selectedSem.name}` : 'Select a Semester'} 
            extra={selectedSemId && <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => openModal('subject')}>Add Subject</Button>}
            className="hover-card" 
            bordered={false}
            style={{ borderRadius: 16, minHeight: 400 }}
          >
            {!selectedSemId ? (
              <Empty description="Please select a semester from the left to view subjects" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ marginTop: 60 }} />
            ) : subjectsLoading ? (
              <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div>
            ) : filteredSubjects.length === 0 ? (
              <Empty description={`No subjects assigned to ${selectedSem?.name}`} />
            ) : (
              <Table 
                dataSource={filteredSubjects} 
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

      {/* Modals */}
      <Modal
        title={activeModal === 'sem' ? 'Add New Semester' : 'Add New Subject'}
        open={!!activeModal}
        onCancel={closeModal}
        onOk={() => form.submit()}
        confirmLoading={activeModal === 'sem' ? createSem.isPending : createSubject.isPending}
      >
        <Form form={form} layout="vertical" onFinish={(v) => activeModal === 'sem' ? createSem.mutate(v) : createSubject.mutate(v)}>
          {activeModal === 'sem' && (
            <Form.Item name="name" label="Semester Name" rules={[{ required: true }]}><Input placeholder="e.g. Semester 1" /></Form.Item>
          )}
          {activeModal === 'subject' && (
            <>
              <Form.Item name="name" label="Subject Name" rules={[{ required: true }]}><Input placeholder="e.g. Data Structures" /></Form.Item>
              <Form.Item name="code" label="Subject Code" rules={[{ required: true }]}><Input placeholder="e.g. CS301" /></Form.Item>
              <Form.Item name="sem" label="Semester" rules={[{ required: true }]}>
                <Select placeholder="Select Semester">
                  {(sems as any[]).map(s => <Option key={s._id} value={s._id}>{s.name}</Option>)}
                </Select>
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
}
