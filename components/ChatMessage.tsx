import React from 'react';
import { Message, AgentType } from '../types';
import AgentAvatar from './AgentAvatar';
import ReactMarkdown from 'react-markdown';
import { User as UserIcon } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  if (message.isDelegationNotice) {
    return (
      <div className="flex justify-center my-6 animate-pulse">
        <div className="bg-slate-800 border border-slate-700 text-slate-400 text-xs py-1 px-4 rounded-full flex items-center gap-2 uppercase tracking-wider font-mono">
          <span className="w-2 h-2 bg-hospital-500 rounded-full"></span>
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar Area */}
        <div className="flex-shrink-0 mt-1">
          {isUser ? (
            <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-slate-300" />
            </div>
          ) : (
            <AgentAvatar type={message.sender || AgentType.COORDINATOR} />
          )}
        </div>

        {/* Message Content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className="mb-1 text-xs text-slate-400 font-mono">
            {isUser ? 'USER' : (message.sender?.replace('_', ' ') || 'SYSTEM')}
          </div>
          
          <div className={`p-4 rounded-2xl shadow-sm leading-relaxed text-sm ${
            isUser 
              ? 'bg-slate-700 text-white rounded-tr-none' 
              : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none'
          }`}>
            <ReactMarkdown 
              components={{
                strong: ({node, ...props}) => <span className="font-bold text-hospital-100" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc ml-4 my-2 space-y-1" {...props} />,
                p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
          <span className="text-[10px] text-slate-500 mt-1">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;