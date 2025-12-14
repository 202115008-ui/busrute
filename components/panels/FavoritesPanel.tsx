import React, { useState } from 'react';
import { MapPin, Route, Star, ChevronDown } from 'lucide-react';

// Mock Data for Favorites
const FAVORITE_PLACES = [
    { id: 1, name: '천안 버스터미널', address: '충청남도 천안시 동남구' },
    { id: 2, name: '백석대학교', address: '충청남도 천안시 동남구 문암로 76' },
    { id: 3, name: '백석문화대학교', address: '충청남도 천안시 동남구 문암로 58' },
];

const FavoritesPanel: React.FC = () => {
    const [mainTab, setMainTab] = useState<'PLACE' | 'ROUTE'>('PLACE');
    const [activeFilter, setActiveFilter] = useState('최신순');

    const filters = ['최신순', '전체 리스트', '저장한 리스트', '내 리스트'];

    return (
        <div className="flex flex-col h-full bg-white font-sans">
            {/* Top Toggle Header */}
            <div className="flex w-full border-b border-gray-100">
                <button 
                    onClick={() => setMainTab('PLACE')}
                    className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-bold transition-colors relative
                    ${mainTab === 'PLACE' ? 'text-[#FF7F00]' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                    <MapPin size={18} />
                    장소
                    {mainTab === 'PLACE' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FF7F00]" />
                    )}
                </button>
                <button 
                    onClick={() => setMainTab('ROUTE')}
                    className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-bold transition-colors relative
                    ${mainTab === 'ROUTE' ? 'text-[#FF7F00]' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                    <Route size={18} />
                    경로
                    {mainTab === 'ROUTE' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FF7F00]" />
                    )}
                </button>
            </div>

            {/* Filter Chips */}
            <div className="p-4 overflow-x-auto whitespace-nowrap no-scrollbar border-b border-gray-50">
                <div className="flex gap-2">
                    {filters.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center gap-1
                            ${activeFilter === filter 
                                ? 'bg-white border-gray-800 text-gray-800' 
                                : 'bg-white border-gray-200 text-gray-500 hover:border-gray-400'}`}
                        >
                            {filter}
                            {filter === '최신순' && <ChevronDown size={10} />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto">
                <div className="px-5 py-3">
                    <h3 className="text-sm font-bold text-[#FF7F00] flex items-center gap-1 mb-4">
                        <Star size={14} fill="#FF7F00" />
                        내 장소
                    </h3>

                    <ul className="space-y-6">
                        {FAVORITE_PLACES.map((place) => (
                            <li key={place.id} className="cursor-pointer group">
                                <div className="flex items-start justify-between mb-1">
                                    <span className="text-sm font-medium text-gray-800 group-hover:text-[#FF7F00] transition-colors">
                                        {place.name}
                                    </span>
                                </div>
                                {/* Optional address or detail line if needed */}
                                {/* <div className="text-xs text-gray-400">{place.address}</div> */}
                            </li>
                        ))}
                    </ul>
                </div>
                
                {/* Empty State Example (Hidden if there is data) */}
                {FAVORITE_PLACES.length === 0 && (
                     <div className="h-full flex flex-col items-center justify-center pb-20 opacity-50">
                        <MapPin size={48} className="text-gray-300 mb-2" />
                        <p className="text-gray-400 text-sm">저장된 장소가 없습니다.</p>
                     </div>
                )}
            </div>
        </div>
    );
};

export default FavoritesPanel;