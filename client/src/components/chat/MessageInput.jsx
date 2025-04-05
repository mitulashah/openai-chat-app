import React, { useRef, useState, useEffect } from 'react';
import {
  Button,
  Input,
} from '@fluentui/react-components';
import { 
  SendRegular,
  ImageRegular,
  MicRegular,
} from '@fluentui/react-icons';
import { useInputStyles } from '../../styles/components/chat/inputStyles';

export const MessageInput = ({ 
  input, 
  setInput, 
  handleSend, 
  selectedImage, 
  setSelectedImage,
  selectedVoice,
  setSelectedVoice,
  isConfigured,
  setError,
  isLoading
}) => {
  const styles = useInputStyles();
  const fileInputRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const audioChunksRef = useRef([]);
  const [isSending, setIsSending] = useState(false);
  
  // Create a wrapped send handler that tracks sending state
  const handleSendWithTracking = () => {
    if (!input.trim() && !selectedImage && !selectedVoice) return;
    if (isLoading) return;
    
    // Set sending state to true briefly
    setIsSending(true);
    
    // Store message content before clearing the input
    const messageToSend = input;
    
    // Clear the input field immediately for better UX
    setInput('');
    
    // Call the actual send handler with the stored message
    handleSend(messageToSend, selectedImage, selectedVoice);
    
    // Reset sending state after a short delay
    setTimeout(() => {
      setIsSending(false);
    }, 300);
  };

  // Effect to notify when the input component is active
  useEffect(() => {
    // Create a custom event for when user starts typing
    const notifyInputActivity = () => {
      window.dispatchEvent(new CustomEvent('user-input-activity', {
        detail: { isActive: true }
      }));
    };
    
    // Add listeners to detect user input activity
    const inputElement = document.querySelector(`.${styles.input} input`);
    if (inputElement) {
      inputElement.addEventListener('focus', notifyInputActivity);
      inputElement.addEventListener('keydown', notifyInputActivity);
    }
    
    return () => {
      if (inputElement) {
        inputElement.removeEventListener('focus', notifyInputActivity);
        inputElement.removeEventListener('keydown', notifyInputActivity);
      }
    };
  }, [styles.input]);

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      setSelectedImage(file);
      setError('');
    }
  };

  const startRecording = async () => {
    if (isRecording) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      audioChunksRef.current = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        if (audioBlob.size > 10 * 1024 * 1024) { // 10MB limit
          setError('Voice recording size must be less than 10MB');
          return;
        }
        
        // Create a File object from the Blob
        const audioFile = new File([audioBlob], "voice-message.webm", { 
          type: "audio/webm",
          lastModified: new Date().getTime()
        });
        
        setSelectedVoice(audioFile);
        setError('');
        
        // Stop all tracks in the stream
        stream.getTracks().forEach(track => track.stop());
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setError('Unable to access microphone. Please check permissions.');
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };
  
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className={styles.inputContainer}>
      <Input
        className={styles.input}
        placeholder="Type your message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSendWithTracking()}
        disabled={!isConfigured}
      />
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleImageSelect}
        style={{ display: 'none' }}
      />
      <Button
        appearance="secondary"
        icon={<ImageRegular />}
        onClick={() => fileInputRef.current?.click()}
        disabled={!isConfigured}
        className={selectedImage ? styles.imageButtonActive : undefined}
        title={selectedImage ? "Image selected" : "Upload an image"}
      />
      <Button
        appearance="secondary"
        icon={<MicRegular />}
        onClick={toggleRecording}
        disabled={!isConfigured}
        className={isRecording ? styles.recordingActive : selectedVoice ? styles.voiceButtonActive : undefined}
        title={isRecording ? "Recording... Click to stop" : selectedVoice ? "Voice recorded" : "Record voice message"}
      />
      <Button
        appearance="primary"
        icon={<SendRegular />}
        onClick={handleSendWithTracking}
        disabled={!isConfigured || isSending}
      >
        Send
      </Button>
    </div>
  );
};