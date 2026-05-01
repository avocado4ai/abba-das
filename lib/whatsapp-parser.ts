/**
 * WhatsApp Message Parser Utility
 * Handles full chat exports and filters by sender.
 */

export interface WhatsAppMessage {
  date: Date;
  sender: string;
  content: string;
}

export function parseWhatsAppExport(rawContent: string, targetSender: string): WhatsAppMessage[] {
  // Regex to detect the start of a new message
  // Pattern 1: [22/05/2023, 10:15:30] Sender: 
  // Pattern 2: 22/05/2023, 10:15 - Sender:
  const messageStartRegex = /^(\[?\d{1,2}\/\d{1,2}\/\d{2,4},?\s\d{1,2}:\d{2}(?::\d{2})?\]?)\s(?:-\s)?([^:]+):\s/m;

  const lines = rawContent.split('\n');
  const messages: WhatsAppMessage[] = [];
  let currentMessage: WhatsAppMessage | null = null;

  for (let line of lines) {
    const match = line.match(messageStartRegex);

    if (match) {
      // If we were processing a message, save it
      if (currentMessage && currentMessage.sender.includes(targetSender)) {
        messages.push(currentMessage);
      }

      const timestampStr = match[1].replace(/[\[\]]/g, '');
      const sender = match[2].trim();
      const content = line.substring(match[0].length).trim();
      
      const date = parseWhatsAppDate(timestampStr);

      currentMessage = {
        date: date || new Date(),
        sender,
        content
      };
    } else if (currentMessage) {
      // Append multi-line message content
      currentMessage.content += '\n' + line.trim();
    }
  }

  // Push the last message if it matches
  if (currentMessage && currentMessage.sender.includes(targetSender)) {
    messages.push(currentMessage);
  }

  // Final cleanup: remove empty messages and trim content
  return messages
    .filter(msg => msg.content.length > 0)
    .map(msg => ({
      ...msg,
      content: msg.content.trim()
    }));
}

function parseWhatsAppDate(dateStr: string): Date | null {
  // Format: "22/05/2023, 10:15" or "22/05/2023, 10:15:30"
  const parts = dateStr.split(', ');
  if (parts.length < 2) return null;

  const dateParts = parts[0].split('/');
  const timeParts = parts[1].split(':');

  if (dateParts.length === 3 && timeParts.length >= 2) {
    const day = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1;
    let year = parseInt(dateParts[2]);
    if (year < 100) year += 2000;

    const hours = parseInt(timeParts[0]);
    const minutes = parseInt(timeParts[1]);
    const seconds = timeParts[2] ? parseInt(timeParts[2]) : 0;

    return new Date(year, month, day, hours, minutes, seconds);
  }

  return null;
}
