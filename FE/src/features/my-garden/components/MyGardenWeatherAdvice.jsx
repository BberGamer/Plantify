import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CloudRain,
  Droplets,
  Loader2,
  RefreshCw,
  ShieldAlert,
  Sun,
  Wind,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getMyGardenWeatherAdvice } from "../api";
import { getApiErrorMessage } from "../myGarden.utils";

const ADVICE_STYLE = {
  warning: {
    icon: ShieldAlert,
    className: "border-amber-200 bg-amber-50 text-amber-950",
  },
  info: {
    icon: AlertTriangle,
    className: "border-sky-200 bg-sky-50 text-sky-950",
  },
};

function getAdviceIcon(code) {
  if (code === "heavy_rain") return CloudRain;
  if (code === "hot_and_dry" || code === "high_humidity") return Droplets;
  if (code === "strong_sun" || code === "above_plant_temperature_limit") return Sun;
  if (code === "strong_wind") return Wind;
  return AlertTriangle;
}

export function MyGardenWeatherAdvice() {
  const [city, setCity] = useState("Ho Chi Minh");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadAdvice = async (event) => {
    event?.preventDefault();
    const normalizedCity = city.trim();
    if (!normalizedCity) {
      setError("Vui lòng nhập thành phố để xem khuyến nghị.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await getMyGardenWeatherAdvice(normalizedCity);
      setResult(response.data);
    } catch (requestError) {
      setError(getApiErrorMessage(
        requestError,
        "Không thể lấy khuyến nghị chăm cây theo thời tiết."
      ));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAdvice();
  }, []);

  return (
    <Card className="border-sky-200/80 bg-gradient-to-br from-sky-50 to-white">
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 font-semibold text-sky-900">
              <CloudRain className="h-5 w-5" />
              Cảnh báo chăm cây theo thời tiết
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Phân tích riêng cho cây trong My Garden; cảnh báo mưa và nắng chỉ áp dụng cho cây ngoài trời.
            </p>
          </div>
          {result?.weather ? (
            <div className="rounded-lg bg-white px-3 py-2 text-right text-sm shadow-sm">
              <p className="font-semibold">{Math.round(result.weather.temperature)}°C · {result.weather.humidity}%</p>
              <p className="text-xs text-muted-foreground">{result.weather.cityName}, {result.weather.country}</p>
            </div>
          ) : null}
        </div>

        <form onSubmit={loadAdvice} className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={city}
            onChange={(event) => setCity(event.target.value)}
            placeholder="Thành phố, ví dụ: Ho Chi Minh"
            className="bg-white"
          />
          <Button type="submit" disabled={loading} className="sm:min-w-32">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Phân tích
          </Button>
        </form>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        {result ? (
          <div className="grid gap-3 lg:grid-cols-2">
              {result.advice.map((item) => {
                const style = ADVICE_STYLE[item.severity] || ADVICE_STYLE.info;
                const Icon = getAdviceIcon(item.code) || style.icon;
                return (
                  <div key={item.code} className={`rounded-xl border p-4 ${style.className}`}>
                    <div className="flex gap-3">
                      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
                      <div>
                        <p className="font-semibold">{item.title}</p>
                        <p className="mt-1 text-sm leading-6">{item.message}</p>
                        {item.plantNames?.length ? (
                          <p className="mt-2 text-xs font-medium">Áp dụng: {item.plantNames.join(", ")}</p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
