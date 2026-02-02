import type { Metadata } from 'next';
import LoginForm from '@/components/auth/LoginForm';

export const metadata: Metadata = {
    title: 'Login - Sales & Inventory Manager',
    description: 'Secure login to access the dashboard',
};

export default function LoginPage() {
    return <LoginForm />;
}
