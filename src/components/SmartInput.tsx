
import React, { useState } from 'react';
import { SparklesIcon } from './Icons';
import { parseEventFromText } from '../services/geminiService';
import { ScheduleEvent } from '../types';

interface SmartInputProps {
  onEventCreated: (event: Omit<ScheduleEvent, 'id'>) => void;
}

const SmartInput: React.FC<SmartInputProps> = ({ onEventCreated }) => {
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSuggest = async () => {
    if (!text.trim() || isProcessing) return;
    
    setIsProcessing(true);
    const now = new Date().toISOString();
    const result = await parseEventFromText(text, now);
    
    if (result) {
      onEventCreated({
        title: result.title,
        start: result.start,
        end: result.end,
        category: result.category,
        description: result.description || `Auto-parsed from: "${text}"`
      });
      setText('');
    }
    setIsProcessing(false);
  };

  return (
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <SparklesIcon className={`w-5 h-5 ${isProcessing ? 'text-indigo-500 animate-pulse' : 'text-gray-400 group-focus-within:text-indigo-500'}`} />
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-32 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all shadow-sm"
        placeholder="Try 'Meeting with Alex at 3pm tomorrow'..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSuggest()}
      />
      <div className="absolute inset-y-1.5 right-1.5">
        <button
          onClick={handleSuggest}
          disabled={!text.trim() || isProcessing}
          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isProcessing ? 'Thinking...' : 'Add with AI'}
        </button>
      </div>
    </div>
  );
};

export default SmartInput;
