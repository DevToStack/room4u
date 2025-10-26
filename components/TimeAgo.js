import { useState, useEffect } from 'react';

function timeAgo(dateString) {
    const date = new Date(dateString);
    if (isNaN(date)) return 'Invalid date';

    const now = new Date();
    const diff = (now - date) / 1000; // seconds diff
    console.log(now)
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

    const units = [
        { name: 'year', seconds: 31536000 },
        { name: 'month', seconds: 2592000 },
        { name: 'week', seconds: 604800 },
        { name: 'day', seconds: 86400 },
        { name: 'hour', seconds: 3600 },
        { name: 'minute', seconds: 60 },
        { name: 'second', seconds: 1 },
    ];

    for (let unit of units) {
        const value = diff / unit.seconds;
        if (Math.abs(value) >= 1) {
            return rtf.format(-Math.round(value), unit.name);
        }
    }
    return 'just now';
}

export default function TimeAgo({ datetime }) {
    const [timeString, setTimeString] = useState(() => timeAgo(datetime));

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeString(timeAgo(datetime));
        }, 60000); // update every 60 seconds

        // Also update immediately if datetime changes
        setTimeString(timeAgo(datetime));

        return () => clearInterval(interval);
    }, [datetime]);

    return <span>{timeString}</span>;
}
