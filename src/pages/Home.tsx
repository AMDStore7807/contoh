import { DevicesList } from "@/components/DevicesList";

export default function Home() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Devices</h1>
      <DevicesList />
    </div>
  );
}
