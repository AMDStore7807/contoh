import { useEffect, useState } from "react";
import { queryDevices } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Device {
  _id: string;
  _lastInform?: string;
  // Add other fields as needed
}

export function DevicesList() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setLoading(true);
        const data = await queryDevices();
        setDevices(data);
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
    return <div className="text-center">Loading devices...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {devices.map((device) => (
        <Card key={device._id}>
          <CardHeader>
            <CardTitle>{device._id}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Last Inform: {device._lastInform || "N/A"}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
