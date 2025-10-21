Generate Financial Report - Demo

This repository contains a static frontend (HTML/CSS/JS) optimized for a narrow Office Task Pane and a sample C# method using OpenXML to create a simple DOCX.

Files:
- index.html — Mobile-first task-pane UI
- styles.css — Visual styles
- app.js — Frontend logic and prepareAgentRequest()
- server/ReportGenerator.cs — C# method using OpenXML SDK

Frontend
- The UI lets you choose Report Type, Reporting Year, Client Name/ID and generate a JSON payload.

Backend (C# / OpenXML)
- Uses the NuGet package: DocumentFormat.OpenXml (Open XML SDK)
- Namespace: DocumentFormat.OpenXml and DocumentFormat.OpenXml.Packaging
- The method CreateSimpleReport(string clientName, string reportType) creates a DOCX file named GeneratedReport.docx with a single paragraph.

2. AI Agent Prompt / API Logic

- Service Endpoint: POST https://api.example.com/reports/generate (production) — for local testing the API is POST http://localhost:5000/reports. The frontend sends a JSON body like { reportType, reportingYear, client, requestedAt } to that endpoint.

- Backend Agent's Role: The backend service validates and enriches the incoming JSON, generates a unique output filename, and then invokes the C# OpenXML routine (ReportGenerator.CreateSimpleReport) with the validated inputs and target path. After generation the backend stores or exposes the file and returns a download URL (or a file reference) to the frontend.

3. Architectural Explanation:

DOCX creation with the OpenXML SDK runs on the server because it requires a stable runtime, server-side libraries, and access to internal data/storage that should not be exposed to client code. Centralized generation also enables consistent formatting, auditing, secure storage, and avoids relying on the end-user's Office host capabilities.

4. Bonus feature

- Feature: "Recent Clients" quick-select list (saved in localStorage) surfaced under the Client input so frequently used client names/IDs can be selected with one tap. It reduces repetitive typing and input errors for repeat users, speeding up report generation in a narrow task pane and improving workflow efficiency.

Deploying to Render
-------------------

This project is prepared for deployment to Render. Recommended approach:

1. Frontend (static site)
	- Create a new Static Site on Render and connect the GitHub repo.
	- Set an environment variable `API_BASE` to the public API URL (for example: `https://financial-report-api.onrender.com`).
	- Under "Build Command" set: `npm run build-config` to generate `config.js` from `API_BASE` before deploy.
	- Publish directory: repository root `/` (the static files are in the repo root).

2. Backend (web service)
	- Create a new Web Service on Render and connect the same repo.
	- Choose Docker as the runtime and point to `server/Api/Dockerfile` (Render will build and run the container).
	- Provide any environment variables needed and set `PORT` if required (the Dockerfile listens on 5000).

Notes
-----
- The `build-config.js` script writes a `config.js` file that sets `window.API_BASE`; the frontend (`app.js`) expects that at runtime. Render's Static Site Build Command will run the script and create `config.js` in the repo root during build.
- The `server/Api/Dockerfile` performs a multi-stage build and publishes the API. The API writes generated files to its working directory; for production you should modify the API to store files in a cloud blob store (Azure Blob / S3) and return signed URLs.
- After deploying, set `API_BASE` in the frontend service to the backend's URL (for Render: `https://<your-backend>.onrender.com`).

Local testing
-------------
- To generate `config.js` locally before serving static files manually:
	- Install Node.js, then run `npm run build-config` in the repo root to create `config.js`.
- Start the API locally from `server/Api` with `dotnet run --urls http://localhost:5000`.
- Start a static server from the repo root (e.g., `python -m http.server 8080` or `npx http-server -p 8080`).


