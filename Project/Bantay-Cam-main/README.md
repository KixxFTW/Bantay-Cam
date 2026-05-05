<div align="center">

```
██████╗  █████╗ ███╗   ██╗████████╗ █████╗ ██╗   ██╗     ██████╗ █████╗ ███╗   ███╗
██╔══██╗██╔══██╗████╗  ██║╚══██╔══╝██╔══██╗╚██╗ ██╔╝    ██╔════╝██╔══██╗████╗ ████║
██████╔╝███████║██╔██╗ ██║   ██║   ███████║ ╚████╔╝     ██║     ███████║██╔████╔██║
██╔══██╗██╔══██║██║╚██╗██║   ██║   ██╔══██║  ╚██╔╝      ██║     ██╔══██║██║╚██╔╝██║
██████╔╝██║  ██║██║ ╚████║   ██║   ██║  ██║   ██║       ╚██████╗██║  ██║██║ ╚═╝ ██║
╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝   ╚═╝        ╚═════╝╚═╝  ╚═╝╚═╝     ╚═╝
```

**AI-powered security camera monitoring with real-time threat analysis**

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite)
![Gemini](https://img.shields.io/badge/Gemini-Flash-4285F4?style=flat-square&logo=google)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

</div>

---

## Overview

**Bantay Cam** (*bantay* — Filipino for "guard" or "watch") is a browser-based security surveillance application that combines live multi-camera feeds with AI-powered threat detection. Each camera frame is analyzed by Gemini Vision against environmental sensor data to produce real-time hazard assessments, incident logs, and emergency alerts.

---

## Features

- **Multi-Camera Grid** — Monitors up to 4 simultaneous camera feeds in a 2×2 grid layout. Cameras are auto-discovered via the browser's MediaDevices API and hot-swappable at runtime.

- **AI Threat Analysis** — Each captured frame is sent to Gemini Vision with ambient sensor context (audio level, motion state, temperature). The model returns a structured threat assessment: `SAFE`, `CAUTION`, or `DANGER`, along with detected hazards and a recommended response.

- **Vision Modes** — Three camera filter presets: **Normal**, **Low Light** (grayscale + contrast boost), and **Thermal** (inverted hue-rotated).

- **Environmental Sensor Panel** — Live readouts for audio level (dB), PIR motion detection, temperature (°C), and atmospheric humidity — all simulated with realistic fluctuation models.

- **Incident Feed** — A real-time sidebar log of every flagged event, searchable and color-coded by severity. Fully exportable as a JSON forensics dump.

- **Emergency Alerts** — Full-screen threat banners and device vibration on `DANGER` detections. Connection loss triggers an overlay notification.

- **Error Resilience** — An `ErrorBoundary` wraps the full application. Camera stream failures, permission errors, and hardware disconnections are each handled with specific user-facing messages and logged to `localStorage` via a singleton `ErrorService`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 19 + TypeScript 5.8 |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS (via Vite plugin) |
| AI Vision | Google Gemini Flash (via `@google/genai`) |
| Runtime Validation | Zod 3 |
| Font | JetBrains Mono + Inter (Google Fonts) |

---

## Project Structure

```
bantay-cam/
├── components/
│   ├── CameraFeed.tsx        # Camera stream, frame capture, per-device error handling
│   ├── ErrorBoundary.tsx     # React error boundary with SYSTEM CRITICAL UI
│   ├── LiveLog.tsx           # Real-time incident sidebar
│   ├── LogView.tsx           # Full-page searchable log with stats
│   ├── MonitorView.tsx       # 2×2 camera grid layout
│   ├── SensorPanel.tsx       # Environmental sensor readout bar
│   ├── SettingsView.tsx      # Scan interval config and diagnostics
│   ├── SMSNotification.tsx   # Toast-style emergency alert overlay
│   └── TabNav.tsx            # Bottom navigation (Monitor / Logs / System)
│
├── hooks/
│   ├── useCameraDevices.ts   # MediaDevices enumeration and hot-plug detection
│   ├── useFrameAnalysis.ts   # Rate-limited Gemini frame processing
│   ├── useSecurityLogs.ts    # Log state, search, filtering, export
│   └── useSensorData.ts      # Simulated sensor data with realistic variance
│
├── services/
│   ├── errorService.ts       # Singleton error logger with localStorage persistence
│   └── geminiService.ts      # Gemini API integration with structured JSON output
│
├── types.ts                  # Branded types, enums, interfaces, type guards
├── validation.ts             # Zod schemas and runtime type assertions
└── App.tsx                   # Root orchestrator — hook wiring, layout, header controls
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- A [Google AI Studio](https://aistudio.google.com) API key (Gemini)

### Installation

```bash
git clone <https://github.com/KixxFTW/Bantay-Cam>
cd bantay-cam
npm install
```

### Configuration

Create a `.env.local` file in the project root:

```env
GEMINI_API_KEY=your_api_key_here
IPROG_API_TOKEN=your_iprog_token_here
IPROG_SMS_PROVIDER=0
```

#### Environment variables

- **`GEMINI_API_KEY`**: Google Gemini API key used by the vision analysis.
- **`IPROG_API_TOKEN`**: Token used by the SMS provider integration (used by the `/api/sms/*` routes).
- **`IPROG_SMS_PROVIDER`**: SMS provider selector (currently `0` in this repo).

> **Security note**: never commit real keys/tokens. If a secret was committed accidentally, rotate it immediately.

### Run

```bash
npm run dev
```

Open the Vite dev server URL (typically `http://localhost:5173`). Grant camera permissions when prompted.

#### Optional: run the local SMS proxy

If you’re developing the SMS API locally (and need a server process in addition to Vite), start:

```bash
npm run dev:proxy
```

---

## API (SMS)

This repo includes serverless-style endpoints under `api/` (deployed on Vercel, and usable locally depending on your setup).

- **`POST /api/sms/send`**: sends an SMS using the configured provider/token.

---

## Usage

1. **Grant camera access** — Bantay Cam will auto-detect all connected video devices and populate the monitor grid.
2. **Select the primary camera** — Click any feed thumbnail to promote it to primary. The primary camera is the one whose frames are sent for AI analysis.
3. **Start scanning** — Press **INITIALIZE SCAN** in the header. The AI will analyze a frame from the primary camera every ~5 seconds.
4. **Switch vision modes** — Toggle between `NORMAL`, `LOW_LIGHT`, and `THERMAL` at any time without interrupting the stream.
5. **Review incidents** — The right-side incident feed updates in real time. Navigate to the **Logs** tab for a full searchable history with severity stats.
6. **Export forensics** — Press the download icon in the header to export all incidents as a timestamped JSON file.

---

## Architecture Notes

### Hook Decoupling

Hooks are kept deliberately unaware of each other. All coupling flows through `App.tsx` via callbacks — for example, `useFrameAnalysis` receives an `onAnalysisComplete` callback injected by `App`, which routes results to `useSecurityLogs.addLog`. This keeps each hook independently testable.

### Branded Nominal Types

`DeviceId` and `LogId` are branded string types that prevent accidental cross-assignment at compile time. The `asDeviceId` and `asLogId` cast helpers are the only sanctioned entry points.

### Error Service

`ErrorService` is a singleton instantiated once at module load. It persists structured error objects to `localStorage` (capped at 100 entries) and is callable from anywhere — components, hooks, and services — without prop drilling.

### Camera Health Tracking

Cameras that emit a terminal error (permission denied, hardware disconnected, device in use) are added to an `unhealthyCameraIds` Set in `App`. They are filtered out of the active camera list and their grid slot reverts to an empty placeholder, preventing repeated failed stream attempts.

---

## Browser Permissions Required

| Permission | Purpose |
|---|---|
| `camera` | Live video feed capture |
| `microphone` | Audio level sensor input (metadata only) |

---

## Build

```bash
npm run build     # Production build to /dist
npm run preview   # Preview production build locally
```

---

## Roadmap

- [ ] Real PIR/microphone sensor integration via Web Audio API
- [ ] SMS/push notification dispatch on DANGER events
- [ ] Multi-camera simultaneous analysis
- [ ] User authentication and role-based access
- [ ] Cloud log sync and remote monitoring dashboard

---

## License

MIT © Bantay Cam Contributors

---

<div align="center">
<sub>Built with React, TypeScript, and Gemini Vision · Designed for the edge</sub>
</div>
