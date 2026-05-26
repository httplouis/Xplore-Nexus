"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DemoInitPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Initializing localStorage with demo data...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initDemoData = () => {
      try {
        // Demo Users
        const users = [
          {
            id: "user-1",
            firstName: "John",
            lastName: "Doe",
            email: "john@xplore.com",
            password: "password123",
            role: "ADMIN",
            department: "Management",
            status: "ACTIVE",
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString(),
          },
          {
            id: "user-2",
            firstName: "Jane",
            lastName: "Smith",
            email: "jane@xplore.com",
            password: "password123",
            role: "ORGANIZER",
            department: "Events",
            status: "ACTIVE",
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString(),
          },
          {
            id: "user-3",
            firstName: "Mike",
            lastName: "Johnson",
            email: "mike@xplore.com",
            password: "password123",
            role: "INSTRUCTOR",
            department: "Training",
            status: "ACTIVE",
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString(),
          },
          {
            id: "user-4",
            firstName: "Sarah",
            lastName: "Williams",
            email: "sarah@xplore.com",
            password: "password123",
            role: "PARTICIPANT",
            department: "HR",
            status: "ACTIVE",
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString(),
          },
        ];

        // Demo Events
        const now = new Date();
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

        const events = [
          {
            id: "evt-1",
            name: "Q1 Business Summit 2024",
            description:
              "Annual business summit featuring industry leaders and networking opportunities",
            type: "ONLINE",
            date: nextWeek.toISOString(),
            endDate: new Date(nextWeek.getTime() + 2 * 60 * 60 * 1000).toISOString(),
            location: "Virtual",
            maxParticipants: 500,
            organizerId: "user-2",
            isPaid: true,
            ticketPrice: 99.99,
            joinCode: "XPL-ABC123-2024",
            tags: ["business", "summit", "networking"],
            status: "UPCOMING",
            createdAt: new Date().toISOString(),
          },
          {
            id: "evt-2",
            name: "Web Development Workshop",
            description: "Learn modern web development with Next.js and React",
            type: "HYBRID",
            date: twoWeeksFromNow.toISOString(),
            endDate: new Date(twoWeeksFromNow.getTime() + 4 * 60 * 60 * 1000).toISOString(),
            location: "Tech Hub, Downtown",
            maxParticipants: 50,
            organizerId: "user-2",
            isPaid: false,
            ticketPrice: 0,
            joinCode: "XPL-DEF456-2024",
            tags: ["development", "workshop", "web"],
            status: "UPCOMING",
            createdAt: new Date().toISOString(),
          },
        ];

        // Demo Trainings
        const trainings = [
          {
            id: "train-1",
            title: "Python Fundamentals",
            description: "Complete beginner guide to Python programming",
            category: "PROGRAMMING",
            instructorId: "user-3",
            hours: 40,
            modules: 8,
            difficulty: "BEGINNER",
            status: "ACTIVE",
            createdAt: new Date().toISOString(),
          },
          {
            id: "train-2",
            title: "Advanced React Patterns",
            description: "Master advanced React patterns and best practices",
            category: "WEB_DEVELOPMENT",
            instructorId: "user-3",
            hours: 30,
            modules: 6,
            difficulty: "ADVANCED",
            status: "ACTIVE",
            createdAt: new Date().toISOString(),
          },
        ];

        // Demo Registrations
        const registrations = [
          {
            id: "reg-1",
            eventId: "evt-1",
            userId: "user-4",
            userName: "Sarah Williams",
            userEmail: "sarah@xplore.com",
            ticketCode: "TKT-ABC123XYZ",
            status: "Confirmed",
            paymentStatus: "PENDING",
            checkedIn: false,
            registeredAt: new Date().toISOString(),
          },
        ];

        // Demo Enrollments
        const enrollments = [
          {
            id: "enroll-1",
            trainingId: "train-1",
            userId: "user-4",
            status: "IN_PROGRESS",
            progress: 45,
            enrolledAt: new Date().toISOString(),
            completedAt: null,
          },
        ];

        // Demo Payments
        const payments = [
          {
            id: "pay-1",
            registrationId: "reg-1",
            amount: 99.99,
            currency: "USD",
            status: "PENDING",
            providerRef: null,
            createdAt: new Date().toISOString(),
          },
        ];

        // Demo Notifications
        const notifications = [
          {
            id: "notif-1",
            userId: "user-4",
            title: "Welcome to Xplore",
            message: "Welcome to Xplore Nexus! Start exploring events and trainings.",
            category: "SYSTEM",
            priority: "high",
            isRead: false,
            createdAt: new Date().toISOString(),
          },
        ];

        // Demo Meetings
        const meetings = [
          {
            id: "meet-1",
            title: "Team Sync Meeting",
            description: "Weekly team synchronization",
            startTime: nextWeek.toISOString(),
            endTime: new Date(nextWeek.getTime() + 60 * 60 * 1000).toISOString(),
            hostId: "user-2",
            zoomMeetingId: "123456789",
            status: "SCHEDULED",
            createdAt: new Date().toISOString(),
          },
        ];

        // Initialize localStorage
        localStorage.setItem("xplore_users", JSON.stringify(users));
        localStorage.setItem("xplore_events", JSON.stringify(events));
        localStorage.setItem("xplore_trainings", JSON.stringify(trainings));
        localStorage.setItem("xplore_registrations", JSON.stringify(registrations));
        localStorage.setItem("xplore_enrollments", JSON.stringify(enrollments));
        localStorage.setItem("xplore_payments", JSON.stringify(payments));
        localStorage.setItem("xplore_notifications", JSON.stringify(notifications));
        localStorage.setItem("xplore_meetings", JSON.stringify(meetings));
        localStorage.setItem("xplore_certificates", JSON.stringify([]));
        localStorage.setItem("xplore_feedback", JSON.stringify([]));
        localStorage.setItem("xplore_reset_tokens", JSON.stringify([]));

        setStatus("✅ Demo data initialized successfully!");

        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } catch (error) {
        console.error("Initialization error:", error);
        setStatus("❌ Error initializing demo data");
      } finally {
        setLoading(false);
      }
    };

    initDemoData();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="mb-6">
            <div className="inline-block">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center animate-pulse">
                <div className="w-12 h-12 bg-indigo-500 rounded-full"></div>
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-2">Xplore Nexus</h1>
          <p className="text-gray-600 mb-6">Platform Demo Initialization</p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700">{status}</p>
          </div>

          {!loading && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">Demo Credentials:</h3>
                <div className="text-left text-sm text-green-800 space-y-1">
                  <p>
                    <strong>Email:</strong> john@xplore.com or sarah@xplore.com
                  </p>
                  <p>
                    <strong>Password:</strong> password123
                  </p>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <p>Redirecting to login in a moment...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
