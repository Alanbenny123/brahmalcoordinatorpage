'use client';

import { useState, useEffect } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { EventDocument , FetchResponse } from '@/lib/types';
import Image from 'next/image';


async function fetchEvents({ page, search, category }: { page: number; search: string; category: string }): Promise<FetchResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: '10',
    ...(search && { search }),
    ...(category && { category }),
  });

  const res = await fetch(`/api/events?${params}`);
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to fetch data from server');
  }
  return res.json();
}


export default function EventsPage() {
  const [page, setPage] = useState(1);
  const [categoryFilter, setcategoryFilter] = useState('');
  
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchInput]);

  const { data, isLoading, isError, error, isPlaceholderData, isFetching } = useQuery({
    queryKey: ['events', page, debouncedSearch, categoryFilter],
    queryFn: () => fetchEvents({ page, search: debouncedSearch, category: categoryFilter }),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-10">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">Events</h1>
              <p className="text-gray-400 text-lg">Discover and manage upcoming events</p>
            </div>
            {isFetching && !isLoading && (
              <div className="animate-spin h-6 w-6 border-3 border-blue-500 border-t-transparent rounded-full" />
            )}
          </div>
        </header>

        {/* Filters Section */}
        <div className="flex flex-col md:flex-row gap-3 mb-8">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="🔍 Search events..."
              value={searchInput}
              className="w-full bg-gray-800/50 border border-gray-700 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-white placeholder-gray-500"
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          
          <select 
            className="bg-gray-800/50 border border-gray-700 px-4 py-3 rounded-lg md:min-w-[200px] outline-none cursor-pointer text-white focus:ring-2 focus:ring-blue-500 transition"
            value={categoryFilter}
            onChange={(e) => { setcategoryFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Categories</option>
            <option value="general">📌 General</option>
            <option value="technical">💻 Technical</option>
            <option value="cultural">🎭 Cultural</option>
          </select>
        </div>

        {/* Content Area */}
        {isError ? (
          <div className="p-6 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl backdrop-blur-sm">
            <p className="font-semibold">⚠️ Error loading events</p>
            <p className="text-sm mt-1">{(error as Error).message}</p>
          </div>
        ) : isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-28 bg-gray-800/30 animate-pulse rounded-lg border border-gray-700/50" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {data?.data && data.data.length === 0 ? (
              <div className="text-center py-24 text-gray-500 border border-dashed border-gray-700 rounded-xl bg-gray-800/20 backdrop-blur-sm">
                <p className="text-lg">🎪 No events found</p>
                <p className="text-sm mt-2">Try adjusting your filters</p>
              </div>
            ) : (
              data?.data.map((event: EventDocument) => (
                <div 
                  key={event.$id} 
                  className={`p-5 rounded-xl border border-gray-700/50 bg-gray-800/30 hover:bg-gray-800/50 hover:border-blue-500/30 transition-all backdrop-blur-sm ${
                      isPlaceholderData ? 'opacity-50 grayscale' : 'opacity-100'
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <Image
                        src={event.brahma_poster || 'https://placehold.co/400x600.png'}
                        alt={event.event_name}
                        width={80}
                        height={80}
                        className="w-20 h-20 object-cover rounded-lg mb-2 mr-4 float-left"
                      />
                      <h3 className="font-semibold text-xl text-blue-400 truncate">{event.event_name}</h3>
                      <div className="flex flex-col sm:flex-row sm:gap-4 text-sm text-gray-400 mt-2">
                        <p>📍 {event.venue}</p>
                        <p>📅 {event.date ? new Date(event.date).toLocaleDateString() : 'TBA'}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="block text-lg font-semibold text-green-400">
                          {event.amount ? `₹${event.amount}` : 'Free'}
                      </span>
                      <span className="inline-block mt-3 text-xs font-bold uppercase tracking-widest bg-blue-500/20 px-3 py-1 rounded-full text-blue-300 border border-blue-500/30">
                        {event.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Pagination */}
        <footer className="mt-12 flex items-center justify-between border-t border-gray-700/50 pt-8">
          <button
            disabled={page === 1 || isFetching}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-6 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-700/50 hover:border-blue-500/50 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium"
          >
            ← Previous
          </button>
          
          <div className="text-center">
              <p className="text-sm text-gray-300">
              Page <span className="font-bold text-blue-400">{page}</span> of <span className="font-bold text-blue-400">{data?.totalPages || 1}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">{data?.total || 0} total events</p>
          </div>

          <button
            disabled={page >= (data?.totalPages || 1) || isFetching}
            onClick={() => setPage((p) => p + 1)}
            className="px-6 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-700/50 hover:border-blue-500/50 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium"
          >
            Next →
          </button>
        </footer>
      </div>
    </div>
  );
}