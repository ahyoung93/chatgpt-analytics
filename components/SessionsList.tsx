'use client';

import { MessageSquare, Clock, DollarSign } from 'lucide-react';

interface Session {
  id: string;
  session_id: string;
  title: string | null;
  model: string | null;
  total_tokens: number;
  total_cost: number;
  message_count: number;
  started_at: string;
  ended_at: string | null;
}

interface SessionsListProps {
  sessions: Session[];
}

export function SessionsList({ sessions }: SessionsListProps) {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p>No sessions yet. Start tracking your ChatGPT conversations!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => (
        <div
          key={session.id}
          className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {session.title || 'Untitled Session'}
              </h3>
              <p className="text-sm text-gray-500">
                Session ID: {session.session_id}
              </p>
            </div>

            {session.model && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                {session.model}
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Messages</p>
                <p className="text-lg font-semibold text-gray-900">
                  {session.message_count}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Tokens</p>
                <p className="text-lg font-semibold text-gray-900">
                  {session.total_tokens.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Cost</p>
                <p className="text-lg font-semibold text-gray-900">
                  ${parseFloat(session.total_cost.toString()).toFixed(4)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Started {new Date(session.started_at).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
