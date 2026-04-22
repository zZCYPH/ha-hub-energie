import { readAttrOptionalFloat } from "./format-utils.js";

/** ``entity_id`` whose attributes hold live W fields (``lovelace_card`` or legacy ``cost_detail``). */
export function buildPowerNowData(states, payloadEntityId, i18n) {
  if (!states?.[payloadEntityId]) return null;
  const gridSigned = readAttrOptionalFloat(states, payloadEntityId, "grid_power_signed_w");
  const solar =
    readAttrOptionalFloat(states, payloadEntityId, "solar_power_w") ??
    readAttrOptionalFloat(states, payloadEntityId, "solar_estimate_power_w");
  const battDis = readAttrOptionalFloat(states, payloadEntityId, "batt_discharge_power_w");
  const battChg = readAttrOptionalFloat(states, payloadEntityId, "batt_charge_power_w");
  const load = readAttrOptionalFloat(states, payloadEntityId, "load_power_w");
  const exportW = readAttrOptionalFloat(states, payloadEntityId, "export_power_w");

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

export function buildBatteryData(states, payloadEntityId) {
  const cap = readAttrOptionalFloat(states, payloadEntityId, "battery_capacity_kwh");
  const soc = readAttrOptionalFloat(states, payloadEntityId, "battery_soc_percent");
  if (cap == null || cap <= 0 || soc == null) return null;
  const sm = readAttrOptionalFloat(states, payloadEntityId, "battery_soc_min_percent");
  const sx = readAttrOptionalFloat(states, payloadEntityId, "battery_soc_max_percent");
  return {
    soc,
    socMin: sm ?? 0,
    socMax: sx ?? 100,
    capacity: cap,
    available: readAttrOptionalFloat(states, payloadEntityId, "battery_available_kwh"),
    chargeW: readAttrOptionalFloat(states, payloadEntityId, "batt_charge_power_w"),
    dischargeW: readAttrOptionalFloat(states, payloadEntityId, "batt_discharge_power_w"),
  };
}
