import React from 'react';
import { MessageCircle, Bus, Star, Sun, Menu, UserCircle } from 'lucide-react';
import { NavTab } from '../types';

interface NavigationRailProps {
    activeTab: NavTab;
    onTabChange: (tab: NavTab) => void;
}

const NavigationRail: React.FC<NavigationRailProps> = ({ activeTab, onTabChange }) => {
    
    const navItems = [
        { id: NavTab.CHAT, icon: MessageCircle, label: '챗봇' },
        { id: NavTab.BUS, icon: Bus, label: '버스' },
        { id: NavTab.FAVORITES, icon: Star, label: '즐겨찾기' },
        { id: NavTab.WEATHER, icon: Sun, label: '날씨' },
        { id: NavTab.MORE, icon: Menu, label: '더보기' },
    ];

    return (
        <div className="w-[80px] h-full bg-white border-r border-gray-200 flex flex-col justify-between items-center py-6 shadow-sm z-20 flex-shrink-0">
            <div className="flex flex-col gap-2 w-full items-center">
                {/* Logo Area */}
                <div className="mb-6 px-2 flex justify-center w-full">
                    {/* 사용자가 제공한 이미지를 logo.png로 저장했다고 가정 */}
                    <img src="/logo.png" alt="VBus Logo" className="w-14 h-auto object-contain" />
                </div>

                {navItems.map((item) => {
                    const isActive = activeTab === item.id;
                    const Icon = item.icon;
                    
                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={`w-full h-[70px] flex flex-col items-center justify-center relative transition-colors duration-200 group
                                ${isActive ? 'text-[#FF7F00]' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-[#FF7F00] rounded-r-full" />
                            )}
                            <Icon size={26} strokeWidth={isActive ? 2.5 : 2} className="mb-1.5" />
                            <span className="text-[11px] font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </div>

            <div className="mb-2">
                <button className="text-gray-300 hover:text-gray-500 transition-colors">
                    <UserCircle size={48} strokeWidth={1.5} />
                </button>
            </div>
        </div>
    );
};

export default NavigationRail;