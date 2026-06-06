"use client";

import { useState, useEffect, useCallback } from "react";
import { useRole } from "@/lib/context/RoleContext";
import type { Event } from "@/types";

export function useEvents() {
  const { user, role } = useRole();
  const [events, setEventsState] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all events from the real database API with user filtering
  const refetch = useCallback(async () => {
    if (!user || !role) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/events?userId=${user.id}&userRole=${role}`);
      const json = await res.json();
      if (json.success) {
        setEventsState(json.data.items ?? []);
      }
    } catch (error) {
      console.error("Failed to load events:", error);
    } finally {
      setLoading(false);
    }
  }, [user, role]);

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
