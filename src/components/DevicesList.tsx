import { useEffect, useState } from "react";
import { queryDevices } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconLayoutColumns } from "@tabler/icons-react";
import { LoadingDots } from "./Loading";

interface Device {
  _id: string;
  _lastInform?: string;
  _registered?: string;
  InternetGatewayDevice?: {
    DeviceInfo?: {
      SoftwareVersion?: {
        _value?: string;
      };
      HardwareVersion?: {
        _value?: string;
      };
    };
  };
  VirtualParameters?: object;
  _deviceId?: {
    _SerialNumber?: string;
    _Manufacturer?: string;
    _ProductClass?: string;
  };
}

export function DevicesList() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    serialNumber: true,
    manufacturer: true,
    productClass: true,
    softwareVersion: true,
    hardwareVersion: true,
    lastInform: true,
    registered: true,
    virtualParameters: true,
  });

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setLoading(true);
        const data = await queryDevices();
        console.log("data", data);
        setDevices(data.data);
      } catch (err) {
        console.error("Failed to fetch devices:", err);
        setError(
          "Failed to load devices. Please check if the backend is running."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  if (loading) {
    return (
      <div className="text-center">
        <LoadingDots text="Loading Devices..." />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  const columns = [
    { key: "id", label: "ID", accessor: (device: Device) => device._id },
    {
      key: "serialNumber",
      label: "Serial Number",
      accessor: (device: Device) => device._deviceId?._SerialNumber || "N/A",
    },
    {
      key: "manufacturer",
      label: "Manufacturer",
      accessor: (device: Device) => device._deviceId?._Manufacturer || "N/A",
    },
    {
      key: "productClass",
      label: "Product Class",
      accessor: (device: Device) => device._deviceId?._ProductClass || "N/A",
    },
    {
      key: "softwareVersion",
      label: "Software Version",
      accessor: (device: Device) =>
        device.InternetGatewayDevice?.DeviceInfo?.SoftwareVersion?._value ||
        "N/A",
    },
    {
      key: "hardwareVersion",
      label: "Hardware Version",
      accessor: (device: Device) =>
        device.InternetGatewayDevice?.DeviceInfo?.HardwareVersion?._value ||
        "N/A",
    },
    {
      key: "lastInform",
      label: "Last Inform",
      accessor: (device: Device) => device._lastInform || "N/A",
    },
    {
      key: "registered",
      label: "Registered",
      accessor: (device: Device) => device._registered || "N/A",
    },
    {
      key: "virtualParameters",
      label: "Virtual Parameters",
      accessor: (device: Device) =>
        device.VirtualParameters
          ? JSON.stringify(device.VirtualParameters)
          : "N/A",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Devices</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <IconLayoutColumns />
              <span className="hidden lg:inline">Customize Columns</span>
              <span className="lg:hidden">Columns</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {columns.map((column) => (
              <DropdownMenuCheckboxItem
                key={column.key}
                className="capitalize"
                checked={
                  visibleColumns[column.key as keyof typeof visibleColumns]
                }
                onCheckedChange={(value) =>
                  setVisibleColumns((prev) => ({
                    ...prev,
                    [column.key]: value,
                  }))
                }
              >
                {column.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              {columns.map(
                (column) =>
                  visibleColumns[column.key as keyof typeof visibleColumns] && (
                    <th
                      key={column.key}
                      className="px-4 py-2 border-b text-left"
                    >
                      {column.label}
                    </th>
                  )
              )}
            </tr>
          </thead>
          <tbody>
            {devices.map((device) => (
              <tr key={device._id} className="hover:bg-gray-50">
                {columns.map(
                  (column) =>
                    visibleColumns[
                      column.key as keyof typeof visibleColumns
                    ] && (
                      <td key={column.key} className="px-4 py-2 border-b">
                        {column.accessor(device)}
                      </td>
                    )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
