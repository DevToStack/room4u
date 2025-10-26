'use client';

import { useEffect, useState } from 'react';
import Loader from './loader';

export default function PageWrapper({ children }) {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading time or wait for real fetch
        const timeout = setTimeout(() => {
            setLoading(false);
        }, 3000); // Adjust time

        return () => clearTimeout(timeout);
    }, []);

    return (
        <>
            {loading && <Loader />}
            <div className={`${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-100`}>
                {children}
            </div>
        </>
    );
}
