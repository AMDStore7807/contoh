import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Save, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import MainLayout from "@/components/MainLayout";
import { useAuth } from "@/hooks/use-auth";

export default function Settings() {
  const [config, setConfig] = useState({
    companyName: "BEATCOM",
    cacheEnabled: false,
    cacheExpiryMinutes: 0,
    notificationsEnabled: true,
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);
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
          setConfig({
            companyName: configData.companyName || "BEATCOM",
            cacheEnabled: configData.cacheEnabled || false,
            cacheExpiryMinutes: configData.cacheExpiryMinutes || 0,
            notificationsEnabled: configData.notificationsEnabled ?? true,
          });
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
        setSaved(true);
        setTimeout(() => {
          setSaved(false);
          window.location.reload();
        }, 3000);
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

  const handleClearCache = async () => {
    if (
      !confirm(
        "Are you sure you want to clear all cached data? This action cannot be undone."
      )
    ) {
      return;
    }

    setClearingCache(true);
    try {
      if (!token) {
        alert("You are not logged in. Please log in first.");
        setClearingCache(false);
        return;
      }
      const response = await fetch("/api/cache/clear", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        // Clear only device cache from localStorage
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("devicesCache")) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((key) => localStorage.removeItem(key));
        alert("Device cache cleared successfully!");
      } else {
        console.log(response);
        alert("Error clearing cache");
      }
    } catch (error) {
      console.error("Error clearing cache:", error);
      alert("Error clearing cache");
    }
    setClearingCache(false);
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card">
          <div className="px-4 py-6 sm:px-6 lg:px-8">
            <div className="mt-4">
              <h1 className="text-3xl font-bold text-foreground">Settings</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage your application configuration and preferences
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 py-8 sm:px-6 lg:px-8">
          {/* Success Message */}
          {saved && (
            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200">
              Configuration saved successfully!
            </div>
          )}

          <div className="space-y-6">
            {/* General Settings */}
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configure basic application information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="companyName"
                    className="text-base font-medium"
                  >
                    Company Name
                  </Label>
                  <Input
                    id="companyName"
                    value={config.companyName}
                    onChange={(e) =>
                      setConfig({ ...config, companyName: e.target.value })
                    }
                    placeholder="Enter company name"
                    className="h-10"
                  />
                  <p className="text-xs text-muted-foreground">
                    This name will be displayed throughout the application
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Cache Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Cache Configuration</CardTitle>
                <CardDescription>
                  Optimize performance with device caching
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4">
                  <div className="space-y-1">
                    <Label
                      htmlFor="cacheEnabled"
                      className="text-base font-medium cursor-pointer"
                    >
                      Enable Device Caching
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Store data locally for faster access
                    </p>
                  </div>
                  <Switch
                    id="cacheEnabled"
                    checked={config.cacheEnabled}
                    onCheckedChange={(checked) =>
                      setConfig({ ...config, cacheEnabled: checked })
                    }
                  />
                </div>

                {config.cacheEnabled && (
                  <div className="space-y-2">
                    <Label
                      htmlFor="cacheExpiryMinutes"
                      className="text-base font-medium"
                    >
                      Cache Expiry Time (minutes)
                    </Label>
                    <Input
                      id="cacheExpiryMinutes"
                      type="number"
                      min="0"
                      value={config.cacheExpiryMinutes}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          cacheExpiryMinutes:
                            Number.parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="0 (no expiry)"
                      className="h-10"
                    />
                    <p className="text-xs text-muted-foreground">
                      Set to 0 for no expiry (cache persists until cleared
                      manually)
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible actions that require caution
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                  <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-2">
                    <p className="font-medium text-foreground">
                      Clear All Cache
                    </p>
                    <p className="text-sm text-muted-foreground">
                      This will permanently delete all cached data. This action
                      cannot be undone.
                    </p>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="mt-2"
                      onClick={handleClearCache}
                      disabled={clearingCache}
                    >
                      {clearingCache ? "Clearing..." : "Clear Cache"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" asChild>
                <Link to="/">Cancel</Link>
              </Button>
              <Button onClick={handleSave} disabled={loading} className="gap-2">
                <Save className="h-4 w-4" />
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
