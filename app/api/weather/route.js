import { NextResponse } from 'next/server';

// WMO Weather Interpretation Codes (WW)
const WMO_CODES = {
  0: { label: 'Clear Sky', dayIcon: '☀️', nightIcon: '🌙' },
  1: { label: 'Mainly Clear', dayIcon: '🌤️', nightIcon: '🌤️' },
  2: { label: 'Partly Cloudy', dayIcon: '⛅', nightIcon: '☁️' },
  3: { label: 'Overcast', dayIcon: '☁️', nightIcon: '☁️' },
  45: { label: 'Foggy', dayIcon: '🌫️', nightIcon: '🌫️' },
  48: { label: 'Depositing Rime Fog', dayIcon: '🌫️', nightIcon: '🌫️' },
  51: { label: 'Light Drizzle', dayIcon: '🌦️', nightIcon: '🌧️' },
  53: { label: 'Moderate Drizzle', dayIcon: '🌦️', nightIcon: '🌧️' },
  55: { label: 'Dense Drizzle', dayIcon: '🌧️', nightIcon: '🌧️' },
  56: { label: 'Light Freezing Drizzle', dayIcon: '🌧️', nightIcon: '🌧️' },
  57: { label: 'Dense Freezing Drizzle', dayIcon: '🌧️', nightIcon: '🌧️' },
  61: { label: 'Slight Rain', dayIcon: '🌦️', nightIcon: '🌧️' },
  63: { label: 'Moderate Rain', dayIcon: '🌧️', nightIcon: '🌧️' },
  65: { label: 'Heavy Rain', dayIcon: '🌧️', nightIcon: '🌧️' },
  66: { label: 'Light Freezing Rain', dayIcon: '🌧️', nightIcon: '🌧️' },
  67: { label: 'Heavy Freezing Rain', dayIcon: '🌧️', nightIcon: '🌧️' },
  71: { label: 'Slight Snow Fall', dayIcon: '🌨️', nightIcon: '🌨️' },
  73: { label: 'Moderate Snow Fall', dayIcon: '🌨️', nightIcon: '🌨️' },
  75: { label: 'Heavy Snow Fall', dayIcon: '❄️', nightIcon: '❄️' },
  77: { label: 'Snow Grains', dayIcon: '❄️', nightIcon: '❄️' },
  80: { label: 'Slight Rain Showers', dayIcon: '🌦️', nightIcon: '🌧️' },
  81: { label: 'Moderate Rain Showers', dayIcon: '🌧️', nightIcon: '🌧️' },
  82: { label: 'Violent Rain Showers', dayIcon: '⛈️', nightIcon: '⛈️' },
  85: { label: 'Slight Snow Showers', dayIcon: '🌨️', nightIcon: '🌨️' },
  86: { label: 'Heavy Snow Showers', dayIcon: '❄️', nightIcon: '❄️' },
  95: { label: 'Thunderstorm', dayIcon: '⛈️', nightIcon: '⛈️' },
  96: { label: 'Thunderstorm with Slight Hail', dayIcon: '⛈️', nightIcon: '⛈️' },
  99: { label: 'Thunderstorm with Heavy Hail', dayIcon: '⛈️', nightIcon: '⛈️' },
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    // Default to station coordinates in Kerala, India if not provided
    const lat = searchParams.get('lat') || '10.028079';
    const lng = searchParams.get('lng') || '76.2260241';

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(
      lat
    )}&longitude=${encodeURIComponent(
      lng
    )}&current_weather=true&hourly=relative_humidity_2m&timezone=auto`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 300 }, // Cache weather for 5 minutes
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Open-Meteo returned status ${res.status}`);
    }

    const data = await res.json();
    const current = data.current_weather || {};
    const weatherCode = current.weathercode ?? 0;
    const isDay = current.is_day === 1;
    const weatherMeta = WMO_CODES[weatherCode] || {
      label: 'Clear',
      dayIcon: '☀️',
      nightIcon: '🌙',
    };

    // Calculate approximate current relative humidity if hourly is available
    let humidity = null;
    if (data.hourly?.time && data.hourly?.relative_humidity_2m && current.time) {
      const idx = data.hourly.time.indexOf(current.time);
      if (idx !== -1) {
        humidity = data.hourly.relative_humidity_2m[idx];
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        temperature: typeof current.temperature === 'number' ? Math.round(current.temperature * 10) / 10 : null,
        unit: '°C',
        condition: weatherMeta.label,
        icon: isDay ? weatherMeta.dayIcon : weatherMeta.nightIcon,
        windSpeed: current.windspeed ?? null,
        windUnit: 'km/h',
        humidity: humidity !== null ? `${humidity}%` : null,
        isDay,
        time: current.time,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Weather API error:', error.message);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch weather data',
      },
      { status: 500 }
    );
  }
}

