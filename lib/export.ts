// CSV export utility for ChatGPT App Analytics
import { createServerClient } from './db';

export async function generateCSVExport(
  appId: string,
  startDate: Date,
  endDate: Date
): Promise<string> {
  const supabase = createServerClient();

  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .eq('app_id', appId)
    .gte('timestamp', startDate.toISOString())
    .lte('timestamp', endDate.toISOString())
    .order('timestamp', { ascending: true });

  if (error || !events) {
    throw new Error('Failed to fetch events for export');
  }

  const headers = [
    'Timestamp',
    'Event Type',
    'Event Name',
    'Latency (ms)',
    'Error Message',
    'Properties'
  ];

  const rows = events.map(event => [
    event.timestamp,
    event.event_type,
    event.event_name || '',
    event.latency_ms?.toString() || '',
    event.error_message || '',
    JSON.stringify(event.properties)
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  return csvContent;
}
