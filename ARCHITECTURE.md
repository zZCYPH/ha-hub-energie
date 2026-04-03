# hub_energie Architecture

## Goals

- Keep the integration as the owner of runtime energy and diagnostics logic.
- Keep the coordinator thin by delegating domain computations to pure modules.
- Preserve Home Assistant behavior and snapshot output keys while reducing coupling.

## High-Level Layers

1. External inputs
   - Coordinator reads Home Assistant entities and provider data.
   - External entities are runtime inputs only.

2. Internal model and persistence
   - Store-backed model and statistics integration are managed by coordinator/storage helpers.
   - Day boundaries and slot attribution are computed in Paris timezone helpers.

3. Domain computation modules
   - `energy/`: aggregation, origin split, costs/savings.
   - `power/`: flow model and reinjection classification/diagnostics.
   - `battery/`: battery metrics and slot split heuristics.
   - `solar/`: production estimation helpers.
   - `tempo/`: Tempo counters and season helpers.

4. Snapshot assembly
   - `snapshot/pipeline.py` orchestrates all domain calls.
   - `snapshot/snapshot_builder.py` assembles the final snapshot dictionary.

5. Coordinator support modules
   - `runtime_state.py`: owns mutable runtime accumulators and delta application.
   - `persistence_manager.py`: owns Store load/save, migration, and recorder durability writes.
   - `scheduler.py`: owns poll/midnight/tariff refresh schedule lifecycle.
   - `diagnostics/reinjection_state.py`: owns reinjection diagnostics state and transitions.
   - `time/paris_time.py`: centralizes all Europe/Paris day-boundary helpers.

## Dependency Direction

- `coordinator.py` depends on domain modules and snapshot pipeline.
- Domain modules do not depend on Home Assistant internals.
- `snapshot/pipeline.py` depends on injected callables (`SnapshotPipelineDeps`) so logic remains unit-testable.
- `snapshot/snapshot_builder.py` is a pure formatter from typed input to final snapshot payload.

## Snapshot Pipeline Contract

- Inputs are grouped in `SnapshotPipelineInputs` (immutable dataclass).
- Intermediate domain outputs are typed dataclasses (`EnergyAggregation`, `PowerFlowModel`, etc.).
- Output is `SnapshotPipelineResult` with:
  - final `snapshot` payload
  - flow mismatch diagnostics metadata
  - updated warning timestamp state for coordinator rate-limited logging

## Snapshot Pipeline Responsibilities

The pipeline is responsible for:
- orchestrating domain computations in the correct order
- ensuring data consistency across modules
- enforcing computation invariants (e.g. energy conservation)
- not performing any I/O or persistence

## Coordinator Responsibilities

- Acquire source values, options, and current state under its own synchronization model.
- Build immutable pipeline input objects.
- Call `SnapshotPipeline.run(...)`.
- Persist/update coordinator-owned runtime state and issue warnings.
- Expose final sensor-facing snapshot values.

## Battery Aggregation Model

- Batteries are aggregated using capacity-weighted metrics
- Missing data is tolerated but degrades quality level
- Charge origin split:
  - grid vs solar determined via power flow or heuristics
- A global battery state is derived for diagnostics and control logic

## Data Quality Model

Each snapshot includes implicit data quality levels:

- OK: all required sensors available
- PARTIAL: some inputs missing, fallback logic used
- POOR: critical inputs missing, degraded accuracy

Modules must avoid silent failure and prefer explicit degradation.

## Home Assistant Boundary

- Home Assistant is treated as an I/O layer only
- All domain logic must be HA-agnostic
- Domain modules must be reusable outside Home Assistant

## Core Invariants

- Energy conservation:
  solar + grid + battery_discharge = home + battery_charge + export

- No negative energy values

- Power flow consistency:
  modelled home power must not exceed available supply

- Slot attribution is strictly monotonic within a day

## Module boundaries (simplicity)

For v0.2 the following separation is **intentionally kept**:

- **`snapshot/coordinator_bridge.py`** — Coordinates wiring from `HubEnergieCoordinator` to the pure `SnapshotPipeline` (reader, options, EDF fields). Merging this into `coordinator.py` would create a very large, hard-to-test module; the bridge is mostly one-off callables and stays the single “HA → pipeline adapter”.
- **`snapshot/pipeline.py` + `snapshot/snapshot_builder.py`** — Orchestration vs pure dict assembly; splitting avoids mixing ordering constraints with formatting.
- **`runtime/state.py` vs `runtime/persistence.py`** — Mutable accumulators vs Store/recorder I/O and debounced saves.

Modules that only made sense when duplicated have already been removed elsewhere; do not add new layers without a clear testability or I/O boundary.

## Testing Strategy

- Unit test each domain module in isolation.
- Unit test snapshot builder key and rounding behavior.
- Unit test snapshot pipeline orchestration with dependency injection and flow warning cases.
- Keep Home Assistant integration tests focused on wiring and lifecycle behavior.

## Advanced Testing Strategy

- Scenario-based tests:
  - full solar day
  - no solar / grid only
  - battery full / empty transitions
  - Tempo red day edge cases

- Regression snapshots:
  - compare full snapshot output for known inputs

- Property-based tests:
  - ensure invariants (energy conservation) always hold

- Fault injection:
  - missing sensors
  - invalid values