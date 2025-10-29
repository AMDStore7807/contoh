import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

export default function Settings() {
  const [config, setConfig] = useState({ companyName: "BEATCOM" });
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

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
          setConfig(configData);
        }
      } catch (error) {
        console.error("Error loading config:", error);
      }
    };
    loadConfig();
  }, [token]);

  const handleSave = async () => {
    setLoading(true);
    try {
      if (!token) {
        alert("You are not logged in. Please log in first.");
        setLoading(false);
        return;
      }
      const response = await fetch("/api/config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(config),
      });
      if (response.ok) {
        alert("Configuration saved successfully!");
        // Reload config to reflect changes
        const loadConfig = async () => {
          try {
            const response = await fetch("/api/config", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            if (response.ok) {
              const configData = await response.json();
              setConfig(configData);
            }
          } catch (error) {
            console.error("Error loading config:", error);
          }
        };
        loadConfig();
      } else {
        console.log(response);
        alert("Error saving configuration");
      }
    } catch (error) {
      console.error("Error saving config:", error);
      alert("Error saving configuration");
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Configure application settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              value={config.companyName}
              onChange={(e) =>
                setConfig({ ...config, companyName: e.target.value })
              }
              placeholder="Enter company name"
            />
          </div>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Configuration"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
