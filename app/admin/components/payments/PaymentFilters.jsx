import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSync, faFileExport } from '@fortawesome/free-solid-svg-icons';

const PaymentFilters = ({ filters, setFilters, loading, exportLoading, onRefresh, onExport }) => {
    return (
        <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-4 mb-8 flex flex-wrap items-center gap-3">
            <div className="flex items-center border border-neutral-700 rounded-lg px-2 py-1 w-64 bg-neutral-900">
                <FontAwesomeIcon icon={faSearch} className="text-neutral-400 mr-2" />
                <input
                    type="text"
                    placeholder="Search by user, apartment, or payment ID..."
                    className="flex-1 outline-none text-sm bg-transparent text-neutral-100 placeholder-neutral-500"
                    value={filters.search}
                    onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                />
            </div>

            <select
                value={filters.status}
                onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                className="border border-neutral-700 rounded-lg px-3 py-1 text-sm bg-neutral-900 text-neutral-100"
            >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
            </select>

            <div className="flex gap-2">
                <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
                    className="border border-neutral-700 rounded-lg px-3 py-1 text-sm bg-neutral-900 text-neutral-100"
                    placeholder="Start Date"
                />
                <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
                    className="border border-neutral-700 rounded-lg px-3 py-1 text-sm bg-neutral-900 text-neutral-100"
                    placeholder="End Date"
                />
            </div>

            <button
                onClick={onRefresh}
                className="bg-neutral-700 hover:bg-neutral-600 text-neutral-100 px-3 py-1 rounded-lg flex items-center gap-2 text-sm"
                disabled={loading}
            >
                <FontAwesomeIcon icon={faSync} className={loading ? 'animate-spin' : ''} />
                {loading ? 'Loading...' : 'Refresh'}
            </button>

            <button
                onClick={onExport}
                disabled={exportLoading}
                className="bg-white hover:bg-neutral-200 text-black px-3 py-1 rounded-lg flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <FontAwesomeIcon icon={faFileExport} className={exportLoading ? 'animate-spin' : ''} />
                {exportLoading ? 'Exporting...' : 'Export'}
            </button>
        </div>
    );
};

export default PaymentFilters;