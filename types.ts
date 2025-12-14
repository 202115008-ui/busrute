export enum NavTab {
    CHAT = 'CHAT',
    BUS = 'BUS',
    FAVORITES = 'FAVORITES',
    WEATHER = 'WEATHER',
    MORE = 'MORE'
}

export interface WeatherDay {
    day: string;
    icon: string;
    min: number;
    max: number;
    condition: string;
}

export interface ChatMessage {
    id: string;
    sender: 'user' | 'ai';
    text?: string;
    type: 'text' | 'route-card';
    routeData?: RouteRecommendation;
}

export interface RouteRecommendation {
    busNumber: string;
    time: number; // minutes
    cost: number;
    tags: string[]; // e.g., "Min Walking", "Fastest"
    color: string;
}

export interface BusHistory {
    id: string;
    name: string;
    type: 'bus' | 'stop';
}

export type LocationMode = 'AUTO' | 'MANUAL';
