/**
 * WMO Weather interpretation codes (WW)
 * https://open-meteo.com/en/docs/historical-weather-api
 */
export function mapWmoToCategory(code: number): string {
  if (code === 0 || code === 1) return "sunny";
  if (code === 2 || code === 3) return "cloudy";
  if (code >= 45 && code <= 48) return "cloudy"; // Fog
  if (code >= 51 && code <= 67) return "rainy"; // Drizzle/Rain
  if (code >= 80 && code <= 82) return "rainy"; // Rain showers
  if (code >= 95) return "rainy"; // Thunderstorm
  return "sunny"; // Default
}

/**
 * Fetches historical weather for a specific date in Tel Aviv.
 * @param date ISO string or Date object
 */
export async function getHistoricalWeather(date: string | Date): Promise<string> {
  const d = new Date(date);
  const dateStr = d.toISOString().split("T")[0];
  
  // Default coordinates for Tel Aviv
  const lat = 32.0853;
  const lon = 34.7818;
  
  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${dateStr}&end_date=${dateStr}&daily=weathercode`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.daily && data.daily.weathercode && data.daily.weathercode.length > 0) {
      const code = data.daily.weathercode[0];
      return mapWmoToCategory(code);
    }
  } catch (error) {
    console.error("Error fetching weather:", error);
  }
  
  return "sunny";
}
