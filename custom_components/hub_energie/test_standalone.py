"""Quick standalone smoke tests -- no HA dependency needed.

Run with:  python integrations/hub_energie/test_standalone.py
"""

import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parent  # hub_energie/
sys.path.insert(0, str(ROOT))

from datetime import date, datetime
import importlib.util


def _load_module(name: str, filepath: Path):
    """Load a single .py module by file path, skipping __init__."""
    spec = importlib.util.spec_from_file_location(name, filepath)
    mod = importlib.util.module_from_spec(spec)
    sys.modules[name] = mod
    spec.loader.exec_module(mod)
    return mod


# ── 1. Solar model ────────────────────────────────────────────────────
solar_model = _load_module("solar_model", ROOT / "solar_model.py")
SolarArray = solar_model.SolarArray
SolarSystem = solar_model.SolarSystem
azimuth_from_orientation = solar_model.azimuth_from_orientation
estimate_daily_energy = solar_model.estimate_daily_energy
estimate_power_now = solar_model.estimate_power_now
estimate_yearly_energy = solar_model.estimate_yearly_energy
optimal_tilt = solar_model.optimal_tilt
performance_ratio_from_preset = solar_model.performance_ratio_from_preset
shading_factor_from_preset = solar_model.shading_factor_from_preset

print("=== Solar Model ===")
print(f"  optimal_tilt(48.8) = {optimal_tilt(48.8):.1f}°")
print(f"  azimuth_from_orientation('S') = {azimuth_from_orientation('S')}°")
print(f"  shading_factor_from_preset('medium') = {shading_factor_from_preset('medium')}")
print(f"  performance_ratio_from_preset('standard') = {performance_ratio_from_preset('standard')}")

arr = SolarArray(
    peak_power_kwc=6.0, tilt_deg=30.0, azimuth_deg=180.0,
    shading_factor=0.0, name="Main",
)
sys_cfg = SolarSystem(
    arrays=[arr], latitude=48.86, longitude=2.35,
    performance_ratio=0.75, commissioning_year=2023, degradation_rate=0.005,
)

pw = estimate_power_now(sys_cfg, datetime(2025, 6, 21, 12, 0))
daily = estimate_daily_energy(sys_cfg, date(2025, 6, 21))
yearly = estimate_yearly_energy(sys_cfg, 2025)
print(f"  power now (June 21 noon, 6kWc Paris): {pw:.0f} W")
print(f"  daily (June 21): {daily:.1f} kWh")
print(f"  yearly (2025): {yearly:.0f} kWh")

assert pw > 0, "Power should be positive at noon in summer"
assert daily > 10, "Daily should be >10 kWh for 6kWc in June"
assert 5000 < yearly < 12000, f"Yearly {yearly} out of expected range for 6kWc Paris"
print("  ✓ Solar model assertions passed\n")

# ── 2. Tariff manager ────────────────────────────────────────────────
# tariff_manager imports from .const — load const package (subdir) like HA does
hub_pkg = type(sys)("hub_energie")
hub_pkg.__path__ = [str(ROOT)]
sys.modules["hub_energie"] = hub_pkg
_load_module("hub_energie.const.core", ROOT / "const" / "core.py")
_load_module("hub_energie.const.tariff_edf", ROOT / "const" / "tariff_edf.py")
_load_module("hub_energie.const.reinjection", ROOT / "const" / "reinjection.py")
_load_module("hub_energie.const.energy_data", ROOT / "const" / "energy_data.py")
_load_module("hub_energie.const.config_keys", ROOT / "const" / "config_keys.py")
# ``tariff_manager`` uses ``from .const import …`` — merge submodules (runtime __init__ is DOMAIN-only).
const_mod = type(sys)("hub_energie.const")
const_mod.__path__ = [str(ROOT / "const")]
for _sub in ("core", "tariff_edf", "reinjection", "energy_data", "config_keys"):
    _sm = sys.modules[f"hub_energie.const.{_sub}"]
    for _name in dir(_sm):
        if _name.startswith("_"):
            continue
        setattr(const_mod, _name, getattr(_sm, _name))
sys.modules["hub_energie.const"] = const_mod

tariff_mod = _load_module("hub_energie.tariff_manager", ROOT / "tariff_manager.py")
TariffResolver = tariff_mod.TariffResolver

print("=== Tariff Manager ===")

