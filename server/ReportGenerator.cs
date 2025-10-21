using System;
using System.IO;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;

namespace ReportServer
{
    public static class ReportGenerator
    {
        // Creates a simple Word document with a single paragraph.
        public static void CreateSimpleReport(string clientName, string reportType)
        {
            if (string.IsNullOrWhiteSpace(clientName)) throw new ArgumentException("clientName required");
            if (string.IsNullOrWhiteSpace(reportType)) throw new ArgumentException("reportType required");

            var fileName = "GeneratedReport.docx";

            // Remove if exists to simplify repeated runs
            if (File.Exists(fileName)) File.Delete(fileName);

            using (var doc = WordprocessingDocument.Create(fileName, WordprocessingDocumentType.Document))
            {
                var mainPart = doc.AddMainDocumentPart();
                mainPart.Document = new Document();
                var body = new Body();

                var para = new Paragraph();
                var run = new Run();
                run.Append(new Text($"Report: {reportType} for Client: {clientName}"));
                para.Append(run);
                body.Append(para);

                mainPart.Document.Append(body);
                mainPart.Document.Save();
            }

            Console.WriteLine($"Saved {fileName}");
        }
    }
}
