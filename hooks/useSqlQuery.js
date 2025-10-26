import { useState } from 'react';

export function useSqlQuery() {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    const executeQuery = async (query, params = []) => {
        setLoading(true);
        setError(null);
        setData(null);

        try {
            const response = await fetch('/api/sql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query, params }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to execute query');
            }

            setData(result);
            return result;
        } catch (err) {
            const errorObj = {
                message: err.message,
                ...(err.response && await err.response.json())
            };
            setError(errorObj);
            throw errorObj;
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setLoading(false);
        setData(null);
        setError(null);
    };

    return {
        executeQuery,
        loading,
        data,
        error,
        reset
    };
}