# PetX Frontend (React + Vite)

A simple React UI to upload an image and get predictions from the backend.

## Prerequisites
- Node.js 18+

## Setup
```bash
cd frontend
npm install
```

## Run (development)
```bash
npm run dev
```
The browser should open automatically. If not, visit the shown localhost URL.

## Build & Preview
```bash
npm run build
npm run preview
```

## Backend endpoints
- Default: `https://minor-project-petx.onrender.com/predictImage` with form field `image`
- Alternate: `https://minor-project-petx.onrender.com/predict` with form field `file`

You can switch endpoints from the dropdown in the UI.

## Notes
- No backend changes are required.
- If you face CORS/network issues, verify the backend allows requests from your origin.
