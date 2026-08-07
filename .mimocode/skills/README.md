# MiMo AI Skills

This directory contains skill definitions that MiMo AI can use to call your server actions.

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
