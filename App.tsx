import React, { useState } from 'react';
import NavigationRail from './components/NavigationRail';
import ContentPanel from './components/ContentPanel';
import MapArea from './components/MapArea';
import { NavTab, LocationMode } from './types';

function App() {
  const [activeTab, setActiveTab] = useState<NavTab>(NavTab.CHAT);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [locationMode, setLocationMode] = useState<LocationMode>('AUTO');

  const handleTabChange = (tab: NavTab) => {
    if (tab === activeTab) {
      // 이미 선택된 탭을 누르면 패널을 열고 닫음
      setIsPanelOpen(!isPanelOpen);
    } else {
      // 다른 탭을 누르면 해당 탭으로 변경하고 패널을 염
      setActiveTab(tab);
      setIsPanelOpen(true);
    }
  };

  return (
    <div className="flex w-screen h-screen overflow-hidden bg-gray-50 font-sans">
      <NavigationRail activeTab={activeTab} onTabChange={handleTabChange} />
      <ContentPanel 
        activeTab={activeTab} 
        isOpen={isPanelOpen} 
        locationMode={locationMode}
        setLocationMode={setLocationMode}
      />
      <MapArea locationMode={locationMode} />
    </div>
  );
}

export default App;