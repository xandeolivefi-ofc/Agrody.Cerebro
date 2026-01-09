
import { WeatherData, HourlyTemp } from '../types';

export const getWeatherDescription = (code: number): { text: string; icon: string } => {
  const mapping: Record<number, { text: string; icon: string }> = {
    0: { text: 'Céu Limpo', icon: 'fa-sun text-yellow-500' },
    1: { text: 'Principalmente Limpo', icon: 'fa-sun text-yellow-400' },
    2: { text: 'Parcialmente Nublado', icon: 'fa-cloud-sun text-yellow-500' },
    3: { text: 'Encoberto', icon: 'fa-cloud text-gray-400' },
    45: { text: 'Nevoeiro', icon: 'fa-smog text-gray-300' },
    48: { text: 'Nevoeiro Escarchado', icon: 'fa-smog text-gray-400' },
    51: { text: 'Garoa Leve', icon: 'fa-cloud-rain text-blue-300' },
    53: { text: 'Garoa Moderada', icon: 'fa-cloud-rain text-blue-400' },
    55: { text: 'Garoa Densa', icon: 'fa-cloud-showers-heavy text-blue-500' },
    61: { text: 'Chuva Leve', icon: 'fa-cloud-rain text-blue-400' },
    63: { text: 'Chuva Moderada', icon: 'fa-cloud-showers-heavy text-blue-500' },
    65: { text: 'Chuva Forte', icon: 'fa-cloud-showers-heavy text-blue-600' },
    80: { text: 'Pancadas de Chuva', icon: 'fa-cloud-showers-water text-blue-400' },
    95: { text: 'Trovoada', icon: 'fa-bolt text-yellow-600' },
  };
  return mapping[code] || { text: 'Desconhecido', icon: 'fa-question text-gray-400' };
};

export const fetchWeather = async (lat: number, lon: number): Promise<WeatherData> => {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m&daily=precipitation_probability_max&timezone=auto`;
  
  const response = await fetch(url);
  if (!response.ok) throw new Error('Falha ao buscar dados climáticos');
  
  const data = await response.json();
  const current = data.current;
  const { text, icon } = getWeatherDescription(current.weather_code);

  // Processar as próximas 24 horas de temperatura
  const hourly = data.hourly;
  const hourlyTemps: HourlyTemp[] = hourly.time.slice(0, 24).map((time: string, index: number) => ({
    time: new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    temp: Math.round(hourly.temperature_2m[index])
  }));

  return {
    temp: Math.round(current.temperature_2m),
    condition: text,
    icon: icon,
    rainProb: data.daily.precipitation_probability_max[0] || 0,
    precipitation: current.precipitation || 0,
    humidity: current.relative_humidity_2m,
    windSpeed: current.wind_speed_10m,
    apparentTemp: Math.round(current.apparent_temperature),
    hourlyTemps
  };
};
