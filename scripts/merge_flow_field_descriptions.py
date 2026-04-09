#!/usr/bin/env python3
"""Merge ``data_description`` entries into integration strings (EN + FR).

Run after editing the dicts below, then regenerate vitrine JSON::

    python scripts/merge_flow_field_descriptions.py
    python scripts/extract_config_flow_catalog.py
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

REPO = Path(__file__).resolve().parent.parent
STRINGS = REPO / "custom_components/hub_energie/strings.json"
STRINGS_EN = REPO / "custom_components/hub_energie/translations/en.json"
STRINGS_FR = REPO / "custom_components/hub_energie/translations/fr.json"


def _deep_merge_dd(target: dict[str, Any], patch: dict[str, Any]) -> None:
    dd = target.setdefault("data_description", {})
    for k, v in patch.items():
        dd[k] = v


def _merge_sections(step: dict[str, Any], sec_patch: dict[str, Any]) -> None:
    sections = step.setdefault("sections", {})
    for sec_id, inner in sec_patch.items():
        sec = sections.setdefault(sec_id, {})
        if "data_description" in inner:
            _deep_merge_dd(sec, inner["data_description"])


def _apply_config_merges(root: dict[str, Any], merges: dict[str, Any]) -> None:
    steps = root.setdefault("config", {}).setdefault("step", {})
    for step_id, patch in merges.items():
        step = steps.setdefault(step_id, {})
        if not isinstance(step, dict):
            continue
        if "data_description" in patch:
            _deep_merge_dd(step, patch["data_description"])
        if "sections" in patch:
            _merge_sections(step, patch["sections"])


def _apply_options_merges(root: dict[str, Any], merges: dict[str, Any]) -> None:
    steps = root.setdefault("options", {}).setdefault("step", {})
    for step_id, patch in merges.items():
        step = steps.setdefault(step_id, {})
        if not isinstance(step, dict):
            continue
        if "data_description" in patch:
            _deep_merge_dd(step, patch["data_description"])
        if "sections" in patch:
            _merge_sections(step, patch["sections"])


def _sched_slots(patch_per_slot: dict[str, str], n_slots: int = 6) -> dict[str, Any]:
    out: dict[str, Any] = {}
    for i in range(n_slots):
        dd = {}
        for suffix, text in patch_per_slot.items():
            key = suffix.replace("{i}", str(i))
            dd[key] = text
        out[f"sched_slot_{i}"] = {"data_description": dd}
    return out


def _tou_slots(en: bool) -> dict[str, Any]:
    if en:
        row = {
            "tou_r{i}_start": "Start of this price band (24 h, HH:MM).",
            "tou_r{i}_end": "End of this price band. Use 00:00 for midnight at the end of the day when spanning overnight.",
            "tou_r{i}_price": "Energy price for this band, per kWh, in your selected currency.",
        }
    else:
        row = {
            "tou_r{i}_start": "Début de la plage tarifaire (24 h, HH:MM).",
            "tou_r{i}_end": "Fin de la plage. Utilisez 00:00 pour minuit en fin de journée si la plage passe la nuit.",
            "tou_r{i}_price": "Prix de l’énergie pour cette plage, au kWh, dans votre devise.",
        }
    out: dict[str, Any] = {}
    for i in range(2):
        dd = {k.format(i=i): v for k, v in row.items()}
        out[f"tou_slot_{i}"] = {"data_description": dd}
    return out


CONFIG_EN: dict[str, Any] = {
    "contract": {
        "data_description": {
            "contract_power": "Subscribed power in kVA from your contract (dropdown values match common EDF tiers; pick the closest match).",
            "contract_name": "Optional label to recognize this Hub Énergie entry in Settings (not sent to the supplier).",
        }
    },
    "edf_offer": {
        "data_description": {
            "tariff_offer": "BASE (single rate), HPHC (peak/off-peak), or TEMPO (blue/white/red days). Must match your real subscription for automatic prices.",
        }
    },
    "edf_tempo": {
        "data_description": {
            "tempo_mode": "RTE needs OAuth API credentials; API Couleur Tempo works without an RTE account.",
        }
    },
    "edf_tempo_rte": {
        "data_description": {
            "rte_client_id": "OAuth client identifier from your RTE developer / app registration.",
            "rte_client_secret": "OAuth client secret. Leave empty later in options if you only rotate the id and want to keep the stored secret.",
        }
    },
    "manual_pricing": {
        "data_description": {
            "price_basis": "Whether manual kWh prices you enter include tax (TTC) or exclude tax (HT).",
            "currency": "ISO currency code used for labels and manual tariffs (e.g. EUR).",
        }
    },
    "manual_flat": {
        "data_description": {
            "energy_price": "Single energy price per kWh for the whole day, before subscription.",
            "subscription_price": "Fixed monthly subscription part (same currency as energy); enter 0 if none.",
        }
    },
    "manual_tou": {
        "sections": _tou_slots(True),
        "data_description": {
            "subscription_price": "Fixed monthly subscription; applied on top of time-of-use energy prices.",
        },
    },
    "manual_schedule_form": {
        "sections": _sched_slots(
            {
                "sched_r{i}_start": "Start of this schedule band (24 h).",
                "sched_r{i}_end": "End of this band. 00:00 means end of the calendar day (use for overnight ranges).",
                "sched_r{i}_price": "Energy price per kWh for this band.",
                "sched_r{i}_day_type": "Whether the band applies every day, only weekdays, or only weekends.",
                "sched_r{i}_name": "Optional short label (dashboards / logs).",
            }
        ),
        "data_description": {
            "subscription_price": "Fixed monthly subscription added to scheduled energy costs.",
        },
    },
    "manual_schedule_json": {
        "data_description": {
            "schedule_slots": "JSON array of slot objects (start, end, price, optional day_type and name). Use when you need more than six slots or copy/paste between instances.",
            "subscription_price": "Fixed monthly subscription; same meaning as on the form step.",
        }
    },
    "grid": {
        "data_description": {
            "load_power_sensor": "Optional household consumption (W) for load-side diagnostics and balance checks.",
        }
    },
    "grid_phases": {
        "data_description": {
            "grid_import_energy_phases": "JSON list of {phase, entity_id} for per-phase import kWh (total_increasing).",
            "grid_export_energy_phases": "Same shape for export counters; leave empty if you do not export.",
            "grid_power_phases": "Optional JSON list for per-phase grid power (W) used for summed real-time display.",
        }
    },
    "grid_tri_per_phase": {
        "sections": {
            "tri_phase_l1": {
                "data_description": {
                    "tri_import_energy_p1": "Total increasing kWh counter for grid import on phase L1.",
                    "tri_export_energy_p1": "Optional export counter for L1; leave empty if unused.",
                }
            },
            "tri_phase_l2": {
                "data_description": {
                    "tri_import_energy_p2": "Total increasing kWh counter for grid import on phase L2.",
                    "tri_export_energy_p2": "Optional export counter for L2; leave empty if unused.",
                }
            },
            "tri_phase_l3": {
                "data_description": {
                    "tri_import_energy_p3": "Total increasing kWh counter for grid import on phase L3.",
                    "tri_export_energy_p3": "Optional export counter for L3; leave empty if unused.",
                }
            },
        }
    },
    "tri_grid_phase_1": {
        "data_description": {
            "tri_phase_step_import_energy": "Optional import kWh entity for L1 when you chose per-phase layout after a single combined meter.",
            "tri_phase_step_export_energy": "Optional export kWh for L1.",
            "tri_phase_step_grid_power": "Optional grid power (W) for L1; integration sums configured phases.",
        }
    },
    "tri_grid_phase_2": {
        "data_description": {
            "tri_phase_step_import_energy": "Optional import kWh entity for L2.",
            "tri_phase_step_export_energy": "Optional export kWh for L2.",
            "tri_phase_step_grid_power": "Optional grid power (W) for L2.",
        }
    },
    "tri_grid_phase_3": {
        "data_description": {
            "tri_phase_step_import_energy": "Optional import kWh entity for L3.",
            "tri_phase_step_export_energy": "Optional export kWh for L3.",
            "tri_phase_step_grid_power": "Optional grid power (W) for L3.",
        }
    },
    "solar": {"data_description": {"has_solar": "Turn off to skip solar entities and accounting for this entry."}},
    "solar_estimation": {
        "data_description": {
            "solar_lat": "Site latitude (decimal degrees); defaults may be prefilled from Home Assistant zone.",
            "solar_lon": "Site longitude (decimal degrees).",
            "solar_peak_power": "Installed DC peak power (kWc) of the PV array.",
            "solar_orientation": "Azimuth in degrees (0–360); 180° is south in the northern hemisphere.",
            "solar_tilt_mode": "Auto uses a typical roof tilt from latitude; manual unlocks the tilt field.",
            "solar_tilt": "Panel tilt from horizontal (°); used only when tilt mode is manual.",
            "solar_shading": "Rough shading level for the clear-sky model.",
            "solar_performance": "Performance class (standard vs optimistic vs conservative) for the estimation model.",
        }
    },
    "battery": {"data_description": {"has_batteries": "Disable to remove battery devices until you enable the feature again."}},
    "battery_add": {
        "data_description": {
            "batt_name": "Display name for this pack in Hub Énergie entities and UI.",
            "batt_energy_in": "total_increasing kWh counter for energy charged into the battery.",
            "batt_energy_out": "total_increasing kWh counter for energy discharged from the battery.",
        }
    },
    "battery_more": {
        "data_description": {
            "add_another": "Turn on to define another battery after saving the current one.",
        }
    },
    "battery_advanced": {
        "data_description": {
            "batt_capacity_kwh_entity": "Pick a sensor, input_number, or number entity whose state is nominal usable energy (kWh) at 100% SOC — datasheet capacity, not live remaining. Leave empty if you type the value in the manual field instead (never both).",
            "batt_capacity_kwh": "Type nominal capacity in kWh at 100% SOC when you do not bind an entity. XOR with the entity picker above.",
            "batt_max_charge_w_entity": "Entity for the inverter/BMS maximum charge power (W), e.g. datasheet limit. Not the live measured charge power. XOR with manual watts below.",
            "batt_max_charge_w": "Manual max charge power (W). XOR with the entity above.",
            "batt_max_discharge_w_entity": "Entity for maximum discharge power (W). XOR with manual value below.",
            "batt_max_discharge_w": "Manual max discharge power (W). XOR with the entity above.",
            "batt_soc_min_entity": "Entity reporting minimum usable SOC (0–100%) — use when the pack never truly hits 0% on the sensor. XOR with manual percent below.",
            "batt_soc_min": "Manual floor SOC (0–100). XOR with the entity above.",
            "batt_soc_max_entity": "Entity for maximum SOC the system reports (0–100%) when it never reaches 100%. XOR with manual percent below.",
            "batt_soc_max": "Manual ceiling SOC (0–100). XOR with the entity above.",
        }
    },
}

CONFIG_FR: dict[str, Any] = {
    "contract": {
        "data_description": {
            "contract_power": "Puissance souscrite en kVA (valeurs proches des paliers EDF courants).",
            "contract_name": "Libellé optionnel pour reconnaître cette entrée dans les réglages (non transmis au fournisseur).",
        }
    },
    "edf_offer": {
        "data_description": {
            "tariff_offer": "BASE (prix unique), HPHC (heures pleines / creuses) ou TEMPO. Doit correspondre à votre contrat pour les tarifs automatiques.",
        }
    },
    "edf_tempo": {
        "data_description": {
            "tempo_mode": "RTE exige des identifiants OAuth ; API Couleur Tempo fonctionne sans compte RTE.",
        }
    },
    "edf_tempo_rte": {
        "data_description": {
            "rte_client_id": "Identifiant client OAuth de votre application RTE.",
            "rte_client_secret": "Secret client. Laissez vide en options si vous ne faites que faire tourner l’identifiant.",
        }
    },
    "manual_pricing": {
        "data_description": {
            "price_basis": "Les prix kWh saisis sont-ils TTC ou HT ?",
            "currency": "Code devise (ex. EUR) pour les libellés et tarifs manuels.",
        }
    },
    "manual_flat": {
        "data_description": {
            "energy_price": "Prix unique au kWh pour toute la journée, hors abonnement.",
            "subscription_price": "Part fixe d’abonnement mensuel (même devise) ; 0 si aucune.",
        }
    },
    "manual_tou": {
        "sections": _tou_slots(False),
        "data_description": {
            "subscription_price": "Abonnement mensuel fixe, en complément des prix par plage horaire.",
        },
    },
    "manual_schedule_form": {
        "sections": _sched_slots(
            {
                "sched_r{i}_start": "Début du créneau (24 h).",
                "sched_r{i}_end": "Fin du créneau ; 00:00 = minuit en fin de journée (plages overnight).",
                "sched_r{i}_price": "Prix de l’énergie au kWh pour ce créneau.",
                "sched_r{i}_day_type": "Jours concernés : tous, semaine uniquement ou week-end uniquement.",
                "sched_r{i}_name": "Libellé optionnel (tableaux de bord / journaux).",
            }
        ),
        "data_description": {
            "subscription_price": "Abonnement mensuel fixe, comme sur l’étape formulaire.",
        },
    },
    "manual_schedule_json": {
        "data_description": {
            "schedule_slots": "Tableau JSON d’objets créneau (début, fin, prix, day_type et nom optionnels). À utiliser au-delà de six créneaux ou pour copier/coller.",
            "subscription_price": "Abonnement mensuel fixe ; même sens que sur le formulaire.",
        }
    },
    "grid": {
        "data_description": {
            "load_power_sensor": "Puissance consommation maison (W) optionnelle pour diagnostics côté charge.",
        }
    },
    "grid_phases": {
        "data_description": {
            "grid_import_energy_phases": "Liste JSON {phase, entity_id} pour les compteurs kWh d’import par phase (total_increasing).",
            "grid_export_energy_phases": "Même format pour l’export ; vide si pas d’export.",
            "grid_power_phases": "Liste JSON optionnelle pour la puissance (W) par phase (somme pour l’affichage temps réel).",
        }
    },
    "grid_tri_per_phase": {
        "sections": {
            "tri_phase_l1": {
                "data_description": {
                    "tri_import_energy_p1": "Compteur kWh total_increasing d’import réseau sur la phase L1.",
                    "tri_export_energy_p1": "Compteur d’export L1 optionnel ; vide si inutilisé.",
                }
            },
            "tri_phase_l2": {
                "data_description": {
                    "tri_import_energy_p2": "Compteur kWh total_increasing d’import réseau sur la phase L2.",
                    "tri_export_energy_p2": "Compteur d’export L2 optionnel ; vide si inutilisé.",
                }
            },
            "tri_phase_l3": {
                "data_description": {
                    "tri_import_energy_p3": "Compteur kWh total_increasing d’import réseau sur la phase L3.",
                    "tri_export_energy_p3": "Compteur d’export L3 optionnel ; vide si inutilisé.",
                }
            },
        }
    },
    "tri_grid_phase_1": {
        "data_description": {
            "tri_phase_step_import_energy": "Entité kWh d’import L1 optionnelle (disposition par phase après compteur combiné).",
            "tri_phase_step_export_energy": "Export kWh L1 optionnel.",
            "tri_phase_step_grid_power": "Puissance réseau (W) L1 optionnelle ; somme des phases renseignées.",
        }
    },
    "tri_grid_phase_2": {
        "data_description": {
            "tri_phase_step_import_energy": "Entité kWh d’import L2 optionnelle.",
            "tri_phase_step_export_energy": "Export kWh L2 optionnel.",
            "tri_phase_step_grid_power": "Puissance réseau (W) L2 optionnelle.",
        }
    },
    "tri_grid_phase_3": {
        "data_description": {
            "tri_phase_step_import_energy": "Entité kWh d’import L3 optionnelle.",
            "tri_phase_step_export_energy": "Export kWh L3 optionnel.",
            "tri_phase_step_grid_power": "Puissance réseau (W) L3 optionnelle.",
        }
    },
    "solar": {"data_description": {"has_solar": "Désactiver pour retirer le solaire de la comptabilité de cette entrée."}},
    "solar_estimation": {
        "data_description": {
            "solar_lat": "Latitude du site (degrés décimaux) ; peut être préremplie depuis la zone Home Assistant.",
            "solar_lon": "Longitude du site (degrés décimaux).",
            "solar_peak_power": "Puissance crête DC installée (kWc).",
            "solar_orientation": "Azimut en degrés (0–360) ; 180° ≈ plein sud (hémisphère nord).",
            "solar_tilt_mode": "Auto estime une inclinaison type ; manuel déverrouille le champ d’inclinaison.",
            "solar_tilt": "Inclinaison des modules par rapport à l’horizontale (°), si mode manuel.",
            "solar_shading": "Niveau d’ombrage approximatif pour le modèle « ciel clair ».",
            "solar_performance": "Classe de performance (standard / optimiste / prudent) pour le modèle.",
        }
    },
    "battery": {"data_description": {"has_batteries": "Désactiver pour masquer les entités batterie jusqu’à réactivation."}},
    "battery_add": {
        "data_description": {
            "batt_name": "Nom affiché du pack dans Hub Énergie.",
            "batt_energy_in": "Compteur kWh total_increasing d’énergie chargée dans la batterie.",
            "batt_energy_out": "Compteur kWh total_increasing d’énergie déchargée.",
        }
    },
    "battery_more": {
        "data_description": {
            "add_another": "Activez pour enchaîner sur une autre batterie après celle-ci.",
        }
    },
    "battery_advanced": {
        "data_description": {
            "batt_capacity_kwh_entity": "Capteur, input_number ou entité nombre dont l’état est la capacité nominale (kWh) à 100 % de SOC — valeur constructeur, pas l’énergie restante instantanée. Laisser vide si vous saisissez la valeur manuelle (jamais les deux).",
            "batt_capacity_kwh": "Capacité nominale en kWh à 100 % de SOC si pas d’entité. XOR avec le sélecteur ci-dessus.",
            "batt_max_charge_w_entity": "Entité pour la puissance max de charge (W) onduleur/BMS (limite technique), pas la puissance mesurée en direct. XOR avec la saisie manuelle.",
            "batt_max_charge_w": "Puissance max de charge (W) manuelle. XOR avec l’entité.",
            "batt_max_discharge_w_entity": "Entité pour la puissance max de décharge (W). XOR avec la valeur manuelle.",
            "batt_max_discharge_w": "Puissance max de décharge (W) manuelle. XOR avec l’entité.",
            "batt_soc_min_entity": "Entité SOC minimum utilisable (0–100 %) si le pack n’atteint jamais vraiment 0 % à l’affichage. XOR avec le pourcentage manuel.",
            "batt_soc_min": "SOC plancher manuel (0–100). XOR avec l’entité.",
            "batt_soc_max_entity": "Entité pour le SOC max affiché (0–100 %) quand le pack n’atteint pas 100 %. XOR avec le pourcentage manuel.",
            "batt_soc_max": "SOC plafond manuel (0–100). XOR avec l’entité.",
        }
    },
}

OPTIONS_EN: dict[str, Any] = {
    "tempo": {"data_description": {"tempo_mode": "Switch between RTE API colours and API Couleur Tempo after install."}},
    "tempo_rte": {
        "data_description": {
            "rte_client_id": "Update the RTE OAuth client id; secret can stay blank to keep the stored value.",
            "rte_client_secret": "New secret when rotating credentials; leave empty to keep the previous secret on save.",
        }
    },
    "offer": {
        "data_description": {
            "supplier_custom_name": "Required when supplier is “Other”; short display name only.",
        }
    },
    "grid_phases": {
        "data_description": {
            "grid_import_energy_phases": "JSON list of {phase, entity_id} objects for per-phase import kWh.",
            "grid_export_energy_phases": "Optional export list with the same JSON shape.",
            "grid_power_phases": "Optional per-phase grid power entities for summed live power.",
        }
    },
    "tri_grid_phase_1": CONFIG_EN["tri_grid_phase_1"],
    "tri_grid_phase_2": CONFIG_EN["tri_grid_phase_2"],
    "tri_grid_phase_3": CONFIG_EN["tri_grid_phase_3"],
    "solar_estimation": CONFIG_EN["solar_estimation"],
    "battery_pick": {
        "data_description": {
            "battery_index": "Pick which saved battery to edit when you are not deleting or adding in the same submit.",
            "add_new": "Turn on to open a blank battery form. Cannot be combined with delete on the same submit.",
            "batt_remove_selected": "Turn on to remove the highlighted battery and save; last battery disables support.",
        }
    },
    "battery_more": CONFIG_EN["battery_more"],
    "battery_add": {
        "data_description": {
            **CONFIG_EN["battery_add"]["data_description"],
        }
    },
    "battery_advanced": {"data_description": dict(CONFIG_EN["battery_advanced"]["data_description"])},
    "reinjection": {
        "data_description": {
            "reinjection_export_ignore_below_w": "Grid export power (W) at or below this is ignored for reinjection classification: diagnostics fall back to “unattributed” and the continuous-export timer resets. Set just above meter noise (default 10 W). Lower = fewer false export events; higher = count smaller injections.",
            "reinjection_batt_charge_significant_w": "Battery charge power (W) strictly above this counts as “significant charging” in the export-vs-solar branches. At or below = treated as not materially charging, which steers causes between solar surplus and battery full / idle. Default 0 means any charge > 0 W is significant.",
            "reinjection_short_export_max_s": "If export has lasted at most this many seconds and its power is at most “Switch latency max power (W)”, the event is classified as switch_latency (brief transient). Increase if real exports ramp slowly; decrease if genuine export should be recognised sooner.",
            "reinjection_short_export_max_w": "Paired with max duration: both conditions must hold for the latency bucket. Typical use: filter short inverter/controller bumps without labelling a sustained export as noise.",
            "reinjection_min_solar_for_classify_w": "Minimum PV production (W) required before solar-heavy classification branches run. Below this, strong export may end up unattributed unless another rule matches.",
            "reinjection_export_min_abs_w": "Builds a dynamic export bar together with the fraction: threshold = max(this watts, fraction × solar_w). Guarantees a minimum export level even when PV is very small.",
            "reinjection_export_vs_solar_fraction": "Fraction (0–1) of current solar power used in the dynamic export bar (see min export field). Example: 0.2 with 2000 W PV → 400 W of the threshold comes from PV; the min-abs watts still applies.",
            "reinjection_batt_full_min_soc_frac": "SOC fill ratio (0–1). When SOC is known and below this, some branches prefer solar_surplus; at/above, combined with low charge power, the pack is treated as “full enough” for battery_full_or_absent-style causes.",
        }
    },
    "advanced_energy": {
        "data_description": {
            "max_delta_kwh_grid": "Maximum positive grid import or export kWh jump accepted in one hub update. If HA was down and the meter moved more than this before the next poll, the excess is discarded for internal slot/cost math (raw meter still advances). Raise for rare long outages; keep moderate to block spikes.",
            "max_delta_kwh_solar": "Same guard for the solar production kWh counter. Tighten if the inverter sometimes posts absurd single-step increases.",
            "max_delta_kwh_battery": "Applies independently to each configured battery charge and discharge total_increasing counter. Large domestic packs rarely need >80 kWh per step unless you intentionally aggregate stacks.",
            "max_delta_kwh_other": "Fallback cap for any other hub energy source (not grid, solar, or named battery counters). Use when you route extra meters through “other” paths.",
        }
    },
}

OPTIONS_FR: dict[str, Any] = {
    "tempo": {
        "data_description": {
            "tempo_mode": "Basculer entre couleurs via API RTE et API Couleur Tempo après installation.",
        }
    },
    "tempo_rte": {
        "data_description": {
            "rte_client_id": "Mettre à jour l’identifiant client OAuth RTE ; le secret peut rester vide pour conserver l’existant.",
            "rte_client_secret": "Nouveau secret lors d’une rotation ; laisser vide pour garder l’ancien à l’enregistrement.",
        }
    },
    "offer": {
        "data_description": {
            "supplier_custom_name": "Obligatoire si fournisseur « Autre » ; nom court d’affichage.",
        }
    },
    "grid_phases": {
        "data_description": {
            "grid_import_energy_phases": "Liste JSON {phase, entity_id} pour les compteurs kWh d’import par phase.",
            "grid_export_energy_phases": "Liste export optionnelle, même format JSON.",
            "grid_power_phases": "Entités de puissance (W) par phase optionnelles pour la somme temps réel.",
        }
    },
    "tri_grid_phase_1": CONFIG_FR["tri_grid_phase_1"],
    "tri_grid_phase_2": CONFIG_FR["tri_grid_phase_2"],
    "tri_grid_phase_3": CONFIG_FR["tri_grid_phase_3"],
    "solar_estimation": CONFIG_FR["solar_estimation"],
    "battery_pick": {
        "data_description": {
            "battery_index": "Choisir quelle batterie éditer si vous ne supprimez ni n’ajoutez sur la même validation.",
            "add_new": "Active pour ouvrir une saisie vide ; incompatible avec la suppression sur la même validation.",
            "batt_remove_selected": "Active pour supprimer la ligne choisie ; si c’était la dernière, le suivi batterie s’arrête.",
        }
    },
    "battery_more": CONFIG_FR["battery_more"],
    "battery_add": {"data_description": dict(CONFIG_FR["battery_add"]["data_description"])},
    "battery_advanced": {"data_description": dict(CONFIG_FR["battery_advanced"]["data_description"])},
    "reinjection": {
        "data_description": {
            "reinjection_export_ignore_below_w": "Puissance d’export réseau (W) en dessous ou égale à ce seuil : ignorée pour la classification « réinjection » — diagnostic plutôt « non attribué » et remise à zéro du chronomètre d’export continu. Réglez juste au-dessus du bruit du compteur (défaut 10 W). Plus bas = moins de faux exports ; plus haut = compter de petites injections.",
            "reinjection_batt_charge_significant_w": "Puissance de charge batterie (W) strictement au-dessus de ce seuil = « charge significative » dans les branches export vs solaire. En dessous ou égal = pas de charge matérielle, ce qui oriente le diagnostic entre surplus solaire et batterie pleine / inactive. 0 = toute charge > 0 W est significative.",
            "reinjection_short_export_max_s": "Si l’export dure au plus ce nombre de secondes et sa puissance ne dépasse pas « Puissance max latence (W) », classification switch_latency (transitoire). Augmentez si vos vrais exports montent lentement ; diminuez pour reconnaître plus tôt un export réel.",
            "reinjection_short_export_max_w": "Associé à la durée : les deux conditions doivent être vraies pour le panier « latence ». Filtre les courts à-coups onduleur/régulation sans traiter un export soutenu comme du bruit.",
            "reinjection_min_solar_for_classify_w": "Production PV minimale (W) avant d’activer les branches « fort solaire ». En dessous, un export marqué peut rester non attribué si aucune autre règle ne s’applique.",
            "reinjection_export_min_abs_w": "Construit avec la fraction un seuil dynamique d’export : max(cette puissance en W, fraction × puissance_solaire). Garantit un plancher d’export même quand le PV est très faible.",
            "reinjection_export_vs_solar_fraction": "Part (0–1) de la puissance solaire instantanée dans ce seuil dynamique (voir champ export minimal). Ex. 0,2 et 2000 W PV → 400 W issus du solaire ; le plancher absolu s’applique toujours.",
            "reinjection_batt_full_min_soc_frac": "Rapport de SOC (0–1). Si le SOC est connu et strictement inférieur, certaines branches privilégient solar_surplus ; au-delà, avec peu de charge, la batterie est vue comme « assez pleine » pour des causes proches de battery_full_or_absent.",
        }
    },
    "advanced_energy": {
        "data_description": {
            "max_delta_kwh_grid": "Plafond de variation positive (kWh) acceptée en une mise à jour pour l’import ou l’export réseau. Après une longue coupure HA, si le compteur a sauté plus que cette valeur, l’excédent n’entre pas dans la comptabilité interne par créneau (le compteur brut avance quand même). Augmentez pour rares grosses reprises ; gardez modéré contre les spikes.",
            "max_delta_kwh_solar": "Même garde-fou pour le compteur kWh de production PV. Serrez si l’onduleur publie parfois des bonds irréalistes.",
            "max_delta_kwh_battery": "S’applique à chaque compteur charge/décharge total_increasing configuré. Les packs domestiques dépassent rarement 80 kWh entre deux polls sauf agrégation volontaire.",
            "max_delta_kwh_other": "Plafond de repli pour toute autre source d’énergie du hub (hors réseau, PV et compteurs batterie nommés). Utile pour des compteurs « autres ».",
        }
    },
}


def main() -> None:
    strings_doc = json.loads(STRINGS.read_text(encoding="utf-8"))
    en_tr_doc = json.loads(STRINGS_EN.read_text(encoding="utf-8"))
    fr_doc = json.loads(STRINGS_FR.read_text(encoding="utf-8"))
    _apply_config_merges(strings_doc, CONFIG_EN)
    _apply_options_merges(strings_doc, OPTIONS_EN)
    _apply_config_merges(en_tr_doc, CONFIG_EN)
    _apply_options_merges(en_tr_doc, OPTIONS_EN)
    _apply_config_merges(fr_doc, CONFIG_FR)
    _apply_options_merges(fr_doc, OPTIONS_FR)
    STRINGS.write_text(json.dumps(strings_doc, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    STRINGS_EN.write_text(json.dumps(en_tr_doc, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    STRINGS_FR.write_text(json.dumps(fr_doc, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(
        f"Updated {STRINGS.relative_to(REPO)}, {STRINGS_EN.relative_to(REPO)}, {STRINGS_FR.relative_to(REPO)}"
    )


if __name__ == "__main__":
    main()
