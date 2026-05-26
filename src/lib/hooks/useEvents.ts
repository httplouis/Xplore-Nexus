"use client";

import { useState, useEffect, useCallback } from "react";
import type { Event } from "@/types";
import { MOCK_EVENTS } from "@/lib/data/events";

const STORE_KEY = "xplore_events";

function readStore(): Event[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Event[];
      // Migration: if any event is missing ticket fields, re-seed
      const needsMigration = parsed.some((e) => e.joinCode === undefined);
      if (needsMigration) {
        localStorage.setItem(STORE_KEY, JSON.stringify(MOCK_EVENTS));
        return MOCK_EVENTS;
      }
      return parsed;
    }
  } catch {
    // ignore
  }
  // Seed with mock data on first visit
  localStorage.setItem(STORE_KEY, JSON.stringify(MOCK_EVENTS));
  return MOCK_EVENTS;
}

function writeStore(events: Event[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORE_KEY, JSON.stringify(events));
}

export function useEvents() {
  const [events, setEventsState] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setEventsState(readStore());
    setLoading(false);
  }, []);

  const addEvent = useCallback((event: Event) => {
    setEventsState((prev) => {
      const next = [event, ...prev];
      writeStore(next);
      return next;
    });
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setEventsState((prev) => {
      const next = prev.filter((e) => e.id !== id);
      writeStore(next);
      return next;
    });
  }, []);

  const updateEvent = useCallback((id: string, patch: Partial<Event>) => {
    setEventsState((prev) => {
      const next = prev.map((e) => (e.id === id ? { ...e, ...patch } : e));
      writeStore(next);
      return next;
    });
  }, []);

  /** Wipe localStorage and re-seed with defaults (useful for dev reset) */
  const resetToDefaults = useCallback(() => {
    writeStore(MOCK_EVENTS);
    setEventsState(MOCK_EVENTS);
  }, []);

  return { events, loading, addEvent, deleteEvent, updateEvent, resetToDefaults };
}
