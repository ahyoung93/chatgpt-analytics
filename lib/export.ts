// Data export utilities
import { createServerClient } from './db';
import { getUserMetrics, getRecentSessions } from './metrics';

// Generate CSV export
export async function generateCSVExport(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<string> {
  const supabase = createServerClient();

  // Get all messages within date range
  const { data: messages, error } = await supabase
    .from('chat_messages')
    .select(`
      *,
      chat_sessions (
        session_id,
        title,
        started_at
      )
    `)
    .eq('user_id', userId)
    .gte('timestamp', startDate.toISOString())
    .lte('timestamp', endDate.toISOString())
    .order('timestamp', { ascending: true });

  if (error) {
    throw new Error('Failed to fetch data for export');
  }

  // Generate CSV
  const headers = [
    'Session ID',
    'Session Title',
    'Timestamp',
    'Role',
    'Model',
    'Prompt Tokens',
    'Completion Tokens',
    'Total Tokens',
    'Cost',
    'Latency (ms)',
    'Content Preview'
  ];

  const rows = messages.map(msg => [
    (msg.chat_sessions as any)?.session_id || '',
    (msg.chat_sessions as any)?.title || 'Untitled',
    msg.timestamp,
    msg.role,
    msg.model || '',
    msg.prompt_tokens,
    msg.completion_tokens,
    msg.total_tokens,
    msg.cost,
    msg.latency_ms || '',
    msg.content.substring(0, 100).replace(/"/g, '""') // Escape quotes and truncate
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csvContent;
}

// Generate JSON export
export async function generateJSONExport(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<any> {
  const metrics = await getUserMetrics(userId, startDate, endDate);
  const sessions = await getRecentSessions(userId, 100);

  return {
    exportDate: new Date().toISOString(),
    dateRange: {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    },
    summary: {
      totalSessions: metrics.totalSessions,
      totalMessages: metrics.totalMessages,
      totalTokens: metrics.totalTokens,
      totalCost: metrics.totalCost,
      avgLatency: metrics.avgLatency
    },
    modelBreakdown: metrics.modelBreakdown,
    timeSeriesData: metrics.timeSeriesData,
    sessions: sessions
  };
}

// Create export record and generate file
export async function createExport(
  userId: string,
  format: 'csv' | 'json' | 'pdf',
  startDate: Date,
  endDate: Date
): Promise<string> {
  const supabase = createServerClient();

  // Create export record
  const { data: exportRecord, error: createError } = await supabase
    .from('exports')
    .insert({
      user_id: userId,
      format,
      status: 'processing'
    })
    .select()
    .single();

  if (createError || !exportRecord) {
    throw new Error('Failed to create export record');
  }

  try {
    let fileContent: string;
    let fileName: string;
    let mimeType: string;

    if (format === 'csv') {
      fileContent = await generateCSVExport(userId, startDate, endDate);
      fileName = `chatgpt-analytics-${Date.now()}.csv`;
      mimeType = 'text/csv';
    } else if (format === 'json') {
      const jsonData = await generateJSONExport(userId, startDate, endDate);
      fileContent = JSON.stringify(jsonData, null, 2);
      fileName = `chatgpt-analytics-${Date.now()}.json`;
      mimeType = 'application/json';
    } else {
      throw new Error('PDF export not yet implemented');
    }

    // In a production environment, you would upload this to S3 or similar
    // For now, we'll use Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('exports')
      .upload(`${userId}/${fileName}`, fileContent, {
        contentType: mimeType,
        upsert: false
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('exports')
      .getPublicUrl(`${userId}/${fileName}`);

    // Update export record
    await supabase
      .from('exports')
      .update({
        status: 'completed',
        file_url: publicUrl,
        file_size: Buffer.byteLength(fileContent)
      })
      .eq('id', exportRecord.id);

    return exportRecord.id;
  } catch (error) {
    // Update export record as failed
    await supabase
      .from('exports')
      .update({ status: 'failed' })
      .eq('id', exportRecord.id);

    throw error;
  }
}

// Get export status
export async function getExportStatus(userId: string, exportId: string) {
  const supabase = createServerClient();

  const { data: exportRecord, error } = await supabase
    .from('exports')
    .select('*')
    .eq('id', exportId)
    .eq('user_id', userId)
    .single();

  if (error) {
    throw new Error('Export not found');
  }

  return exportRecord;
}
