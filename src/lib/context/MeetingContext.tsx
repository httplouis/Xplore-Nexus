"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import type { Meeting } from "@/types";

interface MeetingContextValue {
  activeMeeting: Meeting | null;
  isMinimized: boolean;
  startMeeting: (meeting: Meeting, displayName: string) => void;
  endMeeting: () => void;
  toggleMinimize: () => void;
  jitsiApi: any;
}

const MeetingContext = createContext<MeetingContextValue | undefined>(undefined);

export function useMeeting() {
  const context = useContext(MeetingContext);
  if (!context) {
    throw new Error("useMeeting must be used within MeetingProvider");
  }
  return context;
}

// ─── Build Jitsi room name ───────────────────────────────────────────────────
function buildRoom(id: string, title: string) {
  const safe = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `xplore-nexus-${safe}-${id}`;
}

export function MeetingProvider({ children }: { children: React.ReactNode }) {
  const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const jitsiApiRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Load Jitsi script
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const script = document.createElement("script");
    script.src = "https://meet.jit.si/external_api.js";
    script.async = true;
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const startMeeting = (meeting: Meeting, displayName: string) => {
    // Don't start if already in this meeting
    if (jitsiApiRef.current && activeMeeting?.id === meeting.id) {
      return;
    }

    // Clean up existing meeting first
    if (jitsiApiRef.current) {
      try {
        jitsiApiRef.current.dispose();
      } catch (e) {
        console.error("Error disposing previous Jitsi:", e);
      }
      jitsiApiRef.current = null;
    }

    // Set meeting first so container renders - START IN FULLSCREEN
    setActiveMeeting(meeting);
    setIsMinimized(false); // Changed to false - start fullscreen

    const roomName = buildRoom(meeting.id, meeting.title);
    
    // Wait for both script AND container to be ready
    const initJitsi = () => {
      if (typeof window.JitsiMeetExternalAPI === "undefined") {
        setTimeout(initJitsi, 100);
        return;
      }

      if (!containerRef.current) {
        setTimeout(initJitsi, 100);
        return;
      }

      try {
        const domain = "meet.jit.si";
        const options = {
          roomName,
          width: "100%",
          height: "100%",
          parentNode: containerRef.current,
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            enableClosePage: false,
            prejoinPageEnabled: false, // Skip prejoin to load faster
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
            TOOLBAR_BUTTONS: [
              "microphone",
              "camera",
              "closedcaptions",
              "desktop",
              "fullscreen",
              "fodeviceselection",
              "hangup",
              "profile",
              "chat",
              "recording",
              "livestreaming",
              "etherpad",
              "sharedvideo",
              "settings",
              "raisehand",
              "videoquality",
              "filmstrip",
              "invite",
              "feedback",
              "stats",
              "shortcuts",
              "tileview",
              "videobackgroundblur",
              "download",
              "help",
              "mute-everyone",
              "security",
            ],
          },
          userInfo: {
            displayName,
          },
        };

        console.log("Initializing Jitsi with options:", options);
        jitsiApiRef.current = new window.JitsiMeetExternalAPI(domain, options);

        // Ensure iframe takes full size
        jitsiApiRef.current.on('videoConferenceJoined', () => {
          console.log("Joined video conference");
          const iframe = containerRef.current?.querySelector('iframe');
          if (iframe) {
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none';
            iframe.style.position = 'absolute';
            iframe.style.top = '0';
            iframe.style.left = '0';
          }
        });

        // Handle when user leaves from Jitsi UI
        jitsiApiRef.current.addEventListener("readyToClose", () => {
          console.log("Jitsi readyToClose event");
          endMeeting();
        });

        console.log("Jitsi initialized successfully");
      } catch (error) {
        console.error("Failed to initialize Jitsi:", error);
      }
    };

    // Start initialization after a brief delay to ensure container is mounted
    setTimeout(initJitsi, 200);
  };

  const endMeeting = () => {
    console.log("Ending meeting...");
    if (jitsiApiRef.current) {
      try {
        jitsiApiRef.current.dispose();
        console.log("Jitsi disposed successfully");
      } catch (error) {
        console.error("Error disposing Jitsi:", error);
      }
      jitsiApiRef.current = null;
    }
    
    // Clear the container
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
    
    setActiveMeeting(null);
    setIsMinimized(false);
    console.log("Meeting ended, state cleared");
  };

  const toggleMinimize = () => {
    setIsMinimized((prev) => {
      const newMinimized = !prev;
      
      // Force Jitsi iframe to resize after container animation
      if (jitsiApiRef.current && containerRef.current) {
        setTimeout(() => {
          try {
            const iframe = containerRef.current?.querySelector('iframe');
            if (iframe) {
              iframe.style.position = 'absolute';
              iframe.style.top = '0';
              iframe.style.left = '0';
              iframe.style.width = '100%';
              iframe.style.height = '100%';
              iframe.style.border = 'none';
              
              console.log("Resized iframe to:", newMinimized ? "minimized" : "fullscreen");
            }
          } catch (error) {
            console.error("Error resizing Jitsi:", error);
          }
        }, 350); // Wait for CSS transition
      }
      
      return newMinimized;
    });
  };

  return (
    <MeetingContext.Provider
      value={{
        activeMeeting,
        isMinimized,
        startMeeting,
        endMeeting,
        toggleMinimize,
        jitsiApi: jitsiApiRef.current,
      }}
    >
      {children}
      
      {/* Single persistent meeting container that changes size */}
      {activeMeeting && (
        <div
          className={`fixed bg-gray-950 shadow-2xl border-2 transition-all duration-300 overflow-hidden ${
            isMinimized
              ? "bottom-4 right-4 w-96 h-72 z-50 border-gray-700 rounded-lg"
              : "z-40 border-l border-gray-800 rounded-none"
          }`}
          style={
            isMinimized
              ? {}
              : {
                  top: '56px',
                  left: '140px',
                  right: 0,
                  bottom: 0,
                }
          }
        >
          <div 
            ref={containerRef} 
            className="w-full h-full relative"
            style={{ position: 'relative' }}
          />
        </div>
      )}
    </MeetingContext.Provider>
  );
}

// Extend window type
declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}
