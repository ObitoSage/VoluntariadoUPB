import Constants from 'expo-constants';

// Centralized config for the Gemini backend URL.
// Priority (first available):
// 1. Expo Constants.manifest.extra.GEMINI_BASE_URL (set in app.json under expo.extra)
// 2. process.env.GEMINI_BASE_URL (for dev/metro env)
// 3. Fallback to localhost (only for local emulator) — recommend overriding with ngrok URL.

const extras = (Constants.manifest && (Constants.manifest as any).extra) || (Constants.expoConfig && (Constants.expoConfig as any).extra);
export const GEMINI_BASE_URL =
  (extras && extras.GEMINI_BASE_URL) || process.env.GEMINI_BASE_URL || 'http://localhost:3000';

/*
How to configure:
- For Expo (recommended): add to app.json under expo.extra:
  {
    "expo": {
      "extra": {
        "GEMINI_BASE_URL": "https://abcd-12-34-56.ngrok.io"
      }
    }
  }

- Or set GEMINI_BASE_URL in your environment when running Metro.

Note: Do NOT commit production API keys or sensitive endpoints into source control. For ngrok testing, copy the ngrok https url and set it here.
*/

export default GEMINI_BASE_URL;
