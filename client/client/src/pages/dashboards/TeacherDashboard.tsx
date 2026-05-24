import { useState } from 'react';
import {
  Table, Button, Modal, Form, Input, Select,
  Space, Popconfirm, message, Typography, Tag,
  Card, Row, Col, Statistic, Tabs, List, Empty, Spin, Divider
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  FileTextOutlined, ReloadOutlined, BookOutlined,
  TeamOutlined, UserOutlined, RightOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;

export default function TeacherDashboard() {
  const { user, token } = useAuth();
  const queryClient = useQueryClient();
  const [messageApi, ctx] = message.useMessage();
  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [testType, setTestType] = useState<string>('ct1');
  
  // -- Selection state for student list --
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [studentModalOpen, setStudentModalOpen] = useState(false);

  const fetcher = async (url: string, method: 'get' | 'post' = 'get', body?: any) => {
    const res = method === 'get' ? await api.get(url) : await api.post(url, body);
    return res.data?.data || res.data;
  };

  const { data: marks = [], isLoading: marksLoading, refetch: refetchMarks } = useQuery({
    queryKey: ['teacher-marks'],
    queryFn: () => fetcher('/teacher/all-marks', 'post'),
    enabled: !!token,
  });

  const { data: assignments = [], isLoading: assignsLoading, refetch: refetchAssigns } = useQuery({
    queryKey: ['teacher-assigns'],
    queryFn: () => fetcher('/teacher/get-my-subjects', 'post'),
    enabled: !!token,
  });

  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ['batch-students', selectedAssignment?.batch?._id],
    queryFn: () => fetcher('/teacher/batch-students', 'post', { batch_id: selectedAssignment?.batch?._id }),
    enabled: !!token && !!selectedAssignment?.batch?._id,
  });

  const { data: sems = [] } = useQuery({
    queryKey: ['all-sems'],
    queryFn: () => fetcher('/teacher/all-sems', 'post'),
    enabled: !!token,
  });

  const saveMutation = useMutation({
    mutationFn: async (values: any) => {
      if (editing) return api.put('/teacher/mark-update', { _id: editing._id, ...values });
      return api.post('/teacher/mark-create', values);
    },
    onSuccess: () => {
      messageApi.success(editing ? 'Mark updated!' : 'Mark created!');
      queryClient.invalidateQueries({ queryKey: ['teacher-marks'] });
      setModalOpen(false);
      setEditing(null);
      form.resetFields();
    },
    onError: (e: any) => messageApi.error(e.response?.data?.message || 'Operation failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete('/teacher/mark-delete', { data: { _id: id } }),
    onSuccess: () => {
      messageApi.success('Mark deleted!');
      queryClient.invalidateQueries({ queryKey: ['teacher-marks'] });
    },
    onError: (e: any) => messageApi.error(e.response?.data?.message || 'Delete failed'),
  });

  const openEdit = (record: any) => {
    setEditing(record);
    form.setFieldsValue({
      studentId: record.studentId?._id || record.studentId,
      subjectId: record.subjectId?._id || record.subjectId,
      batch: record.batch?._id || record.batch,
      ct1: record.ct1,
      ct2: record.ct2,
      ct3: record.ct3,
      marksObtained: record.marksObtained,
      grade: record.grade,
      semester: record.semester?._id || record.semester,
      totalMarks: record.totalMarks || 60,
    });
    setModalOpen(true);
  };

  const viewStudents = (assign: any) => {
    setSelectedAssignment(assign);
    setStudentModalOpen(true);
  };

  const markColumns = [
    { title: '#', render: (_: any, __: any, i: number) => i + 1, width: 50 },
    {
      title: 'Student',
      dataIndex: 'studentId',
      key: 'studentId',
      render: (v: any) => <Tag color="blue">{typeof v === 'object' ? v?.username : v || '—'}</Tag>,
    },
    {
      title: 'Subject',
      dataIndex: 'subjectId',
      key: 'subjectId',
      render: (v: any) => <Tag color="purple">{typeof v === 'object' ? v?.name : v || '—'}</Tag>,
    },
    {
      title: 'Batch',
      dataIndex: 'batch',
      key: 'batch',
      render: (v: any) => <Tag>{typeof v === 'object' ? v?.name : v || '—'}</Tag>,
    },
    {
      title: 'CT1',
      dataIndex: 'ct1',
      key: 'ct1',
    },
    {
      title: 'CT2',
      dataIndex: 'ct2',
      key: 'ct2',
    },
    {
      title: 'CT3',
      dataIndex: 'ct3',
      key: 'ct3',
    },
    {
      title: 'Total',
      dataIndex: 'marksObtained',
      key: 'total',
      render: (m: number) => <strong>{m}</strong>,
    },
    {
      title: 'Grade',
      dataIndex: 'grade',
      key: 'grade',
      render: (g: string) => <Tag color={g === 'F' ? 'red' : 'green'}>{g || '—'}</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(record)} />
          <Popconfirm title="Delete?" onConfirm={() => deleteMutation.mutate(record._id)}>
            <Button icon={<DeleteOutlined />} size="small" danger ghost />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const marksArray = Array.isArray(marks) ? marks : [];
  const assignmentsArray = Array.isArray(assignments) ? assignments : [];

  const items = [
    {
      key: 'marks',
      label: <span><FileTextOutlined /> Marks Management</span>,
      children: (
        <Card className="glass-panel" bordered={false}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <Title level={4} style={{ margin: 0 }}>Student Marks</Title>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true); }}>
              Add Mark
            </Button>
          </div>
          <Table rowKey="_id" dataSource={marksArray} columns={markColumns} loading={marksLoading} size="small" />
        </Card>
      )
    },
    {
      key: 'assignments',
      label: <span><BookOutlined /> My Assignments</span>,
      children: (
        <div style={{ padding: '8px 0' }}>
          {assignsLoading ? <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div> : (
            <Row gutter={[16, 16]}>
              {assignmentsArray.map((item: any) => (
                <Col xs={24} sm={12} lg={8} key={item._id}>
                  <Card 
                    className="hover-card" 
                    style={{ borderRadius: 12, cursor: 'pointer', border: '1px solid #f0f0f0' }}
                    onClick={() => viewStudents(item)}
                    hoverable
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <Tag color="purple" style={{ marginBottom: 8 }}>{item.subject?.code || 'SUB'}</Tag>
                        <Title level={5} style={{ margin: 0 }}>{item.subject?.name || 'Unknown Subject'}</Title>
                        <Text type="secondary"><TeamOutlined /> {item.batch?.name || 'Unknown Batch'}</Text>
                      </div>
                      <div style={{ background: '#f5f5f5', padding: '8px', borderRadius: '50%' }}>
                        <RightOutlined style={{ color: '#4f46e5' }} />
                      </div>
                    </div>
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f5f5f5', display: 'flex', justifyContent: 'space-between' }}>
                      <Text size="small" type="secondary">Click to view students</Text>
                      <UserOutlined style={{ opacity: 0.5 }} />
                    </div>
                  </Card>
                </Col>
              ))}
              {assignmentsArray.length === 0 && <Col span={24}><Empty description="No subjects assigned to you yet." /></Col>}
            </Row>
          )}
        </div>
      )
    }
  ];

  return (
    <div style={{ padding: '4px' }}>
      {ctx}
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ margin: 0, fontWeight: 700 }}>Teacher Workspace</Title>
        <Text type="secondary">Welcome back, {user?.username}. Manage your subjects and marks here.</Text>
      </div>

      <Tabs defaultActiveKey="assignments" items={items} />

      {/* Marks Modal */}
      <Modal title={editing ? 'Edit Mark' : 'Add Mark'} open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => form.submit()} confirmLoading={saveMutation.isPending} width={600}>
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={(v) => {
            const payload = {
              ...v,
              teacher: user?._id || user?.id,
              department: editing?.department?._id || editing?.department || selectedAssignment?.batch?.department?._id || selectedAssignment?.batch?.department || selectedAssignment?.subject?.department?._id || selectedAssignment?.subject?.department || user?.department?._id || user?.department,
              semester: editing?.semester?._id || editing?.semester || selectedAssignment?.subject?.sem?._id || selectedAssignment?.subject?.sem
            };
            saveMutation.mutate(payload);
          }}
          onValuesChange={(changed, all) => {
            if ('ct1' in changed || 'ct2' in changed || 'ct3' in changed) {
              const total = (Number(all.ct1) || 0) + (Number(all.ct2) || 0) + (Number(all.ct3) || 0);
              form.setFieldValue('marksObtained', total);
            }
          }}
        >
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="studentId" label="Student" rules={[{ required: true }]}>
                <Select 
                  placeholder="Select Student" 
                  disabled={!!editing} 
                  showSearch 
                  optionFilterProp="label"
                  options={students.map((s: any) => ({ label: s.username, value: s._id }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="subjectId" label="Subject" rules={[{ required: true }]}>
                <Select 
                  placeholder="Select Subject" 
                  disabled={!!editing}
                  options={assignmentsArray.map((a: any) => ({ label: a.subject?.name, value: a.subject?._id }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={24}>
              <Form.Item name="batch" label="Batch" rules={[{ required: true }]}>
                <Select 
                  placeholder="Select Batch" 
                  disabled={!!editing}
                  options={assignmentsArray.map((a: any) => ({ label: a.batch?.name, value: a.batch?._id }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Test Information</Divider>
          
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="Select Class Test">
                <Select 
                  value={testType} 
                  onChange={setTestType}
                  options={[
                    { label: 'Class Test 1', value: 'ct1' },
                    { label: 'Class Test 2', value: 'ct2' },
                    { label: 'Class Test 3', value: 'ct3' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="grade" label="Grade">
                <Select options={['A','B','C','D','F'].map(g => ({label:g, value:g}))} />
              </Form.Item>
            </Col>
          </Row>

          <Card size="small" style={{ background: '#f8fafc', marginBottom: 16 }}>
            <Row gutter={16} align="middle">
              <Col span={6}>
                <Form.Item 
                  name="ct1" 
                  label="CT 1" 
                  rules={[{ required: testType === 'ct1', message: 'Required' }]}
                >
                  <Input 
                    type="number" 
                    disabled={testType !== 'ct1'} 
                    style={testType === 'ct1' ? { border: '1px solid #4f46e5', background: '#fff' } : {}}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item 
                  name="ct2" 
                  label="CT 2" 
                  rules={[{ required: testType === 'ct2', message: 'Required' }]}
                >
                  <Input 
                    type="number" 
                    disabled={testType !== 'ct2'} 
                    style={testType === 'ct2' ? { border: '1px solid #4f46e5', background: '#fff' } : {}}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item 
                  name="ct3" 
                  label="CT 3" 
                  rules={[{ required: testType === 'ct3', message: 'Required' }]}
                >
                  <Input 
                    type="number" 
                    disabled={testType !== 'ct3'} 
                    style={testType === 'ct3' ? { border: '1px solid #4f46e5', background: '#fff' } : {}}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="totalMarks" label="Full Marks" rules={[{ required: true }]}>
                  <Input type="number" placeholder="e.g. 20" />
                </Form.Item>
              </Col>
            </Row>
            <Row justify="end">
              <Col>
                <Text strong>Total Obtained: </Text>
                <Form.Item name="marksObtained" noStyle>
                  <Input style={{ width: 80, fontWeight: 'bold', textAlign: 'center', color: '#4f46e5' }} disabled />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Form>
      </Modal>

      {/* Students Modal */}
      <Modal 
        title={<span><TeamOutlined /> Students in {selectedAssignment?.batch?.name}</span>}
        open={studentModalOpen} 
        onCancel={() => setStudentModalOpen(false)} 
        footer={null}
        width={700}
      >
        {studentsLoading ? <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div> : (
          <Table 
            rowKey="_id"
            dataSource={Array.isArray(students) ? students : []} 
            pagination={{ pageSize: 5 }}
            size="small"
            columns={[
              { title: 'Name', dataIndex: 'username', key: 'name', render: (t: string) => <strong>{t}</strong> },
              { title: 'Email', dataIndex: 'email', key: 'email' },
              { title: 'Actions', render: (_: any, record: any) => (
                <Button size="small" type="link" onClick={() => {
                  setStudentModalOpen(false);
                  setEditing(null);
                  form.setFieldsValue({ 
                    studentId: record._id,
                    batch: selectedAssignment?.batch?._id,
                    subjectId: selectedAssignment?.subject?._id,
                    semester: selectedAssignment?.subject?.sem?._id || selectedAssignment?.subject?.sem,
                  });
                  setModalOpen(true);
                }}>Add Marks</Button>
              )}
            ]}
          />
        )}
      </Modal>
    </div>
  );
}
