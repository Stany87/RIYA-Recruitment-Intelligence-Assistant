import { useState, useRef, useEffect } from 'react';
import { useChatMessages, useSendMessage, useClearChat } from '../hooks/useChat';
import { Send, Sparkles, Trash2, Copy, FileText, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const SUGGESTED_PROMPTS = [
  { text: "Who are the top candidates in the pipeline?", icon: "📊" },
  { text: "Tell me about Aarav Patel", icon: "👤" },
  { text: "Generate interview questions for Senior Backend Engineer", icon: "📝" },
  { text: "Move Aarav Patel to Shortlisted stage", icon: "✨" },
];

export default function ChatPage() {
  const { data: messages = [], isLoading } = useChatMessages();
  const sendMessageMutation = useSendMessage();
  const clearChatMutation = useClearChat();

  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sendMessageMutation.isPending]);

  const handleSend = (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    sendMessageMutation.mutate(text, {
      onSuccess: () => {
        setInput('');
      },
      onError: (err) => {
        toast.error(err.message || 'Failed to send message');
      },
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear the entire chat history?')) {
      clearChatMutation.mutate(null, {
        onSuccess: () => {
          toast.success('Chat history cleared.');
        },
      });
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      {/* Chat Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
        <div>
          <h1 className="text-[16px] font-semibold text-text-primary flex items-center gap-1.5">
            <Sparkles size={16} className="text-accent" /> Chat with RIYA
          </h1>
          <p className="text-[13px] text-text-muted mt-0.5">
            Ask questions about candidates, scores, or execute pipeline updates.
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-2.5 py-[5px] rounded border border-border text-[11px] font-medium text-text-secondary hover:bg-surface-tertiary transition-colors cursor-pointer"
          >
            <Trash2 size={13} />
            Clear Chat
          </button>
        )}
      </div>

      {/* Main Container */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Chat Feed */}
        <div className="flex-1 flex flex-col bg-surface border border-border rounded overflow-hidden h-full">
          {/* Scrollable messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-[13px] text-text-muted">Loading messages...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto text-center py-8">
                <div className="w-14 h-14 rounded-2xl bg-surface-secondary border border-border-light flex items-center justify-center mb-4 text-xl">
                  ✨
                </div>
                <h2 className="text-[15px] font-semibold text-text-primary mb-1.5">Ask RIYA Anything</h2>
                <p className="text-[13px] text-text-muted mb-6 leading-relaxed">
                  RIYA can analyze candidates, write custom interview questions, compare scores, or directly move candidates through stages.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt.text}
                      onClick={() => handleSend(prompt.text)}
                      className="px-3 py-2.5 rounded border border-border text-left hover:bg-surface-secondary transition-colors cursor-pointer"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-[14px]">{prompt.icon}</span>
                        <span className="text-[11px] text-text-secondary leading-normal font-medium">{prompt.text}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`flex gap-3 max-w-[85%] ${
                      msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                    }`}
                  >
                    {/* Avatar */}
                    {msg.role === 'assistant' ? (
                      <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-[10px] text-white flex-shrink-0 font-semibold shadow-sm">
                        🤖
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center text-[10px] flex-shrink-0 font-semibold">
                        U
                      </div>
                    )}

                    {/* Bubble */}
                    <div className="space-y-1">
                      <div
                        className={`px-3.5 py-2.5 rounded-2xl text-[12.5px] leading-relaxed shadow-sm border ${
                          msg.role === 'user'
                            ? 'bg-neutral-900 border-neutral-900 text-white rounded-tr-none'
                            : 'bg-white border-border text-text-primary rounded-tl-none font-sans'
                        }`}
                      >
                        {/* Render simple markdown lines */}
                        <div className="space-y-1.5 whitespace-pre-wrap">
                          {msg.content}
                        </div>
                      </div>
                      
                      {/* Message Actions */}
                      {msg.role === 'assistant' && (
                        <div className="flex items-center gap-1.5 ml-1 pt-0.5">
                          <button
                            onClick={() => handleCopy(msg._id, msg.content)}
                            className="p-1 rounded hover:bg-surface-secondary text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
                            title="Copy reply"
                          >
                            {copiedId === msg._id ? <Check size={11} className="text-status-green" /> : <Copy size={11} />}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Loading typing indicator */}
                {sendMessageMutation.isPending && (
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-[10px] text-white flex-shrink-0 font-semibold shadow-sm">
                      🤖
                    </div>
                    <div className="bg-white border border-border px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Panel */}
          <div className="p-3 border-t border-border bg-white flex gap-2">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask RIYA about candidates, generate interview questions, or move candidates..."
              className="flex-1 px-3 py-2 rounded border border-border bg-white text-[12px] text-text-primary placeholder:text-text-placeholder focus:outline-none focus:border-accent resize-none max-h-24 overflow-y-auto leading-normal"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || sendMessageMutation.isPending}
              className="px-3.5 rounded bg-accent hover:bg-accent-hover text-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50 flex-shrink-0"
            >
              <Send size={14} />
            </button>
          </div>
        </div>

        {/* Sidebar Capabilities Info */}
        <div className="hidden lg:block w-72 bg-surface border border-border rounded p-4 h-full overflow-y-auto space-y-4">
          <div>
            <h3 className="text-[13px] font-semibold text-text-primary mb-1">RIYA AI Capabilities</h3>
            <p className="text-[11px] text-text-muted leading-relaxed">
              Below are shortcuts and commands that the AI recruiter assistant understands.
            </p>
          </div>

          <div className="space-y-3">
            <div className="border border-border rounded p-2.5 bg-white">
              <p className="text-[11.5px] font-semibold text-text-primary flex items-center gap-1">
                🔍 Screen & Score
              </p>
              <p className="text-[10.5px] text-text-muted mt-1 leading-normal">
                Ask about scores or fit: *"Why did we reject Rahul Gupta?"* or *"Compare Aarav vs Neha"*.
              </p>
            </div>

            <div className="border border-border rounded p-2.5 bg-white">
              <p className="text-[11.5px] font-semibold text-text-primary flex items-center gap-1">
                ⚡ Pipeline Management
              </p>
              <p className="text-[10.5px] text-text-muted mt-1 leading-normal">
                Execute stage changes via chat: *"Move Priya Sharma to interview scheduled"*.
              </p>
            </div>

            <div className="border border-border rounded p-2.5 bg-white">
              <p className="text-[11.5px] font-semibold text-text-primary flex items-center gap-1">
                📝 Interview Generation
              </p>
              <p className="text-[10.5px] text-text-muted mt-1 leading-normal">
                Get interview questionnaires: *"Generate questions for Product Manager"*.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
