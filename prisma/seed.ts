import { prisma } from "@/lib/prisma";

const DEMO_ACCOUNTS = [
  {
    firstName: "Jose",
    lastName: "Dela Cruz",
    email: "jose.dc@xplore.io",
    password: "hashed_password_123", // In production, use bcrypt
    role: "ADMIN",
    department: "Information Technology",
    avatarInitials: "JDC",
    bio: "Platform administrator for Xplore Nexus.",
    phone: "+63 912 345 6789",
  },
  {
    firstName: "Maria",
    lastName: "Santos",
    email: "maria.santos@xplore.io",
    password: "hashed_password_123",
    role: "ORGANIZER",
    department: "Events & Communications",
    avatarInitials: "MS",
  },
  {
    firstName: "Anna",
    lastName: "Cruz",
    email: "anna.cruz@xplore.io",
    password: "hashed_password_123",
    role: "INSTRUCTOR",
    department: "Learning & Development",
    avatarInitials: "AC",
  },
  {
    firstName: "Carlos",
    lastName: "Bautista",
    email: "carlos.bautista@xplore.io",
    password: "hashed_password_123",
    role: "PARTICIPANT",
    department: "Finance",
    avatarInitials: "CB",
  },
];

async function main() {
  console.log("🌱 Starting database seed...");

  // Create demo users
  for (const account of DEMO_ACCOUNTS) {
    const user = await prisma.user.upsert({
      where: { email: account.email },
      update: {},
      create: account,
    });
    console.log(`✓ Created user: ${user.email}`);
  }

  // Create sample trainings
  const trainings = [
    {
      title: "Digital Marketing Fundamentals",
      description: "Master the essentials of digital marketing strategies and tools for modern platforms.",
      category: "MARKETING",
      hours: 6,
      modules: 12,
    },
    {
      title: "Project Management Essentials",
      description: "Learn the core principles of effective project management and agile methodologies.",
      category: "MANAGEMENT",
      hours: 8,
      modules: 15,
    },
    {
      title: "Data Analytics Bootcamp",
      description: "Transform data into actionable insights using modern analytics tools and techniques.",
      category: "ANALYTICS",
      hours: 10,
      modules: 18,
    },
  ];

  for (const training of trainings) {
    const instrUser = await prisma.user.findFirst({
      where: { role: "INSTRUCTOR" },
    });
    if (instrUser) {
      const trainingRec = await prisma.training.upsert({
        where: { title: training.title },
        update: {},
        create: {
          ...training,
          instructorId: instrUser.id,
        },
      });
      console.log(`✓ Created training: ${trainingRec.title}`);
    }
  }

  // Create sample event
  const organizer = await prisma.user.findFirst({
    where: { role: "ORGANIZER" },
  });

  if (organizer) {
    const event = await prisma.event.upsert({
      where: { joinCode: "XPL-DEMO-2026" },
      update: {},
      create: {
        name: "Xplore Nexus Launch Event",
        description: "Join us for the official launch of Xplore Nexus platform!",
        type: "HYBRID",
        status: "UPCOMING",
        date: new Date("2026-06-15T10:00:00"),
        endDate: new Date("2026-06-15T14:00:00"),
        location: "Manila Convention Center & Online",
        organizerId: organizer.id,
        maxParticipants: 500,
        isPaid: false,
        ticketPrice: 0,
        joinCode: "XPL-DEMO-2026",
      },
    });
    console.log(`✓ Created event: ${event.name}`);
  }

  console.log("✅ Database seed completed!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
