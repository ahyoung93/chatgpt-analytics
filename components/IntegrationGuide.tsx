'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Copy, Check } from 'lucide-react';

export default function IntegrationGuide() {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [copiedInstructions, setCopiedInstructions] = useState(false);

  const toggleStep = (step: number) => {
    setExpandedStep(expandedStep === step ? null : step);
  };

  const copySchema = () => {
    const schema = `{
  "openapi": "3.1.0",
  "info": {
    "title": "Odin Analytics API",
    "description": "Track events for ChatGPT analytics",
    "version": "1.0.0"
  },
  "servers": [
    {
      "url": "https://chatgpt-analytics-plum.vercel.app"
    }
  ],
  "paths": {
    "/api/track-gpt": {
      "post": {
        "summary": "Track an analytics event from GPT",
        "operationId": "trackEvent",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["event"],
                "properties": {
                  "event": {
                    "type": "string",
                    "enum": ["invoked", "completed", "error", "converted"]
                  },
                  "prompt": {
                    "type": "string"
                  },
                  "user_id": {
                    "type": "string"
                  },
                  "latency_ms": {
                    "type": "number"
                  },
                  "error_message": {
                    "type": "string"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    }
  },
  "components": {
    "securitySchemes": {
      "ApiKeyAuth": {
        "type": "apiKey",
        "in": "header",
        "name": "x-app-key"
      }
    }
  },
  "security": [
    {
      "ApiKeyAuth": []
    }
  ]
}`;
    navigator.clipboard.writeText(schema);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  const copyInstructions = () => {
    const instructions = `IMPORTANT: Track analytics for every conversation.

When a user sends their first message, immediately call trackEvent with:
- event: "invoked"
- prompt: [the user's message]
- user_id: [the conversation ID]

When you complete helping the user, call trackEvent with:
- event: "completed"
- latency_ms: [approximate response time]

If any error occurs, call trackEvent with:
- event: "error"
- error_message: [brief description]

The API automatically hashes sensitive data for privacy.`;
    navigator.clipboard.writeText(instructions);
    setCopiedInstructions(true);
    setTimeout(() => setCopiedInstructions(false), 2000);
  };

  const steps = [
    {
      title: "Step 1: Copy your API key",
      content: (
        <div className="space-y-3">
          <p className="text-sm text-gray-700">
            Look at your app card above. You&apos;ll see a section labeled <strong>&quot;API Write Key&quot;</strong>.
          </p>
          <ol className="list-decimal ml-5 space-y-2 text-sm text-gray-700">
            <li>Click the <strong>eye icon (👁)</strong> to reveal the full key</li>
            <li>Click the <strong>copy icon</strong> next to it to copy the key</li>
            <li>Keep this somewhere safe - you&apos;ll need it in Step 3</li>
          </ol>
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <p className="text-xs text-blue-800">
              💡 <strong>Tip:</strong> Your API key starts with <code className="bg-blue-100 px-1 rounded">odin_</code>
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Step 2: Open your Custom GPT editor",
      content: (
        <div className="space-y-3">
          <p className="text-sm text-gray-700 font-semibold mb-2">Follow these exact steps:</p>
          <ol className="list-decimal ml-5 space-y-3 text-sm text-gray-700">
            <li>
              Go to <strong>ChatGPT</strong> (chat.openai.com)
            </li>
            <li>
              On the <strong>left sidebar</strong>, find your Custom GPT and click on it
            </li>
            <li>
              Look for the <strong>&quot;Edit&quot;</strong> button (usually in the top right) and click it
            </li>
            <li>
              You should now see the GPT editor with tabs like &quot;Create&quot; and &quot;Configure&quot;
            </li>
          </ol>
          <div className="bg-gray-50 border border-gray-200 rounded p-3 mt-3">
            <p className="text-xs text-gray-600">
              ℹ️ If you don&apos;t see an &quot;Edit&quot; button, you might not be the owner of this GPT.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Step 3: Set up authentication FIRST",
      content: (
        <div className="space-y-3">
          <p className="text-sm text-gray-700 font-semibold">In the GPT editor:</p>
          <ol className="list-decimal ml-5 space-y-3 text-sm text-gray-700">
            <li>
              Click the <strong>&quot;Configure&quot;</strong> tab at the top
            </li>
            <li>
              Scroll down to find the <strong>&quot;Actions&quot;</strong> section
            </li>
            <li>
              Click <strong>&quot;Create new action&quot;</strong>
            </li>
            <li>
              <strong>BEFORE pasting the schema</strong>, scroll down to find <strong>&quot;Authentication&quot;</strong>
            </li>
            <li>
              Click the dropdown that says &quot;None&quot; and select <strong>&quot;API Key&quot;</strong>
            </li>
            <li>
              A new dropdown appears - select <strong>&quot;Custom&quot;</strong>
            </li>
            <li>
              You&apos;ll see two fields:
              <ul className="list-disc ml-5 mt-2 space-y-1">
                <li><strong>API Key:</strong> Paste your API key from Step 1</li>
                <li><strong>Custom Header Name:</strong> Type exactly <code className="bg-gray-100 px-1 rounded">x-app-key</code></li>
              </ul>
            </li>
          </ol>
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-3">
            <p className="text-xs text-yellow-800">
              ⚠️ <strong>Important:</strong> Do this BEFORE adding the schema in Step 4!
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Step 4: Add the API schema",
      content: (
        <div className="space-y-3">
          <p className="text-sm text-gray-700 font-semibold">Now paste the schema:</p>
          <ol className="list-decimal ml-5 space-y-2 text-sm text-gray-700">
            <li>
              Scroll back up to the <strong>&quot;Schema&quot;</strong> text box (big empty box)
            </li>
            <li>
              Click the button below to copy the schema:
            </li>
          </ol>
          <button
            onClick={copySchema}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            {copiedSchema ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Schema to Clipboard
              </>
            )}
          </button>
          <ol start={3} className="list-decimal ml-5 space-y-2 text-sm text-gray-700">
            <li>
              Paste it into the <strong>Schema</strong> text box
            </li>
            <li>
              When asked for <strong>Privacy Policy URL</strong>, paste:<br />
              <code className="bg-gray-100 px-2 py-1 rounded text-xs block mt-1">
                https://chatgpt-analytics-plum.vercel.app/privacy
              </code>
            </li>
          </ol>
        </div>
      )
    },
    {
      title: "Step 5: Test the action",
      content: (
        <div className="space-y-3">
          <p className="text-sm text-gray-700 font-semibold">Before continuing, test that it works:</p>
          <ol className="list-decimal ml-5 space-y-2 text-sm text-gray-700">
            <li>
              Look for a <strong>&quot;Test&quot;</strong> button in the Actions section
            </li>
            <li>
              Click it - you should see a test panel appear
            </li>
            <li>
              If you see a success message (200 OK), you&apos;re good! ✅
            </li>
            <li>
              If you see an error, double-check your API key in Step 3
            </li>
          </ol>
        </div>
      )
    },
    {
      title: "Step 6: Add tracking instructions",
      content: (
        <div className="space-y-3">
          <p className="text-sm text-gray-700 font-semibold">Final step - tell your GPT when to track:</p>
          <ol className="list-decimal ml-5 space-y-2 text-sm text-gray-700">
            <li>
              Stay in the <strong>&quot;Configure&quot;</strong> tab
            </li>
            <li>
              Scroll up to the <strong>&quot;Instructions&quot;</strong> text box
            </li>
            <li>
              Click the button below to copy tracking instructions:
            </li>
          </ol>
          <button
            onClick={copyInstructions}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            {copiedInstructions ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Instructions to Clipboard
              </>
            )}
          </button>
          <ol start={4} className="list-decimal ml-5 space-y-2 text-sm text-gray-700">
            <li>
              Paste them at the <strong>end</strong> of your existing instructions
            </li>
            <li>
              Click <strong>&quot;Update&quot;</strong> at the top right to save
            </li>
          </ol>
        </div>
      )
    },
    {
      title: "Step 7: Test your integration",
      content: (
        <div className="space-y-3">
          <p className="text-sm text-gray-700 font-semibold">Make sure everything works:</p>
          <ol className="list-decimal ml-5 space-y-2 text-sm text-gray-700">
            <li>
              Close the GPT editor
            </li>
            <li>
              Start a <strong>new conversation</strong> with your GPT
            </li>
            <li>
              Send any message (e.g., &quot;Hello&quot;)
            </li>
            <li>
              Wait 10-20 seconds
            </li>
            <li>
              Come back to this Odin dashboard and click the <strong>&quot;Events&quot;</strong> tab
            </li>
            <li>
              You should see an event appear! 🎉
            </li>
          </ol>
          <div className="bg-green-50 border border-green-200 rounded p-3 mt-3">
            <p className="text-sm text-green-800">
              ✅ <strong>Success!</strong> Your GPT is now tracking analytics. You&apos;ll see events, prompts, and retention data as users interact with it.
            </p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">📍 Integration Guide</h2>
      <p className="text-gray-700 mb-2">
        Follow these simple steps to connect your Custom GPT. Takes about 2 minutes!
      </p>
      <p className="text-sm text-gray-600 mb-6">
        💡 Click each step to expand detailed instructions
      </p>

      <div className="space-y-2">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isExpanded = expandedStep === stepNumber;

          return (
            <div key={stepNumber} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleStep(stepNumber)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {stepNumber}
                  </div>
                  <span className="font-semibold text-gray-900">{step.title}</span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-gray-100">
                  {step.content}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 bg-white border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-700">
          <strong>Need help?</strong> If you get stuck, the events aren&apos;t showing up, or something doesn&apos;t work, double-check:
        </p>
        <ul className="list-disc ml-5 mt-2 space-y-1 text-sm text-gray-600">
          <li>Your API key is copied correctly (starts with <code className="bg-gray-100 px-1 rounded">odin_</code>)</li>
          <li>Custom Header Name is exactly <code className="bg-gray-100 px-1 rounded">x-app-key</code> (lowercase, with hyphen)</li>
          <li>You clicked &quot;Update&quot; to save your GPT</li>
          <li>You started a NEW conversation (not an old one)</li>
        </ul>
      </div>
    </div>
  );
}
