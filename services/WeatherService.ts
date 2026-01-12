// WeatherService.ts - Real-time weather using Open-Meteo API (free, no key required)

interface WeatherData {
    temperature: number;
    condition: string;
    icon: string;
    humidity: number;
    description: string;
}

interface CachedWeather {
    data: WeatherData;
    timestamp: number;
}

const CACHE_TTL = 60 * 60 * 1000; // 1 hour cache
const BANGKOK_COORDS = { lat: 13.7563, lng: 100.5018 };

// Weather code to condition mapping
const weatherCodeMap: Record<number, { condition: string; icon: string; description: string }> = {
    0: { condition: '晴朗', icon: '☀️', description: 'Clear sky' },
    1: { condition: '大致晴朗', icon: '🌤️', description: 'Mainly clear' },
    2: { condition: '多雲', icon: '⛅', description: 'Partly cloudy' },
    3: { condition: '陰天', icon: '☁️', description: 'Overcast' },
    45: { condition: '霧', icon: '🌫️', description: 'Fog' },
    48: { condition: '霧凇', icon: '🌫️', description: 'Depositing rime fog' },
    51: { condition: '小雨', icon: '🌧️', description: 'Light drizzle' },
    53: { condition: '中雨', icon: '🌧️', description: 'Moderate drizzle' },
    55: { condition: '大雨', icon: '🌧️', description: 'Dense drizzle' },
    61: { condition: '小雨', icon: '🌧️', description: 'Slight rain' },
    63: { condition: '中雨', icon: '🌧️', description: 'Moderate rain' },
    65: { condition: '大雨', icon: '🌧️', description: 'Heavy rain' },
    80: { condition: '陣雨', icon: '🌦️', description: 'Rain showers slight' },
    81: { condition: '陣雨', icon: '🌦️', description: 'Rain showers moderate' },
    82: { condition: '暴雨', icon: '⛈️', description: 'Rain showers violent' },
    95: { condition: '雷暴', icon: '⛈️', description: 'Thunderstorm' },
    96: { condition: '雷暴', icon: '⛈️', description: 'Thunderstorm with hail' },
    99: { condition: '強雷暴', icon: '⛈️', description: 'Heavy thunderstorm with hail' },
};

class WeatherService {
    private cacheKey = 'tour-app-weather-cache';

    private getFromCache(): CachedWeather | null {
        try {
            const cached = localStorage.getItem(this.cacheKey);
            if (!cached) return null;

            const parsed: CachedWeather = JSON.parse(cached);
            const now = Date.now();

            // Check if cache is still valid
            if (now - parsed.timestamp < CACHE_TTL) {
                return parsed;
            }
            return null;
        } catch {
            return null;
        }
    }

    private setCache(data: WeatherData): void {
        const cached: CachedWeather = {
            data,
            timestamp: Date.now(),
        };
        localStorage.setItem(this.cacheKey, JSON.stringify(cached));
    }

    async getCurrentWeather(): Promise<WeatherData> {
        // Check cache first
        const cached = this.getFromCache();
        if (cached) {
            console.log('[WeatherService] Returning cached weather data');
            return cached.data;
        }

        try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${BANGKOK_COORDS.lat}&longitude=${BANGKOK_COORDS.lng}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=Asia%2FBangkok`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Weather API error: ${response.status}`);
            }

            const data = await response.json();
            const current = data.current;

            const weatherCode = current.weather_code || 0;
            const weatherInfo = weatherCodeMap[weatherCode] || weatherCodeMap[0];

            const weatherData: WeatherData = {
                temperature: Math.round(current.temperature_2m),
                condition: weatherInfo.condition,
                icon: weatherInfo.icon,
                humidity: current.relative_humidity_2m,
                description: weatherInfo.description,
            };

            // Cache the result
            this.setCache(weatherData);
            console.log('[WeatherService] Fetched fresh weather data:', weatherData);

            return weatherData;
        } catch (error) {
            console.error('[WeatherService] Error fetching weather:', error);

            // Return fallback data
            return {
                temperature: 32,
                condition: '晴朗',
                icon: '☀️',
                humidity: 65,
                description: 'Clear sky (offline)',
            };
        }
    }

    // Get weather for a specific date (forecast)
    async getForecast(date: string): Promise<WeatherData> {
        try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${BANGKOK_COORDS.lat}&longitude=${BANGKOK_COORDS.lng}&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=Asia%2FBangkok&start_date=${date}&end_date=${date}`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Forecast API error: ${response.status}`);
            }

            const data = await response.json();
            const daily = data.daily;

            if (!daily || !daily.temperature_2m_max || daily.temperature_2m_max.length === 0) {
                throw new Error('No forecast data available');
            }

            const weatherCode = daily.weather_code?.[0] || 0;
            const weatherInfo = weatherCodeMap[weatherCode] || weatherCodeMap[0];

            return {
                temperature: Math.round((daily.temperature_2m_max[0] + daily.temperature_2m_min[0]) / 2),
                condition: weatherInfo.condition,
                icon: weatherInfo.icon,
                humidity: 65, // Not available in daily forecast
                description: weatherInfo.description,
            };
        } catch (error) {
            console.error('[WeatherService] Error fetching forecast:', error);
            return this.getCurrentWeather(); // Fallback to current weather
        }
    }
}

export const weatherService = new WeatherService();
export type { WeatherData };
