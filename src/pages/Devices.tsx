import { useEffect, useState } from "react";
import MainLayout from "@/components/MainLayout";
import { DataTable } from "@/components/data-table";
import { queryDevices } from "@/lib/api";
import { LoadingDots } from "@/components/Loading";
import { schema } from "@/components/data-table-constants";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Clock, Settings } from "lucide-react";

const CACHE_KEY = "devicesCache";

interface Config {
  cacheEnabled: boolean;
  cacheExpiryMinutes: number;
}

interface CacheData {
  pageSize: number;
  allDevices: z.infer<typeof schema>[];
  lastFetchedPage: number;
  timestamp: number;
}

function transformDeviceData(devices: RawDevice[]): z.infer<typeof schema>[] {
  return devices.map((device: RawDevice) => {
    const virtualParameters: Record<string, string> = {};
    if (device.VirtualParameters) {
      Object.entries(device.VirtualParameters).forEach(([key, value]) => {
        virtualParameters[key] = value?._value || "";
      });
    }

    const ssid: string[] = [];
    if (device.InternetGatewayDevice?.LANDevice?.["1"]?.WLANConfiguration) {
      Object.values(
        device.InternetGatewayDevice.LANDevice["1"].WLANConfiguration
      ).forEach((config: WLANConfiguration[string]) => {
        if (config.SSID?._value) {
          ssid.push(config.SSID._value);
        }
      });
    }

    return {
      _id: device._id,
      ssid,
      oui: device._deviceId?._OUI || "",
      productClass: device._deviceId?._ProductClass || "",
      serialNumber: device._deviceId?._SerialNumber || "",
      hardwareVersion:
        device.InternetGatewayDevice?.DeviceInfo?.HardwareVersion?._value || "",
      softwareVersion:
        device.InternetGatewayDevice?.DeviceInfo?.SoftwareVersion?._value || "",
      upTime: device.InternetGatewayDevice?.DeviceInfo?.UpTime?._value || 0,
      lastInform: device._lastInform || "",
      registered: device._registered || "",
      namaPPOE: (() => {
        if (!device.VirtualParameters) return "";
        const ppoeKeys = Object.keys(device.VirtualParameters).filter(
          (key) =>
            key.toLowerCase().includes("pppoe") &&
            key.toLowerCase().includes("username")
        );
        for (const key of ppoeKeys) {
          const value = device.VirtualParameters[key]?._value;
          if (value) return value;
        }
        return "";
      })(),
      virtualParameters,
    };
  });
}

function getCache(config: Config): CacheData | null {
  if (!config.cacheEnabled) {
    // If cache is disabled, clear any existing cache
    localStorage.removeItem(CACHE_KEY);
    return null;
  }

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const data: CacheData = JSON.parse(cached);

    const expiryMs =
      config.cacheExpiryMinutes === 0
        ? 0
        : config.cacheExpiryMinutes * 60 * 1000;
    if (expiryMs > 0 && Date.now() - data.timestamp > expiryMs) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return data;
  } catch (error) {
    console.error("Error reading cache:", error);
    return null;
  }
}

function setCache(data: CacheData): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error setting cache:", error);
  }
}

function clearCache(): void {
  localStorage.removeItem(CACHE_KEY);
}

interface DeviceInfo {
  HardwareVersion?: { _value: string };
  SoftwareVersion?: { _value: string };
  UpTime?: { _value: number };
}

interface WLANConfiguration {
  [key: string]: {
    SSID?: { _value: string };
  };
}

interface LANDevice {
  [key: string]: {
    WLANConfiguration?: WLANConfiguration;
  };
}

interface InternetGatewayDevice {
  DeviceInfo?: DeviceInfo;
  LANDevice?: LANDevice;
}

interface DeviceId {
  _Manufacturer: string;
  _OUI: string;
  _ProductClass: string;
  _SerialNumber: string;
}

interface VirtualParameters {
  [key: string]: { _value: string } | undefined;
}

interface RawDevice {
  _id: string;
  InternetGatewayDevice?: InternetGatewayDevice;
  _deviceId: DeviceId;
  _lastInform: string;
  _registered: string;
  VirtualParameters?: VirtualParameters;
}

