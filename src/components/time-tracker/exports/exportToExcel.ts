
import { WorkSession } from "../WorkSessionCard";
import { format } from "date-fns";

export function exportToExcel(sessions: WorkSession[]) {
  // Convert sessions to CSV format
  const headers = ["Date", "Start Time", "End Time", "Duration", "Location", "Earnings"];
  
  const csvRows = [
    headers.join(","), // Header row
    ...sessions.map(session => {
      const date = format(session.startTime, "yyyy-MM-dd");
      const startTime = format(session.startTime, "HH:mm:ss");
      const endTime = session.endTime ? format(session.endTime, "HH:mm:ss") : "In Progress";
      
      let duration = "In Progress";
      if (session.endTime) {
        const durationMs = session.endTime.getTime() - session.startTime.getTime();
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        duration = `${hours}h ${minutes}m`;
      }
      
      return [
        date,
        startTime,
        endTime,
        duration,
        session.location.replace(/,/g, " "), // Replace commas to avoid CSV issues
        `$${session.earnings.toFixed(2)}`
      ].join(",");
    })
  ].join("\n");
  
  // Create and download the CSV file
  const blob = new Blob([csvRows], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `work_sessions_${format(new Date(), "yyyy-MM-dd")}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
