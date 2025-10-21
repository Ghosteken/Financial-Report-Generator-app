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

Agent/API Notes
- Hypothetical endpoint: POST https://api.example.com/reports/generate
- Backend receives JSON { reportType, reportingYear, client, requestedAt }
- Backend performs any retrieval/validation and calls CreateSimpleReport(...) to build the DOCX, then returns a download link or stores it in a document store.

Deployment
- To publish the frontend: push to a GitHub repo and enable GitHub Pages or deploy to Netlify/Vercel.

