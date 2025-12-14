import React from 'react';
import { NavTab, LocationMode } from '../types';
import ChatPanel from './panels/ChatPanel';
import BusPanel from './panels/BusPanel';
import WeatherPanel from './panels/WeatherPanel';
import FavoritesPanel from './panels/FavoritesPanel';
import MorePanel from './panels/MorePanel';

interface ContentPanelProps {
    activeTab: NavTab;
    isOpen: boolean;
    locationMode: LocationMode;
    setLocationMode: (mode: LocationMode) => void;
}

const ContentPanel: React.FC<ContentPanelProps> = ({ activeTab, isOpen, locationMode, setLocationMode }) => {
    const renderContent = () => {
        switch (activeTab) {
            case NavTab.CHAT: return <ChatPanel />;
            case NavTab.BUS: return <BusPanel />;
            case NavTab.WEATHER: return <WeatherPanel />;
            case NavTab.FAVORITES: return <FavoritesPanel />;
            case NavTab.MORE: return <MorePanel locationMode={locationMode} setLocationMode={setLocationMode} />;
            default: return <ChatPanel />;
        }
    };

    return (
        <div 
            className={`h-full flex flex-col border-r border-gray-200 bg-white z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-all duration-300 ease-in-out overflow-hidden`}
            style={{ width: isOpen ? '360px' : '0px', opacity: isOpen ? 1 : 0 }}
        >
            <div className="w-[360px] h-full flex flex-col">
                {renderContent()}
            </div>
        </div>
    );
};

export default ContentPanel;