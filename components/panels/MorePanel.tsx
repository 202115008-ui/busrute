import React, { useState } from 'react';
import { Settings, Info, Bell, Shield, UserCircle, ChevronRight, Headphones, ArrowLeft, RefreshCw, X, ChevronDown, CircleAlert, Phone, Trash2 } from 'lucide-react';
import { LocationMode } from '../../types';

interface MorePanelProps {
    locationMode?: LocationMode;
    setLocationMode?: (mode: LocationMode) => void;
}

interface NoticeItem {
    id: number;
    type: 'GENERAL' | 'UPDATE' | 'EVENT';
    title: string;
    date: string;
    content: string;
}

interface HistoryItem {
    id: number;
    start: string;
    end: string;
}

const NOTICE_DATA: NoticeItem[] = [
    {
        id: 1,
        type: 'GENERAL',
        title: '[일반] 동절기 안전 점검으로 일부 노선 출발 지연 안내(12.02)',
        date: '2025-12-02',
        content: '동절기 안전 점검으로 인하여 일부 노선의 첫차 출발 시간이 약 10분 정도 지연될 수 있습니다. 이용에 불편을 드려 죄송합니다.'
    },
    {
        id: 2,
        type: 'GENERAL',
        title: '[일반] 천안 시내 버스 노선 일부 우회 운행 안내(12.09)',
        date: '2025-12-09',
        content: '도로 공사로 인해 12번, 14번 버스가 우회 운행합니다. 상세 경로는 홈페이지를 참조해주세요.'
    },
    {
        id: 3,
        type: 'GENERAL',
        title: '[일반] 폭설 예보로 일부 노선 운행 중단 가능성 안내(12.09)',
        date: '2025-12-09',
        content: '내일 오전 폭설 예보로 인해 산간 지역 노선 운행이 일시 중단될 수 있습니다.'
    },
    {
        id: 4,
        type: 'UPDATE',
        title: '[업데이트] 인기 노선 즐겨찾기 기능 업데이트(12.18)',
        date: '2025-12-09',
        content: '자주 타는 버스를 더 쉽게 관리할 수 있도록 즐겨찾기 그룹 기능이 추가되었습니다.'
    },
    {
        id: 5,
        type: 'UPDATE',
        title: '[업데이트] 다크모드 UI 적용 안내 시행예정 (2026-01-01)',
        date: '2025-12-09',
        content: '사용자 눈 건강을 위한 다크모드가 2026년 1월 1일부터 정식 지원됩니다.'
    },
];

const MOCK_HISTORY: HistoryItem[] = [
    { id: 1, start: '천안 고속버스터미널', end: '백석대학교 정문' },
    { id: 2, start: '두정역', end: '단국대병원' },
    { id: 3, start: '신세계백화점', end: '천안역 서부광장' },
    { id: 4, start: '불당동 카페거리', end: '갤러리아백화점' },
    { id: 5, start: '쌍용역', end: '나사렛대학교' },
];

