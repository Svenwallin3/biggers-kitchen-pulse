import { createContext, ReactNode, useContext, useState } from "react";

type Settings = {
  laborAlertThreshold: number; // %
  revenueVarianceThreshold: number; // % below prior year
  unsoldThreshold: number; // % unsold of units sent
  setLaborAlertThreshold: (n: number) => void;
  setRevenueVarianceThreshold: (n: number) => void;
  setUnsoldThreshold: (n: number) => void;
};

const Ctx = createContext<Settings | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [laborAlertThreshold, setLaborAlertThreshold] = useState(35);
  const [revenueVarianceThreshold, setRevenueVarianceThreshold] = useState(20);
  const [unsoldThreshold, setUnsoldThreshold] = useState(30);
  return (
    <Ctx.Provider
      value={{
        laborAlertThreshold,
        revenueVarianceThreshold,
        unsoldThreshold,
        setLaborAlertThreshold,
        setRevenueVarianceThreshold,
        setUnsoldThreshold,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useSettings() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSettings must be used within SettingsProvider");
  return v;
}
