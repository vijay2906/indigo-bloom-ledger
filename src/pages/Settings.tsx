import { User, Bell, Shield, Palette, Download, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSettings, useUpdateSettings } from "@/hooks/useSettings";
import { currencySymbols } from "@/utils/currency";
import { HouseholdManager } from "@/components/HouseholdManager";

export default function Settings() {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  const handleCurrencyChange = (currency: string) => {
    updateSettings.mutate({ currency });
  };

  const handleToggle = (field: string, value: boolean) => {
    updateSettings.mutate({ [field]: value });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light/20 to-secondary/30">
      {/* Mobile App Header */}
      <div className="sticky top-0 z-10 bg-card/80 backdrop-blur-xl border-b border-border/50 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground">Manage preferences</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6 sm:px-6">

      {/* Profile Settings */}
      <div className="finance-card p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Profile Settings</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" defaultValue="John Doe" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" defaultValue="john.doe@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Default Currency</Label>
            <Select value={settings?.currency || 'INR'} onValueChange={handleCurrencyChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(currencySymbols).map(([code, symbol]) => (
                  <SelectItem key={code} value={code}>
                    {code} ({symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Input id="timezone" defaultValue="EST (UTC-5)" />
          </div>
        </div>
        <div className="mt-6">
          <Button className="gradient-primary">Save Changes</Button>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="finance-card p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-warning/10 rounded-lg flex items-center justify-center">
            <Bell className="h-5 w-5 text-warning" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Notifications</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Email Notifications</p>
              <p className="text-sm text-muted-foreground">Receive updates about your finances via email</p>
            </div>
            <Switch 
              checked={settings?.notifications_enabled} 
              onCheckedChange={(checked) => handleToggle('notifications_enabled', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Budget Alerts</p>
              <p className="text-sm text-muted-foreground">Get notified when you're close to budget limits</p>
            </div>
            <Switch 
              checked={settings?.budget_alerts} 
              onCheckedChange={(checked) => handleToggle('budget_alerts', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Payment Reminders</p>
              <p className="text-sm text-muted-foreground">Reminders for upcoming loan and bill payments</p>
            </div>
            <Switch 
              checked={settings?.bill_reminders} 
              onCheckedChange={(checked) => handleToggle('bill_reminders', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Goal Updates</p>
              <p className="text-sm text-muted-foreground">Progress updates on your savings goals</p>
            </div>
            <Switch 
              checked={false} 
              onCheckedChange={(checked) => console.log('Goal updates:', checked)}
            />
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="finance-card p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-destructive/10 rounded-lg flex items-center justify-center">
            <Shield className="h-5 w-5 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Security</h3>
        </div>
        <div className="space-y-4">
          <Button variant="outline" className="w-full justify-start">
            Change Password
          </Button>
          <Button variant="outline" className="w-full justify-start">
            Enable Two-Factor Authentication
          </Button>
          <Button variant="outline" className="w-full justify-start">
            View Login History
          </Button>
        </div>
      </div>

      {/* Household Management */}
      <div className="finance-card p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
            <Users className="h-5 w-5 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Family Sharing</h3>
        </div>
        <HouseholdManager />
      </div>

      {/* Data Management */}
      <div className="finance-card p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
            <Download className="h-5 w-5 text-success" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Data Management</h3>
        </div>
        <div className="space-y-4">
          <Button variant="outline" className="w-full justify-start">
            <Download className="h-4 w-4 mr-2" />
            Export All Data
          </Button>
          <Button variant="outline" className="w-full justify-start">
            Import Data from CSV
          </Button>
          <div className="pt-4 border-t border-border">
            <Button variant="destructive" className="w-full justify-start">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              This action cannot be undone. All your data will be permanently deleted.
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}