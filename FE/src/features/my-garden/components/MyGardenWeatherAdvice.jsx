import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CloudRain,
  Droplets,
  Loader2,
  MapPin,
  RefreshCw,
  ShieldAlert,
  Sun,
  Thermometer,
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

function WeatherMetric({ icon: Icon, label, value, iconClassName }) {
  return (
    <div className="rounded-xl border border-white/70 bg-white/80 p-3 shadow-sm backdrop-blur">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Icon className={`h-4 w-4 ${iconClassName}`} />
        {label}
      </div>
      <p className="mt-2 text-lg font-bold text-slate-900">{value}</p>
    </div>
  );
}

export function MyGardenWeatherAdvice() {
  const [city, setCity] = useState("Hà Nội");
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
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-white to-primary/10 shadow-sm">
      <CardContent className="p-0">
        <div className="relative overflow-hidden bg-gradient-to-r from-primary to-green-600 p-5 text-white sm:p-6">
          <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="flex items-center gap-3 text-xl font-bold sm:text-2xl">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/25 backdrop-blur-sm">
                  <CloudRain className="h-6 w-6" />
                </span>
                <span>Cảnh báo chăm cây theo thời tiết</span>
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/90">
                Phân tích riêng cho cây trong My Garden; cảnh báo mưa và nắng
                chỉ áp dụng cho cây ngoài trời.
              </p>
            </div>

            <form
              onSubmit={loadAdvice}
              className="flex w-full flex-col gap-2 rounded-2xl bg-white/10 p-2 ring-1 ring-white/20 backdrop-blur sm:flex-row lg:max-w-md"
            >
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                <Input
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  placeholder="Thành phố, ví dụ: Hà Nội"
                  className="border-0 bg-white pl-9 text-slate-900 shadow-none"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="bg-background text-primary hover:bg-background/90 sm:min-w-28"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Phân tích
              </Button>
            </form>
          </div>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          {error ? (
            <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          ) : null}

          {result?.weather ? (
            <div>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="flex items-center gap-1.5 font-semibold text-slate-900">
                    <MapPin className="h-4 w-4 text-primary" />
                    {result.weather.cityName}, {result.weather.country}
                  </p>
                  <p className="mt-1 text-sm capitalize text-muted-foreground">
                    {result.weather.description || "Thời tiết hiện tại"}
                  </p>
                </div>
                {result.generatedAt ? (
                  <p className="text-xs text-muted-foreground">
                    Cập nhật {new Date(result.generatedAt).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <WeatherMetric
                  icon={Thermometer}
                  label="Nhiệt độ"
                  value={`${Math.round(result.weather.temperature)}°C`}
                  iconClassName="text-rose-500"
                />
                <WeatherMetric
                  icon={Droplets}
                  label="Độ ẩm"
                  value={`${result.weather.humidity}%`}
                  iconClassName="text-sky-500"
                />
                <WeatherMetric
                  icon={CloudRain}
                  label="Mưa 1 giờ"
                  value={`${result.weather.rainLastHourMm ?? 0} mm`}
                  iconClassName="text-blue-600"
                />
              </div>
            </div>
          ) : null}
          {result ? (
            <div className="grid auto-rows-fr gap-3">
              {result.advice.map((item) => {
                const style = ADVICE_STYLE[item.severity] || ADVICE_STYLE.info;
                const Icon = getAdviceIcon(item.code) || style.icon;
                const isNormalCare = item.code === "normal_care";
                return (
                  <div
                    key={item.code}
                    className={`h-full rounded-2xl border p-4 shadow-sm ${
                      isNormalCare
                        ? "border-primary/20 bg-primary/5 text-foreground"
                        : style.className
                    }`}
                  >
                    <div className="flex h-full gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/70">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <p className="font-semibold">{item.title}</p>
                        <p className="mt-1 text-sm leading-6">{item.message}</p>
                        {item.plantNames?.length ? (
                          <div className="mt-auto pt-3">
                            <p className="inline-flex rounded-full bg-white/70 px-2.5 py-1 text-xs font-medium">
                              Áp dụng: {item.plantNames.join(", ")}
                            </p>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