export default function DevicesPage() {
  const [data, setData] = useState<z.infer<typeof schema>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [config, setConfig] = useState<Config>({
    cacheEnabled: false,
    cacheExpiryMinutes: 0,
  });

  const { token } = useAuth();

  // Load config on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch("/api/config", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const configData = await response.json();
          setConfig({
            cacheEnabled: configData.cacheEnabled || false,
            cacheExpiryMinutes: configData.cacheExpiryMinutes || 0,
          });

          // Cache expiry time is no longer needed
        }
      } catch (error) {
        console.error("Error loading config:", error);
      }
    };
    if (token) loadConfig();
  }, [token]);

  const fetchDevices = async (
    currentPage = page,
    currentPageSize = pageSize
  ) => {
    setLoading(true);
    try {
      // Check cache first if enabled
      const cache = getCache(config);
      let allDevices: z.infer<typeof schema>[] = [];
      let lastFetchedPage = 0;

      if (cache && cache.pageSize === currentPageSize) {
        allDevices = cache.allDevices;
        lastFetchedPage = cache.lastFetchedPage;
        console.log("Using cached data up to page", lastFetchedPage);
      }

      // If we need more data (currentPage > lastFetchedPage), fetch additional pages
      if (currentPage > lastFetchedPage) {
        for (
          let pageToFetch = lastFetchedPage + 1;
          pageToFetch <= currentPage;
          pageToFetch++
        ) {
          console.log("Fetching page", pageToFetch);
          const response = await queryDevices({
            limit: currentPageSize,
            skip: (pageToFetch - 1) * currentPageSize,
          });

          const transformedData = transformDeviceData(response.data);
          allDevices = [...allDevices, ...transformedData];

          // Update total if this is the first fetch
          if (pageToFetch === 1) {
            setTotal(response.data.total || 0);
          }

          lastFetchedPage = pageToFetch;
        }

        // Update cache with new data if caching is enabled
        if (config.cacheEnabled) {
          const newCache: CacheData = {
            pageSize: currentPageSize,
            allDevices,
            lastFetchedPage,
            timestamp: Date.now(),
          };
          setCache(newCache);
        } else {
          // If caching is disabled, clear any existing cache
          clearCache();
        }
      } else {
        // Data already cached, just update total if needed
        if (allDevices.length > 0 && total === 0) {
          // We might need to fetch total separately, but for now assume it's cached
          // In a real scenario, you might want to store total in cache too
        }
      }

      // Set data for current page
      const startIndex = (currentPage - 1) * currentPageSize;
      const endIndex = startIndex + currentPageSize;
      const pageData = allDevices.slice(startIndex, endIndex);
      setData(pageData);

      console.log(
        "Displaying",
        pageData.length,
        "devices for page",
        currentPage,
        "(total cached:",
        allDevices.length,
        ")"
      );
    } catch (error) {
      console.error("Error fetching devices:", error);
      setError((error as Error).message || "Failed to fetch devices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDevices();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, config, token]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 w-full">
          <div className="min-h-screen w-full flex-1 rounded-xl bg-muted/50 md:min-h-min flex items-center justify-center">
            <LoadingDots text="Loading devices..." />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="min-h-screen flex-1 rounded-xl bg-muted/50 md:min-h-min flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-500 mb-2">Error loading devices</p>
              <p className="text-sm text-muted-foreground">{error}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Please check if the GenieACS server is running and accessible.
              </p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-1 flex-col gap-4 p-2">
        {/* Cache Banner */}
        {config.cacheEnabled && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Cache Device aktif, klik settings untuk data realtime
                </p>
                {config.cacheExpiryMinutes > 0 && (
                  <p className="text-xs text-blue-700">
                    Expires in: {config.cacheExpiryMinutes} minutes
                  </p>
                )}
              </div>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </Button>
          </div>
        )}

        <div className="min-h-screen flex-1 rounded-xl bg-muted/50 md:min-h-min p-2">
          <DataTable
            data={data}
            total={total}
            page={page}
            pageSize={pageSize}
            onPageChange={(newPage) => {
              setPage(newPage);
            }}
            onPageSizeChange={(newPageSize) => {
              // Clear cache when page size changes
              clearCache();
              setPageSize(newPageSize);
              setPage(1);
            }}
          />
        </div>
      </div>
    </MainLayout>
  );
}
