'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';

interface ExportButtonProps {
  format: 'csv' | 'json' | 'pdf';
  startDate?: Date;
  endDate?: Date;
  apiKey: string;
}

export function ExportButton({ format, startDate, endDate, apiKey }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);

    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({
          format,
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Export failed');
      }

      const data = await response.json();

      // Poll for export completion
      const exportId = data.exportId;
      const checkStatus = async () => {
        const statusResponse = await fetch(`/api/export?exportId=${exportId}`, {
          headers: {
            'x-api-key': apiKey
          }
        });

        const statusData = await statusResponse.json();

        if (statusData.export.status === 'completed') {
          // Download the file
          window.open(statusData.export.file_url, '_blank');
          setIsExporting(false);
        } else if (statusData.export.status === 'failed') {
          throw new Error('Export failed');
        } else {
          // Check again in 2 seconds
          setTimeout(checkStatus, 2000);
        }
      };

      await checkStatus();
    } catch (err: any) {
      setError(err.message);
      setIsExporting(false);
    }
  };

  return (
    <div className="inline-block">
      <button
        onClick={handleExport}
        disabled={isExporting}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isExporting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            Export as {format.toUpperCase()}
          </>
        )}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
