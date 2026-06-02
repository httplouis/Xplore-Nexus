"use client";

import { useState, useEffect, useCallback } from "react";
import type { Event } from "@/types";

export function useEvents() {
  const [events, setEventsState] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all events from the real database API
  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/events");
      const json = await res.json();
      if (json.success) {
        setEventsState(json.data.items ?? []);
      }
    } catch (error) {
      console.error("Failed to load events:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const addEvent = useCallback((event: Event) => {
    setEventsState((prev) => [event, ...prev]);
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setEventsState((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const updateEvent = useCallback((id: string, patch: Partial<Event>) => {
    setEventsState((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...patch } : e))
    );
  }, []);

  return { events, loading, addEvent, deleteEvent, updateEvent, refetch };
}
