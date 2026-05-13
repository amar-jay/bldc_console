import { Link } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { 
  Settings as SettingsIcon, 
  Cpu, 
  Unplug, 
  ShieldCheck,
  ChevronLeft,
  Save,
  Trash2,
  X
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Settings() {
  const closeWindow = () => {
    window.close()
  }

  return (
    <div className="min-h-screen bg-background border border-accent-foreground/30 shadow-2xl overflow-hidden flex flex-col rounded-2xl">
      {/* Draggable Header */}
      <div className="h-10 flex items-center justify-between px-4 bg-muted/30 border-b drag-area select-none">
        <div className="flex items-center gap-2 opacity-70">
          <SettingsIcon className="h-3.5 w-3.5" />
          <span className="text-[11px] font-medium uppercase tracking-wider">System Settings</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 no-drag-area hover:bg-destructive hover:text-destructive-foreground transition-colors"
          onClick={closeWindow}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pt-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Internal Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-left">Settings</h1>
              <p className="text-sm text-muted-foreground text-left">Manage your hardware and application preferences.</p>
            </div>
            <Button 
              size="sm" 
              className="gap-2 no-drag-area"
              onClick={closeWindow}
            >
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>

        <Tabs defaultValue="hardware" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="hardware" className="gap-2">
               <Cpu className="h-4 w-4" /> Hardware
            </TabsTrigger>
            <TabsTrigger value="telemetry" className="gap-2">
               <Unplug className="h-4 w-4" /> Connectivity
            </TabsTrigger>
            <TabsTrigger value="ui" className="gap-2">
               <SettingsIcon className="h-4 w-4" /> General
            </TabsTrigger>
            <TabsTrigger value="safety" className="gap-2">
               <ShieldCheck className="h-4 w-4" /> Safety
            </TabsTrigger>
          </TabsList>

          {/* Hardware Tab */}
          <TabsContent value="hardware" className="space-y-4">
            <Card>
              <CardHeader className="text-left">
                <CardTitle>Motor Configuration</CardTitle>
                <CardDescription>Setup parameters for your BLDC motor controller.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div className="space-y-2">
                    <Label htmlFor="pole-pairs">Pole Pairs</Label>
                    <Input id="pole-pairs" type="number" placeholder="7" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kv-rating">Motor KV</Label>
                    <Input id="kv-rating" type="number" placeholder="1000" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 text-left">
                    <Label>Hall Sensor Feedback</Label>
                    <p className="text-[12px] text-muted-foreground">Enable if using motors with Hall effect sensors.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-left">
                <CardTitle>Power Limits</CardTitle>
                <CardDescription>Voltage and current safety thresholds.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div className="space-y-2">
                    <Label htmlFor="max-current">Max Amperage (A)</Label>
                    <Input id="max-current" type="number" placeholder="40.0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cutoff-voltage">Low Voltage Cutoff (V)</Label>
                    <Input id="cutoff-voltage" type="number" placeholder="10.5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Connectivity Tab */}
          <TabsContent value="telemetry" className="space-y-4">
            <Card>
              <CardHeader className="text-left">
                <CardTitle>Serial Communication</CardTitle>
                <CardDescription>Configure telemetry data stream settings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2 text-left">
                  <Label htmlFor="baud-rate">Baud Rate</Label>
                  <Input id="baud-rate" type="number" placeholder="115200" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 text-left">
                    <Label>Auto-reconnect</Label>
                    <p className="text-[12px] text-muted-foreground">Automatically try to reconnect if connection is lost.</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* General Tab */}
          <TabsContent value="ui" className="space-y-4">
            <Card>
              <CardHeader className="text-left">
                <CardTitle>Application Settings</CardTitle>
                <CardDescription>Customize the interface behaviors.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 text-left">
                    <Label>Dark Mode</Label>
                    <p className="text-[12px] text-muted-foreground">Use the dark theme across the application.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between text-destructive">
                  <div className="space-y-0.5 text-left">
                    <Label className="text-destructive font-semibold">Reset Settings</Label>
                    <p className="text-[12px] text-destructive/80">Revert all preferences to default values.</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-destructive/30 hover:bg-destructive/10 text-destructive h-8 gap-2">
                    <Trash2 className="h-3.5 w-3.5" /> Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Safety Tab */}
          <TabsContent value="safety" className="space-y-4">
            <Card className="border-orange-500/20 bg-orange-500/5">
              <CardHeader className="text-left">
                <CardTitle className="text-orange-500 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5" /> Emergency Protocols
                </CardTitle>
                <CardDescription>Critical safety overrides.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 text-left">
                    <Label>Kill Switch Hotkey</Label>
                    <p className="text-[12px] text-muted-foreground">Use 'Spacebar' as a global emergency stop.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}