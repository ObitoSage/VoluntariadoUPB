Changelog - Plantini integration fixes

What I changed
- Centralized GEMINI base URL in `src/config/gemini.ts`. Use expo `app.json` -> `expo.extra.GEMINI_BASE_URL` for ngrok or remote URL.
- Updated `services/chatApi.ts` to use the new config instead of `process.env`.
- Updated `hooks/useChat.ts` to persist `chatId` into the Zustand store, add AbortController cleanup on unmount, and implement retry/backoff for transient errors.
- Added avatar to the Chat screen header and updated the Home `PlantiniHomeCard` text to emphasize scope.
- Basic file-type validation/warning in `AttachmentPicker` (no new deps added).
- Updated `src/features/chat/README.md` with instructions and ngrok guidance.

Why
- Ensure Plantini only appears in Home and uses a configurable backend URL (ngrok friendly).
- Keep chat context (chatId) persistent across app navigation and restarts.
- Fix streaming & retry behavior and ensure UI updates incrementally without duplications.

How to configure & test (quick)
1. Run backend locally or via ngrok: `ngrok http 3000` and copy the https URL.
2. In `app.json` add under `expo.extra`:

   "GEMINI_BASE_URL": "https://abcd-12-34-56.ngrok.io"

3. Restart Metro/Expo so `Constants.manifest.extra` is available.
4. Open the app -> Home tab. Tap the Plantini card.
5. Send an app-related message (e.g., "¿Cómo postulo a una oportunidad?") and observe streaming response and persistence.
6. Send an off-topic question (e.g., "¿Cuál es el clima?") — Plantini should reply with a short refusal message without calling backend.

Notes & next steps
- For robust file-size checks consider adding `expo-file-system` to inspect file size prior to upload.
- Consider server-side persistence to `chats/{chatId}/messages` in Firestore with explicit user consent (not implemented here).
