/**
 * Service for handling chat-related API calls
 */

// Define the API base URL to ensure we're always calling the correct server port
const API_BASE_URL = 'http://localhost:3002'; // Updated from 3001 to 3002 to match the new server port

/**
 * Checks if Azure OpenAI is configured by calling the health endpoint
 * @returns {Promise<boolean>} Whether Azure OpenAI is configured
 */
export const checkConfiguration = async () => {
  try {
    console.log('Checking API configuration...');
    const response = await fetch(`${API_BASE_URL}/api/health`);
    
    if (!response.ok) {
      console.error('Health check failed:', response.status, response.statusText);
      return false;
    }
    
    const data = await response.json();
    console.log('Configuration status received:', data);
    return data.configured;
  } catch (error) {
    console.error('Error checking configuration:', error);
    return false;
  }
};

/**
 * Retrieves current Azure OpenAI configuration from the server
 * @returns {Promise<Object>} The current configuration
 */
export const getServerConfig = async () => {
  try {
    console.log('Fetching server configuration...');
    const response = await fetch(`${API_BASE_URL}/api/config`);
    
    if (!response.ok) {
      console.error('Config fetch failed:', response.status, response.statusText);
      throw new Error('Failed to fetch configuration');
    }
    
    const data = await response.json();
    console.log('Configuration received from server');
    return data;
  } catch (error) {
    console.error('Error fetching server configuration:', error);
    throw error;
  }
};

/**
 * Converts chat messages to the format expected by the API
 * @param {Array} messages - The chat messages
 * @returns {Array} Formatted messages for the API
 */
const formatMessagesForAPI = (messages) => {
  return messages.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'assistant',
    content: msg.text
  }));
};

/**
 * Sends a message to the chat API
 * @param {string} message - The message text
 * @param {File|null} image - Optional image file to send
 * @param {File|null} voice - Optional voice recording file to send
 * @param {Array} previousMessages - Array of previous messages in the conversation
 * @returns {Promise<Object>} The AI response
 */
export const sendMessage = async (message, image = null, voice = null, previousMessages = []) => {
  try {
    // Create FormData for multipart/form-data
    const formData = new FormData();
    formData.append('message', message);
    
    if (image) {
      formData.append('image', image);
    }
    
    if (voice) {
      formData.append('voice', voice);
    }
    
    // Convert and add previous messages if they exist
    if (previousMessages && previousMessages.length > 0) {
      const formattedMessages = formatMessagesForAPI(previousMessages);
      formData.append('previousMessages', JSON.stringify(formattedMessages));
    }
    
    console.log('Sending chat request to API server:', { 
      url: `${API_BASE_URL}/api/chat`,
      message: message, 
      hasImage: !!image,
      imageSize: image ? image.size : null,
      imageName: image ? image.name : null,
      hasVoice: !!voice,
      voiceSize: voice ? voice.size : null,
      voiceName: voice ? voice.name : null,
      previousMessagesCount: previousMessages ? previousMessages.length : 0
    });

    // Send message to the server using the correct API URL
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      body: formData,
    });

    console.log('Chat response received:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Chat API error:', data);
      throw new Error(data.error || data.message || 'Failed to send message');
    }

    return data;
  } catch (error) {
    console.error('Error sending message:', error);
    // Check if it's a network error (likely 404 Not Found)
    if (error.message === 'Failed to fetch') {
      console.error('Network error - check if the server is running and the endpoint exists');
    }
    throw error;
  }
};

/**
 * Updates the server configuration with new settings
 * @param {Object} config - The updated configuration
 * @returns {Promise<Object>} The response from the server
 */
export const updateConfig = async (config) => {
  try {
    console.log('Updating server configuration...');
    
    const response = await fetch(`${API_BASE_URL}/api/config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });
    
    if (!response.ok) {
      console.error('Config update failed:', response.status, response.statusText);
      const errorData = await response.json();
      throw new Error(errorData.error || errorData.message || 'Failed to update configuration');
    }
    
    const data = await response.json();
    console.log('Configuration updated successfully');
    return data;
  } catch (error) {
    console.error('Error updating configuration:', error);
    throw error;
  }
};
