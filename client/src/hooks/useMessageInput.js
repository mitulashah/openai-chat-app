import { useState } from 'react';

/**
 * Custom hook for managing message input and file attachments
 * @returns {Object} Input state and functions
 */
export const useMessageInput = () => {
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVoice, setSelectedVoice] = useState(null);

  /**
   * Reset all inputs (text, image, voice)
   */
  const resetInputs = () => {
    setInput('');
    setSelectedImage(null);
    setSelectedVoice(null);
  };

  /**
   * Handle file selection for images
   * @param {File} file - The selected image file
   * @returns {boolean} Whether the file was accepted
   */
  const handleImageSelect = (file) => {
    if (!file) return false;
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      return false;
    }
    
    if (!file.type.startsWith('image/')) {
      return false;
    }
    
    setSelectedImage(file);
    return true;
  };

  /**
   * Handle voice recording selection
   * @param {File} file - The voice recording file
   * @returns {boolean} Whether the file was accepted
   */
  const handleVoiceSelect = (file) => {
    if (!file) return false;
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return false;
    }
    
    setSelectedVoice(file);
    return true;
  };

  return {
    input,
    setInput,
    selectedImage,
    setSelectedImage,
    selectedVoice,
    setSelectedVoice,
    resetInputs,
    handleImageSelect,
    handleVoiceSelect
  };
};