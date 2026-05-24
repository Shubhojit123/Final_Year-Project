import { useState } from 'react';
import * as XLSX from 'xlsx';

import {
  Tabs, Table, Button, Modal, Form, Input,
  Space, Popconfirm, message, Typography, Tag, Card,
  Row, Col, Statistic, Upload, Divider
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  BookOutlined, CalendarOutlined, TeamOutlined,
  ScheduleOutlined, UserAddOutlined, UploadOutlined, ReloadOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useAppSelector } from '../../redux/hooks';
import { Select } from 'antd';


const { Title, Text } = Typography;
const { Option } = Select;


// ─── HOD Dashboard ─────────────────────────────────────────────────────
export default function HodDashboard() {
  const { user, token } = useAuth();
  const reduxUser = useAppSelector((state) => state.auth.user);

  const queryClient = useQueryClient();
  const [messageApi, ctx] = message.useMessage();


  // ── Student Bulk Upload State ──
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  const handleFileChange = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json(sheet);
      setPreviewData(parsedData);
      setCurrentFile(file);
    };
    reader.readAsBinaryString(file);
  };


  // ── Fetch all sub-entities ──
  const fetchAll = async (url: string) => {
    const res = await api.get(url);
    const d = res.data?.data ?? res.data?.message ?? res.data;
    return Array.isArray(d) ? d : [];
  };

  const postData = async (url: string, body: any = {}) => {
  const res = await api.post(url, body);
  const d = res.data?.data ?? res.data?.message ?? res.data;
  return Array.isArray(d) ? d : [];
};

  const { data: years = [], isLoading: yearsLoading, refetch: refetchYears } = useQuery({ queryKey: ['hod-years'], queryFn: () => postData('/hod/all-years'), enabled: !!token });
  const { data: batches = [], isLoading: batchesLoading, refetch: refetchBatches } = useQuery({ queryKey: ['hod-batches'], queryFn: () => postData('/hod/all-batchs'), enabled: !!token });
  const { data: sems = [], isLoading: semsLoading, refetch: refetchSems } = useQuery({ queryKey: ['hod-sems'], queryFn: () => postData('/hod/all-sems'), enabled: !!token });
  const { data: subjects = [], isLoading: subjectsLoading, refetch: refetchSubjects } = useQuery({ queryKey: ['hod-subjects'], queryFn: () => postData('/hod/all-subjects'), enabled: !!token });
  const { data: assigns = [], isLoading: assignsLoading, refetch: refetchAssigns } = useQuery({ queryKey: ['hod-assigns'], queryFn: () => postData('/hod/all-teacher-assigns'), enabled: !!token });

  // ── Generic modal/form state ──
  const [form] = Form.useForm();
  const [inviteForm] = Form.useForm();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [editing, setEditing] = useState<any>(null);

  const openModal = (key: string, record?: any) => {
    setEditing(record || null);
    setActiveModal(key);
    if (record) {
      form.setFieldsValue(record);
    } else {
      form.resetFields();
    }
  };
  const closeModal = () => { setActiveModal(null); setEditing(null); form.resetFields(); };

  // ── Generic CRUD mutations ──
  const makeMutations = (createUrl: string, updateUrl: string, deleteUrl: string, queryKey: string) => ({
    save: useMutation({
      mutationFn: async (values: any) => {
        // Automatically inject department ID for new creations
        const data = editing
          ? { _id: editing._id, ...values }
          : { ...values, department: user?.department?._id || user?.department };


        return editing
          ? api.put(updateUrl, data)
          : api.post(createUrl, data);
      },
      onSuccess: () => { messageApi.success('Saved!'); queryClient.invalidateQueries({ queryKey: [queryKey] }); closeModal(); },
      onError: (e: any) => messageApi.error(e.response?.data?.message || 'Failed'),
    }),

    del: useMutation({
      mutationFn: async (id: string) => api.delete(deleteUrl, { data: { _id: id } }),
      onSuccess: () => { messageApi.success('Deleted!'); queryClient.invalidateQueries({ queryKey: [queryKey] }); },
      onError: (e: any) => messageApi.error(e.response?.data?.message || 'Failed'),
    }),
  });

  const yearM = makeMutations('/hod/year-create', '/hod/year-update', '/hod/year-delete', 'hod-years');
  const batchM = makeMutations('/hod/batch-create', '/hod/batch-update', '/hod/batch-delete', 'hod-batches');
  const semM = makeMutations('/hod/sem-create', '/hod/sem-update', '/hod/sem-delete', 'hod-sems');
  const subjectM = makeMutations('/hod/subject-create', '/hod/subject-update', '/hod/subject-delete', 'hod-subjects');
  const assignM = makeMutations('/hod/teacher-assign', '/hod/teacher-assign-update', '/hod/teacher-assign-delete', 'hod-assigns');

  // ── Invite Teacher ──
  const inviteMutation = useMutation({
    mutationFn: async (values: any) => api.post('/hod/invite-teacher', values),
    onSuccess: () => { messageApi.success('Invitation sent!'); inviteForm.resetFields(); closeModal(); },
    onError: (e: any) => messageApi.error(e.response?.data?.message || 'Failed to send invite'),
  });

  // ── Student Bulk Upload ──
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!user?.department || !selectedBatchId) {
        throw new Error("Missing department or batch information");
      }
      const fd = new FormData();
      fd.append('file', file);
      const deptId = typeof user?.department === 'object' ? user.department._id : user?.department;
      // Backend expects department_id & batch_id as query params
      return api.post(`/hod/student-create?department_id=${deptId}&batch_id=${selectedBatchId}`, fd, {

        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    onSuccess: (res: any) => {
      const data = res.data?.data ?? res.data?.message;
      if (typeof data === 'object' && data.success !== undefined) {
        messageApi.success(`Students processed: ${data.success} succeeded, ${data.failed} failed.`);
      } else {
        messageApi.success('Students uploaded successfully!');
      }
      // Reset preview after success
      setPreviewData([]);
      setCurrentFile(null);
    },
    onError: (e: any) => messageApi.error(e.response?.data?.message || 'Upload failed'),
  });


  const actionCol = (modalKey: string, del: any) => ({
    title: 'Actions', key: 'actions',
    render: (_: any, record: any) => (
      <Space>
        <Button icon={<EditOutlined />} size="small" onClick={() => openModal(modalKey, record)}>Edit</Button>
        <Popconfirm title="Delete?" onConfirm={() => del.mutate(record._id)} okText="Yes" cancelText="No">
          <Button icon={<DeleteOutlined />} size="small" danger loading={del.isPending}>Delete</Button>
        </Popconfirm>
      </Space>
    ),
  });

  // ── Current active save mutation ──
  const currentSaveMutation = activeModal === 'year' ? yearM.save
    : activeModal === 'batch' ? batchM.save
      : activeModal === 'sem' ? semM.save
        : activeModal === 'subject' ? subjectM.save
          : assignM.save;

  const tabItems = [
    {
      key: 'years',
      label: <span><CalendarOutlined /> Years</span>,
      children: (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <Button icon={<ReloadOutlined />} size="small" onClick={() => refetchYears()}>Refresh</Button>
            <Button type="primary" icon={<PlusOutlined />} size="small" onClick={() => openModal('year')}>Add Year</Button>
          </div>
          <Table rowKey="_id" loading={yearsLoading} size="small" dataSource={years as any[]} bordered pagination={{ pageSize: 6 }}
            columns={[
              { title: 'Year Name', dataIndex: 'name', render: (t: string) => <strong>{t}</strong> },
              { title: 'Department', dataIndex: 'department', render: () => <Tag>{reduxUser?.department?.name || '—'}</Tag> },
              actionCol('year', yearM.del),
            ]} />
        </div>
      ),
    },
    {
      key: 'batches',
      label: <span><TeamOutlined /> Batches</span>,
      children: (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <Button icon={<ReloadOutlined />} size="small" onClick={() => refetchBatches()}>Refresh</Button>
            <Button type="primary" icon={<PlusOutlined />} size="small" onClick={() => openModal('batch')}>Add Batch</Button>
          </div>
          <Table rowKey="_id" loading={batchesLoading} size="small" dataSource={batches as any[]} bordered pagination={{ pageSize: 6 }}
            columns={[
              { title: 'Batch Name', dataIndex: 'name', render: (t: string) => <strong>{t}</strong> },
              { title: 'Department', dataIndex: 'department', render: () => <Tag>{reduxUser?.department?.name || '—'}</Tag> },
              { title: 'Year', dataIndex: 'year', render: (v: any) => {
                  const id = typeof v === 'object' ? v?._id : v;
                  const found = (years as any[]).find(y => String(y._id) === String(id));
                  return <Tag color="blue">{found ? found.name : (typeof v === 'object' ? v?.name : id || '—')}</Tag>;
              }},
              actionCol('batch', batchM.del),
            ]} />
        </div>
      ),
    },
    {
      key: 'sems',
      label: <span><ScheduleOutlined /> Semesters</span>,
      children: (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <Button icon={<ReloadOutlined />} size="small" onClick={() => refetchSems()}>Refresh</Button>
            <Button type="primary" icon={<PlusOutlined />} size="small" onClick={() => openModal('sem')}>Add Semester</Button>
          </div>
          <Table rowKey="_id" loading={semsLoading} size="small" dataSource={sems as any[]} bordered pagination={{ pageSize: 6 }}
            columns={[
              { title: 'Semester', dataIndex: 'name', render: (t: string) => <strong>{t}</strong> },
              { title: 'Department', dataIndex: 'department', render: () => <Tag>{reduxUser?.department?.name || '—'}</Tag> },
              actionCol('sem', semM.del),
            ]} />
        </div>
      ),
    },
    {
      key: 'subjects',
      label: <span><BookOutlined /> Subjects</span>,
      children: (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <Button icon={<ReloadOutlined />} size="small" onClick={() => refetchSubjects()}>Refresh</Button>
            <Button type="primary" icon={<PlusOutlined />} size="small" onClick={() => openModal('subject')}>Add Subject</Button>
          </div>
          <Table rowKey="_id" loading={subjectsLoading} size="small" dataSource={subjects as any[]} bordered pagination={{ pageSize: 6 }}
            columns={[
              { title: 'Semlist', dataIndex: 'sem', key: 'sem', render: (v: any) => {
                  const id = typeof v === 'object' ? v?._id : v;
                  const found = (sems as any[]).find(s => String(s._id) === String(id));
                  return <Tag color="cyan" style={{ fontWeight: 600 }}>{found ? found.name : (typeof v === 'object' ? v?.name : id || '—')}</Tag>;
              }},
              { title: 'Subject Name', dataIndex: 'name', key: 'name', render: (t: string) => <strong>{t}</strong> },
              { title: 'Code', dataIndex: 'code', key: 'code', render: (t: string) => <Tag color="purple">{t}</Tag> },
              { title: 'Department', dataIndex: 'department', key: 'department', render: () => <Tag>{reduxUser?.department?.name || '—'}</Tag> },
              actionCol('subject', subjectM.del),
            ]} />
        </div>
      ),
    },
    {
      key: 'assigns',
      label: <span><UserAddOutlined /> Teacher Assignments</span>,
      children: (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <Button icon={<ReloadOutlined />} size="small" onClick={() => refetchAssigns()}>Refresh</Button>
            <Button type="primary" icon={<PlusOutlined />} size="small" onClick={() => openModal('assign')}>Assign Teacher</Button>
          </div>
          <Table rowKey="_id" loading={assignsLoading} size="small" dataSource={assigns as any[]} bordered pagination={{ pageSize: 6 }}
            columns={[
              { title: 'Teacher', dataIndex: 'teacher', render: (v: any) => <Tag color="blue">{typeof v === 'object' ? v?.username || v?._id : v || '—'}</Tag> },
              { title: 'Subject', dataIndex: 'subject', render: (v: any) => {
                  const id = typeof v === 'object' ? v?._id : v;
                  const found = (subjects as any[]).find(s => String(s._id) === String(id));
                  return <Tag color="purple">{found ? found.name : (typeof v === 'object' ? v?.name : id || '—')}</Tag>;
              }},
              { title: 'Batch', dataIndex: 'batch', render: (v: any) => {
                  const id = typeof v === 'object' ? v?._id : v;
                  const found = (batches as any[]).find(b => String(b._id) === String(id));
                  return <Tag>{found ? found.name : (typeof v === 'object' ? v?.name : id || '—')}</Tag>;
              }},
              actionCol('assign', assignM.del),
            ]} />
        </div>
      ),
    },
    {
      key: 'students',
      label: <span><UploadOutlined /> Students</span>,
      children: (
        <div>
          <Title level={5}>Bulk Upload Students (Excel)</Title>
          <Text type="secondary">Upload an Excel file with columns: <strong>name, email, dob</strong>. Password will be set to their DOB.</Text>
          <Divider />

          <div style={{ marginBottom: 20 }}>
            <span style={{ marginRight: 12 }}>Target Batch:</span>
            <Select
              placeholder="Select Batch"
              style={{ width: 300 }}
              value={selectedBatchId}
              onChange={setSelectedBatchId}
              options={(batches as any[]).map(b => ({ label: b.name, value: b._id }))}
            />
          </div>

          {!previewData.length ? (
            <div style={{ marginTop: 16 }}>
              <Upload.Dragger
                accept=".xlsx,.xls,.csv"
                showUploadList={false}
                disabled={!selectedBatchId}
                beforeUpload={(file) => {
                  handleFileChange(file);
                  return false; // Prevent auto-upload
                }}
              >
                <p className="ant-upload-drag-icon"><UploadOutlined /></p>
                {!selectedBatchId ? (
                  <p className="ant-upload-text">Please select a batch first</p>
                ) : (
                  <>
                    <p className="ant-upload-text">Click or drag file to upload</p>
                    <p className="ant-upload-hint">Supports Excel (.xlsx) and CSV files</p>
                  </>
                )}
              </Upload.Dragger>
            </div>
          ) : (
            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' }}>
                <Title level={5} style={{ margin: 0 }}>Preview Data ({previewData.length} students)</Title>
                <Space>
                  <Button onClick={() => { setPreviewData([]); setCurrentFile(null); }}>Clear</Button>
                  <Button
                    type="primary"
                    icon={<UploadOutlined />}
                    loading={uploadMutation.isPending}
                    onClick={() => currentFile && uploadMutation.mutate(currentFile)}
                  >
                    Send to Server
                  </Button>
                </Space>
              </div>
              <Table
                dataSource={previewData}
                columns={[
                  { title: 'Name', dataIndex: 'name', key: 'name' },
                  { title: 'Email', dataIndex: 'email', key: 'email' },
                  { title: 'DOB', dataIndex: 'dob', key: 'dob' },
                ]}
                pagination={{ pageSize: 5 }}
                size="small"
                bordered
              />
            </div>
          )}
        </div>
      ),
    },

    {
      key: 'invite',
      label: <span><UserAddOutlined /> Invite Teacher</span>,
      children: (
        <div>
          <Title level={5}>Invite a Teacher</Title>
          <Text type="secondary">Send an email invitation for a teacher to join the system.</Text>
          <Divider />
          <Form form={inviteForm} layout="vertical" onFinish={(v) => inviteMutation.mutate(v)} style={{ maxWidth: 400 }}>
            <Form.Item name="email" label="Teacher Email" rules={[{ required: true, type: 'email' }]}>
              <Input placeholder="teacher@college.com" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={inviteMutation.isPending}>Send Invitation</Button>
            </Form.Item>
          </Form>
        </div>
      ),
    },
  ];

  return (
    <div>
      {ctx}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <Title level={2} style={{ marginBottom: 0, fontWeight: 700, letterSpacing: '-0.5px' }}>HOD Dashboard</Title>
        <div style={{ textAlign: 'right' }}>
          <Tag color="blue" style={{ fontSize: 13, padding: '4px 10px', borderRadius: '8px' }}>
            🏫 <strong>College:</strong> {reduxUser?.department?.college?.name || 'Loading...'}
          </Tag>
          <Tag color="orange" style={{ fontSize: 13, padding: '4px 10px', borderRadius: '8px' }}>
            🏢 <strong>Dept:</strong> {reduxUser?.department?.name || 'Loading...'}
          </Tag>
        </div>
      </div>
      <Divider style={{ marginTop: 8, marginBottom: 24 }} />

      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        {[
          { label: 'Years', value: (years as any[]).length, icon: <CalendarOutlined style={{ marginRight: 8 }} />, className: 'gradient-card-1' },
          { label: 'Batches', value: (batches as any[]).length, icon: <TeamOutlined style={{ marginRight: 8 }} />, className: 'gradient-card-2' },
          { label: 'Subjects', value: (subjects as any[]).length, icon: <BookOutlined style={{ marginRight: 8 }} />, className: 'gradient-card-3' },
          { label: 'Assignments', value: (assigns as any[]).length, icon: <UserAddOutlined style={{ marginRight: 8 }} />, className: 'gradient-card-4' },
        ].map((s) => (
          <Col xs={24} sm={12} md={6} key={s.label}>
            <Card bordered={false} className={`hover-card ${s.className}`}>
              <Statistic
                title={<span style={{ color: s.className === 'gradient-card-3' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.9)', fontSize: 16 }}>{s.label}</span>}
                value={s.value}
                valueStyle={{ color: s.className === 'gradient-card-3' ? '#111827' : '#fff', fontSize: 36, fontWeight: 700 }}
                prefix={s.icon}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="hover-card" bordered={false} style={{ borderRadius: 16, padding: '8px' }}>
        <Tabs defaultActiveKey="years" items={tabItems} size="large" />
      </Card>

      {/* Generic Edit/Create Modal */}
      <Modal
        title={editing ? 'Edit Record' : 'Create Record'}
        open={!!activeModal && !['students', 'invite'].includes(activeModal || '')}
        onCancel={closeModal}
        onOk={() => form.submit()}
        confirmLoading={currentSaveMutation.isPending}
        okText={editing ? 'Update' : 'Create'}
      >
        <Form form={form} layout="vertical" onFinish={(v) => currentSaveMutation.mutate(v)}>
          {activeModal === 'year' && <>
            <Form.Item name="name" label="Year Name" rules={[{ required: true }]}><Input placeholder="e.g. First Year" /></Form.Item>
          </>}
          {activeModal === 'batch' && <>
            <Form.Item name="name" label="Batch Name" rules={[{ required: true }]}><Input placeholder="e.g. Batch A" /></Form.Item>
            <Form.Item name="year" label="Year" rules={[{ required: true }]}>
              <Select placeholder="Select Year">
                {(years as any[]).map(y => <Option key={y._id} value={y._id}>{y.name}</Option>)}
              </Select>
            </Form.Item>
          </>}
          {activeModal === 'sem' && <>
            <Form.Item name="name" label="Semester Name" rules={[{ required: true }]}><Input placeholder="e.g. Semester 1" /></Form.Item>
          </>}
          {activeModal === 'subject' && <>
            <Form.Item name="name" label="Subject Name" rules={[{ required: true }]}><Input placeholder="e.g. Data Structures" /></Form.Item>
            <Form.Item name="code" label="Subject Code" rules={[{ required: true }]}><Input placeholder="e.g. CS301" /></Form.Item>
            <Form.Item name="sem" label="Semester" rules={[{ required: true }]}>
              <Select placeholder="Select Semester">
                {(sems as any[]).map(s => <Option key={s._id} value={s._id}>{s.name}</Option>)}
              </Select>
            </Form.Item>
          </>}
          {activeModal === 'assign' && <>
            <Form.Item name="teacher" label="Teacher" rules={[{ required: true }]}>
              <Input placeholder="Teacher ID" />
            </Form.Item>
            <Form.Item name="subject" label="Subject" rules={[{ required: true }]}>
              <Select placeholder="Select Subject">
                {(subjects as any[]).map(s => <Option key={s._id} value={s._id}>{s.name}</Option>)}
              </Select>
            </Form.Item>
            <Form.Item name="batch" label="Batch" rules={[{ required: true }]}>
              <Select placeholder="Select Batch">
                {(batches as any[]).map(b => <Option key={b._id} value={b._id}>{b.name}</Option>)}
              </Select>
            </Form.Item>
          </>}

        </Form>
      </Modal>
    </div>
  );
}
