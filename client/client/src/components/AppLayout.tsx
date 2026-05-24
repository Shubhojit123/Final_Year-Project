import { Layout, Menu, Dropdown, Avatar, Modal, Tag, Typography } from 'antd';
import { Outlet, useNavigate, useLocation } from '@tanstack/react-router';
import { useAuth } from '../context/AuthContext';
import {
  DashboardOutlined, LogoutOutlined, UserOutlined,
  ExclamationCircleOutlined, BookOutlined, TeamOutlined
} from '@ant-design/icons';
import { useAppSelector } from '../redux/hooks';


const { Header, Content, Sider } = Layout;
const { Text } = Typography;

const ROLE_COLORS: Record<string, string> = {
  SUPERADMIN: 'red',
  ADMIN: 'volcano',
  HOD: 'orange',
  TEACHER: 'blue',
  STUDENT: 'green',
};

const ROLE_AVATAR_COLORS: Record<string, string> = {
  SUPERADMIN: '#cf1322',
  ADMIN: '#d4380d',
  HOD: '#d46b08',
  TEACHER: '#096dd9',
  STUDENT: '#389e0d',
};

export default function AppLayout() {
  const { user, logout } = useAuth();
  const reduxUser = useAppSelector((state) => state.auth.user);
  const navigate = useNavigate();

  const location = useLocation();

  if (!user) {
    return null;
  }

  const rolePathMap: Record<string, string> = {
    SUPERADMIN: '/dashboard/super-admin',
    ADMIN: '/dashboard/admin',
    HOD: '/dashboard/hod',
    TEACHER: '/dashboard/teacher',
    STUDENT: '/dashboard/student',
  };

  const dashboardPath = rolePathMap[user.role] || '/';

  const menuItems = [
    {
      key: dashboardPath,
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    ...(user.role === 'HOD' ? [
      {
        key: '/hod/subjects',
        icon: <BookOutlined />,
        label: 'Subjects',
      },
      {
        key: '/hod/batch-assignments',
        icon: <TeamOutlined />,
        label: 'Batch Assignments',
      }
    ] : [])
  ];

  const confirmLogout = () => {
    Modal.confirm({
      title: 'Confirm Logout',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to log out?',
      okText: 'Yes, Logout',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: logout,
    });
  };

  const dropdownItems = {
    items: [
      {
        key: 'user-info',
        label: (
          <div style={{ padding: '4px 0', minWidth: 180 }}>
            <div style={{ fontWeight: 700 }}>{user.username}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>{user.email}</Text>
          </div>
        ),
        disabled: true,
      },
      { type: 'divider' as const },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: <span style={{ color: '#ff4d4f' }}>Logout</span>,
        onClick: confirmLogout,
      },
    ],
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible theme="dark">
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          marginBottom: 8,
        }}>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 16, letterSpacing: 1 }}>
            EduPortal
          </span>
        </div>
        <Menu
          theme="dark"
          selectedKeys={[location.pathname]}
          mode="inline"
          items={menuItems}
          onClick={({ key }) => navigate({ to: key })}
        />
      </Sider>

      <Layout>
        <Header style={{
          padding: '0 24px',
          background: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 1px 4px rgba(0,21,41,.08)',
        }}>
          <div style={{ color: '#666', fontSize: 14 }}>
            📚 Academic Management System
          </div>

          <Dropdown menu={dropdownItems} placement="bottomRight" trigger={['click']}>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '4px 8px', borderRadius: 8, transition: 'background 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f5')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <Avatar
                style={{ backgroundColor: ROLE_AVATAR_COLORS[user.role] || '#1677ff' }}
                icon={<UserOutlined />}
              />
              <div style={{ lineHeight: 1.3 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{user.username}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Tag color={ROLE_COLORS[user.role] || 'default'} style={{ fontSize: 10 }}>
                    {user.role}
                  </Tag>
                  {user.role === 'HOD' && reduxUser?.department && (
                    <Text type="secondary" style={{ fontSize: 10 }}>
                      • {reduxUser.department.name}
                    </Text>
                  )}
                </div>

              </div>
            </div>
          </Dropdown>
        </Header>

        <Content style={{ margin: '24px 24px 0', background: 'transparent' }}>
          <div style={{ minHeight: 360, paddingBottom: 24 }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