const MorePanel: React.FC<MorePanelProps> = ({ locationMode = 'AUTO', setLocationMode }) => {
    // View state: MAIN -> SETTINGS -> LOCATION_SETTING | HISTORY | DELETE_ALL_CONFIRM | NOTICES | SUPPORT
    const [currentView, setCurrentView] = useState<'MAIN' | 'SETTINGS' | 'LOCATION_SETTING' | 'HISTORY' | 'DELETE_ALL_CONFIRM' | 'NOTICES' | 'SUPPORT'>('MAIN');
    
    // Notice State
    const [activeNoticeTab, setActiveNoticeTab] = useState<'ALL' | 'UPDATE' | 'GENERAL' | 'EVENT'>('ALL');
    const [expandedNoticeId, setExpandedNoticeId] = useState<number | null>(null);

    // History State
    const [historyData, setHistoryData] = useState<HistoryItem[]>(MOCK_HISTORY);

    const mainMenuItems = [
        { icon: Settings, label: '설정', action: () => setCurrentView('SETTINGS') },
        { icon: Shield, label: '이용약관 및 정책', action: () => {} },
        { icon: Info, label: '버전 정보', action: () => {} },
        { icon: Bell, label: '공지사항', action: () => setCurrentView('NOTICES') },
        { icon: Headphones, label: '고객센터', action: () => setCurrentView('SUPPORT') },
    ];

    const toggleNotice = (id: number) => {
        if (expandedNoticeId === id) {
            setExpandedNoticeId(null);
        } else {
            setExpandedNoticeId(id);
        }
    };

    const getFilteredNotices = () => {
        if (activeNoticeTab === 'ALL') return NOTICE_DATA;
        return NOTICE_DATA.filter(item => item.type === activeNoticeTab);
    };

    // History handlers
    const deleteHistoryItem = (id: number) => {
        setHistoryData(prev => prev.filter(item => item.id !== id));
    };

    const deleteAllHistory = () => {
        setHistoryData([]);
        setCurrentView('SETTINGS');
    };

    // SUPPORT View
    if (currentView === 'SUPPORT') {
        return (
            <div className="flex flex-col h-full bg-white font-sans animate-slide-left">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setCurrentView('MAIN')}
                            className="p-1 text-gray-800 hover:text-gray-600 transition-colors"
                        >
                            <ChevronRight size={24} className="rotate-180" />
                        </button>
                        <h2 className="text-xl font-bold text-gray-800">고객센터</h2>
                    </div>
                    <button onClick={() => setCurrentView('MAIN')} className="text-gray-400 hover:text-gray-800">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5">
                    
                    {/* Inquiry Form */}
                    <div className="mb-8">
                        <h3 className="text-base font-medium text-gray-800 mb-3">1대1 문의하기</h3>
                        <div className="space-y-3">
                            <input 
                                type="text" 
                                placeholder="제목" 
                                className="w-full border border-gray-300 rounded-md px-3 py-3 text-sm focus:outline-none focus:border-[#FF7F00]"
                            />
                            <textarea 
                                placeholder="문의하실 내용을 자세히 적어주세요." 
                                className="w-full h-48 border border-gray-300 rounded-md px-3 py-3 text-sm resize-none focus:outline-none focus:border-[#FF7F00]"
                            />
                        </div>
                    </div>

                    {/* File Attachment */}
                    <div className="mb-6">
                        <h3 className="text-base font-medium text-gray-800 mb-3">파일 첨부(선택)</h3>
                        <div className="w-full border border-gray-300 rounded-md px-4 py-3 text-xs text-gray-400 text-center cursor-pointer hover:bg-gray-50 transition-colors">
                            여기를 눌러 파일을 첨부해주세요 (PDF, JPG, PNG, HWP등)
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-center mb-8">
                        <button className="bg-[#007AFF] text-white px-8 py-2 rounded-md text-sm font-medium hover:bg-blue-600 transition-colors">
                            제출
                        </button>
                    </div>

                    <div className="h-[1px] bg-gray-100 w-full mb-6" />

                    {/* FAQ Section */}
                    <div className="mb-8">
                        <h3 className="text-xs font-bold text-gray-800 mb-3">자주 묻는 질문</h3>
                        <div className="space-y-3">
                            {/* FAQ Item 1 */}
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="text-sm font-bold text-gray-800 mb-2">Q. 분실물은 어디에 문의하나요?</h4>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    A. 운영사 고객센터 또는 터미널 분실물 센터 연락처를 통해 확인 가능합니다.
                                </p>
                            </div>
                            {/* FAQ Item 2 */}
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="text-sm font-bold text-gray-800 mb-2">Q. 버스 위치가 표시되지 않아요.</h4>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    A. GPS 수신 장애 또는 통신 지연 일 수 있으며 새로 고침 혹은 상담센터로 연락 주시면 확인 가능합니다
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="text-[10px] text-gray-400 pb-4">
                        <div className="flex items-center gap-1 mb-1">
                            <Phone size={10} />
                            <span>상담센터 : 1588-1234</span>
                        </div>
                        <p className="leading-snug">
                            상담 가능 시간<br/>
                            평일 : 9:00~ 18:00<br/>
                            (점심 12:00~13:00 제외) / 주말 공휴일 휴무
                        </p>
                    </div>

                </div>
            </div>
        );
    }

    // NOTICES View
    if (currentView === 'NOTICES') {
        const filteredNotices = getFilteredNotices();

        return (
             <div className="flex flex-col h-full bg-white font-sans animate-slide-left">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setCurrentView('MAIN')}
                            className="p-1 text-gray-800 hover:text-gray-600 transition-colors"
                        >
                            <ChevronRight size={24} className="rotate-180" />
                        </button>
                        <h2 className="text-xl font-bold text-gray-800">공지사항</h2>
                    </div>
                    <button onClick={() => setCurrentView('MAIN')} className="text-gray-400 hover:text-gray-800">
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex w-full border-b border-gray-200">
                    {['ALL', 'UPDATE', 'GENERAL', 'EVENT'].map((tab) => {
                        let label = '';
                        switch(tab) {
                            case 'ALL': label = '전체'; break;
                            case 'UPDATE': label = '업데이트'; break;
                            case 'GENERAL': label = '일반'; break;
                            case 'EVENT': label = '이벤트'; break;
                        }
                        
                        const isActive = activeNoticeTab === tab;
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveNoticeTab(tab as any)}
                                className={`flex-1 py-3 text-sm font-bold relative transition-colors
                                ${isActive ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                {label}
                                {isActive && (
                                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#007AFF]" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto bg-white">
                    {filteredNotices.length > 0 ? (
                        <ul className="divide-y divide-gray-100">
                            {filteredNotices.map((notice) => (
                                <li key={notice.id}>
                                    <button 
                                        onClick={() => toggleNotice(notice.id)}
                                        className="w-full text-left p-5 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <h3 className={`text-sm font-medium leading-snug mb-2 ${expandedNoticeId === notice.id ? 'text-[#007AFF]' : 'text-gray-800'}`}>
                                                    {notice.title}
                                                </h3>
                                                <p className="text-xs text-gray-400">{notice.date}</p>
                                            </div>
                                            <ChevronDown 
                                                size={20} 
                                                className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${expandedNoticeId === notice.id ? 'rotate-180' : ''}`} 
                                            />
                                        </div>
                                    </button>
                                    {/* Content Expansion */}
                                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedNoticeId === notice.id ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <div className="px-5 pb-5 pt-0 text-sm text-gray-600 bg-gray-50/50 leading-relaxed whitespace-pre-line">
                                            {notice.content}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center pb-20 opacity-40">
                            <CircleAlert size={48} className="text-gray-400 mb-3" />
                            <p className="text-gray-500 text-sm">등록된 공지가 없습니다.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // LOCATION_SETTING View
    if (currentView === 'LOCATION_SETTING') {
        return (
            <div className="flex flex-col h-full bg-white font-sans animate-slide-left">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                    <button 
                        onClick={() => setCurrentView('SETTINGS')}
                        className="p-1 -ml-2 text-gray-500 hover:text-gray-800 transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h2 className="text-xl font-medium text-gray-800">접속 위치 설정</h2>
                </div>

                <div className="flex-1 p-6">
                    {/* Auto Mode Option */}
                    <div className="mb-6">
                        <label className="flex items-center gap-3 cursor-pointer group mb-2" onClick={() => setLocationMode?.('AUTO')}>
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${locationMode === 'AUTO' ? 'border-[#007AFF]' : 'border-gray-300'}`}>
                                {locationMode === 'AUTO' && <div className="w-2.5 h-2.5 rounded-full bg-[#007AFF]" />}
                            </div>
                            <span className="text-gray-800 text-base">자동</span>
                        </label>
                    </div>

                    {/* Manual Mode Option */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-1">
                            <label className="flex items-center gap-3 cursor-pointer group" onClick={() => setLocationMode?.('MANUAL')}>
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${locationMode === 'MANUAL' ? 'border-[#007AFF]' : 'border-gray-300'}`}>
                                    {locationMode === 'MANUAL' && <div className="w-2.5 h-2.5 rounded-full bg-[#007AFF]" />}
                                </div>
                                <span className="text-gray-800 text-base">직접 설정</span>
                            </label>

                            {/* Reset Button */}
                            {locationMode === 'MANUAL' && (
                                <button className="flex items-center gap-1 px-2 py-0.5 border border-gray-200 rounded-full text-[10px] text-gray-500 hover:bg-gray-50 transition-colors">
                                    초기화 <RefreshCw size={8} />
                                </button>
                            )}
                        </div>
                        <p className="pl-8 text-xs text-gray-400">설정한 위치 : 없음</p>
                    </div>

                    <div className="h-[1px] bg-gray-100 w-full mb-8" />

                    {/* Info Text */}
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-medium text-gray-800 mb-2 text-sm">자동</h4>
                            <p className="text-sm text-gray-500 leading-relaxed font-light">
                                버스루트는 사용자의 IP주소에 따라 기본 위치를 설정해 줍니다. 따라서 정확한 접속 위피 제공에 어려움이 있을 수 있습니다.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-medium text-gray-800 mb-2 text-sm">직접 설정</h4>
                            <p className="text-sm text-gray-500 leading-relaxed font-light mb-4">
                                만약 [자동] 상태에서 실제 접속 위치와 다른 위치의 지도가 노출될 경우, [직접 설정]을 선택한 지도를 움직여서 우너하는 위치로 옮긴 뒤 저장해 주세요.
                            </p>
                            <p className="text-sm text-gray-500 leading-relaxed font-light mb-4">
                                버스루트에 처음 접속 하거나 화면 오른쪽 아래의 접속 위치 버튼을 누를 때, 직접 설정한 위치의 지도 화면을 보여드립니다.
                            </p>
                            <p className="text-sm text-gray-500 leading-relaxed font-light">
                                직접 설정 시, 지도를 확대/축소한 정도는 저장되지 않는 점 참고 부탁드립니다.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // HISTORY View
    if (currentView === 'HISTORY') {
        return (
            <div className="flex flex-col h-full bg-white font-sans animate-slide-left">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                    <button 
                        onClick={() => setCurrentView('SETTINGS')}
                        className="p-1 -ml-2 text-gray-500 hover:text-gray-800 transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h2 className="text-xl font-medium text-gray-800">사용 기록</h2>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {historyData.length > 0 ? (
                        <div className="space-y-6">
                            {historyData.map((item) => (
                                <div key={item.id} className="border-b border-gray-100 pb-4 last:border-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="text-sm text-gray-800 font-medium">
                                            {item.start} → {item.end}
                                        </div>
                                        <button className="bg-[#FF7F00] text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-orange-600 transition-colors">
                                            불러오기
                                        </button>
                                    </div>
                                    <div className="flex justify-end">
                                         <button 
                                            onClick={() => deleteHistoryItem(item.id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1 text-xs px-1 py-1"
                                        >
                                            <Trash2 size={12} /> 삭제
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center opacity-40 pb-20">
                            <CircleAlert size={48} className="text-gray-400 mb-3" />
                            <p className="text-gray-500 text-sm">사용 기록이 없습니다.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // DELETE_ALL_CONFIRM View
    if (currentView === 'DELETE_ALL_CONFIRM') {
        return (
             <div className="flex flex-col h-full bg-white font-sans animate-slide-left items-center justify-center px-6">
                <div className="mb-6">
                    {/* Placeholder for the warning image/icon mentioned by user */}
                    {/* Using a large exclamation or similar icon */}
                    <CircleAlert size={64} className="text-[#FF7F00] opacity-80" strokeWidth={1.5} />
                </div>
                
                <h2 className="text-xl font-medium text-gray-800 mb-4">정말로 삭제하시겠습니까?</h2>
                
                <p className="text-sm text-gray-500 text-center leading-relaxed mb-8 max-w-[280px]">
                    지금까지 사용한 위치 및 장소가 전부 삭제 됩니다.<br/>
                    사용한 위치 및 장소를 보시려면 설정 → 사용 기록 보기를 눌러주세요.
                </p>

                <div className="flex gap-4 w-full justify-center">
                    <button 
                        onClick={deleteAllHistory}
                        className="w-32 py-3 bg-[#FF7F00] text-white rounded-lg font-bold text-sm hover:bg-orange-600 transition-colors"
                    >
                        예
                    </button>
                    <button 
                        onClick={() => setCurrentView('SETTINGS')}
                        className="w-32 py-3 bg-[#FFB366] text-white rounded-lg font-bold text-sm hover:bg-orange-400 transition-colors"
                    >
                        아니오
                    </button>
                </div>
             </div>
        );
    }

    // SETTINGS View
    if (currentView === 'SETTINGS') {
        return (
            <div className="flex flex-col h-full bg-white font-sans animate-slide-left">
                <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                    <button 
                        onClick={() => setCurrentView('MAIN')}
                        className="p-1 -ml-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h2 className="text-2xl font-bold text-gray-800">설정</h2>
                </div>
                
                <div className="flex-1">
                    <ul className="divide-y divide-gray-100">
                        <li>
                            <button 
                                onClick={() => setCurrentView('LOCATION_SETTING')}
                                className="w-full flex items-center justify-between p-6 hover:bg-gray-50 text-left transition-colors group"
                            >
                                <div className="flex flex-col gap-1 pr-4">
                                    <span className="text-base font-medium text-gray-800">접속 위치 설정</span>
                                    <span className="text-xs text-gray-400 leading-relaxed">
                                        접속 위치가 정상적이지 않을 경우, 지도를 옮겨 접속 위치를 직접 설정할 수 있습니다.
                                    </span>
                                </div>
                                <ChevronRight size={20} className="text-gray-300 group-hover:text-[#FF7F00]" />
                            </button>
                        </li>
                        <li>
                            <button 
                                onClick={() => setCurrentView('HISTORY')}
                                className="w-full flex items-center justify-between p-6 hover:bg-gray-50 text-left transition-colors group"
                            >
                                <span className="text-base font-medium text-gray-800">사용 기록 보기</span>
                                <ChevronRight size={20} className="text-gray-300 group-hover:text-[#FF7F00]" />
                            </button>
                        </li>
                        <li>
                            <button 
                                onClick={() => setCurrentView('DELETE_ALL_CONFIRM')}
                                className="w-full flex items-center justify-between p-6 hover:bg-gray-50 text-left transition-colors group"
                            >
                                <span className="text-base font-medium text-gray-800">사용 기록 전체 삭제</span>
                                <ChevronRight size={20} className="text-gray-300 group-hover:text-[#FF7F00]" />
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        );
    }

    // MAIN View
    return (
        <div className="flex flex-col h-full bg-white font-sans">
            {/* Profile / Login Header */}
            <div className="p-8 flex flex-col items-center border-b border-gray-100">
                <div className="w-20 h-20 bg-gray-200 rounded-full mb-4 flex items-center justify-center text-gray-400">
                    <UserCircle size={64} strokeWidth={1} />
                </div>
                <h2 className="text-xl font-light text-gray-400">로그인이 필요합니다</h2>
            </div>

            {/* Menu List */}
            <div className="flex-1 p-4">
                <ul className="space-y-1">
                    {mainMenuItems.map((item, idx) => (
                        <li key={idx}>
                            <button 
                                onClick={item.action}
                                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg text-gray-700 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon size={20} strokeWidth={1.5} />
                                    <span className="text-sm font-medium">{item.label}</span>
                                </div>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Footer Version Info */}
            <div className="p-6 text-xs text-gray-300 text-center">
                v1.0.2 Beta
            </div>
        </div>
    );
};

export default MorePanel;