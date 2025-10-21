Generate Financial Report - Demo

This repository contains a static frontend (HTML/CSS/JS) optimized for a narrow Office Task Pane and a sample C# method using OpenXML to create a simple DOCX.

Files:
- index.html — Mobile-first task-pane UI
- styles.css — Visual styles
- app.js — Frontend logic and prepareAgentRequest()
- server/ReportGenerator.cs — C# method using OpenXML SDK

Frontend
- Open index.html in a browser or deploy to GitHub Pages / Netlify.
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

Deployment
- To publish the frontend: push to a GitHub repo and enable GitHub Pages or deploy to Netlify/Vercel.

