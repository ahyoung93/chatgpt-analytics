'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Download, Filter, Search, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

interface Event {
  id: string;
  timestamp: string;
  event_type: 'invoked' | 'completed' | 'error' | 'converted' | 'custom';
  app_name: string;
  latency_ms?: number;
  error_message?: string;
  properties?: Record<string, any>;
}

export default function EventsPage() {
  const { orgId } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPlan, setCurrentPlan] = useState<'free' | 'pro'>('free');

  useEffect(() => {
    const fetchPlan = async () => {
      if (orgId) {
        try {
          const response = await fetch(`/api/orgs/${orgId}`);
          if (response.ok) {
            const data = await response.json();
            setCurrentPlan(data.org?.plan || 'free');
          }
        } catch (error) {
          console.error('Error fetching plan:', error);
        }
      }
    };

    fetchPlan();
  }, [orgId]);

  const eventTypes = ['all', 'invoked', 'completed', 'error', 'converted', 'custom'];

  const filteredEvents = events.filter(event => {
    const matchesType = filterType === 'all' || event.event_type === filterType;
    const matchesSearch = !searchTerm ||
      event.app_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.event_type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getEventTypeBadge = (type: string) => {
    const styles = {
      invoked: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      error: 'bg-red-100 text-red-700',
      converted: 'bg-purple-100 text-purple-700',
      custom: 'bg-gray-100 text-gray-700'
    };
    return styles[type as keyof typeof styles] || styles.custom;
  };

  const handleExportCSV = () => {
    if (currentPlan === 'free') {
      // Show upgrade modal
      alert('CSV export is available on Pro plan. Please upgrade to access this feature.');
      return;
    }

    // Export filtered events to CSV
    if (filteredEvents.length === 0) {
      alert('No events to export');
      return;
    }

    // Create CSV header
    const headers = ['Timestamp', 'Event Type', 'App', 'Source', 'Country', 'Latency (ms)', 'Error Message', 'Properties'];

    // Create CSV rows
    const rows = filteredEvents.map(event => [
      new Date(event.timestamp).toISOString(),
      event.event_type,
      event.app_name,
      event.properties?.source || '',
      event.properties?.country || '',
      event.latency_ms || '',
      event.error_message || '',
      JSON.stringify(event.properties || {})
    ]);

    // Combine header and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => {
        // Escape cells that contain commas, quotes, or newlines
        const cellStr = String(cell);
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `odin-events-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout>
      <div>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Events</h1>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
            </div>

            {/* Event Type Filter */}
            <div className="sm:w-48">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
                {eventTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Events Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    App
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Country
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Metadata
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <p className="mb-2">No events yet</p>
                      <p className="text-sm">Data will appear here once you connect your app</p>
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(event.timestamp), 'MMM d, h:mm a')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getEventTypeBadge(event.event_type)}`}>
                          {event.event_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {event.app_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {event.properties?.source || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {event.properties?.country || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {event.latency_ms && <span className="mr-2">{event.latency_ms}ms</span>}
                        {event.error_message && <span className="text-red-600">{event.error_message}</span>}
                        {event.properties?.conversion && <span>Conv: {event.properties.conversion}</span>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination placeholder */}
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {filteredEvents.length} of {events.length} events
          </p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50" disabled>
              Previous
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50" disabled>
              Next
            </button>
          </div>
        </div>

        {/* Export Upgrade Modal (if free plan) */}
        {currentPlan === 'free' && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Unlock CSV Export</h3>
                <p className="text-gray-700 mb-4">
                  Export your events data to CSV format with a Pro plan. Analyze your data in Excel, Google Sheets, or your favorite tools.
                </p>
                <a
                  href="/pricing"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                >
                  Upgrade Now
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
