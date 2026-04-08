# Advanced schedule slots (manual tariff)

When you configure **Hub Énergie** with a manual offer and **Advanced schedule** pricing, each **slot** defines a time range, an energy price, which days it applies to, and an optional label.

The integration stores slots as a JSON **array of objects** in `schedule_slots` (Home Assistant config entry data).

## JSON shape

Each element is an object with:

| Field       | Required | Type   | Description |
|------------|----------|--------|-------------|
| `start`    | yes      | string | Start time, `HH:MM` (24 h). Seconds (`HH:MM:SS`) are accepted and normalized to `HH:MM`. |
| `end`      | yes      | string | End time, same format. **`00:00` means midnight at the end of the day** (24:00), not midnight at the start. Use this for ranges that cross midnight (e.g. `22:00` → `00:00`). |
| `price`    | yes      | number | Energy price in your configured currency per kWh (non-negative). |
| `day_type` | no       | string | One of: `all`, `weekdays`, `weekends`. Default: `all`. |
| `name`     | no       | string | Short label for UI/logs (e.g. `Night`, `Peak`). |

## `day_type` values

- `all` — every day  
- `weekdays` — Monday–Friday  
- `weekends` — Saturday and Sunday  

## Minimal example

```json
[
  {
    "start": "22:00",
    "end": "06:00",
    "price": 0.1296,
    "day_type": "all",
    "name": "Off-peak"
  },
  {
    "start": "06:00",
    "end": "22:00",
    "price": 0.1609,
    "day_type": "all",
    "name": "Peak"
  }
]
```

## Example with different weekday / weekend prices

```json
[
  {
    "start": "00:00",
    "end": "06:00",
    "price": 0.12,
    "day_type": "all",
    "name": "Night"
  },
  {
    "start": "06:00",
    "end": "22:00",
    "price": 0.18,
    "day_type": "weekdays",
    "name": "Weekday day"
  },
  {
    "start": "06:00",
    "end": "22:00",
    "price": 0.15,
    "day_type": "weekends",
    "name": "Weekend day"
  },
  {
    "start": "22:00",
    "end": "00:00",
    "price": 0.12,
    "day_type": "all",
    "name": "Evening"
  }
]
```

## Validation rules (summary)

- At least one slot is required.  
- Times must be valid 24 h `HH:MM`.  
- `price` must be a number ≥ 0.  
- `day_type`, if present, must be exactly one of the three allowed values.  

The tariff engine matches the current local time and weekday against slots; overlapping rules depend on how slots are ordered and evaluated in code—keep your intent clear and avoid redundant overlaps when possible.

## Config flow: form vs JSON

The setup wizard first asks whether you want the **form** or **JSON** mode.

- **Form** — up to **6** slots with time pickers, price, day type, and optional name (no raw JSON).  
- **JSON** — paste a full array as in the examples above (for advanced or bulk edits). Use JSON if you need more than six slots.  

This file is the reference for the JSON format in both cases. In Home Assistant, the setup step links to the **documentation vitrine** (on-site setup help) instead of embedding GitLab URLs in the dialog.
