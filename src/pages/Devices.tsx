import { useEffect, useState } from "react";
import MainLayout from "@/components/MainLayout";
import { DataTable } from "@/components/data-table";
import { queryDevices } from "@/lib/api";
import { LoadingDots } from "@/components/Loading";
import { schema } from "@/components/data-table-constants";
import { z } from "zod";

const CACHE_KEY = "devicesCache";
const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

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

function getCache(): CacheData | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const data: CacheData = JSON.parse(cached);
    if (Date.now() - data.timestamp > CACHE_EXPIRY_MS) {
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

  const fetchDevices = async (
    currentPage = page,
    currentPageSize = pageSize
  ) => {
    setLoading(true);
    try {
      // Check cache first
      const cache = getCache();
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

        // Update cache with new data
        const newCache: CacheData = {
          pageSize: currentPageSize,
          allDevices,
          lastFetchedPage,
          timestamp: Date.now(),
        };
        setCache(newCache);
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
    fetchDevices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

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
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="min-h-screen flex-1 rounded-xl bg-muted/50 md:min-h-min">
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
              setPage(1); // Reset to first page when changing page size
            }}
          />
        </div>
      </div>
    </MainLayout>
  );
}
