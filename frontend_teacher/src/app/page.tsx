'use client';

import React, { useEffect } from 'react';

export default function Home() {
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const hasUser = localStorage.getItem('vlab_user');
            const hasToken = localStorage.getItem('vlab_access_token') || document.cookie.includes('vlab_access_token');
            if (hasUser && hasToken) {
                window.location.href = '/dashboard';
            } else {
                window.location.href = '/login';
            }
        }
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
            <div className="w-12 h-12 border-4 border-t-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );
}
