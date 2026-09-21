export function speakVietnamese(text: string, rate: number = 1.0, onEnd?: () => void): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'vi-VN';
  utterance.rate = rate;
  utterance.pitch = 1.0;

  // Try to find native vi-VN voice
  const voices = window.speechSynthesis.getVoices();
  const viVoice = voices.find(v => v.lang.startsWith('vi'));
  if (viVoice) {
    utterance.voice = viVoice;
  }

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = () => onEnd();
  }

  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

export function createSpeechRecognizer(
  onResult: (transcript: string) => void,
  onError: (err: any) => void,
  onEnd: () => void
): any {
  if (!isSpeechRecognitionSupported()) return null;

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognizer = new SpeechRecognition();
  recognizer.lang = 'vi-VN';
  recognizer.continuous = false;
  recognizer.interimResults = false;

  recognizer.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };

  recognizer.onerror = (event: any) => {
    onError(event.error);
  };

  recognizer.onend = () => {
    onEnd();
  };

  return recognizer;
}
