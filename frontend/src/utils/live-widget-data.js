import { readAttrOptionalFloat } from "./format-utils.js";

export function buildPowerNowData(states, costId, i18n) {
  if (!states?.[costId]) return null;
  const gridSigned = readAttrOptionalFloat(states, costId, "grid_power_signed_w");
  const solar =
    readAttrOptionalFloat(states, costId, "solar_power_w") ??
    readAttrOptionalFloat(states, costId, "solar_estimate_power_w");
  const battDis = readAttrOptionalFloat(states, costId, "batt_discharge_power_w");
  const battChg = readAttrOptionalFloat(states, costId, "batt_charge_power_w");
  const load = readAttrOptionalFloat(states, costId, "load_power_w");
  const exportW = readAttrOptionalFloat(states, costId, "export_power_w");

  const tipParts = [];
  if (gridSigned != null) {
    tipParts.push(gridSigned >= 0 ? `${i18n.segImport} ${gridSigned.toFixed(0)} W` : `${i18n.segExport} ${Math.abs(gridSigned).toFixed(0)} W`);
  } else if (exportW != null && exportW > 0) {
    tipParts.push(`${i18n.segExport} ${exportW.toFixed(0)} W`);
  }
  if (solar != null) tipParts.push(`${i18n.segSolar} ${solar.toFixed(0)} W`);
  if (battDis != null && battDis > 0) tipParts.push(`${i18n.segBattDis} ${battDis.toFixed(0)} W`);
  if (battChg != null && battChg > 0) tipParts.push(`${i18n.segBattChg} ${battChg.toFixed(0)} W`);

  return {
    gridSigned,
    solar,
    battDis,
    battChg,
    load,
    exportW,
    tooltip: [i18n.powerBarTip, tipParts.length ? tipParts.join(" · ") : ""].filter(Boolean).join(" — "),
  };
}

export function buildBatteryData(states, costId) {
  const cap = readAttrOptionalFloat(states, costId, "battery_capacity_kwh");
  const soc = readAttrOptionalFloat(states, costId, "battery_soc_percent");
  if (cap == null || cap <= 0 || soc == null) return null;
  const sm = readAttrOptionalFloat(states, costId, "battery_soc_min_percent");
  const sx = readAttrOptionalFloat(states, costId, "battery_soc_max_percent");
  return {
    soc,
    socMin: sm ?? 0,
    socMax: sx ?? 100,
    capacity: cap,
    available: readAttrOptionalFloat(states, costId, "battery_available_kwh"),
    chargeW: readAttrOptionalFloat(states, costId, "batt_charge_power_w"),
    dischargeW: readAttrOptionalFloat(states, costId, "batt_discharge_power_w"),
  };
}
