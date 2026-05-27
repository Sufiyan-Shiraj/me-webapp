import Link from 'next/link';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function Home() {
  return (
    <div className="dark min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center shadow-lg text-accent">
            <ShieldCheck size={40} />
          </div>
        </div>

        <div>
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight text-center">ME Flow</h1>
          <p className="mt-4 text-lg text-foreground opacity-70 text-center">
            Secure Sales & Inventory Management Flow for modern businesses.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Link href="/login" className="w-full">
            <Button size="lg" fullWidth rightIcon={ArrowRight} className="h-12 font-bold">
              Sign In to Dashboard
            </Button>
          </Link>
          <p className="text-xs text-foreground opacity-50">
            Authorized personnel only. All activities are monitored.
          </p>
        </div>
      </div>
    </div>
  );
}
