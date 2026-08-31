# CarePlus Healthcare Portal

A responsive front-end healthcare dashboard built with plain HTML, CSS and JavaScript.

## Included

- Dashboard with health metrics and activity chart
- Doctor search and specialty filtering
- Appointment booking, editing/removal demo flows
- Health record upload/view/download demo
- Medication management
- Lab test booking
- Health tracking
- Health articles
- Emergency assistance page
- Editable profile
- Notifications
- Settings and dark mode
- Responsive desktop/tablet/mobile layout
- Large synthetic clinical reference catalogs (doctors, medicines, labs, protocols)

## Install

```bash
cd careplus-healthcare-portal

# Optional: install dev dependencies for tests
npm install
```

No runtime npm packages are required to run the application.

## Build

```bash
npm run build
```

Static frontend — no compile step. Assets are served as-is.

## Run

### Option A — Open file

Open `index.html` in any modern browser.

### Option B — Local server (recommended)

```bash
python3 -m http.server 8000
# or
npm start
```

Open http://localhost:8000

### Option C — Docker

```bash
docker build -t careplus-portal .
docker run -p 8080:80 careplus-portal
```

Open http://localhost:8080

## Tests

```bash
npm install
npm test
```

## Important

This is a front-end demonstration. It does not connect to a real hospital, pharmacy, laboratory, payment service, electronic health record, or emergency dispatch system. **Do not enter real sensitive medical information into this demo.**

## License

Proprietary — All rights reserved. UNLICENSED.
