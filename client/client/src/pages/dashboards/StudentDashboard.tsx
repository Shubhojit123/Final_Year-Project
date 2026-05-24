import { useState } from 'react';
import {
  Table, Button, Form, Input, message, Typography,
  Tag, Card, Row, Col, Statistic, Empty, Spin, Select
} from 'antd';
import {
  SearchOutlined, BookOutlined, TrophyOutlined, PercentageOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;

export default function StudentDashboard() {
  const { user, token } = useAuth();
  const [messageApi, ctx] = message.useMessage();
  const [form] = Form.useForm();
  const [results, setResults] = useState<any[] | null>(null);
  const [selectedSem, setSelectedSem] = useState<string | null>(null);

  const { data: sems = [] } = useQuery({
    queryKey: ['student-sems'],
    queryFn: async () => {
      const res = await api.post('/student/all-sems');
      return res.data?.data || [];
    },
    enabled: !!token
  });

  const resultsMutation = useMutation({
    mutationFn: async (values: any) => {
      const res = await api.post('/student/results', {
        studentId: user?._id || user?.id,
        semesterId: values.semesterId
      });
      return res.data?.data || res.data || [];
    },
    onSuccess: (data) => {
      setResults(Array.isArray(data) ? data : [data]);
    },
    onError: (e: any) => {
      messageApi.error(e.response?.data?.message || 'Failed to fetch results');
      setResults([]);
    },
  });

  const totalMarks = results ? results.reduce((a, r) => a + (Number(r.marksObtained) || 0), 0) : 0;
  const totalFullMarks = results ? results.reduce((a, r) => a + (Number(r.totalMarks) || 0), 0) : 0;
  const avgPercentage = results && results.length > 0 ? Math.round(results.reduce((a, r) => a + (Number(r.percentage) || 0), 0) / results.length) : 0;
  const passed = results ? results.filter((r) => r.grade !== 'F').length : 0;

  const gradeColor: Record<string, string> = { A: 'green', B: 'blue', C: 'orange', D: 'red', F: 'volcano' };

  const columns = [
    { title: '#', render: (_: any, __: any, i: number) => i + 1, width: 50 },
    {
      title: 'Subject',
      dataIndex: 'subjectName',
      key: 'subjectName',
      render: (text: string, record: any) => (
        <div>
          <strong>{text}</strong>
          <div style={{ fontSize: '11px', color: '#888' }}>{record.subjectCode}</div>
        </div>
      ),
    },
    {
      title: 'Semester',
      dataIndex: 'semesterName',
      key: 'semesterName',
      render: (t: string) => <Tag color="cyan">{t}</Tag>
    },
    { title: 'CT 1', dataIndex: 'ct1', key: 'ct1' },
    { title: 'CT 2', dataIndex: 'ct2', key: 'ct2' },
    { title: 'CT 3', dataIndex: 'ct3', key: 'ct3' },
    {
      title: 'Obtained',
      dataIndex: 'marksObtained',
      key: 'marksObtained',
      render: (m: number, record: any) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <strong>{m} / {record.totalMarks}</strong>
          <div style={{ width: '100%', height: 4, background: '#f0f0f0', borderRadius: 2 }}>
            <div style={{ width: `${record.percentage}%`, height: '100%', background: record.percentage >= 40 ? '#52c41a' : '#ff4d4f', borderRadius: 2 }} />
          </div>
        </div>
      ),
    },
    {
      title: 'Grade',
      dataIndex: 'grade',
      key: 'grade',
      render: (g: string) => <Tag color={gradeColor[g] || 'default'} style={{ fontWeight: 700 }}>{g || '—'}</Tag>,
    },
  ];

  return (
    <div>
      {ctx}
      <Title level={2} style={{ marginBottom: 8, fontWeight: 700, letterSpacing: '-0.5px' }}>Student Portal</Title>
      <Text type="secondary" style={{ fontSize: 16 }}>Welcome, <strong>{user?.username}</strong>. View your academic results below.</Text>

      {/* Search Form */}
      <Card className="hover-card glass-panel" bordered={false} style={{ marginTop: 24, marginBottom: 32, borderRadius: 16 }}>
        <Title level={5} style={{ marginBottom: 16, fontWeight: 600 }}><SearchOutlined /> Search Your Results</Title>
        <Form form={form} layout="inline" onFinish={(v) => resultsMutation.mutate(v)}>
          <Form.Item name="semesterId" label="Semester" rules={[{ required: true, message: 'Select Semester' }]}>
            <Select 
              placeholder="Select Semester" 
              style={{ width: 300 }}
              options={sems.map((s: any) => ({ label: s.name, value: s._id }))}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={resultsMutation.isPending} icon={<SearchOutlined />}>
              Get Marks
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* Stats */}
      {results && results.length > 0 && (
        <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
          <Col xs={24} sm={8}>
            <Card bordered={false} className="hover-card gradient-card-1">
              <Statistic title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16 }}>Total Subjects</span>}
                value={results.length} valueStyle={{ color: '#fff', fontSize: 36, fontWeight: 700 }} prefix={<BookOutlined style={{ marginRight: 8 }} />} />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card bordered={false} className="hover-card gradient-card-2">
              <Statistic title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16 }}>Performance Index</span>}
                value={avgPercentage} valueStyle={{ color: '#fff', fontSize: 36, fontWeight: 700 }} prefix={<PercentageOutlined style={{ marginRight: 8 }} />} suffix={<span style={{ fontSize: 20 }}>%</span>} />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card bordered={false} className="hover-card gradient-card-4">
              <Statistic title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16 }}>Subjects Passed</span>}
                value={passed} valueStyle={{ color: '#fff', fontSize: 36, fontWeight: 700 }} prefix={<TrophyOutlined style={{ marginRight: 8 }} />} suffix={<span style={{ fontSize: 20 }}>/ {results.length}</span>} />
            </Card>
          </Col>
        </Row>
      )}

      {/* Results Table */}
      <Card className="hover-card" bordered={false} style={{ borderRadius: 16 }}>
        <Title level={4} style={{ marginBottom: 16, fontWeight: 600 }}>My Academic Results</Title>

        {resultsMutation.isPending ? (
          <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div>
        ) : results === null ? (
          <Empty description="Search your results using the form above" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : results.length === 0 ? (
          <Empty description="No results found. Check your Student ID and Batch ID." />
        ) : (
          <Table
            rowKey="_id"
            dataSource={results}
            columns={columns}
            bordered
            size="middle"
            pagination={{ pageSize: 10 }}
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row style={{ background: '#fafafa' }}>
                  <Table.Summary.Cell index={0} colSpan={6}><strong>Aggregate Total</strong></Table.Summary.Cell>
                  <Table.Summary.Cell index={6}>
                    <strong>{totalMarks} / {totalFullMarks}</strong>
                    <div style={{ fontSize: '12px', color: '#4f46e5' }}>Avg Percentage: {avgPercentage}%</div>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={7}>
                    <Tag color={passed === results.length ? 'green' : 'orange'}>
                      {passed}/{results.length} Passed
                    </Tag>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        )}
      </Card>
    </div>
  );
}
