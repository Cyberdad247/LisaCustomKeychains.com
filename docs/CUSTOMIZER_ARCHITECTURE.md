# 🛠️ Keychain Customizer Architecture & Interaction Spec

## 1. Core Components & Interaction Flows

### A. The Visual Forge (Preview Engine)
- **Role:** Real-time visual feedback.
- **Behavior:**
  - Updates instantaneously (`useOptimistic`) on user input.
  - "Breathing" animation (Framer Motion) to simulate hanging fabric.
  - **Interaction:** Passive (Output only). Refined by Control Panel.

### B. The Control Panel (Input Engine)
- **Role:** User input and configuration.
- **Components:**
  - **Yarn Palette:** Color selection with accessibility overlays.
  - **Vibe Input:** AI-driven suggestion engine (Debounced).
  - **Text Matrix:** Direct string input with validation.
  - **Transaction Button:** Smart action button (State: Idle, Loading, Error, Success).

### C. Interaction Flow
1.  **Initiate:** User clicks "Customize" on Product Card.
2.  **Context Load:** `KeychainCustomizer` mounts. URL updated (`?customize=true`).
3.  **Configure:**
    - User selects **Color** -> Preview updates tint.
    - User types **Text** -> Preview renders characters (Optimistic UI).
    - User enters **Vibe** -> AI suggests Charms -> User selects Charm -> Preview updates Icon.
4.  **Validate:** Zod schema checks constraints (Tier limits, profanity).
5.  **Commit:** User clicks "Process Transaction".
6.  **Sync:** Data sent to Shopify Cart API. Inventory checked. Errors caught.
7.  **Completion:** Drawer closes, Cart opens.

---

## 2. Data Structures

### A. Menu Item (Color Option)
```typescript
interface ThreadColor {
  id: string;          // e.g., "purple"
  name: string;        // e.g., "Royal Purple"
  hex: string;         // e.g., "#9333ea" or linear-gradient
  isRainbow?: boolean; // Special rendering flag
  availability: 'in_stock' | 'low_stock' | 'out_of_stock'; // Future extension
}
```

### B. Charm Option (Vibe)
```typescript
interface Charm {
  id: string;          // e.g., "heart"
  name: string;        // e.g., "Heart"
  icon: string;        // Emoji or SVG Path
  category: string;    // e.g., "Romantic"
}
```

### C. Configuration State (The "Payload")
```typescript
interface KeychainConfig {
  text: string;
  color: ThreadColor;
  charm: Charm;
  tier: 1 | 2 | 3;
}
```

---

## 3. API Endpoints

### A. `POST /api/design-ai`
- **Purpose:** Vibe-to-Design Synthesis.
- **Input:** `{ prompt: string }`
- **Output:** `{ text: string, vibe: { icons: Charm[] } }`
- **Security:** Rate-limited, Zod-validated input.

### B. `POST /api/cart/add` (Internal abstraction over Shopify)
- **Purpose:** Sync configuration to Checkout.
- **Input:** `variantId`, `qty`, `attributes[]`
- **Output:** `CartOperationResult` (Cart object or UserErrors).

---

## 4. Validation Rules

### A. Tier Constraints
| Tier | Price | Max Chars | Strands | Logic |
| :--- | :--- | :--- | :--- | :--- |
| **1** | < $6 | 0 (Color Only) | 1 | `text = ""` |
| **2** | < $15 | 8 | 1 | `text.length <= 8` |
| **3** | > $15 | 16 | 2 | `text.length <= 16`, split at 8 |

### B. Input Sanitization
- **Text:** Uppercase only, A-Z, 0-9. No special chars (except space).
- **Vibe:** Max 200 chars. No script tags.

---

## 5. Measurable Outcomes (Metrics)

1.  **Interaction Latency:** Time from Input -> Preview Update (< 16ms, 60fps).
2.  **Conversion Rate:** % of "Customize" opens that result in "Process Transaction".
3.  **Error Rate:** % of submissions rejected by Shopify Inventory checks.
4.  **AI Usage:** % of users engaging with Vibe Input vs Manual Text.
