import EmptyState from './EmptyState';

export default function DataTable({ data, columns, emptyMessage }) {
    const rows = Array.isArray(data) ? data : [];

    if (!rows.length) {
        return <EmptyState message={emptyMessage} />;
    }

    return (
        <div className="relative rounded-xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-sm shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-[700px] w-full text-sm text-gray-300 border-collapse">
                    {/* Table Head */}
                    <thead>
                        <tr className="border-b border-neutral-800 bg-neutral-900/80">
                            {columns.map((column, idx) => (
                                <th
                                    key={column.key}
                                    className={`px-4 py-3 text-left font-medium text-gray-400 tracking-wide
                    ${column.center ? 'text-center' : ''}
                    ${idx === 0 ? 'sticky left-0 bg-neutral-900/80 backdrop-blur-sm z-10' : ''}
                  `}
                                >
                                    {column.label}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    {/* Table Body */}
                    <tbody>
                        {rows.map((item, rowIdx) => (
                            <tr
                                key={item.id || rowIdx}
                                className="border-b border-neutral-800 hover:bg-neutral-800/50 transition-colors"
                            >
                                {columns.map((column, colIdx) => (
                                    <td
                                        key={column.key}
                                        className={`px-4 py-3 whitespace-nowrap 
                      ${column.center ? 'text-center' : 'text-left'} 
                      ${colIdx === 0 ? 'sticky left-0 bg-neutral-900/80 backdrop-blur-sm z-10' : ''}
                    `}
                                    >
                                        {column.render ? column.render(item) : item[column.key]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
