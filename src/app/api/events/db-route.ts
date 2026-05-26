import { NextResponse } from "next/server";

// POST /api/events
// Create new event (localStorage version)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      type,
      date,
      endDate,
      location,
      maxParticipants,
      organizerId,
      isPaid,
      ticketPrice,
      tags,
    } = body;

    if (!name || !organizerId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate unique join code
    const joinCode = `XPL-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${new Date().getFullYear()}`;

    const event = {
      id: `evt-${Date.now()}`,
      name,
      description,
      type: type || "ONLINE",
      date: new Date(date).toISOString(),
      endDate: new Date(endDate).toISOString(),
      location,
      maxParticipants: maxParticipants || 50,
      organizerId,
      isPaid: isPaid || false,
      ticketPrice: ticketPrice || 0,
      joinCode,
      tags: tags || [],
      status: "UPCOMING",
      createdAt: new Date().toISOString(),
    };

    // Save to localStorage
    const events = JSON.parse(localStorage.getItem("xplore_events") || "[]");
    events.push(event);
    localStorage.setItem("xplore_events", JSON.stringify(events));

    return NextResponse.json({ success: true, data: event });
  } catch (error: any) {
    console.error("Create event error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create event" },
      { status: 500 }
    );
  }
}

// GET /api/events
// Retrieve events (localStorage version)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const organizerId = searchParams.get("organizerId");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");

    const events = JSON.parse(localStorage.getItem("xplore_events") || "[]");

    let filtered = events;
    if (organizerId) {
      filtered = filtered.filter((e: any) => e.organizerId === organizerId);
    }
    if (status) {
      filtered = filtered.filter((e: any) => e.status === status);
    }

    const result = filtered
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
