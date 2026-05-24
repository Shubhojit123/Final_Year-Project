import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { AuthProvider } from './context/AuthContext';
import { router } from './routes';
import { ConfigProvider } from 'antd';

const queryClient = new QueryClient();

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: "'Outfit', system-ui, sans-serif",
          colorPrimary: '#4f46e5',
          borderRadius: 12,
          colorBgContainer: '#ffffff',
          colorTextBase: '#374151',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        },
        components: {
          Card: {
            paddingLG: 24,
          },
          Button: {
            controlHeight: 40,
            borderRadius: 8,
          },
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>
    </ConfigProvider>
  );
}

export default App;
