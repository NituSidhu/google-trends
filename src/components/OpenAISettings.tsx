import React, { useState } from 'react';
import { Key, Settings, Eye, EyeOff, Check, X } from 'lucide-react';

interface OpenAISettingsProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export const OpenAISettings: React.FC<OpenAISettingsProps> = ({
  apiKey,
  onApiKeyChange,
  isEnabled,
  onToggle
}) => {
  const [showKey, setShowKey] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onApiKeyChange(e.target.value);
  };

  const isValidKey = apiKey.startsWith('sk-') && apiKey.length > 20;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI-Enhanced Insights</h3>
          <div className="flex items-center space-x-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => onToggle(e.target.checked)}
                className="sr-only peer"
                disabled={!isValidKey}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
            {isValidKey ? (
              <Check className="h-4 w-4 text-success-600" />
            ) : (
              <X className="h-4 w-4 text-error-600" />
            )}
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          {isExpanded ? 'Hide Settings' : 'Configure'}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          <div>
            <label htmlFor="openai-key" className="block text-sm font-medium text-gray-700 mb-2">
              OpenAI API Key
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Key className="h-4 w-4 text-gray-400" />
              </div>
              <input
                id="openai-key"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={handleKeyChange}
                placeholder="sk-..."
                className="block w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showKey ? (
                  <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            {!isValidKey && apiKey.length > 0 && (
              <p className="text-error-600 text-xs mt-1">
                Please enter a valid OpenAI API key (starts with 'sk-')
              </p>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">How to get your OpenAI API key:</p>
                <ol className="list-decimal list-inside space-y-1 text-blue-700">
                  <li>Visit <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">OpenAI API Keys</a></li>
                  <li>Sign in or create an account</li>
                  <li>Click "Create new secret key"</li>
                  <li>Copy and paste the key here</li>
                </ol>
                <p className="text-xs mt-2 text-blue-600">
                  Your API key is stored locally and never sent to our servers.
                </p>
              </div>
            </div>
          </div>

          {isEnabled && isValidKey && (
            <div className="bg-success-50 border border-success-200 rounded-lg p-4">
              <p className="text-success-800 text-sm">
                ✨ AI insights enabled! Your analysis will include personalized recommendations and deeper market insights.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};