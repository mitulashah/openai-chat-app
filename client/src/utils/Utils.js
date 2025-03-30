/**
 * Utility functions for the chat application
 */

/**
 * Format a number with commas as thousands separators
 * @param {number} num - The number to format
 * @returns {string} The formatted number with commas
 */
export const formatNumber = (num) => {
  if (num === undefined || num === null) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

/**
 * Format a timestamp into a human-readable time
 * @param {string} timestamp - ISO timestamp string
 * @param {Object} options - Formatting options
 * @returns {string} The formatted time string
 */
export const formatTimestamp = (timestamp, options = {}) => {
  if (!timestamp) return '';
  
  try {
    return new Date(timestamp).toLocaleTimeString(
      options.locale || undefined, 
      options.formatOptions || undefined
    );
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return '';
  }
};

/**
 * Get a user-friendly error message
 * @param {string} errorMsg - The raw error message
 * @returns {string} A user-friendly error message
 */
export const getErrorMessage = (errorMsg) => {
  if (!errorMsg) return 'An error occurred';
  
  // Handle known error patterns
  if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError')) {
    return 'Network error - please check your connection';
  }
  
  if (errorMsg.includes('Authorization')) {
    return 'Authentication error - please check your API key';
  }
  
  if (errorMsg.includes('429') || errorMsg.includes('rate limit')) {
    return 'Rate limit exceeded - please try again later';
  }
  
  // If the error is already short and user-friendly, return it directly
  if (errorMsg.length < 100 && !errorMsg.includes('{') && !errorMsg.includes('Error:')) {
    return errorMsg;
  }
  
  // Otherwise, provide a generic message
  return 'Error communicating with AI service';
};

/**
 * Get memory mode display text
 * @param {Object} memorySettings - The memory settings object
 * @returns {string} Display text for the current memory mode
 */
export const getMemoryModeDisplay = (memorySettings) => {
  if (!memorySettings) return 'Limited Memory';
  
  switch(memorySettings.memoryMode) {
    case 'none': return 'No Memory';
    case 'limited': return `Limited (${memorySettings.memoryLimit} messages)`;
    case 'full': return 'Full Memory';
    default: return 'Limited Memory';
  }
};

/**
 * Generate a unique ID
 * @returns {number} A timestamp-based unique ID
 */
export const generateId = () => {
  return Date.now() + Math.floor(Math.random() * 1000);
};

/**
 * Export chat messages to plain text format
 * @param {Array} messages - The array of chat messages
 * @returns {string} Plain text representation of the chat
 */
export const exportChatToText = (messages) => {
  if (!messages || messages.length === 0) return '';
  
  return messages.map(msg => {
    const sender = msg.sender === 'user' ? 'You' : 'AI';
    const time = formatTimestamp(msg.timestamp);
    return `[${time}] ${sender}: ${msg.text}`;
  }).join('\n\n');
};

/**
 * Export chat messages to Markdown format
 * @param {Array} messages - The array of chat messages
 * @returns {string} Markdown representation of the chat
 */
export const exportChatToMarkdown = (messages) => {
  if (!messages || messages.length === 0) return '';
  
  const title = '# Chat Conversation\n\n';
  const date = `*Exported on ${new Date().toLocaleString()}*\n\n`;
  
  const content = messages.map(msg => {
    const sender = msg.sender === 'user' ? '**You**' : '**AI**';
    const time = formatTimestamp(msg.timestamp);
    
    // If the message is a summary, add special formatting
    if (msg.isSummary) {
      return `### Summary (${time})\n\n${msg.text}\n`;
    }
    
    return `### ${sender} (${time})\n\n${msg.text}\n`;
  }).join('\n');
  
  return title + date + content;
};

/**
 * Download content as a file
 * @param {string} content - The content to download
 * @param {string} filename - The filename to use
 * @param {string} contentType - The content type of the file
 */
export const downloadFile = (content, filename, contentType) => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Export chat as PDF using jsPDF library
 * @param {Array} messages - The array of chat messages
 * @param {string} title - Title for the PDF document
 * @returns {void}
 */
export const exportChatToPDF = (messages, title = 'Chat Conversation') => {
  // Import jsPDF dynamically to avoid build issues
  import('jspdf').then(({ default: jsPDF }) => {
    const doc = new jsPDF();
    
    // Set document title and metadata
    doc.setProperties({
      title: title,
      subject: 'Chat Export',
      creator: 'AI Chat App',
      author: 'User',
      creationDate: new Date()
    });
    
    // Define formatting variables
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - (margin * 2);
    let y = margin;
    
    // Add title
    doc.setFontSize(18);
    doc.text(title, margin, y);
    
    // Add export date
    y += 10;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Exported on ${new Date().toLocaleString()}`, margin, y);
    
    // Reset text settings for messages
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    
    // Process each message
    messages.forEach((msg, index) => {
      const sender = msg.sender === 'user' ? 'You' : 'AI';
      const time = formatTimestamp(msg.timestamp);
      const header = `${sender} (${time})`;
      
      // Add spacing between messages
      y += 10;
      
      // Set color based on sender (user or AI)
      if (msg.sender === 'user') {
        doc.setTextColor(0, 120, 212); // Blue for user
      } else if (msg.isSummary) {
        doc.setTextColor(255, 136, 0); // Orange for summary
      } else {
        doc.setTextColor(0, 0, 0); // Black for AI
      }
      
      // Add message header (sender and time)
      // Use the correct method for setting font style in jsPDF 3.x
      doc.setFont(undefined, 'bold');
      doc.text(header, margin, y);
      doc.setFont(undefined, 'normal');
      
      // Add message content with text wrapping
      y += 6;
      
      // Handle null or undefined text
      const messageText = msg.text || '';
      
      // Process and wrap the message text
      const textLines = doc.splitTextToSize(messageText, contentWidth);
      
      // Check if we need a new page
      if (y + (textLines.length * 6) > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin + 6;
      }
      
      doc.text(textLines, margin, y);
      
      // Move y position for next message
      y += (textLines.length * 6);
      
      // Add horizontal line between messages (except last)
      if (index < messages.length - 1) {
        y += 4;
        doc.setDrawColor(220, 220, 220);
        doc.line(margin, y, pageWidth - margin, y);
        y += 4;
      }
      
      // Reset text color
      doc.setTextColor(0, 0, 0);
      
      // Check if we need a new page for the next message
      if (y > doc.internal.pageSize.getHeight() - 30) {
        doc.addPage();
        y = margin;
      }
    });
    
    // Save the PDF
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    doc.save(`${title}-${timestamp}.pdf`);
  }).catch(error => {
    console.error('Error generating PDF:', error);
    // Log more details about the error to help with debugging
    if (error.stack) {
      console.error('Error stack:', error.stack);
    }
    alert('Failed to generate PDF. Please try another format.');
  });
};

/**
 * Export chat as a specific file format
 * @param {Array} messages - The array of chat messages
 * @param {string} format - The export format ('txt', 'md', 'pdf')
 * @param {string} title - Optional title for the export
 */
export const exportChat = (messages, format, title = 'Chat Conversation') => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  
  switch(format) {
    case 'txt': {
      const textContent = exportChatToText(messages);
      downloadFile(textContent, `${title}-${timestamp}.txt`, 'text/plain');
      break;
    }
    case 'md': {
      const mdContent = exportChatToMarkdown(messages);
      downloadFile(mdContent, `${title}-${timestamp}.md`, 'text/markdown');
      break;
    }
    case 'pdf': {
      exportChatToPDF(messages, title);
      break;
    }
    default:
      console.error('Unsupported export format:', format);
  }
};