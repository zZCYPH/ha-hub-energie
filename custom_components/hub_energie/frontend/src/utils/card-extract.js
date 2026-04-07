import {
  COLOR_BATTERY,
  COLOR_GRID_TO_BATT,
  COLOR_GRID_SOURCE,
  COLOR_SOLAR,
} from "../constants/colors.js";
import { SLOTS } from "../constants/slots.js";
import { readAttrNum, readNum } from "./format-utils.js";
import { readSlotValue, slotLabel } from "./energy-utils.js";

export function extractHubCardViewModel(states, E, i18n) {
  const st = states;
  const costAttrs = st?.[E.cost]?.attributes ?? {};

  const offer = String(costAttrs.offer ?? "tempo").toLowerCase();
  const contractPower = String(costAttrs.contract_power ?? "");
  const currentSlot = String(costAttrs.current_slot ?? "");
  const tempoDays = costAttrs.tempo_days ?? null;
  const todayColor = costAttrs.today_color ?? null;
  const tomorrowColor = costAttrs.tomorrow_color ?? null;

  const reinj = {
    solarSurplus: readAttrNum(st, E.cost, "export_due_to_solar_surplus_kwh"),
    batteryFull: readAttrNum(st, E.cost, "export_due_to_battery_full_or_absent_kwh"),
    switchLatency: readAttrNum(st, E.cost, "export_due_to_switch_latency_kwh"),
    unattributed: readAttrNum(st, E.cost, "export_unattributed_kwh"),
    oppTotalEur: readAttrNum(st, E.cost, "export_opportunity_cost_total_eur"),
    oppSolarEur: readAttrNum(st, E.cost, "export_opportunity_cost_solar_surplus_eur"),
    oppBatteryEur: readAttrNum(st, E.cost, "export_opportunity_cost_battery_full_or_absent_eur"),
    oppLatencyEur: readAttrNum(st, E.cost, "export_opportunity_cost_switch_latency_eur"),
    oppOtherEur: readAttrNum(st, E.cost, "export_opportunity_cost_unattributed_eur"),
  };

  const gridBySlotKwh = costAttrs.grid_by_slot_kwh;
  const maisonBySlotKwh = costAttrs.maison_by_slot_kwh;

  const grid = SLOTS.map((s) => ({
    ...s,
    label: slotLabel(s.id, offer, i18n),
    v: readSlotValue(gridBySlotKwh, s.id),
    isHc: s.id.endsWith("_hc"),
  }));
  const maison = SLOTS.map((s) => ({
    ...s,
    label: slotLabel(s.id, offer, i18n),
    v: readSlotValue(maisonBySlotKwh, s.id),
    isHc: s.id.endsWith("_hc"),
  }));

  const totalEur = readNum(st, E.cost);
  const costs = SLOTS.map((s) => ({
    ...s,
    label: slotLabel(s.id, offer, i18n),
    v: readAttrNum(st, E.cost, `${s.id}_eur`),
    tooltip: `${readSlotValue(gridBySlotKwh, s.id).toFixed(3)} kWh`,
    isHc: s.id.endsWith("_hc"),
  }));
  const abo = readAttrNum(st, E.cost, "abonnement_eur");

  const ecoSolar = readNum(st, E.ecoSolar);
  const ecoBatt = readNum(st, E.ecoBatt);
  const og = readNum(st, E.originGrid);
  const os = readNum(st, E.originSolar);

  const usage = {
    gridDirect: { label: i18n.usageGridDirect, v: readNum(st, E.usageGridDirect), color: COLOR_GRID_SOURCE },
    gridBatt: { label: i18n.usageGridBatt, v: readNum(st, E.usageGridBatt), color: COLOR_GRID_TO_BATT },
    solarDirect: { label: i18n.usageSolarDirect, v: readNum(st, E.usageSolarDirect), color: COLOR_SOLAR },
    solarBatt: { label: i18n.usageSolarBatt, v: readNum(st, E.usageSolarBatt), color: "#fbc02d" },
    battHome: { label: i18n.usageBattHome, v: readNum(st, E.usageBattHome), color: COLOR_BATTERY },
  };

  return {
    grid,
    maison,
    totalEur,
    costs,
    abo,
    ecoSolar,
    ecoBatt,
    og,
    os,
    usage,
    costEntityOk: !!st[E.cost],
    offer,
    contractPower,
    currentSlot,
    tempoDays,
    todayColor,
    tomorrowColor,
    reinj,
    gridBattBySlot: costAttrs.usage_grid_batt_charge_by_slot_kwh,
    solarBattBySlot: costAttrs.usage_solar_batt_charge_by_slot_kwh,
  };
}
