import React from 'react';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="dark flex items-center justify-center min-h-screen bg-background p-4 text-foreground">
            <div className="w-full max-w-md">
                {children}
            </div>
        </div>
    );
}
