import { 
  User as DbUser, 
  Event as DbEvent, 
  Meeting as DbMeeting, 
  Registration as DbRegistration,
  Training as DbTraining,
  Enrollment as DbEnrollment
} from "@prisma/client";
import { 
  AuthUser, 
  UserRole, 
  UserStatus, 
  Event, 
  EventType, 
  EventStatus, 
  Meeting, 
  MeetingStatus, 
  Registration, 
  RegistrationStatus,
  Training,
  TrainingCategory,
  TrainingStatus
} from "@/types";

export function mapUserToAuthUser(dbUser: DbUser): AuthUser {
  let role: UserRole = "Participant";
  if (dbUser.role === "ADMIN") role = "Admin";
  else if (dbUser.role === "ORGANIZER") role = "Organizer";
  else if (dbUser.role === "INSTRUCTOR") role = "Instructor";

  let status: UserStatus = "Active";
  if (dbUser.status === "INACTIVE" || dbUser.status === "SUSPENDED") status = "Inactive";

  return {
    id: dbUser.id,
    email: dbUser.email,
    firstName: dbUser.firstName,
    lastName: dbUser.lastName,
    phone: dbUser.phone || undefined,
    avatarInitials: dbUser.avatarInitials,
    bio: dbUser.bio || undefined,
    department: dbUser.department || "",
    role,
    status,
    lastActive: dbUser.lastActive.toISOString(),
    createdAt: dbUser.createdAt.toISOString(),
  };
}

export function mapEventToClient(dbEvent: DbEvent & { organizer?: DbUser | null }, currentUserId?: string): Event {
  let type: EventType = "Online";
  if (dbEvent.type === "ONSITE") type = "Onsite";
  else if (dbEvent.type === "HYBRID") type = "Hybrid";

  let status: EventStatus = "Upcoming";
  if (dbEvent.status === "ONGOING") status = "Ongoing";
  else if (dbEvent.status === "COMPLETED") status = "Completed";
  else if (dbEvent.status === "CANCELLED") status = "Cancelled";

  const organizerName = dbEvent.organizer 
    ? `${dbEvent.organizer.firstName} ${dbEvent.organizer.lastName}` 
    : "Unknown Organizer";

  return {
    id: dbEvent.id,
    name: dbEvent.name,
    description: dbEvent.description,
    type,
    status,
    date: dbEvent.date.toISOString(),
    endDate: dbEvent.endDate.toISOString(),
    location: dbEvent.location,
    organizerId: dbEvent.organizerId,
    organizerName,
    participantCount: dbEvent.participantCount,
    maxParticipants: dbEvent.maxParticipants,
    isOwner: currentUserId ? dbEvent.organizerId === currentUserId : false,
    tags: dbEvent.tags,
    createdAt: dbEvent.createdAt.toISOString(),
    isPaid: dbEvent.isPaid,
    ticketPrice: dbEvent.ticketPrice,
    joinCode: dbEvent.joinCode,
    registrationCount: dbEvent.registrationCount,
  };
}

export function mapMeetingToClient(dbMeeting: DbMeeting & { host?: DbUser | null }, currentUserId?: string): Meeting {
  let status: MeetingStatus = "Upcoming";
  if (dbMeeting.status === "LIVE") status = "Live";
  else if (dbMeeting.status === "COMPLETED") status = "Completed";
  else if (dbMeeting.status === "CANCELLED") status = "Cancelled";

  const hostName = dbMeeting.host 
    ? `${dbMeeting.host.firstName} ${dbMeeting.host.lastName}` 
    : "Unknown Host";

  return {
    id: dbMeeting.id,
    title: dbMeeting.title,
    description: dbMeeting.description,
    status,
    date: dbMeeting.date.toISOString(),
    duration: dbMeeting.duration,
    hostId: dbMeeting.hostId,
    hostName,
    participantCount: dbMeeting.participantCount,
    maxParticipants: dbMeeting.maxParticipants,
    meetingUrl: dbMeeting.meetingUrl || undefined,
    zoomMeetingId: dbMeeting.zoomMeetingId ? parseInt(dbMeeting.zoomMeetingId) : undefined,
    isHost: currentUserId ? dbMeeting.hostId === currentUserId : false,
    createdAt: dbMeeting.createdAt.toISOString(),
  };
}

export function mapRegistrationToClient(
  dbReg: DbRegistration & { event?: DbEvent | null; user?: DbUser | null }
): Registration {
  let status: RegistrationStatus = "Pending";
  if (dbReg.status === "CONFIRMED") status = "Confirmed";
  else if (dbReg.status === "CANCELLED") status = "Cancelled";

  const eventName = dbReg.event ? dbReg.event.name : "Unknown Event";
  const userName = dbReg.user ? `${dbReg.user.firstName} ${dbReg.user.lastName}` : "Unknown User";
  const userEmail = dbReg.user ? dbReg.user.email : "";

  return {
    id: dbReg.id,
    eventId: dbReg.eventId,
    eventName,
    userId: dbReg.userId,
    userName,
    userEmail,
    ticketCode: dbReg.ticketCode,
    status,
    registeredAt: dbReg.createdAt.toISOString(),
  };
}

export function mapTrainingToClient(
  dbTraining: DbTraining & { 
    instructor?: DbUser | null; 
    enrollments?: DbEnrollment[] 
  },
  currentUserId?: string
): Training {
  const instructorName = dbTraining.instructor 
    ? `${dbTraining.instructor.firstName} ${dbTraining.instructor.lastName}` 
    : "Unknown Instructor";

  const myEnrollment = dbTraining.enrollments?.find(e => e.userId === currentUserId);

  let status: TrainingStatus = "Not Started";
  let progress = 0;
  let completed = false;

  if (myEnrollment) {
    progress = myEnrollment.progress;
    if (myEnrollment.status === "IN_PROGRESS") status = "In Progress";
    else if (myEnrollment.status === "COMPLETED") {
      status = "Completed";
      completed = true;
    }
  }

  let category: TrainingCategory = "Technology";
  const cat = dbTraining.category;
  if (cat === "MARKETING") category = "Marketing";
  else if (cat === "MANAGEMENT") category = "Management";
  else if (cat === "ANALYTICS") category = "Analytics";
  else if (cat === "LEADERSHIP") category = "Leadership";
  else if (cat === "FINANCE") category = "Finance";
  else if (cat === "HR") category = "HR";
  else if (cat === "COMMUNICATION") category = "Communication";

  const colors = ["#8B1A1A", "#16a34a", "#d97706", "#7c3aed", "#0284c7", "#be185d"];
  const progressColor = colors[Math.abs(dbTraining.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) % colors.length];

  return {
    id: dbTraining.id,
    title: dbTraining.title,
    description: dbTraining.description,
    category,
    status,
    instructorId: dbTraining.instructorId,
    instructorName,
    isInstructor: currentUserId ? dbTraining.instructorId === currentUserId : false,
    totalHours: dbTraining.hours,
    moduleCount: dbTraining.modules,
    enrollmentCount: dbTraining.enrollments?.length ?? 0,
    progress,
    completed,
    progressColor,
    tags: [],
    createdAt: dbTraining.createdAt.toISOString(),
  };
}
