import './globals.css';
import { ToastProvider } from '@/src/context/ToastContext';
import { AuthProvider } from '@/src/context/AuthContext';
import { ConfigProvider } from '@/src/context/ConfigContext';
import { TransactionProvider } from '@/src/context/TransactionContext';

import MainLayout from './MainLayout';

export const metadata = {
  title: 'Webzio Accounting | Expenses Tracker',
  description: 'Agency management and revenue tracking for Webzio International.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased scroll-smooth">
        <ToastProvider>
          <AuthProvider>
            <ConfigProvider>
              <TransactionProvider>
                  <MainLayout>
                    {children}
                  </MainLayout>
              </TransactionProvider>
            </ConfigProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
