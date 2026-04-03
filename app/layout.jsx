import './globals.css';
import { ToastProvider } from '@/src/context/ToastContext';
import { AuthProvider } from '@/src/context/AuthContext';
import { AppProvider } from '@/src/context/ExpenseContext';
import MainLayout from './MainLayout';

export const metadata = {
  title: 'Webzio Agency | Financial Tracker',
  description: 'Agency management and revenue tracking for Webzio International.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased scroll-smooth">
        <ToastProvider>
          <AuthProvider>
            <AppProvider>
              <MainLayout>
                {children}
              </MainLayout>
            </AppProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
