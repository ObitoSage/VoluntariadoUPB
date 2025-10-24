Plantini chat integration

This folder implements the Plantini chatbot integration for VoluntariadoUPB.

Notes and configuration
- The backend base URL is centralized in `src/config/gemini.ts`. It reads, in order of preference:
	1. `Constants.manifest.extra.GEMINI_BASE_URL` (recommended - add to `app.json` under `expo.extra`)
	2. `process.env.GEMINI_BASE_URL` (development)
	3. Fallback to `http://localhost:3000` (not recommended for device testing)

	For ngrok testing, set the ngrok https URL in `app.json` like:

	{
		"expo": {
			"extra": {
				"GEMINI_BASE_URL": "https://abcd-12-34-56.ngrok.io"
			}
		}
	}

- Chat persistence uses Zustand + AsyncStorage under key `chat_store_v1`. The `chatId` is persisted so conversations survive navigation and app restarts.
- The client performs a lightweight client-side scope check to avoid sending out-of-domain queries. Plantini will reply with a short rejection message for out-of-scope prompts; the backend enforces context as well.
- Image picking uses `expo-image-picker` and attachments are uploaded as multipart/form-data. Current implementation limits quality to reduce size but does not perform heavy compression (can be improved by adding `expo-file-system`/`sharp` on server-side).

Files:
- `services/chatApi.ts` – wrapper for POST `/gemini/chat-stream` with streaming support (reads base URL from `src/config/gemini.ts`).
- `store/chatStore.ts` – Zustand store persisted in AsyncStorage
- `hooks/useChat.ts` – hook exposing sendMessage, cancel, messages. Adds:
	- chatId persistence into the store
	- incremental streaming updates using a placeholder message
	- retry/backoff for transient network errors
- `components/*` – UI components and Chat screen. `PlantiniHomeCard` is included only in the Home tab. There is a floating button component in `PlantiniFloatingButton.tsx`, but it is not used globally; Plantini must be accessed from Home.

Testing tips
- Start your backend or run `ngrok http 3000` and copy the https URL. Put it into `app.json` as explained above. Restart Metro/Expo to pick up `Constants.manifest.extra`.
- Open the Home tab and tap the Plantini card “Abrir chat”. The chat will reuse/generate a `chatId` and load persisted history.
- Try asking an out-of-scope question (e.g., "¿Cuál es el clima?") — Plantini should reply with a short refusal without querying the backend.

Security note
- Do not store or send sensitive personal data to the backend without user consent. If you plan to persist conversations to Firestore, use a separate collection and ensure users opt-in.
