"use client";

import { useEffect, useRef, useState } from "react";

// Tiny base64 encoded audio files to avoid external dependencies
const SOUNDS = {
  // A double beep for the restaurant (attention grabbing)
  newOrder: "data:audio/mp3;base64,//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq",
  
  // A gentle ding for the customer
  statusChange: "data:audio/mp3;base64,//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq"
};

// For this demo we use HTML5 Audio context with an oscillator to create generic sounds
// since real base64 MP3s are too large to embed easily.
export function useAudioNotification() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);

  useEffect(() => {
    // Initialize lazily to respect browser autoplay policies
    const initAudio = () => {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume().then(() => setIsAudioUnlocked(true)).catch(() => {});
      } else {
        setIsAudioUnlocked(true);
      }
    };
    
    window.addEventListener("click", initAudio);
    return () => window.removeEventListener("click", initAudio);
  }, []);

  const unlockAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume().then(() => setIsAudioUnlocked(true)).catch(() => {});
    } else {
      setIsAudioUnlocked(true);
    }
  };

  const playSound = (type: "newOrder" | "statusChange") => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume().then(() => setIsAudioUnlocked(true)).catch(() => {});
      }

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === "newOrder") {
        // Double beep (attention grabbing)
        oscillator.type = "square";
        oscillator.frequency.setValueAtTime(800, now);
        
        // Envelope for double beep
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.05);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.15);
        
        gainNode.gain.setValueAtTime(0, now + 0.2);
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.25);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.4);
        
        oscillator.start(now);
        oscillator.stop(now + 0.5);
      } else {
        // Gentle ding (status change)
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(880, now); // A5 note
        oscillator.frequency.exponentialRampToValueAtTime(440, now + 0.5); // Slide down
        
        // Bell-like envelope
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.5, now + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1);
        
        oscillator.start(now);
        oscillator.stop(now + 1);
      }
    } catch (err) {
      console.warn("Audio autoplay blocked by browser", err);
    }
  };

  return { playSound, isAudioUnlocked, unlockAudio };
}
