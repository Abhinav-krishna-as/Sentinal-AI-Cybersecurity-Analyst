SENTINAL AI — RESEND EMAIL FIX

This package replaces only Sentinal AI files. It does not include or modify Hanu AI files.

Files:
- dashboard/app.py
- dashboard/static/dashboard.js
- cybi_incident_automation.py

Why this fixes the issue:
- The dashboard email endpoint uses the Resend HTTP API and attaches a generated PDF.
- The background CYBI incident worker now also uses Resend HTTP API instead of SMTP.
- The worker no longer displays or requires CYBI_SMTP_HOST, CYBI_SMTP_USER, CYBI_SMTP_PASSWORD, or CYBI_SMTP_FROM.
- If no automation profile exists, the worker defaults to disabled.

Install:
1. Stop Sentinal AI with Ctrl+C.
2. Back up these existing Sentinal files:
   dashboard/app.py
   dashboard/static/dashboard.js
   cybi_incident_automation.py
3. Extract this ZIP into:
   C:\Users\abhin\OneDrive\Documents\Sentinal AI
   Allow the three files above to be replaced.
4. Configure RESEND_API_KEY for the Sentinal process. The app loads the project's .env at startup, so either put RESEND_API_KEY=your_actual_key in Sentinal AI's own .env, or set the Windows environment variable and open a new terminal. Never share the key.
5. Start Sentinal:
   cd "C:\Users\abhin\OneDrive\Documents\Sentinal AI"
   python -m uvicorn dashboard.app:app --host 127.0.0.1 --port 8001
6. Test CYBI > Generate > Email > Send PDF by email.

Resend sender note:
The default sender is Sentinal AI <onboarding@resend.dev>, which is restricted to Resend's testing rules (usually the account owner's verified address). To send to other recipients, verify a domain in Resend and set RESEND_FROM_EMAIL to a sender on that verified domain. This is a sender setting, not the recipient field.

The dashboard's one-off email action and the background incident automation both use Resend. Actual delivery requires a valid API key and an allowed sender/recipient combination.
