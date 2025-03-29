import React, { useRef, useEffect, useState } from 'react';
import {
  Spinner,
  Button,
  makeStyles,
  shorthands,
  tokens,
} from '@fluentui/react-components';
import { 
  PlayRegular, 
  PauseRegular, 
  InfoRegular
} from '@fluentui/react-icons';

const useStyles = makeStyles({
  audioContainer: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('8px'),
    padding: '8px',
    backgroundColor: tokens.colorNeutralBackground4,
    borderRadius: '4px',
    marginTop: '4px',
  },
  audioControls: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('8px'),
  },
  audioProgress: {
    flexGrow: 1,
    height: '4px',
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: '2px',
    position: 'relative',
    cursor: 'pointer',
  },
  audioProgressFill: {
    height: '100%',
    backgroundColor: tokens.colorBrandBackground,
    borderRadius: '2px',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  audioTime: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground2,
    whiteSpace: 'nowrap',
  },
  audioError: {
    color: tokens.colorStatusDangerForeground1,
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('4px'),
    fontSize: '12px',
  },
});

/**
 * Audio player component for rendering and controlling audio playback
 * 
 * @param {Object} props - Component props
 * @param {string} props.src - URL to the audio file
 * @param {string} props.className - Optional CSS class to apply to the audio element
 * @returns {JSX.Element}
 */
const AudioPlayer = ({ src, className }) => {
  const styles = useStyles();
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      audio.currentTime = 0;
    };

    const handleError = (e) => {
      setError('Failed to load audio');
      setIsLoading(false);
      console.error('Audio error:', e);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(err => {
        setError('Failed to play audio: ' + err.message);
        console.error('Play error:', err);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e) => {
    if (!progressRef.current || duration === 0) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  return (
    <div className={styles.audioContainer}>
      <audio 
        ref={audioRef} 
        src={src} 
        className={className}
        preload="metadata"
        style={{ display: 'none' }}
      />
      
      {isLoading ? (
        <div className={styles.audioControls}>
          <Spinner size="tiny" label="Loading audio..." />
        </div>
      ) : error ? (
        <div className={styles.audioError}>
          <InfoRegular />
          <span>{error}</span>
        </div>
      ) : (
        <>
          <Button
            icon={isPlaying ? <PauseRegular /> : <PlayRegular />}
            appearance="subtle"
            onClick={togglePlayPause}
          />
          
          <div className={styles.audioProgress} ref={progressRef} onClick={handleProgressClick}>
            <div 
              className={styles.audioProgressFill} 
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
          
          <span className={styles.audioTime}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </>
      )}
    </div>
  );
};

export default AudioPlayer;