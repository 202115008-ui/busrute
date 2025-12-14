import { BusHistory, ChatMessage, WeatherDay } from "./types";

export const THEME_ORANGE = '#FF7F00';

export const WEATHER_FORECAST: WeatherDay[] = [
    { day: 'Today', icon: 'cloud-rain', min: -1, max: 4, condition: 'Rainy' },
    { day: 'Wed', icon: 'sun', min: 1, max: 10, condition: 'Sunny' },
    { day: 'Thu', icon: 'cloud', min: 2, max: 9, condition: 'Cloudy' },
    { day: 'Fri', icon: 'cloud-rain', min: -1, max: 7, condition: 'Rainy' },
    { day: 'Sat', icon: 'cloud-snow', min: -4, max: 4, condition: 'Snow' },
    { day: 'Sun', icon: 'sun', min: 1, max: 10, condition: 'Sunny' },
    { day: 'Mon', icon: 'cloud', min: 2, max: 9, condition: 'Cloudy' },
];

export const RECENT_BUSES: BusHistory[] = [
    { id: '1', name: '14 (Direction Bangadari Park)', type: 'bus' },
    { id: '2', name: '700 (Jeonui Eup-nae)', type: 'bus' },
    { id: '3', name: '2 (Dujeong Station)', type: 'bus' },
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
    {
        id: '1',
        sender: 'user',
        type: 'text',
        text: 'Show me the way from Cheonan Terminal to Baekseok University.'
    },
    {
        id: '2',
        sender: 'ai',
        type: 'text',
        text: 'Since it is currently raining, I recommend the route with the least walking.'
    },
    {
        id: '3',
        sender: 'ai',
        type: 'route-card',
        routeData: {
            busNumber: '14',
            time: 25,
            cost: 1400,
            tags: ['Min Walking', 'Frequent'],
            color: 'bg-blue-500'
        }
    },
    {
        id: '4',
        sender: 'ai',
        type: 'route-card',
        routeData: {
            busNumber: '700',
            time: 22,
            cost: 1400,
            tags: ['Fastest'],
            color: 'bg-green-500'
        }
    }
];