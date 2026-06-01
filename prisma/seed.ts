import { PrismaClient, UserRole, UserStatus, EventType, EventStatus, MeetingStatus, TrainingCategory, TrainingStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');
  
  // Clean database
  await prisma.payment.deleteMany({});
  await prisma.registration.deleteMany({});
  await prisma.feedback.deleteMany({});
  await prisma.eventReport.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.certificate.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.meeting.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.training.deleteMany({});
  await prisma.user.deleteMany({});

  // Seed Users
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      id: 'u-001',
      email: 'jose.dc@xplore.io',
      password: passwordHash,
      firstName: 'Jose',
      lastName: 'Dela Cruz',
      phone: '+63 912 345 6789',
      avatarInitials: 'JDC',
      bio: 'Platform administrator for Xplore Nexus.',
      department: 'Information Technology',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  const organizer1 = await prisma.user.create({
    data: {
      id: 'u-002',
      email: 'maria.santos@xplore.io',
      password: passwordHash,
      firstName: 'Maria',
      lastName: 'Santos',
      avatarInitials: 'MS',
      department: 'Events & Communications',
      role: UserRole.ORGANIZER,
      status: UserStatus.ACTIVE,
    },
  });

  const organizer2 = await prisma.user.create({
    data: {
      id: 'u-003',
      email: 'john.reyes@xplore.io',
      password: passwordHash,
      firstName: 'John',
      lastName: 'Reyes',
      avatarInitials: 'JR',
      department: 'Product',
      role: UserRole.ORGANIZER,
      status: UserStatus.ACTIVE,
    },
  });

  const instructor = await prisma.user.create({
    data: {
      id: 'u-004',
      email: 'anna.cruz@xplore.io',
      password: passwordHash,
      firstName: 'Anna',
      lastName: 'Cruz',
      avatarInitials: 'AC',
      department: 'Learning & Development',
      role: UserRole.INSTRUCTOR,
      status: UserStatus.ACTIVE,
    },
  });

  const organizer3 = await prisma.user.create({
    data: {
      id: 'u-005',
      email: 'robert.tan@xplore.io',
      password: passwordHash,
      firstName: 'Robert',
      lastName: 'Tan',
      avatarInitials: 'RT',
      department: 'Operations',
      role: UserRole.ORGANIZER,
      status: UserStatus.ACTIVE,
    },
  });

  const participant = await prisma.user.create({
    data: {
      id: 'u-007',
      email: 'carlos.bautista@xplore.io',
      password: passwordHash,
      firstName: 'Carlos',
      lastName: 'Bautista',
      avatarInitials: 'CB',
      department: 'Finance',
      role: UserRole.PARTICIPANT,
      status: UserStatus.ACTIVE,
    },
  });

  console.log('Seeded users.');

  // Seed Events
  const event1 = await prisma.event.create({
    data: {
      id: 'ev-001',
      name: 'Annual Strategy Summit 2026',
      description: 'A high-level strategic planning session for all department heads and key stakeholders.',
      type: EventType.ONLINE,
      status: EventStatus.UPCOMING,
      date: new Date('2026-04-20T09:00:00.000Z'),
      endDate: new Date('2026-04-20T17:00:00.000Z'),
      location: 'https://meet.xplore.io/strategy-summit',
      organizerId: organizer1.id,
      maxParticipants: 100,
      participantCount: 45,
      isPaid: true,
      ticketPrice: 500,
      joinCode: 'XPL-SM26-2026',
      registrationCount: 45,
      tags: ['Strategy', 'Leadership', 'All-hands'],
    },
  });

  const event2 = await prisma.event.create({
    data: {
      id: 'ev-002',
      name: 'Product Launch Webinar',
      description: 'Official launch presentation for Xplore Nexus v2.0 with live demo and Q&A.',
      type: EventType.ONLINE,
      status: EventStatus.UPCOMING,
      date: new Date('2026-04-23T14:00:00.000Z'),
      endDate: new Date('2026-04-23T16:00:00.000Z'),
      location: 'https://meet.xplore.io/product-launch',
      organizerId: organizer2.id,
      maxParticipants: 100,
      participantCount: 67,
      isPaid: false,
      ticketPrice: 0,
      joinCode: 'XPL-PL26-2026',
      registrationCount: 67,
      tags: ['Product', 'Launch', 'Webinar'],
    },
  });

  const event3 = await prisma.event.create({
    data: {
      id: 'ev-003',
      name: 'Team Building Activity',
      description: 'Full-day team building and bonding activity for all staff at the Laguna Nature Camp.',
      type: EventType.ONSITE,
      status: EventStatus.UPCOMING,
      date: new Date('2026-04-27T10:00:00.000Z'),
      endDate: new Date('2026-04-27T18:00:00.000Z'),
      location: 'Laguna Nature Camp, Sta. Rosa Laguna',
      organizerId: admin.id,
      maxParticipants: 50,
      participantCount: 35,
      isPaid: true,
      ticketPrice: 250,
      joinCode: 'XPL-TB27-2026',
      registrationCount: 35,
      tags: ['Team Building', 'Onsite', 'Wellness'],
    },
  });

  const event4 = await prisma.event.create({
    data: {
      id: 'ev-004',
      name: 'Quarterly Review Meeting',
      description: 'End-of-quarter business review covering OKRs, financials, and roadmap adjustments.',
      type: EventType.HYBRID,
      status: EventStatus.COMPLETED,
      date: new Date('2026-03-28T15:00:00.000Z'),
      endDate: new Date('2026-03-28T17:00:00.000Z'),
      location: 'HQ Board Room + Online',
      organizerId: organizer3.id,
      maxParticipants: 40,
      participantCount: 28,
      isPaid: false,
      ticketPrice: 0,
      joinCode: 'XPL-QR28-2026',
      registrationCount: 28,
      tags: ['Finance', 'OKRs', 'Quarterly'],
    },
  });

  const event5 = await prisma.event.create({
    data: {
      id: 'ev-005',
      name: 'HR Policy Town Hall',
      description: 'Open forum to discuss updated HR policies and gather employee feedback.',
      type: EventType.HYBRID,
      status: EventStatus.UPCOMING,
      date: new Date('2026-05-05T09:00:00.000Z'),
      endDate: new Date('2026-05-05T11:00:00.000Z'),
      location: 'Main Hall + Online',
      organizerId: admin.id,
      maxParticipants: 100,
      participantCount: 72,
      isPaid: false,
      ticketPrice: 0,
      joinCode: 'XPL-HR05-2026',
      registrationCount: 72,
      tags: ['HR', 'Policy', 'Townhall'],
    },
  });

  console.log('Seeded events.');

  // Seed Meetings
  await prisma.meeting.create({
    data: {
      id: 'mt-001',
      title: 'Leadership Training Workshop',
      description: 'Live session covering advanced leadership frameworks and practical exercises.',
      status: MeetingStatus.LIVE,
      date: new Date('2026-04-15T06:00:00.000Z'),
      duration: 60,
      hostId: organizer1.id,
      maxParticipants: 50,
      participantCount: 28,
      meetingUrl: 'https://meet.jit.si/xplore-leadership-workshop-mt-001',
    },
  });

  await prisma.meeting.create({
    data: {
      id: 'mt-002',
      title: 'Product Review Meeting',
      description: 'Weekly product sync to review feature progress and blockers.',
      status: MeetingStatus.UPCOMING,
      date: new Date('2026-04-16T02:00:00.000Z'),
      duration: 45,
      hostId: organizer2.id,
      maxParticipants: 20,
      participantCount: 12,
      meetingUrl: 'https://meet.jit.si/xplore-product-review-mt-002',
    },
  });

  await prisma.meeting.create({
    data: {
      id: 'mt-003',
      title: 'Weekly Team Sync',
      description: 'Monday team sync — priorities, blockers, weekend updates.',
      status: MeetingStatus.UPCOMING,
      date: new Date('2026-04-17T07:00:00.000Z'),
      duration: 30,
      hostId: admin.id,
      maxParticipants: 15,
      participantCount: 8,
      meetingUrl: 'https://meet.jit.si/xplore-team-sync-mt-003',
    },
  });

  await prisma.meeting.create({
    data: {
      id: 'mt-004',
      title: 'Client Presentation',
      description: 'Final presentation of Phase 1 deliverables to the Lazada account.',
      status: MeetingStatus.COMPLETED,
      date: new Date('2026-03-29T03:00:00.000Z'),
      duration: 120,
      hostId: organizer3.id,
      maxParticipants: 25,
      participantCount: 15,
      meetingUrl: 'https://meet.jit.si/xplore-client-presentation-mt-004',
    },
  });

  await prisma.meeting.create({
    data: {
      id: 'mt-005',
      title: 'IT Infrastructure Review',
      description: 'Quarterly review of server performance, security patches, and cloud costs.',
      status: MeetingStatus.UPCOMING,
      date: new Date('2026-04-22T05:00:00.000Z'),
      duration: 60,
      hostId: admin.id,
      maxParticipants: 10,
      participantCount: 5,
      meetingUrl: 'https://meet.jit.si/xplore-it-review-mt-005',
    },
  });

  console.log('Seeded meetings.');

  // Seed Trainings
  const training1 = await prisma.training.create({
    data: {
      id: 'tr-001',
      title: 'Digital Marketing Fundamentals',
      description: 'Master the essentials of digital marketing strategies and tools.',
      category: TrainingCategory.MARKETING,
      hours: 6,
      modules: 12,
      instructorId: organizer1.id, // Maria Santos
    },
  });

  const training2 = await prisma.training.create({
    data: {
      id: 'tr-002',
      title: 'Project Management Essentials',
      description: 'Learn the core principles of effective project management.',
      category: TrainingCategory.MANAGEMENT,
      hours: 8,
      modules: 15,
      instructorId: organizer2.id, // John Reyes
    },
  });

  const training3 = await prisma.training.create({
    data: {
      id: 'tr-003',
      title: 'Data Analytics Bootcamp',
      description: 'Transform data into actionable insights with analytics.',
      category: TrainingCategory.ANALYTICS,
      hours: 10,
      modules: 18,
      instructorId: admin.id, // Jose Dela Cruz
    },
  });

  const training4 = await prisma.training.create({
    data: {
      id: 'tr-004',
      title: 'Leadership Excellence Program',
      description: 'Develop essential leadership skills for modern organizations.',
      category: TrainingCategory.LEADERSHIP,
      hours: 5,
      modules: 10,
      instructorId: organizer3.id, // Robert Tan
    },
  });

  const training5 = await prisma.training.create({
    data: {
      id: 'tr-005',
      title: 'Advanced Excel & Power BI',
      description: 'From formulas to dashboards — master Excel and Power BI for business reporting.',
      category: TrainingCategory.ANALYTICS,
      hours: 7,
      modules: 14,
      instructorId: instructor.id, // Anna Cruz
    },
  });

  console.log('Seeded trainings.');

  // Seed Enrollments for u-001 (Admin / Jose Dela Cruz)
  await prisma.enrollment.create({
    data: {
      userId: admin.id,
      trainingId: training1.id,
      progress: 75,
      status: TrainingStatus.IN_PROGRESS,
    },
  });

  await prisma.enrollment.create({
    data: {
      userId: admin.id,
      trainingId: training2.id,
      progress: 45,
      status: TrainingStatus.IN_PROGRESS,
    },
  });

  await prisma.enrollment.create({
    data: {
      userId: admin.id,
      trainingId: training3.id,
      progress: 60,
      status: TrainingStatus.IN_PROGRESS,
    },
  });

  await prisma.enrollment.create({
    data: {
      userId: admin.id,
      trainingId: training4.id,
      progress: 100,
      status: TrainingStatus.COMPLETED,
      completedAt: new Date(),
    },
  });

  console.log('Seeded enrollments.');
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
