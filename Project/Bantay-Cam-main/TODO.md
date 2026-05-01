# 📱 Bantay Cam — ClickSend SMS Integration TODO

> Track all remaining setup, wiring, and production-hardening tasks for the ClickSend SMS alert feature.

---

## 1. ClickSend Environment Setup

- [ ] Sign up at [clicksend.com](https://www.clicksend.com) and verify your account
- [ ] Get your ClickSend API key from Settings -> API Credentials
- [ ] Create or open `.env.local` in the project root
- [ ] Add `VITE_CLICKSEND_API_KEY=your_api_key_here`
- [ ] Add `VITE_CLICKSEND_SENDER_ID=BantayCam` (max 11 chars)
- [ ] Confirm `.env.local` is listed in `.gitignore` ✅
- [ ] Restart Vite dev server: `npm run dev`

---

## 2. ClickSend Account Setup

- [ ] Verify your account on ClickSend
- [ ] Configure sender name/ID (max 11 chars), default to `BantayCam`
- [ ] Test with your own number first
- [ ] Check ClickSend balance/credits
- [ ] Confirm Philippine SMS routing works

---

## 3. File Placement / Wiring

- [x] Create `services/clicksendService.ts`
- [x] Update `hooks/useSMSAlerts.ts` to call ClickSend service
- [x] Keep `components/SettingsView.tsx` SMS controls and test button wired
- [x] Keep `App.tsx` SMS hook integration on analysis events
- [x] Remove Twilio-only service usage once ClickSend path is complete

---

## 4. Smoke Test (Local)

- [ ] Run `npm run dev` with no TypeScript errors
- [ ] Open Settings -> SMS Alerts section is visible
- [ ] Toggle **Enable SMS Alerts** on
- [ ] Add PH test number (e.g. `+639171234567`)
- [ ] Click **Send Test Message** -> see success status
- [ ] Confirm test SMS arrives on device
- [ ] Trigger DANGER event -> alert SMS received
- [ ] Trigger second DANGER within cooldown -> no duplicate send
- [ ] Toggle SMS off -> no SMS on next threat

---

## 5. Configuration QA

- [ ] Add multiple recipients -> broadcast sends to all
- [ ] Remove a recipient -> broadcast no longer includes them
- [ ] Adjust **DANGER Cooldown** slider -> verify cooldown update
- [ ] Adjust **CAUTION Cooldown** slider -> verify cooldown update
- [ ] Reload page -> recipients and toggles persist via `localStorage`

---

## 6. Production Hardening ⚠️

> Do not ship ClickSend API keys in frontend bundles.
> Move SMS delivery to a backend proxy/function before public deployment.

- [ ] Create an Appwrite Function (Node.js) that accepts `{ to, body }` and calls ClickSend server-side
- [ ] Store ClickSend secrets as function environment variables (not frontend)
- [ ] Update frontend SMS service to call proxy endpoint instead of ClickSend directly
- [ ] Remove `VITE_CLICKSEND_API_KEY` from frontend env for production
- [ ] Keep only `VITE_SMS_PROXY_URL` in frontend env
- [ ] Add request authentication to proxy endpoint
- [ ] Test proxy end-to-end in staging before deploy

---

## 7. Polish (Optional)

- [ ] Show SMS send history in Logs (timestamp + recipient + status)
- [ ] Add badge/counter in header when SMS is enabled
- [ ] Support custom message templates per severity
- [ ] Add DND schedule to suppress alerts during selected hours
- [ ] Validate PH numbers start with `+639` and are exactly 13 chars
- [ ] Show "Last alerted X seconds ago" per severity

---