# Flat tariff
opts_flat = {"abonnement_mensuel_eur": 15.0}
data_flat = {
    "supplier": "other", "tariff_mode": "manual",
    "pricing_structure": "flat", "energy_price": 0.18,
    "currency": "EUR", "price_basis": "TTC",
}
tr = TariffResolver(opts_flat, data_flat)
rate = tr._generic_rate_now(datetime(2025, 3, 15, 14, 0))
print(f"  flat rate = {rate:.4f} €/kWh")
assert rate == 0.18
print(f"  daily subscription = {tr.subscription_daily():.4f} €")
assert tr.subscription_daily() == round(15.0 / 30.0, 6)
print("  ✓ Flat tariff OK")

# EDF auto (Tempo)
opts_edf = {
    "tariff_offer": "tempo",
    "hc_bleu_ttc": "0.1296", "hp_rouge_ttc": "0.7562",
    "fixed_ttc": "18.36",
}
data_edf = {"supplier": "edf", "tariff_mode": "auto"}
tr_edf = TariffResolver(opts_edf, data_edf)
print(f"  EDF bleu_hc = {tr_edf.rate_for_slot('bleu_hc'):.4f}")
print(f"  EDF rouge_hp = {tr_edf.rate_for_slot('rouge_hp'):.4f}")
assert tr_edf.is_tempo
assert tr_edf.rate_for_slot("bleu_hc") == 0.1296
assert tr_edf.rate_for_slot("rouge_hp") == 0.7562
# PART_FIXE_TTC is annual: daily share uses /365, not /30
assert tr_edf.subscription_daily() == round(18.36 / 365.0, 6)
print("  ✓ EDF auto Tempo OK")

# TOU tariff
opts_tou = {"abonnement_mensuel_eur": 12.0}
data_tou = {
    "supplier": "other", "tariff_mode": "manual",
    "pricing_structure": "time_of_use", "currency": "EUR", "price_basis": "TTC",
    "tou_periods": [
        {"name": "HC", "price": 0.12, "start": "22:00", "end": "06:00"},
        {"name": "HP", "price": 0.20, "start": "06:00", "end": "22:00"},
    ],
}
tr_tou = TariffResolver(opts_tou, data_tou)
hc_rate = tr_tou._generic_rate_now(datetime(2025, 3, 15, 3, 0))
hp_rate = tr_tou._generic_rate_now(datetime(2025, 3, 15, 14, 0))
print(f"  TOU at 03:00 (HC) = {hc_rate:.4f}")
print(f"  TOU at 14:00 (HP) = {hp_rate:.4f}")
assert hc_rate == 0.12
assert hp_rate == 0.20
print("  ✓ Time-of-use OK\n")

# ── 3. Const sanity ──────────────────────────────────────────────────
DOMAIN = const_mod.DOMAIN
SLOTS = const_mod.SLOTS
SUPPLIER_OPTIONS = const_mod.SUPPLIER_OPTIONS
TARIFF_OFFER_OPTIONS = const_mod.TARIFF_OFFER_OPTIONS
CONTRACT_POWER_OPTIONS = const_mod.CONTRACT_POWER_OPTIONS
PHASE_OPTIONS = const_mod.PHASE_OPTIONS

print("=== Constants ===")
assert DOMAIN == "hub_energie"
assert len(SLOTS) == 6
assert len(SUPPLIER_OPTIONS) == 2
assert len(TARIFF_OFFER_OPTIONS) == 3
assert len(CONTRACT_POWER_OPTIONS) == 9
assert len(PHASE_OPTIONS) == 2
print(f"  DOMAIN = {DOMAIN}")
print(f"  SLOTS = {SLOTS}")
print(f"  SUPPLIERS = {SUPPLIER_OPTIONS}")
print(f"  TARIFF_OFFERS = {TARIFF_OFFER_OPTIONS}")
print("  ✓ Constants OK\n")

# ── 4. Import checks (no HA, just AST) ──────────────────────────────
import ast

print("=== AST parse check (all .py files) ===")
base = Path(__file__).resolve().parent
py_files = sorted(base.rglob("*.py"))
for f in py_files:
    if "__pycache__" in str(f) or f.name == "test_standalone.py":
        continue
    ast.parse(f.read_text(encoding="utf-8"))
    print(f"  ✓ {f.relative_to(base)}")
print()

# ── 5. JSON parse check ─────────────────────────────────────────────
import json

print("=== JSON parse check ===")
json_files = sorted(base.rglob("*.json"))
for f in json_files:
    json.loads(f.read_text(encoding="utf-8"))
    print(f"  ✓ {f.relative_to(base)}")
print()

print("═" * 50)
print(" ALL CHECKS PASSED")
print("═" * 50)
