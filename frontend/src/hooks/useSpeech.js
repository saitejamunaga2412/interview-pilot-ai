import { useState, useEffect, useRef, useCallback } from "react";

/**
 * useSpeech Hook
 * Provides seamless Speech-to-Text (Microphone transcription)
 * and Text-to-Speech (AI interviewer reading questions aloud)
 * using standard browser Web Speech APIs.
 */
export function useSpeech() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechError, setSpeechError] = useState("");

  const recognitionRef = useRef(null);
  const synthRef = useRef(typeof window !== "undefined" ? window.speechSynthesis : null);

  const SpeechRecognition =
    typeof window !== "undefined"
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : null;

  const supportsSTT = Boolean(SpeechRecognition);
  const supportsTTS = Boolean(typeof window !== "undefined" && window.speechSynthesis);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
      if (synthRef.current) {
        try {
          synthRef.current.cancel();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  /**
   * Start listening to the microphone and stream text to onTranscript
   */
  const startListening = useCallback(
    (onTranscript) => {
      setSpeechError("");
      if (!supportsSTT) {
        setSpeechError("Speech recognition is not supported in this browser. Try Chrome or Edge.");
        return;
      }

      // If already speaking, cancel TTS first
      if (synthRef.current && synthRef.current.speaking) {
        synthRef.current.cancel();
        setIsSpeaking(false);
      }

      try {
        if (recognitionRef.current) {
          recognitionRef.current.abort();
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event) => {
          let interimTranscript = "";
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + " ";
            } else {
              interimTranscript += transcript;
            }
          }

          const currentChunk = finalTranscript || interimTranscript;
          if (currentChunk && onTranscript) {
            onTranscript(currentChunk, Boolean(finalTranscript));
          }
        };

        recognition.onerror = (event) => {
          console.warn("[useSpeech] recognition error:", event.error);
          if (event.error !== "no-speech") {
            setSpeechError(`Microphone error: ${event.error}`);
          }
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        console.error("[useSpeech] failed to start recognition:", err);
        setSpeechError("Could not access microphone. Please check permissions.");
        setIsListening(false);
      }
    },
    [supportsSTT, SpeechRecognition]
  );

  /**
   * Stop listening to microphone
   */
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  }, []);

  /**
   * AI Voice: Speak text aloud
   */
  const speak = useCallback(
    (text, onEndCallback) => {
      if (!supportsTTS || !synthRef.current) return;

      // Cancel ongoing speech
      synthRef.current.cancel();

      if (!text) {
        setIsSpeaking(false);
        return;
      }

      // Remove markdown or special formatting for natural speech
      const cleanedText = text
        .replace(/`{1,3}[^`]*`{1,3}/g, "")
        .replace(/[*_#]/g, "")
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanedText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.lang = "en-US";

      // Try to choose a high quality voice if available
      const voices = synthRef.current.getVoices();
      const naturalVoice = voices.find(
        (v) => v.lang.startsWith("en") && (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Samantha"))
      );
      if (naturalVoice) {
        utterance.voice = naturalVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        if (onEndCallback) onEndCallback();
      };

      utterance.onerror = (e) => {
        console.warn("[useSpeech] TTS error:", e);
        setIsSpeaking(false);
      };

      synthRef.current.speak(utterance);
    },
    [supportsTTS]
  );

  /**
   * Stop AI voice
   */
  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      try {
        synthRef.current.cancel();
      } catch {
        // ignore
      }
    }
    setIsSpeaking(false);
  }, []);

  return {
    isListening,
    isSpeaking,
    supportsSTT,
    supportsTTS,
    speechError,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  };
}
