import { useState, useEffect } from 'react';
import { onPlayingChange, getIsPlaying } from '../audio/tourAudio';

export function useTourNarration() {
  const [isPlaying, setIsPlaying] = useState(getIsPlaying);

  useEffect(() => {
    return onPlayingChange(setIsPlaying);
  }, []);

  return isPlaying;
}
