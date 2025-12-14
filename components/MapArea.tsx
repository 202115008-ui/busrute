import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpDown, Plus, Minus, Crosshair, Search, Star, X, MapPin, Navigation, Bus, Train, Clock, ChevronDown, ChevronUp, List } from 'lucide-react';
import { Map, MapMarker, useMap, Polyline, CustomOverlayMap } from 'react-kakao-maps-sdk';
import { LocationMode } from '../types';

declare global {
    interface Window {
        kakao: any;
    }
}

interface MapAreaProps {
    locationMode?: LocationMode;
}

// 경로 구간 타입 정의
interface RouteSegment {
    type: 'WALK' | 'BUS' | 'SUBWAY';
    path: {lat: number, lng: number}[];
    laneName?: string; 
    color?: string;
    startName?: string; // 출발 정류장 이름
    stations?: { name: string; lat: number; lng: number }[]; // 정류장 리스트
}

const MapArea: React.FC<MapAreaProps> = ({ locationMode = 'AUTO' }) => {
    const mapRef = useRef<kakao.maps.Map>(null);
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [center, setCenter] = useState({ lat: 36.815, lng: 127.113 });
    const [level, setLevel] = useState(4); // 줌 레벨 (낮을수록 확대)

    const [startLocation, setStartLocation] = useState('');
    const [endLocation, setEndLocation] = useState('');
    const [startCoord, setStartCoord] = useState<{lat: number, lng: number} | null>(null);
    const [endCoord, setEndCoord] = useState<{lat: number, lng: number} | null>(null);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [activeField, setActiveField] = useState<'START' | 'END' | null>(null);
    
    const [activeOverlay, setActiveOverlay] = useState<{ lat: number; lng: number; name: string; address: string; } | null>(null);
    const [allPaths, setAllPaths] = useState<any[]>([]); 
    const [selectedPathIndex, setSelectedPathIndex] = useState<number | null>(null);
    const [routeSegments, setRouteSegments] = useState<RouteSegment[]>([]);
    
    // 경로 리스트 UI 상태
    const [isPathListVisible, setIsPathListVisible] = useState(false);
    const [hasSearchResults, setHasSearchResults] = useState(false);
    const [isLoadingPath, setIsLoadingPath] = useState(false);

    useEffect(() => {
        const scriptId = 'kakao-map-script';
        if (document.getElementById(scriptId)) {
            if (window.kakao && window.kakao.maps) setIsMapLoaded(true);
            return;
        }
        const script = document.createElement('script');
        script.id = scriptId;
        const apiKey = (import.meta as any).env?.VITE_KAKAO_MAP_KEY || '';
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services,clusterer&autoload=false`;
        script.onload = () => {
            if (window.kakao && window.kakao.maps) window.kakao.maps.load(() => setIsMapLoaded(true));
        };
        document.head.appendChild(script);
    }, []);

    // 1. 검색 기능
    const searchPlacesReal = (keyword: string) => {
        if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) return;
        const ps = new window.kakao.maps.services.Places();
        
        const currentCenter = mapRef.current ? mapRef.current.getCenter() : new window.kakao.maps.LatLng(center.lat, center.lng);
        const searchOptions = {
            location: currentCenter,
            sort: window.kakao.maps.services.SortBy.ACCURACY
        };

        ps.keywordSearch(keyword, (data: any, status: any) => {
            if (status === window.kakao.maps.services.Status.OK) {
                setSuggestions(data);
            } else {
                setSuggestions([]);
            }
        }, searchOptions);
    };

    const handleInputChange = (type: 'START' | 'END', value: string) => {
        if (type === 'START') setStartLocation(value);
        else setEndLocation(value);
        setActiveField(type);
        if (value.trim().length > 0 && isMapLoaded) {
            searchPlacesReal(value);
        } else {
            setSuggestions([]);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent, type: 'START' | 'END') => {
        if (e.key === 'Enter' && suggestions.length > 0) {
            handleSelectSuggestion(suggestions[0]);
            e.currentTarget.blur();
        }
    };

    const handleSelectSuggestion = (place: any) => {
        const lat = parseFloat(place.y);
        const lng = parseFloat(place.x);
        
        if (activeField === 'START') {
            setStartLocation(place.place_name);
            setStartCoord({ lat, lng });
        } else {
            setEndLocation(place.place_name);
            setEndCoord({ lat, lng });
        }

        setSuggestions([]); 
        setActiveField(null);
        setCenter({ lat, lng });
        setActiveOverlay({ lat, lng, name: place.place_name, address: place.road_address_name || place.address_name });
    };

    // 2. 경로 탐색 (ODsay Search)
    const findPath = async () => {
        if (!startCoord || !endCoord) {
            alert("출발지와 도착지를 모두 설정해주세요!");
            return;
        }

        const rawApiKey = "ooE65C4BNp0fvBeSsI/Zpg";
        const apiKey = encodeURIComponent(rawApiKey);
        // 프록시(/odsay)를 쓰지 않고 직접 찌릅니다.
        const url = `https://api.odsay.com/v1/api/searchPubTransPathT?SX=${startCoord.lng}&SY=${startCoord.lat}&EX=${endCoord.lng}&EY=${endCoord.lat}&apiKey=${apiKey}`;
        try {
            const response = await fetch(url);
            const data = await response.json();

            if (!data.result || !data.result.path || data.result.path.length === 0) {
                alert("대중교통 경로를 찾을 수 없습니다.");
                return;
            }

            setAllPaths(data.result.path);
            setIsPathListVisible(true);
            setHasSearchResults(true);
            
            // 첫 번째 경로 자동 선택
            loadDetailedRoute(data.result.path[0], 0);

        } catch (error) {
            console.error(error);
            alert("경로 검색 중 오류가 발생했습니다.");
        }
    };

    // 3. 상세 경로 로딩 (ODsay LoadLane)
    const loadDetailedRoute = async (pathData: any, index: number) => {
        setSelectedPathIndex(index);
        setIsLoadingPath(true);

        const rawApiKey = "ooE65C4BNp0fvBeSsI/Zpg";
        const apiKey = encodeURIComponent(rawApiKey);
        const mapObj = pathData.info.mapObj;
        const laneUrl = `/odsay/v1/api/loadLane?mapObject=0:0@${mapObj}&apiKey=${apiKey}`;

        try {
            const response = await fetch(laneUrl);
            const data = await response.json();
            const laneData = data.result?.lane;
            const parsedSegments: RouteSegment[] = [];
            let laneIndex = 0;

            if (pathData.subPath) {
                pathData.subPath.forEach((sub: any) => {
                    // 버스(2) 또는 지하철(1)
                    if (sub.trafficType === 1 || sub.trafficType === 2) {
                        const detailedPath: {lat: number, lng: number}[] = [];
                        const stations: {name: string, lat: number, lng: number}[] = [];

                        // 정류장 정보 수집 (줌 확대 시 보여줄 데이터)
                        if (sub.passStopList?.stations) {
                            sub.passStopList.stations.forEach((station: any) => {
                                const lat = parseFloat(station.y);
                                const lng = parseFloat(station.x);
                                if (!isNaN(lat) && !isNaN(lng)) {
                                    stations.push({ name: station.stationName, lat, lng });
                                }
                            });
                        }
                        
                        // 상세 경로 그래픽 데이터
                        if (laneData && laneData[laneIndex] && laneData[laneIndex].section) {
                            laneData[laneIndex].section.forEach((sec: any) => {
                                if (sec.graphPos) {
                                    sec.graphPos.forEach((pos: any) => {
                                        if (!isNaN(pos.x) && !isNaN(pos.y)) {
                                            detailedPath.push({ lat: pos.y, lng: pos.x });
                                        }
                                    });
                                }
                            });
                            laneIndex++;
                        } 
                        
                        // Fallback: 상세 데이터 없으면 정류장 좌표 사용
                        if (detailedPath.length === 0 && stations.length > 0) {
                            stations.forEach(s => detailedPath.push({ lat: s.lat, lng: s.lng }));
                        }

                        let color = "#3B82F6"; 
                        let laneName = "경로";
                        
                        if (sub.lane && sub.lane.length > 0) {
                            laneName = sub.lane[0].busNo || sub.lane[0].name;
                            if (sub.trafficType === 1) color = "#FF9500"; 
                            else if (sub.lane[0].type === 12) color = "#10B981"; 
                            else if (sub.lane[0].type === 11) color = "#3B82F6"; 
                            else if (sub.lane[0].type === 14) color = "#EF4444"; 
                        }

                        if (detailedPath.length > 0) {
                            parsedSegments.push({
                                type: sub.trafficType === 1 ? 'SUBWAY' : 'BUS',
                                path: detailedPath,
                                laneName: laneName,
                                startName: sub.startName, // 출발 정류장 이름
                                color: color,
                                stations: stations // 정류장 리스트 저장
                            });
                        }

                    } else if (sub.trafficType === 3) { // 도보
                        const startY = parseFloat(sub.startY);
                        const startX = parseFloat(sub.startX);
                        const endY = parseFloat(sub.endY);
                        const endX = parseFloat(sub.endX);
                        
                        if (!isNaN(startY) && !isNaN(startX) && !isNaN(endY) && !isNaN(endX)) {
                            parsedSegments.push({
                                type: 'WALK',
                                path: [{ lat: startY, lng: startX }, { lat: endY, lng: endX }]
                            });
                        }
                    }
                });
            }

            setRouteSegments(parsedSegments);
            setActiveOverlay(null);

            // 지도 범위 조정
            if (mapRef.current && parsedSegments.length > 0) {
                const bounds = new window.kakao.maps.LatLngBounds();
                bounds.extend(new window.kakao.maps.LatLng(startCoord!.lat, startCoord!.lng));
                bounds.extend(new window.kakao.maps.LatLng(endCoord!.lat, endCoord!.lng));
                parsedSegments.forEach(seg => {
                    for(let i=0; i<seg.path.length; i+=10) {
                        bounds.extend(new window.kakao.maps.LatLng(seg.path[i].lat, seg.path[i].lng));
                    }
                });
                mapRef.current.setBounds(bounds);
            }

        } catch (error) {
            console.error("Route Detail Error:", error);
            alert("상세 경로를 불러오는 중 문제가 발생했습니다.");
        } finally {
            setIsLoadingPath(false);
        }
    };

    const handleSwap = () => {
        setStartLocation(endLocation);
        setStartCoord(endCoord);
        setEndLocation(startLocation);
        setEndCoord(startCoord);
    };

    const ZoomControl = () => {
        const map = useMap();
        return (
            <div className="flex flex-col bg-white rounded-md shadow-md overflow-hidden border border-gray-100">
                <button className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 border-b" onClick={() => map.setLevel(map.getLevel() - 1)}><Plus size={18} /></button>
                <button className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50" onClick={() => map.setLevel(map.getLevel() + 1)}><Minus size={18} /></button>
            </div>
        );
    };

    return (
        <div className="flex-1 relative bg-[#e8e8e5] overflow-hidden h-full w-full">
            {!isMapLoaded ? (
                <div className="w-full h-full flex items-center justify-center text-gray-500">지도를 불러오는 중...</div>
            ) : (
                <Map
                    ref={mapRef}
                    center={center}
                    style={{ width: "100%", height: "100%" }}
                    level={level}
                    onZoomChanged={(map) => setLevel(map.getLevel())}
                    onClick={(_t, mouseEvent) => {}}
                    isPanto={true}
                >
                    {locationMode === 'MANUAL' && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[100]">
                             <MapPin size={48} className="text-[#00D26A] fill-current drop-shadow-xl pb-4" />
                        </div>
                    )}

                    {/* ▼▼▼ 경로 및 정보창 그리기 ▼▼▼ */}
                    {routeSegments.map((segment, index) => (
                        <React.Fragment key={index}>
                            {/* 1. 경로선 (도보는 점선, 버스는 실선) */}
                            <Polyline
                                path={[segment.path]}
                                strokeWeight={segment.type === 'WALK' ? 5 : 7}
                                strokeColor={segment.type === 'WALK' ? '#888888' : (segment.color || '#3B82F6')}
                                strokeOpacity={segment.type === 'WALK' ? 0.7 : 1}
                                strokeStyle={segment.type === 'WALK' ? 'shortdot' : 'solid'} // ★ 도보는 점선
                            />
                            
                            {/* 2. 환승/탑승 정보 (줌 레벨 상관없이 항상 표시) */}
                            {/* 버스나 지하철의 '시작점'에 버스번호+정류장명 말풍선 */}
                            {(segment.type === 'BUS' || segment.type === 'SUBWAY') && segment.path.length > 0 && (
                                <CustomOverlayMap
                                    position={segment.path[0]}
                                    yAnchor={1.6}
                                    zIndex={30} // 가장 위에 표시
                                >
                                    <div className="flex flex-col items-center animate-fade-in-up">
                                        <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg shadow-lg border border-gray-200 cursor-pointer hover:scale-105 transition-transform">
                                            <div className="flex items-center gap-1 font-bold" style={{ color: segment.color }}>
                                                {segment.type === 'BUS' ? <Bus size={14} /> : <Train size={14} />}
                                                <span className="text-[13px] whitespace-nowrap">{segment.laneName}</span>
                                            </div>
                                            {segment.startName && (
                                                <>
                                                    <div className="w-[1px] h-3 bg-gray-300 mx-1"></div>
                                                    <span className="text-[12px] font-medium text-gray-700 whitespace-nowrap">
                                                        {segment.startName}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white -mt-[1px] drop-shadow-sm"></div>
                                        <div className="w-3 h-3 bg-white border-2 border-gray-500 rounded-full mt-1 shadow-sm"></div>
                                    </div>
                                </CustomOverlayMap>
                            )}

                            {/* 3. 줌 확대 시(100m, 레벨 4 이하) 정류장 이름 표시 */}
                            {level <= 4 && segment.stations && segment.stations.map((station, sIdx) => (
                                <CustomOverlayMap key={`${index}-${sIdx}`} position={{ lat: station.lat, lng: station.lng }} yAnchor={1} zIndex={10}>
                                    <div className="flex flex-col items-center group">
                                        <div className="w-2 h-2 bg-white border-2 border-gray-400 rounded-full mb-1"></div>
                                        <span className="text-[11px] text-gray-600 bg-white/90 px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap border border-gray-100 -mt-1">
                                            {station.name}
                                        </span>
                                    </div>
                                </CustomOverlayMap>
                            ))}
                        </React.Fragment>
                    ))}

                    {/* 오버레이 (검색 마커) */}
                    {activeOverlay && (
                        <>
                             <MapMarker 
                                position={{ lat: activeOverlay.lat, lng: activeOverlay.lng }}
                                image={{
                                    src: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png", 
                                    size: { width: 24, height: 35 }
                                }}
                            />
                            <CustomOverlayMap position={{ lat: activeOverlay.lat, lng: activeOverlay.lng }} yAnchor={1.4} zIndex={9999}>
                                <div className="bg-white rounded-[16px] shadow-[0_4px_16px_rgba(0,0,0,0.2)] p-4 min-w-[260px] relative animate-fade-in-up">
                                    <button onClick={() => setActiveOverlay(null)} className="absolute top-4 right-4 text-gray-300 hover:text-gray-600">
                                        <X size={18} />
                                    </button>
                                    <div className="mb-4 pr-6">
                                        <h3 className="text-[16px] font-bold text-[#242424] mb-1">{activeOverlay.name}</h3>
                                        <p className="text-[13px] text-[#8f8f8f]">{activeOverlay.address}</p>
                                    </div>
                                    <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white transform rotate-45 z-[-1]"></div>
                                </div>
                            </CustomOverlayMap>
                        </>
                    )}

                    <div className="absolute bottom-8 right-6 z-20 flex flex-col gap-2">
                        <ZoomControl />
                    </div>
                </Map>
            )}

            {/* ▼▼▼ UI 패널 ▼▼▼ */}
            <div className="absolute top-4 right-4 z-20 w-[380px] flex flex-col gap-3 max-h-[calc(100vh-40px)] pointer-events-none">
                
                {/* 검색창 */}
                <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-4 flex flex-col gap-2 pointer-events-auto">
                    <div className="flex items-center gap-3 px-3 h-11 bg-[#F8F9FA] rounded-lg border border-transparent focus-within:border-[#007AFF] focus-within:bg-white transition-all">
                        <div className="text-[12px] font-bold text-[#007AFF] w-8 text-center shrink-0">출발</div>
                        <input type="text" value={startLocation} onChange={(e) => handleInputChange('START', e.target.value)} onKeyDown={(e) => handleKeyDown(e, 'START')} placeholder="출발지 검색" className="flex-1 text-[14px] bg-transparent focus:outline-none text-[#333]" />
                        {startLocation && <X size={16} className="text-gray-400 cursor-pointer hover:text-gray-600" onClick={() => {setStartLocation(''); setStartCoord(null);}} />}
                    </div>
                    
                    <div className="flex items-center gap-3 px-3 h-11 bg-[#F8F9FA] rounded-lg border border-transparent focus-within:border-[#FF3B30] focus-within:bg-white transition-all">
                        <div className="text-[12px] font-bold text-[#FF3B30] w-8 text-center shrink-0">도착</div>
                        <input type="text" value={endLocation} onChange={(e) => handleInputChange('END', e.target.value)} onKeyDown={(e) => handleKeyDown(e, 'END')} placeholder="도착지 검색" className="flex-1 text-[14px] bg-transparent focus:outline-none text-[#333]" />
                        {endLocation && <X size={16} className="text-gray-400 cursor-pointer hover:text-gray-600" onClick={() => {setEndLocation(''); setEndCoord(null);}} />}
                    </div>

                    <div className="flex gap-2 mt-1">
                        <button 
                            onClick={findPath} 
                            disabled={!startCoord || !endCoord || isLoadingPath} 
                            className={`flex-1 py-3 rounded-lg font-bold text-white flex items-center justify-center gap-2 transition-all shadow-sm text-[15px] ${(!startCoord || !endCoord || isLoadingPath) ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#00D26A] hover:bg-[#00b058] hover:shadow'}`}
                        >
                            {isLoadingPath ? '경로 불러오는 중...' : <><Navigation size={18} /> 길찾기</>}
                        </button>
                         <button onClick={handleSwap} className="w-12 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-600 border border-gray-200 transition-colors"><ArrowUpDown size={20} /></button>
                    </div>

                    {suggestions.length > 0 && activeField && (
                        <div className="absolute top-[150px] left-0 w-full bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 max-h-[360px] overflow-y-auto animate-fade-in-down">
                            <ul>
                                {suggestions.map((place, idx) => (
                                    <li key={idx} onMouseDown={() => handleSelectSuggestion(place)} className="px-5 py-3.5 hover:bg-[#F2F4F6] cursor-pointer border-b border-gray-50 last:border-0 flex items-start gap-3 transition-colors group">
                                        <div className="mt-1 text-gray-400 group-hover:text-[#007AFF]"><MapPin size={18} /></div>
                                        <div className="flex flex-col gap-0.5 overflow-hidden">
                                            <span className="text-[15px] font-semibold text-[#333] truncate" dangerouslySetInnerHTML={{ __html: place.place_name }}></span>
                                            <span className="text-[12px] text-gray-500 truncate">{place.road_address_name || place.address_name}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* ▼▼▼ [수정됨] 경로 리스트 다시 열기 버튼 (닫혔을 때 표시) ▼▼▼ */}
                {hasSearchResults && !isPathListVisible && (
                    <button 
                        onClick={() => setIsPathListVisible(true)}
                        className="pointer-events-auto self-end bg-white px-4 py-2.5 rounded-full shadow-lg border border-gray-200 flex items-center gap-2 text-sm font-bold text-[#007AFF] hover:bg-gray-50 transition-all"
                    >
                        <List size={16} /> 추천 경로 목록 보기 ({allPaths.length})
                    </button>
                )}

                {/* 경로 리스트 */}
                {isPathListVisible && allPaths.length > 0 && (
                    <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden pointer-events-auto flex flex-col max-h-[400px]">
                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <span className="font-bold text-gray-700">추천 경로 {allPaths.length}개</span>
                            <button onClick={() => setIsPathListVisible(false)} className="text-xs text-gray-400 hover:text-gray-600">닫기</button>
                        </div>
                        <div className="overflow-y-auto">
                            {allPaths.map((path, index) => {
                                const isSelected = selectedPathIndex === index;
                                const info = path.info;
                                const routeSummary = path.subPath
                                    .filter((s:any) => s.trafficType === 1 || s.trafficType === 2)
                                    .map((s:any) => s.lane?.[0]?.busNo || s.lane?.[0]?.name)
                                    .join(' → ');

                                return (
                                    <div key={index} onClick={() => loadDetailedRoute(path, index)} className={`px-5 py-4 border-b border-gray-50 cursor-pointer transition-colors relative ${isSelected ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}>
                                        {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#007AFF]"></div>}
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[22px] font-bold text-[#333]">{info.totalTime}<span className="text-[14px] font-normal text-gray-600 ml-0.5">분</span></span>
                                            </div>
                                            {index === 0 && <span className="bg-[#00D26A] text-white text-[10px] px-1.5 py-0.5 rounded font-bold">최적</span>}
                                        </div>
                                        <div className="flex flex-col gap-1.5 mb-2">
                                            <div className="text-[13px] font-bold text-[#007AFF] truncate">{routeSummary}</div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-400">환승 {info.busTransitCount + info.subwayTransitCount - 1}회</span>
                                                <span className="text-xs text-gray-400">도보 {info.totalWalk}m</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center text-xs text-gray-500 gap-1">
                                            <Clock size={12} />
                                            <span>도착 예정: {new Date(new Date().getTime() + info.totalTime * 60000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MapArea;