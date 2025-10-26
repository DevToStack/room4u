import SqlQueryRunner from '@/components/SqlQueryRunner';

export default function SqlRunnerPage() {
    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <SqlQueryRunner />
        </div>
    );
}

export const metadata = {
    title: 'SQL Query Runner',
    description: 'Run SQL queries against your database',
};