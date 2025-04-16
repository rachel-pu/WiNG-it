"use client";
import { useState, useRef, useEffect } from "react";

export default function SpeechToText() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setError("");
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      setError(`Microphone access error: ${err.message}`);
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;

    return new Promise(resolve => {
      mediaRecorderRef.current.onstop = async () => {
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          await sendAudioForTranscription(audioBlob);
          resolve();
        } catch (err) {
          setError(`Error processing audio: ${err.message}`);
          console.error("Error processing audio:", err);
          resolve();
        } finally {
          if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
          }
        }
      };

      mediaRecorderRef.current.stop();
      setIsRecording(false);
    });
  };

  const toggleRecording = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  const sendAudioForTranscription = async (audioBlob) => {
    setLoading(true);
    setTranscript("");

    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.wav");

      const response = await fetch("http://127.0.0.1:5000/save-and-transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setTranscript(data.transcript);
      } else {
        setError(data.error || "An error occurred during transcription");
      }
    } catch (err) {
      setError(`Server error: ${err.message}`);
      console.error("Server error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto", padding: "20px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px", textAlign: "center" }}>
        Speech Recorder
      </h1>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
        <button
          onClick={toggleRecording}
          disabled={loading}
          style={{
            width: "150px",
            height: "50px",
            backgroundColor: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "5px",
            fontSize: "16px",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? "Processing..." : isRecording ? "Stop Recording" : "Start Recording"}
        </button>
      </div>

      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        {isRecording && <p style={{ color: "#0070f3" }}>Recording in progress...</p>}
      </div>

      {error && (
        <div style={{
          marginTop: "20px",
          padding: "10px",
          backgroundColor: "#ffebee",
          border: "1px solid #ffcdd2",
          color: "#c62828",
          borderRadius: "4px"
        }}>
          {error}
        </div>
      )}

      {transcript && (
        <div style={{ marginTop: "20px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "10px" }}>Transcript:</h2>
          <div style={{
            padding: "15px",
            backgroundColor: "#ffffff",
            border: "1px solid #e0e0e0",
            borderRadius: "4px"
          }}>
            {transcript}
          </div>
        </div>
      )}
    </div>
  );
}

// // components/SpeechToText.jsx
// 'use client';
// import { useState, useRef, useEffect } from 'react';
// import { io } from 'socket.io-client';
//
// export default function SpeechToText() {
//   const [isRecording, setIsRecording] = useState(false);
//   const [transcript, setTranscript] = useState('');
//   const [permissionStatus, setPermissionStatus] = useState('prompt');
//   const socketRef = useRef(null);
//   const mediaStreamRef = useRef(null);
//   const audioContextRef = useRef(null);
//
//   // Initialize Socket.IO connection
//   useEffect(() => {
//     socketRef.current = io('http://localhost:5000', {
//       reconnection: true,
//       reconnectionAttempts: 5,
//     });
//
//     // Socket event handlers
//     socketRef.current.on('connect', () => {
//       console.log('Connected to backend');
//     });
//
//     socketRef.current.on('transcription', (data) => {
//       setTranscript(prev => `${prev} ${data.text}`.trim());
//     });
//
//     socketRef.current.on('error', (error) => {
//       setTranscript(prev => `${prev} [Error: ${error.message}]`.trim());
//     });
//
//     // Check initial microphone permission
//     const checkPermissions = async () => {
//       try {
//         const status = await navigator.permissions.query({ name: 'microphone' });
//         setPermissionStatus(status.state);
//         status.onchange = () => setPermissionStatus(status.state);
//       } catch (err) {
//         console.log('Permission API not supported');
//       }
//     };
//     checkPermissions();
//
//     return () => {
//       if (socketRef.current) socketRef.current.disconnect();
//       stopRecording();
//     };
//   }, []);
//
//   const startRecording = async () => {
//     try {
//       setIsRecording(true);
//       setTranscript('Initializing microphone...');
//
//       // 1. Get microphone access
//       const stream = await navigator.mediaDevices.getUserMedia({
//         audio: {
//           sampleRate: 16000,
//           channelCount: 1,
//           echoCancellation: true,
//           noiseSuppression: true
//         }
//       }).catch(err => {
//         throw new Error(`Microphone access denied: ${err.message}`);
//       });
//
//       mediaStreamRef.current = stream;
//       setTranscript('Listening... Speak now');
//
//       // 2. Set up audio processing
//       audioContextRef.current = new AudioContext({ sampleRate: 16000 });
//       const source = audioContextRef.current.createMediaStreamSource(stream);
//       const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
//
//       processor.onaudioprocess = (e) => {
//         if (!socketRef.current?.connected) return;
//         const audioData = e.inputBuffer.getChannelData(0);
//         socketRef.current.emit('audio_chunk', {
//           audio: Array.from(audioData)
//         });
//       };
//
//       source.connect(processor);
//       processor.connect(audioContextRef.current.destination);
//
//       // 3. Ensure socket is ready
//       if (!socketRef.current.connected) {
//         await new Promise(resolve => {
//           socketRef.current.once('connect', resolve);
//         });
//       }
//       socketRef.current.emit('start_recording');
//
//     } catch (err) {
//       console.error('Recording error:', err);
//       setTranscript(`Error: ${err.message}`);
//       setIsRecording(false);
//
//       // Handle Chrome's autoplay policy
//       if (err.name === 'NotAllowedError') {
//         setTranscript('Please click the page first, then start recording');
//       }
//     }
//   };
//
//   const stopRecording = () => {
//     if (mediaStreamRef.current) {
//       mediaStreamRef.current.getTracks().forEach(track => track.stop());
//       mediaStreamRef.current = null;
//     }
//
//     if (audioContextRef.current) {
//       audioContextRef.current.close();
//       audioContextRef.current = null;
//     }
//
//     if (socketRef.current?.connected) {
//       socketRef.current.emit('stop_recording');
//     }
//
//     setIsRecording(false);
//   };
//
//   return (
//     <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
//       <h1 className="text-2xl font-bold text-gray-800 mb-4">Speech to Text</h1>
//
//       <div className="flex gap-3 mb-4">
//         <button
//           onClick={startRecording}
//           disabled={isRecording || permissionStatus === 'denied'}
//           className={`px-4 py-2 rounded-md text-white font-medium ${
//             isRecording || permissionStatus === 'denied'
//               ? 'bg-gray-400 cursor-not-allowed'
//               : 'bg-blue-600 hover:bg-blue-700'
//           }`}
//         >
//           {isRecording ? 'Recording...' : 'Start Recording'}
//         </button>
//
//         <button
//           onClick={stopRecording}
//           disabled={!isRecording}
//           className={`px-4 py-2 rounded-md font-medium ${
//             !isRecording
//               ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
//               : 'bg-red-600 hover:bg-red-700 text-white'
//           }`}
//         >
//           Stop
//         </button>
//       </div>
//
//       {/* Permission guidance */}
//       {permissionStatus === 'denied' && (
//         <div className="p-3 bg-red-50 text-red-700 rounded mb-4">
//           <p>Microphone access blocked. Please:</p>
//           <ol className="list-decimal pl-5 mt-1">
//             <li>Click the lock icon in your browser's address bar</li>
//             <li>Set microphone permissions to "Allow"</li>
//             <li>Refresh the page</li>
//           </ol>
//         </div>
//       )}
//
//       {/* Transcript display */}
//       <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 min-h-32">
//         <p className="whitespace-pre-wrap text-gray-800">
//           {transcript || (isRecording ? 'Listening...' : 'Transcript will appear here')}
//         </p>
//       </div>
//
//       {/*/!* Chrome-specific guidance *!/*/}
//       {/*{!isRecording && navigator.userAgent.includes('Chrome') && (*/}
//       {/*  <div className="mt-3 text-sm text-gray-600">*/}
//       {/*    <p>ℹ️ Chrome requires you to <strong>click anywhere on the page</strong> before recording.</p>*/}
//       {/*  </div>*/}
//       {/*)}*/}
//     </div>
//   );
// }