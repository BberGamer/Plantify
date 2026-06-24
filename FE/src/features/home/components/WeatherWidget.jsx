/**
 * WeatherWidget.jsx - Widget hiển thị thông tin thời tiết
 */
import { CloudSun, Droplets, Wind, Gauge } from "lucide-react";
import { useWeather } from "../hooks";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function WeatherWidget() {
  const {
    weatherCity,
    setWeatherCity,
    weather,
    weatherLoading,
    weatherError,
    handleWeatherSearch,
  } = useWeather();

  return (
    <div className="
      relative z-20 mx-auto max-w-7xl px-6 pt-6
      lg:absolute lg:right-8 lg:top-8 lg:w-72
      xl:right-8 xl:top-16 xl:w-80
    ">
      <Card className="weather-card">
        <CardContent className="p-4">
          <div className="mb-3 flex items-center gap-2 font-semibold text-primary">
            <CloudSun className="h-4 w-4" />
            <span className="text-sm">Thời tiết chăm cây</span>
          </div>

          <form onSubmit={handleWeatherSearch} className="mb-3 flex gap-2">
            <Input
              value={weatherCity}
              onChange={(event) => setWeatherCity(event.target.value)}
              placeholder="Thành phố..."
              className="h-9 min-w-0 text-sm"
            />
            <Button type="submit" size="sm" className="h-9 px-3" disabled={weatherLoading}>
              {weatherLoading ? "..." : "Xem"}
            </Button>
          </form>

          {weatherError && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
              {weatherError}
            </div>
          )}

          {weather && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {weather.iconUrl && (
                  <img
                    src={weather.iconUrl}
                    alt={weather.description || "Weather icon"}
                    className="h-12 w-12"
                  />
                )}
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">
                    {weather.cityName}, {weather.country}
                  </div>
                  <div className="text-2xl font-bold leading-tight">
                    {Math.round(weather.temperature)}°C
                  </div>
                  <div className="truncate text-xs capitalize text-muted-foreground">
                    {weather.description}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="rounded-md bg-blue-50 p-2">
                  <div className="mb-1 flex items-center gap-1 text-muted-foreground">
                    <Droplets className="h-3.5 w-3.5 text-blue-600" />
                    Ẩm
                  </div>
                  <div className="font-semibold">{weather.humidity}%</div>
                </div>
                <div className="rounded-md bg-sky-50 p-2">
                  <div className="mb-1 flex items-center gap-1 text-muted-foreground">
                    <Wind className="h-3.5 w-3.5 text-sky-600" />
                    Gió
                  </div>
                  <div className="font-semibold">{weather.windSpeed} m/s</div>
                </div>
                <div className="rounded-md bg-amber-50 p-2">
                  <div className="mb-1 flex items-center gap-1 text-muted-foreground">
                    <Gauge className="h-3.5 w-3.5 text-amber-600" />
                    hPa
                  </div>
                  <div className="font-semibold">{weather.pressure}</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
