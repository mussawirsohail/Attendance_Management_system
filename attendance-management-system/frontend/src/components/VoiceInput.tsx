// src/components/VoiceInput.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square } from 'lucide-react';

type VoiceInputProps = {
  onResult: (transcript: string) => void;
  isListening: boolean;
  toggleListening: () => void;
  className?: string;
};

export default function VoiceInput({ onResult, isListening, toggleListening, className = "" }: VoiceInputProps) {
  return (
    <Button
      type="button"
      onClick={toggleListening}
      variant={isListening ? "destructive" : "default"}
      className={`p-2 ${className}`}
      aria-label={isListening ? "Stop listening" : "Start listening"}
    >
      {isListening ? (
        <Square className="h-5 w-5" />
      ) : (
        <Mic className="h-5 w-5" />
      )}
    </Button>
  );
}