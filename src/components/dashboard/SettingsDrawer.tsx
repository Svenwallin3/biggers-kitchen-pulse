import { useState } from "react";
import { Settings as SettingsIcon } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { useSettings } from "@/lib/settings";

export function SettingsDrawer() {
  const { laborAlertThreshold, revenueVarianceThreshold, setLaborAlertThreshold, setRevenueVarianceThreshold } = useSettings();
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="inline-flex items-center justify-center w-9 h-9 rounded-md hover:bg-sidebar-accent text-sidebar-foreground transition-colors"
          aria-label="Settings"
        >
          <SettingsIcon className="w-4 h-4" />
        </button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Alert Settings</SheetTitle>
          <SheetDescription>Adjust thresholds for the inline alert banner.</SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-8">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Labor % alert</label>
              <span className="text-sm tabular-nums font-semibold">{laborAlertThreshold}%</span>
            </div>
            <Slider
              value={[laborAlertThreshold]}
              min={20}
              max={50}
              step={1}
              onValueChange={(v) => setLaborAlertThreshold(v[0])}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Trigger a red banner when yesterday's labor % exceeds this.
            </p>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Revenue variance alert</label>
              <span className="text-sm tabular-nums font-semibold">{revenueVarianceThreshold}%</span>
            </div>
            <Slider
              value={[revenueVarianceThreshold]}
              min={5}
              max={50}
              step={1}
              onValueChange={(v) => setRevenueVarianceThreshold(v[0])}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Trigger an amber banner when revenue is this % below prior year.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
