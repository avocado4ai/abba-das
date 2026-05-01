/**
 * WhatsApp Message Parser Utility
 * Handles full chat exports and filters by sender.
 */

export interface WhatsAppMessage {
  date: Date;
  sender: string;
  content: string;
  attachments?: string[];
  tags?: string[];
}

export function parseWhatsAppExport(rawContent: string, targetSender: string): WhatsAppMessage[] {
  // Regex to detect the start of a new message
  // Pattern 1: [22/05/2023, 10:15:30] Sender: 
  // Pattern 2: 22/05/2023, 10:15 - Sender:
  const messageStartRegex = /^(\[?\d{1,2}\/\d{1,2}\/\d{2,4},?\s\d{1,2}:\d{2}(?::\d{2})?\]?)\s(?:-\s)?([^:]+):\s/m;
  
  // Regex for attachments: "IMG-20230522-WA0001.jpg (file attached)" or "‎<attached: filename.jpg>"
  const attachmentRegex = /([a-zA-Z0-9_.-]+\.(?:jpg|jpeg|png|gif|mp4|webp))\s*\(file attached\)|<attached:\s*([a-zA-Z0-9_.-]+\.(?:jpg|jpeg|png|gif|mp4|webp))>/gi;

  const lines = rawContent.split('\n');
  const messages: WhatsAppMessage[] = [];
  let currentMessage: WhatsAppMessage | null = null;

  for (const line of lines) {
    const match = line.match(messageStartRegex);

    if (match) {
      if (currentMessage && currentMessage.sender.includes(targetSender)) {
        extractAttachments(currentMessage, attachmentRegex);
        messages.push(currentMessage);
      }

      const timestampStr = match[1].replace(/[\[\]]/g, '');
      const sender = match[2].trim();
      const content = line.substring(match[0].length).trim();
      const tags = Array.from(content.matchAll(/#(\w+)/g)).map(m => m[1]);
      
      const date = parseWhatsAppDate(timestampStr);

      currentMessage = {
        date: date || new Date(),
        sender,
        content,
        attachments: [],
        tags
      };
    } else if (currentMessage) {
      const newLine = line.trim();
      currentMessage.content += '\n' + newLine;
      const newTags = Array.from(newLine.matchAll(/#(\w+)/g)).map(m => m[1]);
      if (newTags.length > 0) {
        currentMessage.tags = [...(currentMessage.tags || []), ...newTags];
      }
    }
  }

  if (currentMessage && currentMessage.sender.includes(targetSender)) {
    extractAttachments(currentMessage, attachmentRegex);
    messages.push(currentMessage);
  }

  return messages
    .filter(msg => msg.content.length > 0 || (msg.attachments && msg.attachments.length > 0))
    .map(msg => ({
      ...msg,
      content: msg.content.trim(),
      tags: Array.from(new Set(msg.tags || []))
    }));
}

function extractAttachments(msg: WhatsAppMessage, regex: RegExp) {
  const attachments: string[] = [];
  let match;
  while ((match = regex.exec(msg.content)) !== null) {
    const filename = match[1] || match[2];
    if (filename) {
      attachments.push(filename);
    }
  }
  msg.attachments = attachments;
}

function parseWhatsAppDate(dateStr: string): Date | null {
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
