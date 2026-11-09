# Deye Solar Monitor

A personal solar monitoring web application that connects directly to the official **Deye Cloud OpenAPI** and provides real-time inverter and solar telemetry, replacing the need for the mobile application.

---

## Features

- **Direct Deye Cloud OpenAPI Integration**: Authenticates securely server-side using SHA-256 hashed credentials, handles token caching and automated renewal.
- **Real-Time Telemetry Dashboard**:
  1. Solar Production ($kW$)
  2. Today's Generation ($kWh$)
  3. Lifetime Total Generation ($kWh$)
  4. Home Consumption ($W / kW$)
  5. Grid Import / Export ($W / kW$)
  6. Battery State of Charge ($SOC\ \% $)
  7. Battery Charging / Discharging Power ($W / kW$)
  8. Inverter Connectivity Status (Online / Offline)
- **Interactive Energy Flow Diagram**: Visualizes real-time power flows between Solar Panels $\to$ Inverter $\to$ Home / Grid / Battery with animated direction indicators.
- **Generation Analytics (Recharts)**: Production curves and daily/monthly/yearly comparison charts with customizable date filters and granularity settings.
- **Hardware Discovery**: Automatically discovers registered stations, dataloggers, inverters, and supported measure points.
- **Data Integrity**: No fabricated or mock metrics — displays "Unavailable" for fields not returned by the inverter.
- **Security-First Architecture**: All API keys, secrets, passwords, and access tokens are kept strictly server-side in Route Handlers. Never exposed to browser JavaScript.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: JavaScript (ES Modules)
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Backend**: Next.js Route Handlers (`app/api/deye/*`)
- **Hosting**: Netlify
- **Source Control**: GitHub

---

## Environment Variables

Configure your credentials in `.env.local` (kept out of version control via `.gitignore`):

# Regional Base URL

> **Note on Password Encryption**: The application automatically handles the standard SHA-256 lowercase hexadecimal password encryption required by the Deye Cloud OpenAPI. You supply your account password in `.env.local`, and `lib/deye.js` securely hashes it server-side.

---

## API Routes Reference

All routes are implemented as Next.js App Router Route Handlers in `app/api/deye/`:

| Route | Method | Description | Parameters |
|---|---|---|---|
| `/api/deye/auth` | `GET` | Validates credentials & returns authentication status (never exposes tokens) | None |
| `/api/deye/stations` | `GET` | Retrieves user's solar stations list & installed capacity | None |
| `/api/deye/devices` | `GET` | Retrieves inverters & dataloggers associated with a station | `?stationId=<id>` |
| `/api/deye/live` | `GET` | Retrieves latest telemetry metrics for inverter(s) | `?deviceSn=<sn1,sn2>` |
| `/api/deye/history` | `GET` | Retrieves historical generation records | `?deviceSn=<sn>&startAt=YYYY-MM-DD&endAt=YYYY-MM-DD&granularity=1..4` |
| `/api/deye/measure-points` | `GET` | Discovers available telemetry points supported by the hardware | `?deviceSn=<sn>` |

---

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure `.env.local` with your Deye developer credentials.

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Netlify Deployment Guide (GitHub $\to$ Netlify)

1. Push your repository to **GitHub**:
   ```bash
   git add .
   git commit -m "feat: complete Deye Solar Monitor"
   git push origin main
   ```

2. Log into [Netlify](https://app.netlify.com/) and click **"Add new site"** $\to$ **"Import an existing project"**.
3. Select your GitHub repository.
4. Netlify automatically detects Next.js via the root `netlify.toml`:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
5. Under **Site configuration** $\to$ **Environment variables**, add
6. Click **Deploy**. Netlify's Next.js runtime adapter provisions the Route Handlers and server components with zero additional configuration.

---

## Future Database Roadmap (Supabase)

The centralized service module in `lib/deye.js` and Route Handlers are organized with clear boundaries to enable seamless insertion of a Supabase persistence layer for:
- Long-term 5-minute telemetry storage.
- Custom alerting & outage notifications.
- Solar ROI and tariff calculation.
