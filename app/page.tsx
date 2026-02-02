import Link from 'next/link';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg text-white">
            <ShieldCheck size={40} />
          </div>
        </div>

        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">SIMS Enterprise</h1>
          <p className="mt-4 text-lg text-gray-500">
            Secure Sales & Inventory Management System for modern enterprises.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Link href="/login" className="w-full">
            <Button size="lg" fullWidth rightIcon={ArrowRight}>
              Sign In to Dashboard
            </Button>
          </Link>
          <p className="text-xs text-gray-400">
            Authorized personnel only. All activities are monitored.
          </p>
        </div>
      </div>
    </div>
  );
}
