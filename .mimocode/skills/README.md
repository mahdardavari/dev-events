# MiMo AI Skills

This directory contains skill definitions that MiMo AI can use to call your server actions.

## Available Skills

### 1. searchEvents
Search for events by title, tag, location or date.

**Example MiMo prompt:**
```
Find all online events about "AI" happening in 2024
```

**MiMo will call:**
```typescript
import { searchEvents } from "@/lib/actions/event.actions/searchEvents";

const results = await searchEvents({
  query: "AI",
  mode: "online",
  date: "2024"
});
```

---

### 2. smartBooking
Book an event with automatic duplicate detection.

**Example MiMo prompt:**
```
Book me for the "tech-conf-2024" event, my email is user@example.com
```

**MiMo will call:**
```typescript
import { smartBooking } from "@/lib/actions/event.actions/smartBooking";

const result = await smartBooking({
  eventSlug: "tech-conf-2024",
  email: "user@example.com",
  userName: "John Doe"
});
```

---

### 3. eventAnalytics
Get statistics and analytics from events and bookings.

**Example MiMo prompt:**
```
Show me booking statistics for this month
```

**MiMo will call:**
```typescript
import { eventAnalytics } from "@/lib/actions/event.actions/eventAnalytics";

const stats = await eventAnalytics({
  timeRange: "month"
});
```

---

## How MiMo AI Uses Skills

1. **User sends a prompt** to MiMo AI
2. **MiMo analyzes** the prompt and identifies which skill(s) to use
3. **MiMo extracts** the parameters from the user's natural language
4. **MiMo calls** the server action with the extracted parameters
5. **MiMo formats** the response and returns it to the user

## Adding New Skills

1. Create a JSON file in this directory with the skill definition
2. Create the corresponding server action in `lib/actions/`
3. The handler path should point to the server action file

### Skill JSON Schema

```json
{
  "name": "skillName",
  "description": "What this skill does",
  "inputs": {
    "paramName": {
      "type": "string|number|boolean|array|object",
      "required": true|false,
      "description": "Parameter description",
      "enum": ["value1", "value2"]
    }
  },
  "output": {
    "type": "object|array",
    "properties": { ... }
  },
  "handler": "path/to/server-action.ts"
}
```
