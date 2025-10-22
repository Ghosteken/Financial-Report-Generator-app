using System;
using ReportServer;

class Program
{
    static void Main(string[] args)
    {
        Console.WriteLine("Generating report...");

        // passing client and report type via command-line for quick testing
        var client = args.Length > 0 && !string.IsNullOrWhiteSpace(args[0]) ? args[0] : "Acme Corp";
        var reportType = args.Length > 1 && !string.IsNullOrWhiteSpace(args[1]) ? args[1] : "P&L";

        try
        {
            ReportGenerator.CreateSimpleReport(client, reportType);
            Console.WriteLine("Done creating report.");
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine("Error creating report: " + ex.Message);
            Environment.ExitCode = 1;
        }
    }
}
