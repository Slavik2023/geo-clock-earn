
import { WorkSession } from "../WorkSessionCard";
import { format } from "date-fns";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export function exportToPdf(sessions: WorkSession[]) {
  // Create PDF document
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(16);
  doc.text("Work Sessions Report", 14, 22);
  
  // Add generation date
  doc.setFontSize(10);
  doc.text(`Generated on: ${format(new Date(), "PPP")}`, 14, 30);
  
  // Prepare data for table
  const tableData = sessions.map(session => {
    const date = format(session.startTime, "PPP");
    const startTime = format(session.startTime, "p");
    const endTime = session.endTime ? format(session.endTime, "p") : "In Progress";
    
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
      session.location,
      `$${session.earnings.toFixed(2)}`
    ];
  });
  
  // Add table
  doc.autoTable({
    head: [["Date", "Start Time", "End Time", "Duration", "Location", "Earnings"]],
    body: tableData,
    startY: 40,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 }
  });
  
  // Add summary section
  const totalEarnings = sessions.reduce((sum, session) => sum + session.earnings, 0);
  const totalHours = sessions.reduce((sum, session) => {
    if (!session.endTime) return sum;
    const durationHours = (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60 * 60);
    return sum + durationHours;
  }, 0);
  
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFontSize(10);
  doc.text(`Total Sessions: ${sessions.length}`, 14, finalY);
  doc.text(`Total Hours: ${totalHours.toFixed(2)}`, 14, finalY + 6);
  doc.text(`Total Earnings: $${totalEarnings.toFixed(2)}`, 14, finalY + 12);
  
  // Save PDF
  doc.save(`work_sessions_${format(new Date(), "yyyy-MM-dd")}.pdf`);
}
