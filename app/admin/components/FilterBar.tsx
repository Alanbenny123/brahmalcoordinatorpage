"use client";

import { motion } from "framer-motion";

interface FilterOption {
    key: string;
    label: string;
    options: { value: string; label: string }[];
}

interface FilterBarProps {
    search: string;
    setSearch: (val: string) => void;
    sort?: string;
    setSort?: (val: string) => void;
    sortOptions?: string[];
    filters?: FilterOption[];
    activeFilters?: { [key: string]: string };
    setFilter?: (key: string, value: string) => void;
    placeholder?: string;
}

export default function FilterBar({
    search,
    setSearch,
    sort,
    setSort,
    sortOptions = [],
    filters = [],
    activeFilters = {},
    setFilter,
    placeholder = "Search...",
}: FilterBarProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row gap-4 mb-8 bg-gray-800/50 backdrop-blur-md p-4 rounded-xl border border-gray-700/50"
        >
            {/* Search Input */}
            <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                <input
                    type="text"
                    placeholder={placeholder}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-900/80 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                />
            </div>

            {/* Dynamic Filters */}
            {filters.map((filter) => (
                <div key={filter.key} className="relative min-w-[150px]">
                    <select
                        value={activeFilters[filter.key] || ""}
                        onChange={(e) => setFilter && setFilter(filter.key, e.target.value)}
                        className="w-full appearance-none px-4 py-2.5 rounded-lg bg-gray-900/80 border border-gray-700 text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 cursor-pointer hover:bg-gray-900 transition-colors"
                    >
                        <option value="">{filter.label}: All</option>
                        {filter.options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                        ▼
                    </div>
                </div>
            ))}

            {/* Sort Dropdown */}
            {sort && setSort && sortOptions.length > 0 && (
                <div className="relative min-w-[180px]">
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="w-full appearance-none px-4 py-2.5 rounded-lg bg-gray-900/80 border border-gray-700 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer hover:bg-gray-900 transition-colors"
                    >
                        {sortOptions.map((opt) => (
                            <option key={opt} value={opt}>
                                Sort: {opt.charAt(0).toUpperCase() + opt.slice(1)}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                        ⇅
                    </div>
                </div>
            )}
        </motion.div>
    );
}
