import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Umbrella, Zap, ChevronRight, Loader2 } from 'lucide-react';
import { ChatMessage } from '../../types';
import { INITIAL_CHAT_MESSAGES } from '../../constants';

const ChatPanel: React.FC = () => {
    // 1. 상태 관리
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // 자동 스크롤을 위한 Ref
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory, isLoading]);

    const handleSendMessage = () => {
        if (!inputMessage.trim()) return;

        // 사용자 메시지 추가
        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            sender: 'user',
            type: 'text',
            text: inputMessage
        };

        setChatHistory(prev => [...prev, userMsg]);
        setInputMessage('');
        setIsLoading(true);

        // 2. AI 연동 준비 (Mock Response)
        // TODO: API Call
        setTimeout(() => {
            const aiMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'ai',
                type: 'text',
                text: "AI 답변 기능을 준비 중입니다."
            };
            setChatHistory(prev => [...prev, aiMsg]);
            setIsLoading(false);
        }, 1000);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
            handleSendMessage();
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#f8f9fa]">
            {/* Header */}
            <div className="p-4 bg-white border-b border-gray-100 flex-shrink-0">
                <h2 className="text-lg font-bold text-gray-800">Transit AI Assistant</h2>
                <p className="text-xs text-gray-400">Powered by Gemini</p>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {chatHistory.map((msg) => (
                    <div key={msg.id} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.type === 'text' ? (
                            <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm
                                ${msg.sender === 'user' 
                                    ? 'bg-gray-200 text-gray-800 rounded-tr-none' 
                                    : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none'}`}>
                                {msg.text}
                            </div>
                        ) : (
                            // Route Card Implementation
                            <div className="w-full max-w-[90%] bg-white rounded-xl shadow-md border border-orange-100 overflow-hidden transform transition-all hover:scale-[1.02]">
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2.5 py-0.5 rounded text-white font-bold text-sm ${msg.routeData?.color}`}>
                                                {msg.routeData?.busNumber}
                                            </span>
                                            <span className="text-gray-500 text-xs">Bus</span>
                                        </div>
                                        <span className="text-lg font-bold text-gray-900">
                                            {msg.routeData?.time} <span className="text-xs font-normal text-gray-500">min</span>
                                        </span>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {msg.routeData?.tags.map((tag, idx) => (
                                            <span key={idx} className="inline-flex items-center px-2 py-1 bg-orange-50 text-orange-600 text-[10px] font-bold uppercase rounded-md">
                                                {tag.includes('Walking') && <Umbrella size={10} className="mr-1" />}
                                                {tag.includes('Fastest') && <Zap size={10} className="mr-1" />}
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex justify-between items-center text-xs text-gray-500 border-t pt-3">
                                        <span>Cost: ₩{msg.routeData?.cost.toLocaleString()}</span>
                                        <button className="flex items-center text-[#FF7F00] font-semibold hover:underline">
                                            View Route <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                
                {isLoading && (
                    <div className="flex justify-start w-full">
                        <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex items-center gap-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100 flex-shrink-0">
                <div className="relative">
                    <input 
                        type="text" 
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="경로나 교통 상황에 대해 물어보세요..." 
                        className="w-full h-11 pl-4 pr-12 rounded-full border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-200 text-sm"
                    />
                    <button 
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim() || isLoading}
                        className={`absolute right-1.5 top-1.5 w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors
                            ${!inputMessage.trim() || isLoading ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#FF7F00] hover:bg-orange-600'}`}
                    >
                        <ArrowUp size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatPanel;