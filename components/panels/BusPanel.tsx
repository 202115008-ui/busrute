import React, { useState } from 'react';
import { Bus, MapPin } from 'lucide-react';
import { RECENT_BUSES } from '../../constants';

const BusPanel: React.FC = () => {
    const [tab, setTab] = useState<'BUS' | 'STATION'>('BUS');

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Tabs */}
            <div className="flex p-4 gap-3">
                <button 
                    onClick={() => setTab('BUS')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors
                    ${tab === 'BUS' ? 'bg-[#FF7F00] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                >
                    <Bus size={16} /> 버스
                </button>
                <button 
                    onClick={() => setTab('STATION')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors
                    ${tab === 'STATION' ? 'bg-[#FF7F00] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                >
                    <MapPin size={16} /> 정류장
                </button>
            </div>

            {/* Search */}
            <div className="px-4 mb-6">
                <input 
                    type="text" 
                    placeholder={tab === 'BUS' ? "버스 번호를 입력하세요." : "버스 정류장 이름을 입력하세요."}
                    className="w-full h-10 px-4 border border-gray-300 rounded-md focus:outline-none focus:border-[#FF7F00] text-sm"
                />
            </div>

            {/* Recent Search Header */}
            <div className="px-4 mb-2">
                <h3 className="text-xs font-semibold text-gray-500">최근 검색</h3>
            </div>

            <div className="flex-1 overflow-y-auto">
                <ul className="divide-y divide-gray-100">
                    {RECENT_BUSES.map((bus) => (
                        <li key={bus.id} className="flex items-center gap-3 px-4 py-3 hover:bg-orange-50 cursor-pointer transition-colors group">
                            <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-600 group-hover:bg-white group-hover:text-[#FF7F00]">
                                <Bus size={18} />
                            </div>
                            <span className="text-sm text-gray-800 font-medium">{bus.name}</span>
                        </li>
                    ))}
                </ul>
            </div>
            
            {/* Example Info Section */}
            <div className="p-4 border-t border-gray-100">
                <h4 className="text-xs font-semibold text-gray-500 mb-2">도착 정보</h4>
                <div className="flex items-center justify-between text-sm py-2">
                    <div className="flex items-center gap-2">
                        <Bus size={16} />
                        <span className="font-bold">2번 버스</span>
                    </div>
                    <span className="text-red-500 text-xs">11분 <span className="text-gray-400">/ 4정거장</span></span>
                </div>
            </div>
        </div>
    );
};

export default BusPanel;