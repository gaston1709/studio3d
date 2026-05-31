import fs from "fs";
import path from "path";

const settingsPath = path.join(process.cwd(), "prisma", "settings.json");

export interface ShippingOption {
  id: string;
  label: string;
  desc: string;
}

export interface AppSettingsData {
  paymentAlias: string;
  paymentCbu: string;
  shippingOptions: ShippingOption[];
  machineHourRate: number;
  materialPricePerGram: number;
  materialPrices: Record<string, number>;
}

const defaultSettings: AppSettingsData = {
  paymentAlias: "3D.PRINT.HUB.CBA",
  paymentCbu: "0000000000000000000000",
  shippingOptions: [
    { id: "local", label: "Retiro en local (CBA Capital)", desc: "Sin costo adicional" },
    { id: "point_nv", label: "Punto Retiro: Nueva Córdoba", desc: "Zona Buen Pastor" },
    { id: "point_ga", label: "Punto Retiro: General Paz", desc: "Plaza principal" },
    { id: "moto", label: "Envío en Moto / Uber", desc: "Costo a cargo del cliente al recibir" }
  ],
  machineHourRate: 500,
  materialPricePerGram: 30,
  materialPrices: {},
};

export function getSettings(): AppSettingsData {
  try {
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, "utf8");
      return { ...defaultSettings, ...JSON.parse(data) };
    }
  } catch (err) {
    console.error("Error reading settings.json, using defaults:", err);
  }
  return defaultSettings;
}

export function saveSettings(data: Partial<AppSettingsData>): AppSettingsData {
  const current = getSettings();
  const updated = {
    ...current,
    ...data
  };
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(updated, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing settings.json:", err);
  }
  return updated;
}
