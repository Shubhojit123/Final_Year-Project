import { 
  createRootRoute, 
  createRoute, 
  createRouter, 
  Outlet, 
  redirect 
} from '@tanstack/react-router';
import Login from './pages/Login';
import AppLayout from './components/AppLayout';
import SuperAdminDashboard from './pages/dashboards/SuperAdminDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import HodDashboard from './pages/dashboards/HodDashboard';
import TeacherDashboard from './pages/dashboards/TeacherDashboard';
import StudentDashboard from './pages/dashboards/StudentDashboard';
import HodSubjects from './pages/dashboards/HodSubjects';
import HodBatchAssignments from './pages/dashboards/HodBatchAssignments';

// Root Route
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// Login Route
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login,
});

// Protected Layout Route
const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'layout',
  component: AppLayout,
  beforeLoad: ({ location }) => {
    const token = localStorage.getItem('token');
    if (!token && location.pathname !== '/login') {
      throw redirect({
        to: '/login',
      });
    }
  },
});

// Index Route (Redirects to dashboard based on role)
const indexRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/',
  beforeLoad: () => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);
      const rolePathMap: Record<string, string> = {
        SUPERADMIN: '/dashboard/super-admin',
        ADMIN: '/dashboard/admin',
        HOD: '/dashboard/hod',
        TEACHER: '/dashboard/teacher',
        STUDENT: '/dashboard/student',
      };
      throw redirect({
        to: rolePathMap[user.role] || '/login',
      });
    }
  },
});

// Dashboard Routes
const superAdminRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/dashboard/super-admin',
  component: SuperAdminDashboard,
});

const adminRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/dashboard/admin',
  component: AdminDashboard,
});

const hodRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/dashboard/hod',
  component: HodDashboard,
});

const hodSubjectsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/hod/subjects',
  component: HodSubjects,
});

const hodBatchAssignmentsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/hod/batch-assignments',
  component: HodBatchAssignments,
});

const teacherRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/dashboard/teacher',
  component: TeacherDashboard,
});

const studentRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/dashboard/student',
  component: StudentDashboard,
});

// Route Tree
const routeTree = rootRoute.addChildren([
  loginRoute,
  layoutRoute.addChildren([
    indexRoute,
    superAdminRoute,
    adminRoute,
    hodRoute,
    hodSubjectsRoute,
    hodBatchAssignmentsRoute,
    teacherRoute,
    studentRoute,
  ]),
]);

// Create Router
export const router = createRouter({ routeTree });

// Register Router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
