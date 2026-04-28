import { createContext, ReactNode, useContext, useState } from "react";

type Settings = {
  laborAlertThreshold: number; // %
  revenueVarianceThreshold: number; // % below prior year
  setLaborAlertThreshold: (n: number) => void;
  setRevenueVarianceThreshold: (n: number) => void;
};

const Ctx = createContext<Settings | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [laborAlertThreshold, setLaborAlertThreshold] = useState(35);
  const [revenueVarianceThreshold, setRevenueVarianceThreshold] = useState(20);
  return (
    <Ctx.Provider
      value={{
        laborAlertThreshold,
        revenueVarianceThreshold,
        setLaborAlertThreshold,
        setRevenueVarianceThreshold,
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
