
import { WorkSession } from "../WorkSessionCard";

// Save session data to local storage as a backup
export function saveSessionToLocalStorage(session: {
  startTime: Date;
  endTime?: Date;
  earnings?: number;
  address?: string;
  hourlyRate?: number;
}) {
  try {
    const existingSessions = JSON.parse(localStorage.getItem('offlineSessions') || '[]');
    existingSessions.push({
      ...session,
      startTime: session.startTime.toISOString(),
      endTime: session.endTime ? session.endTime.toISOString() : null,
      id: `local-${Date.now()}`,
      earnings: session.earnings || 0,
      hourlyRate: session.hourlyRate || 0
    });
    localStorage.setItem('offlineSessions', JSON.stringify(existingSessions));
    console.log("Session saved to local storage:", session);
  } catch (error) {
    console.error("Error saving session to local storage:", error);
  }
}

// Get offline sessions from local storage
export function getOfflineSessions(): WorkSession[] {
  try {
    const sessions = JSON.parse(localStorage.getItem('offlineSessions') || '[]');
    return sessions.map((session: any) => ({
      id: session.id,
      startTime: new Date(session.startTime),
      endTime: session.endTime ? new Date(session.endTime) : undefined,
      location: session.address || "Offline location",
      earnings: session.earnings || 0,
    }));
  } catch (error) {
    console.error("Error reading offline sessions:", error);
    return [];
  }
}
