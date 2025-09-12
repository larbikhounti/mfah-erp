import { PrismaClient } from '@prisma/client';

export async function seedTickets(prisma: PrismaClient) {
  console.log('Seeding tickets...');

  try {
    // Get existing data to create realistic tickets
    const users = await prisma.users.findMany({
      take: 15, // Use first 15 users
    });

    const experiences = await prisma.experiences.findMany({
      where: { deletedAt: null },
      include: {
        machines: {
          include: {
            machineChairs: {
              where: { deletedAt: null },
            },
          },
        },
        games: {
          select: {
            name: true,
            price: true,
            playTime: true,
            gameTypes: {
              select: {
                name: true,
              },
            },
          },
        },
        doms: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      take: 20, // Use first 20 experiences
    });

    const doms = await prisma.doms.findMany({
      where: { deletedAt: null },
    });

    if (users.length === 0 || experiences.length === 0 || doms.length === 0) {
      console.log(
        'Not enough users, experiences, or doms to create tickets. Skipping tickets seeding.',
      );
      return;
    }

    // Check if tickets already exist to avoid duplicates
    const existingTickets = await prisma.tickets.findMany({
      where: { deletedAt: null },
    });

    if (existingTickets.length > 0) {
      console.log('✅ Tickets already exist, skipping seeding');
      return;
    }

    const ticketsToCreate = [];

    // Create scenarios for different types of bookings

    // Scenario 1: Popular VR experiences (high ticket count)
    const vrExperiences = experiences.filter(
      (exp) =>
        exp.games?.gameTypes?.name === 'VR Experience' ||
        exp.games?.name?.toLowerCase().includes('vr'),
    );

    for (const vrExp of vrExperiences.slice(0, 3)) {
      // Create 8-12 tickets for popular VR experiences
      const ticketCount = Math.floor(Math.random() * 5) + 8;

      for (let i = 0; i < ticketCount; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        const availableChairs = vrExp.machines.machineChairs || [];
        const chair =
          availableChairs.length > 0
            ? availableChairs[i % availableChairs.length]
            : null;

        // VR experiences have higher payment rates (95%)
        const isPaid = Math.random() > 0.05;

        // Recent bookings (last 7 days)
        const randomHoursAgo = Math.floor(Math.random() * (7 * 24));
        const createdAt = new Date();
        createdAt.setHours(createdAt.getHours() - randomHoursAgo);

        ticketsToCreate.push({
          userId: user.id,
          experienceId: vrExp.id,
          isPaid,
          chairId: chair?.id || null,
          domeId: vrExp.doms?.id || doms[0].id,
          createdAt,
          updatedAt: createdAt,
        });
      }
    }

    // Scenario 2: Racing simulators (medium popularity)
    const racingExperiences = experiences.filter(
      (exp) =>
        exp.games?.gameTypes?.name === 'Racing' ||
        exp.games?.name?.toLowerCase().includes('racing'),
    );

    for (const raceExp of racingExperiences.slice(0, 2)) {
      const ticketCount = Math.floor(Math.random() * 4) + 4; // 4-7 tickets

      for (let i = 0; i < ticketCount; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        const availableChairs = raceExp.machines.machineChairs || [];
        const chair =
          availableChairs.length > 0
            ? availableChairs[i % availableChairs.length]
            : null;

        const isPaid = Math.random() > 0.1; // 90% payment rate

        // Bookings within last 14 days
        const randomHoursAgo = Math.floor(Math.random() * (14 * 24));
        const createdAt = new Date();
        createdAt.setHours(createdAt.getHours() - randomHoursAgo);

        ticketsToCreate.push({
          userId: user.id,
          experienceId: raceExp.id,
          isPaid,
          chairId: chair?.id || null,
          domeId: raceExp.doms?.id || doms[0].id,
          createdAt,
          updatedAt: createdAt,
        });
      }
    }

    // Scenario 3: Premium experiences (high price, fewer tickets)
    const premiumExperiences = experiences.filter(
      (exp) => exp.games?.price && exp.games.price > 25,
    );

    for (const premExp of premiumExperiences.slice(0, 3)) {
      const ticketCount = Math.floor(Math.random() * 3) + 2; // 2-4 tickets

      for (let i = 0; i < ticketCount; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        const availableChairs = premExp.machines.machineChairs || [];
        const chair =
          availableChairs.length > 0
            ? availableChairs[
                Math.floor(Math.random() * availableChairs.length)
              ]
            : null;

        const isPaid = Math.random() > 0.05; // 95% payment rate for premium

        // Recent premium bookings (last 5 days)
        const randomHoursAgo = Math.floor(Math.random() * (5 * 24));
        const createdAt = new Date();
        createdAt.setHours(createdAt.getHours() - randomHoursAgo);

        ticketsToCreate.push({
          userId: user.id,
          experienceId: premExp.id,
          isPaid,
          chairId: chair?.id || null,
          domeId: premExp.doms?.id || doms[0].id,
          createdAt,
          updatedAt: createdAt,
        });
      }
    }

    // Scenario 4: Budget-friendly arcade games (more tickets, lower payment rate)
    const arcadeExperiences = experiences.filter(
      (exp) =>
        exp.games?.gameTypes?.name === 'Action' ||
        exp.games?.name?.toLowerCase().includes('arcade') ||
        (exp.games?.price && exp.games.price <= 15),
    );

    for (const arcadeExp of arcadeExperiences.slice(0, 4)) {
      const ticketCount = Math.floor(Math.random() * 6) + 5; // 5-10 tickets

      for (let i = 0; i < ticketCount; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        const availableChairs = arcadeExp.machines.machineChairs || [];
        const chair =
          availableChairs.length > 0 && Math.random() > 0.3
            ? availableChairs[
                Math.floor(Math.random() * availableChairs.length)
              ]
            : null;

        const isPaid = Math.random() > 0.2; // 80% payment rate for budget games

        // Bookings within last 21 days
        const randomHoursAgo = Math.floor(Math.random() * (21 * 24));
        const createdAt = new Date();
        createdAt.setHours(createdAt.getHours() - randomHoursAgo);

        ticketsToCreate.push({
          userId: user.id,
          experienceId: arcadeExp.id,
          isPaid,
          chairId: chair?.id || null,
          domeId: arcadeExp.doms?.id || doms[0].id,
          createdAt,
          updatedAt: createdAt,
        });
      }
    }

    // Scenario 5: Random distribution for remaining experiences
    const remainingExperiences = experiences.filter(
      (exp) =>
        !vrExperiences.includes(exp) &&
        !racingExperiences.includes(exp) &&
        !premiumExperiences.includes(exp) &&
        !arcadeExperiences.includes(exp),
    );

    for (const exp of remainingExperiences) {
      const ticketCount = Math.floor(Math.random() * 4) + 1; // 1-4 tickets

      for (let i = 0; i < ticketCount; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        const availableChairs = exp.machines.machineChairs || [];
        const chair =
          availableChairs.length > 0 && Math.random() > 0.5
            ? availableChairs[
                Math.floor(Math.random() * availableChairs.length)
              ]
            : null;

        const isPaid = Math.random() > 0.15; // 85% payment rate

        // Random bookings within last 30 days
        const randomHoursAgo = Math.floor(Math.random() * (30 * 24));
        const createdAt = new Date();
        createdAt.setHours(createdAt.getHours() - randomHoursAgo);

        ticketsToCreate.push({
          userId: user.id,
          experienceId: exp.id,
          isPaid,
          chairId: chair?.id || null,
          domeId: exp.doms?.id || doms[0].id,
          createdAt,
          updatedAt: createdAt,
        });
      }
    }

    // Remove potential duplicates based on userId + experienceId + chairId + similar time
    const uniqueTickets = [];
    const seen = new Set();

    for (const ticket of ticketsToCreate) {
      const key = `${ticket.userId}-${ticket.experienceId}-${ticket.chairId}-${ticket.createdAt.toDateString()}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueTickets.push(ticket);
      }
    }

    await prisma.tickets.createMany({
      data: uniqueTickets,
      skipDuplicates: true,
    });

    console.log(
      `✅ Created ${uniqueTickets.length} tickets with realistic scenarios`,
    );

    // Enhanced statistics
    const totalTickets = await prisma.tickets.count({
      where: { deletedAt: null },
    });
    const paidTickets = await prisma.tickets.count({
      where: { deletedAt: null, isPaid: true },
    });
    const unpaidTickets = await prisma.tickets.count({
      where: { deletedAt: null, isPaid: false },
    });
    const ticketsWithChairs = await prisma.tickets.count({
      where: { deletedAt: null, chairId: { not: null } },
    });

    // Calculate revenue statistics
    const ticketsWithPricing = await prisma.tickets.findMany({
      where: { deletedAt: null, isPaid: true },
      include: {
        experiences: {
          include: {
            games: {
              select: {
                price: true,
              },
            },
          },
        },
      },
    });

    const totalRevenue = ticketsWithPricing.reduce((sum, ticket) => {
      return sum + (ticket.experiences.games?.price || 0);
    }, 0);

    console.log(`📊 Enhanced Ticket Statistics:`);
    console.log(`   Total Tickets: ${totalTickets}`);
    console.log(
      `   Paid: ${paidTickets} (${((paidTickets / totalTickets) * 100).toFixed(1)}%)`,
    );
    console.log(
      `   Unpaid: ${unpaidTickets} (${((unpaidTickets / totalTickets) * 100).toFixed(1)}%)`,
    );
    console.log(`   With chairs assigned: ${ticketsWithChairs}`);
    console.log(`   Total Revenue (paid): $${totalRevenue.toFixed(2)}`);
    console.log(
      `   Average ticket price: $${(totalRevenue / paidTickets).toFixed(2)}`,
    );
  } catch (error) {
    console.error('❌ Error seeding tickets:', error);
    throw error;
  }
}
