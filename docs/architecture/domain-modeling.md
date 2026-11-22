# Domain Modeling & State Boundary Design

This document captures domain modeling patterns and architecture principles learned from complex domain applications (such as inventory, collectible ateliers, and asset trackers), expressed with neutral enterprise abstractions.

---

## 1. The Core Hazard: Conflating Identity, Current State, and Home Location

A common architectural trap in local-first applications is overloading a single property or entity with multiple distinct facts:

```typescript
// ❌ Anti-pattern: Conflated Entity
interface Equipment {
  id: string;
  name: string;
  location: string; // Ambigous! Is this current position, home shelf, or next destination?
  status: 'idle' | 'in_use' | 'maintenance';
}
```

### Why Conflation Fails:
1. **Lost Home Location**: When the equipment is moved into temporary maintenance or transit, overwriting `location` permanently erases knowledge of where the equipment belongs when returned.
2. **Race Conditions**: Two asynchronous operations updating status vs. position simultaneously can produce invalid permutations (e.g. equipment marked `in_use` while located in `warehouse_bin_4`).
3. **Inference Errors**: Code begins inferring status from location strings (e.g. `if (loc === 'workshop') return 'repairing'`), introducing subtle, fragile heuristics.

---

## 2. Recommended Solution: Four Separate Facets of Reality

Robust domain modeling decomposes entities into four decoupled facts:

```
┌────────────────────────────────────────────────────────┐
│ 1. Immutable Identity & Physical Specs                 │
│    (Serial Number, Model, Dimensions, Manufacturer)    │
├────────────────────────────────────────────────────────┤
│ 2. Current Location & Mount State                      │
│    (Where is it located right now? e.g. Rack B, Slot 3)│
├────────────────────────────────────────────────────────┤
│ 3. Suggested / Home Location                           │
│    (Where does it belong when returned to idle?)       │
├────────────────────────────────────────────────────────┤
│ 4. Historical Event Timeline                           │
│    (Immutable log of past movements and status changes)│
└────────────────────────────────────────────────────────┘
```

### Neutral Implementation Example:

```typescript
export interface AssetSpecification {
  readonly id: string;
  readonly serialNumber: string;
  readonly model: string;
  readonly createdAt: string;
}

export type AssetMountStatus =
  | { state: 'idle'; homeBinId: string }
  | { state: 'mounted'; parentAssetId: string; slotId: string }
  | { state: 'in_transit'; destination: string; departureTime: string }
  | { state: 'maintenance'; ticketId: string; facility: string };

export interface AssetLifecycleRecord {
  id: string;
  assetId: string;
  timestamp: string;
  eventType: 'relocated' | 'mounted' | 'unmounted' | 'serviced';
  details: Record<string, string | number>;
}
```

---

## 3. Transaction Boundaries & Aggregate Roots

- **Single Source of Truth**: When mounting child equipment into a parent machine, update both parent and child inside a single atomic repository transaction.
- **Fail-Safe Rollback**: If one step fails (e.g. slot is already occupied), rollback both operations and surface a domain conflict error.
- **Never rely on UI components to enforce domain invariants**: All business checks (e.g. slot compatibility, circular parent-child nesting) belong inside domain services (`equipmentService.ts`).
