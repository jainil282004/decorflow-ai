/**
 * Demo operational data.
 *
 * 1) Thin upcoming demo (PENDING packing) — reserved for day-to-day UI smoke tests.
 * 2) Complete E2E ops loop — one finished rental cycle covering:
 *    event → reserved → packed → dispatched → used → returned →
 *    cleaning → washed/restocked → invoice → payment
 *
 * Idempotent: keyed by stable titles / document numbers / SKUs.
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const LOOP_EVENT_TITLE = 'E2E Ops Loop — Sharma Wedding';
const LOOP_QUOTE_NUMBER = 'QT-LOOP-0001';
const LOOP_INVOICE_NUMBER = 'INV-LOOP-0001';
const TAX_RATE = 18;
const LOOP_QTY = 8;
const LOOP_UNIT_PRICE = 500;
const LOOP_CLEAN_QTY = 5;

function daysFromNow(days, hours = 0) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  if (hours) d.setHours(d.getHours() + hours);
  return d;
}

async function ensureCustomer(companyId) {
  let customer = await prisma.customer.findFirst({
    where: { companyId, email: 'demo.customer@decorflow.com', deletedAt: null },
  });
  if (!customer) {
    customer = await prisma.customer.findFirst({
      where: { companyId, deletedAt: null },
    });
  }
  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        companyId,
        type: 'INDIVIDUAL',
        name: 'Demo Customer',
        email: 'demo.customer@decorflow.com',
        phone: '9999999999',
      },
    });
  }
  return customer;
}

async function ensureEventType(companyId) {
  let eventType = await prisma.eventType.findFirst({ where: { companyId } });
  if (!eventType) {
    eventType = await prisma.eventType.create({
      data: { companyId, name: 'Wedding' },
    });
  }
  return eventType;
}

async function ensureEventStatus(companyId, name, { color, isTerminal = false } = {}) {
  let status = await prisma.eventStatus.findFirst({ where: { companyId, name } });
  if (!status) {
    status = await prisma.eventStatus.create({
      data: { companyId, name, color: color ?? null, isTerminal },
    });
  } else if (isTerminal && !status.isTerminal) {
    status = await prisma.eventStatus.update({
      where: { id: status.id },
      data: { isTerminal: true },
    });
  }
  return status;
}

async function ensureInventory(companyId) {
  let category = await prisma.inventoryCategory.findFirst({ where: { companyId } });
  if (!category) {
    category = await prisma.inventoryCategory.create({
      data: { companyId, name: 'Decor', bufferHours: 24 },
    });
  }

  let item = await prisma.inventoryItem.findFirst({
    where: { companyId, sku: 'CHAD-WHITE-001', deletedAt: null },
    include: { variants: true },
  });
  if (!item) {
    item = await prisma.inventoryItem.findFirst({
      where: { companyId, deletedAt: null },
      include: { variants: true },
    });
  }
  if (!item) {
    item = await prisma.inventoryItem.create({
      data: {
        companyId,
        categoryId: category.id,
        name: 'White Chadarva',
        sku: 'CHAD-WHITE-001',
        status: 'AVAILABLE',
        currentQuantity: 20,
        availableQuantity: 20,
        minStock: 2,
        rentalPrice: LOOP_UNIT_PRICE,
        requiresCleaning: true,
        bufferHours: 24,
        variants: {
          create: [{ name: 'Standard', sku: 'CHAD-WHITE-001-STD' }],
        },
      },
      include: { variants: true },
    });
  } else {
    // Keep washable flag + rental price aligned for loop demos.
    item = await prisma.inventoryItem.update({
      where: { id: item.id },
      data: {
        requiresCleaning: true,
        rentalPrice: item.rentalPrice > 0 ? item.rentalPrice : LOOP_UNIT_PRICE,
        bufferHours: item.bufferHours ?? 24,
      },
      include: { variants: true },
    });
    if (!item.variants.length) {
      await prisma.inventoryVariant.create({
        data: { itemId: item.id, name: 'Standard', sku: `${item.sku}-STD` },
      });
      item = await prisma.inventoryItem.findFirst({
        where: { id: item.id },
        include: { variants: true },
      });
    }
  }

  let warehouse = await prisma.warehouse.findFirst({ where: { companyId } });
  if (!warehouse) {
    warehouse = await prisma.warehouse.create({
      data: { companyId, name: 'Main Warehouse', address: 'HQ' },
    });
  }

  return { category, item, warehouse, variantId: item.variants[0].id };
}

async function ensureFleet(companyId) {
  const driverUser = await prisma.user.findFirst({
    where: { email: 'driver@decorflow.com', deletedAt: null },
  });
  if (!driverUser) {
    throw new Error('driver@decorflow.com missing — run seed-roles first.');
  }

  let driver = await prisma.driver.findFirst({
    where: { companyId, userId: driverUser.id },
  });
  if (!driver) {
    const licenseExpiry = daysFromNow(365 * 2);
    driver = await prisma.driver.create({
      data: {
        companyId,
        userId: driverUser.id,
        licenseNumber: 'DL-DEMO-0001',
        licenseExpiry,
        contactNumber: '9876543210',
        availabilityStatus: 'AVAILABLE',
      },
    });
  }

  let vehicleType = await prisma.vehicleType.findFirst({ where: { companyId } });
  if (!vehicleType) {
    vehicleType = await prisma.vehicleType.create({
      data: { companyId, name: 'Tempo' },
    });
  }

  let vehicle = await prisma.vehicle.findFirst({
    where: { companyId, licensePlate: 'GJ-01-DF-1001' },
  });
  if (!vehicle) {
    vehicle = await prisma.vehicle.create({
      data: {
        companyId,
        typeId: vehicleType.id,
        make: 'Tata',
        model: '407',
        year: 2022,
        licensePlate: 'GJ-01-DF-1001',
        status: 'ACTIVE',
        assignedDriverId: driver.id,
      },
    });
  }

  return { driver, vehicle, driverUser };
}

async function ensureVenue(companyId) {
  let venue = await prisma.venue.findFirst({
    where: { companyId, name: 'Grand Banquet Hall' },
  });
  if (!venue) {
    venue = await prisma.venue.create({
      data: {
        companyId,
        name: 'Grand Banquet Hall',
        type: 'Banquet',
        address: 'SG Highway, Ahmedabad',
        indoorOutdoor: 'Indoor',
        parkingNotes: 'Loading bay on west side',
      },
    });
  }
  return venue;
}

async function seedThinUpcomingDemo({
  company,
  customer,
  eventType,
  confirmedStatus,
  item,
  warehouse,
  variantId,
}) {
  let event = await prisma.event.findFirst({
    where: { companyId: company.id, title: 'Demo Mandap Setup', deletedAt: null },
  });
  if (!event) {
    // Prefer existing non-loop event if present (legacy seed).
    event = await prisma.event.findFirst({
      where: {
        companyId: company.id,
        deletedAt: null,
        NOT: { title: LOOP_EVENT_TITLE },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
  if (!event) {
    const start = daysFromNow(7);
    const end = daysFromNow(7, 8);
    event = await prisma.event.create({
      data: {
        companyId: company.id,
        customerId: customer.id,
        typeId: eventType.id,
        statusId: confirmedStatus.id,
        title: 'Demo Mandap Setup',
        startDate: start,
        endDate: end,
      },
    });
  }

  let packingJob = await prisma.packingJob.findFirst({
    where: {
      companyId: company.id,
      eventId: event.id,
      deletedAt: null,
      status: 'PENDING',
    },
  });
  if (!packingJob) {
    // Avoid duplicating if this event already has any packing job.
    packingJob = await prisma.packingJob.findFirst({
      where: { companyId: company.id, eventId: event.id, deletedAt: null },
    });
  }
  if (!packingJob) {
    packingJob = await prisma.packingJob.create({
      data: {
        companyId: company.id,
        eventId: event.id,
        warehouseId: warehouse.id,
        status: 'PENDING',
        items: {
          create: [{ variantId, expectedQuantity: 5 }],
        },
      },
    });
  }

  return { event, packingJob };
}

/**
 * One finished rental cycle so every ops screen has realistic completed data.
 */
async function seedCompleteOpsLoop({
  company,
  customer,
  eventType,
  completedStatus,
  item,
  warehouse,
  variantId,
  venue,
  driver,
  vehicle,
}) {
  const inventoryUser = await prisma.user.findFirst({
    where: { email: 'inventory@decorflow.com', deletedAt: null },
  });
  const adminUser = await prisma.user.findFirst({
    where: { email: 'admin@decorflow.com', deletedAt: null },
  });
  const actorId = inventoryUser?.id ?? adminUser?.id;
  if (!actorId) {
    throw new Error('No inventory/admin user found — run seed-roles first.');
  }

  const eventStart = daysFromNow(-14);
  const eventEnd = daysFromNow(-14, 10);
  const packedAt = daysFromNow(-15);
  const verifiedAt = daysFromNow(-15, 1);
  const dispatchedAt = daysFromNow(-14, -2);
  const returnedAt = daysFromNow(-13);
  const washedAt = daysFromNow(-12);
  const quoteDate = daysFromNow(-20);
  const invoiceDate = daysFromNow(-13);
  const paymentDate = daysFromNow(-12);

  let event = await prisma.event.findFirst({
    where: { companyId: company.id, title: LOOP_EVENT_TITLE, deletedAt: null },
  });
  if (!event) {
    event = await prisma.event.create({
      data: {
        companyId: company.id,
        customerId: customer.id,
        typeId: eventType.id,
        statusId: completedStatus.id,
        venueId: venue.id,
        title: LOOP_EVENT_TITLE,
        theme: 'Ivory & Gold',
        priority: 'HIGH',
        startDate: eventStart,
        endDate: eventEnd,
        setupDate: packedAt,
        dismantleDate: returnedAt,
        guestCount: 350,
        budget: 80000,
        expectedRevenue: 4720,
        totalAmount: 4720,
        depositAmount: 2000,
      },
    });
  } else if (event.statusId !== completedStatus.id || event.venueId !== venue.id) {
    event = await prisma.event.update({
      where: { id: event.id },
      data: {
        statusId: completedStatus.id,
        venueId: venue.id,
        totalAmount: 4720,
      },
    });
  }

  const subTotal = LOOP_QTY * LOOP_UNIT_PRICE;
  const taxTotal = Math.round(subTotal * (TAX_RATE / 100) * 100) / 100;
  const totalAmount = subTotal + taxTotal;
  const lineDescription = `${item.name} rental × ${LOOP_QTY}`;

  let quotation = await prisma.quotation.findFirst({
    where: { companyId: company.id, number: LOOP_QUOTE_NUMBER },
    include: { items: true, invoice: true },
  });
  if (!quotation) {
    quotation = await prisma.quotation.create({
      data: {
        companyId: company.id,
        customerId: customer.id,
        eventId: event.id,
        number: LOOP_QUOTE_NUMBER,
        date: quoteDate,
        validUntil: daysFromNow(-10),
        subTotal,
        taxTotal,
        discountTotal: 0,
        totalAmount,
        status: 'APPROVED',
        items: {
          create: [
            {
              description: lineDescription,
              quantity: LOOP_QTY,
              unitPrice: LOOP_UNIT_PRICE,
              taxRate: TAX_RATE,
            },
          ],
        },
      },
      include: { items: true, invoice: true },
    });
  }

  let invoice = await prisma.invoice.findFirst({
    where: { companyId: company.id, number: LOOP_INVOICE_NUMBER },
    include: { payments: true, items: true },
  });
  if (!invoice && quotation.invoice) {
    invoice = await prisma.invoice.findFirst({
      where: { id: quotation.invoice.id },
      include: { payments: true, items: true },
    });
  }
  if (!invoice) {
    invoice = await prisma.invoice.create({
      data: {
        companyId: company.id,
        customerId: customer.id,
        eventId: event.id,
        quotationId: quotation.id,
        number: LOOP_INVOICE_NUMBER,
        date: invoiceDate,
        dueDate: daysFromNow(-6),
        subTotal,
        taxTotal,
        discountTotal: 0,
        totalAmount,
        status: 'PAID',
        notes: 'E2E ops loop demo invoice — paid in full after return.',
        items: {
          create: [
            {
              description: lineDescription,
              quantity: LOOP_QTY,
              unitPrice: LOOP_UNIT_PRICE,
              taxRate: TAX_RATE,
            },
          ],
        },
        payments: {
          create: [
            {
              companyId: company.id,
              amount: totalAmount,
              date: paymentDate,
              method: 'TRANSFER',
              reference: 'UPI-LOOP-DEMO-001',
            },
          ],
        },
      },
      include: { payments: true, items: true },
    });
  } else if (invoice.payments.length === 0) {
    await prisma.payment.create({
      data: {
        companyId: company.id,
        invoiceId: invoice.id,
        amount: totalAmount,
        date: paymentDate,
        method: 'TRANSFER',
        reference: 'UPI-LOOP-DEMO-001',
      },
    });
    invoice = await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: 'PAID' },
      include: { payments: true, items: true },
    });
  }

  let packingJob = await prisma.packingJob.findFirst({
    where: { companyId: company.id, eventId: event.id, deletedAt: null },
    include: { items: true },
  });
  if (!packingJob) {
    packingJob = await prisma.packingJob.create({
      data: {
        companyId: company.id,
        eventId: event.id,
        warehouseId: warehouse.id,
        status: 'RETURNED',
        packedById: actorId,
        packedAt,
        verifiedById: actorId,
        verifiedAt,
        verificationNotes: 'All items present and packed.',
        dispatchedById: actorId,
        dispatchedAt,
        dispatchNotes: 'Loaded on Tempo GJ-01-DF-1001.',
        vehicleId: vehicle.id,
        driverId: driver.id,
        dispatchChecklist: JSON.stringify({
          loadVerified: true,
          strapsChecked: true,
          docsReady: true,
        }),
        returnedById: actorId,
        returnedAt,
        returnNotes: 'Returned after dismantle; 5 pcs need washing.',
        items: {
          create: [
            {
              variantId,
              expectedQuantity: LOOP_QTY,
              pickedQuantity: LOOP_QTY,
              missingQuantity: 0,
              damagedQuantity: 0,
              packingNotes: 'Reserved & fully picked.',
              returnedQuantity: LOOP_QTY,
              returnMissingQuantity: 0,
              returnDamagedQuantity: 0,
              needsCleaningQuantity: LOOP_CLEAN_QTY,
              needsRepairQuantity: 0,
              returnNotes: `${LOOP_CLEAN_QTY} dirty after event use.`,
            },
          ],
        },
      },
      include: { items: true },
    });
  } else if (packingJob.status !== 'RETURNED') {
    // Upgrade an incomplete loop job to the finished state (idempotent re-seed).
    const line = packingJob.items[0];
    if (line) {
      await prisma.packingJobItem.update({
        where: { id: line.id },
        data: {
          expectedQuantity: LOOP_QTY,
          pickedQuantity: LOOP_QTY,
          returnedQuantity: LOOP_QTY,
          needsCleaningQuantity: LOOP_CLEAN_QTY,
          returnNotes: `${LOOP_CLEAN_QTY} dirty after event use.`,
        },
      });
    }
    packingJob = await prisma.packingJob.update({
      where: { id: packingJob.id },
      data: {
        status: 'RETURNED',
        packedById: actorId,
        packedAt,
        verifiedById: actorId,
        verifiedAt,
        dispatchedById: actorId,
        dispatchedAt,
        vehicleId: vehicle.id,
        driverId: driver.id,
        returnedById: actorId,
        returnedAt,
        returnNotes: 'Returned after dismantle; 5 pcs need washing.',
      },
      include: { items: true },
    });
  }

  const packingLine = packingJob.items[0];
  if (!packingLine) {
    throw new Error('E2E loop packing job has no line items.');
  }

  let trip = await prisma.trip.findFirst({
    where: { companyId: company.id, eventId: event.id },
  });
  if (!trip) {
    trip = await prisma.trip.create({
      data: {
        companyId: company.id,
        eventId: event.id,
        vehicleId: vehicle.id,
        driverId: driver.id,
        pickupWarehouseId: warehouse.id,
        destinationVenueId: venue.id,
        plannedDeparture: dispatchedAt,
        plannedArrival: eventStart,
        actualDeparture: dispatchedAt,
        actualArrival: eventStart,
        status: 'COMPLETED',
        distance: 18.5,
        notes: 'Delivery + pickup for E2E ops loop event.',
        checkVehicleInspection: true,
        checkFuel: true,
        checkDocuments: true,
        checkLoadVerification: true,
        checkSafetyEquipment: true,
        postVehicleInspection: true,
        postDamageReport: true,
        postFuelLog: true,
        postOdometerUpdate: true,
      },
    });
  } else if (trip.status !== 'COMPLETED') {
    trip = await prisma.trip.update({
      where: { id: trip.id },
      data: {
        status: 'COMPLETED',
        vehicleId: vehicle.id,
        driverId: driver.id,
        pickupWarehouseId: warehouse.id,
        destinationVenueId: venue.id,
        actualDeparture: dispatchedAt,
        actualArrival: eventStart,
        checkVehicleInspection: true,
        checkFuel: true,
        checkDocuments: true,
        checkLoadVerification: true,
        checkSafetyEquipment: true,
        postVehicleInspection: true,
        postDamageReport: true,
        postFuelLog: true,
        postOdometerUpdate: true,
      },
    });
  }

  let inspection = await prisma.returnInspection.findFirst({
    where: { companyId: company.id, packingJobId: packingJob.id },
    include: { items: { include: { cleaningJobs: true } } },
  });
  if (!inspection) {
    inspection = await prisma.returnInspection.create({
      data: {
        companyId: company.id,
        eventId: event.id,
        packingJobId: packingJob.id,
        inspectorId: actorId,
        status: 'COMPLETED',
        inspectionNotes: 'Post-event return inspection for E2E loop.',
        items: {
          create: [
            {
              packingJobItemId: packingLine.id,
              returnedQuantity: LOOP_QTY,
              missingQuantity: 0,
              damagedQuantity: 0,
              dirtyQuantity: LOOP_CLEAN_QTY,
              lostQuantity: 0,
              inspectionNotes: `${LOOP_CLEAN_QTY} pcs tagged for wash.`,
            },
          ],
        },
      },
      include: { items: { include: { cleaningJobs: true } } },
    });
  }

  const inspectionItem = inspection.items[0];
  if (!inspectionItem) {
    throw new Error('E2E loop return inspection has no items.');
  }

  let cleaningJob = inspectionItem.cleaningJobs?.[0];
  if (!cleaningJob) {
    cleaningJob = await prisma.cleaningJob.findFirst({
      where: { companyId: company.id, inspectionItemId: inspectionItem.id },
    });
  }
  if (!cleaningJob) {
    cleaningJob = await prisma.cleaningJob.create({
      data: {
        companyId: company.id,
        inspectionItemId: inspectionItem.id,
        variantId,
        priority: 'NORMAL',
        status: 'DONE',
        quantity: LOOP_CLEAN_QTY,
        washCount: 1,
        lastWashDate: washedAt,
        dueDate: daysFromNow(-12, 6),
        assignedStaffId: actorId,
        cleaningNotes: 'Washed, dried, and restocked to Main Warehouse.',
      },
    });
  } else if (cleaningJob.status !== 'DONE') {
    cleaningJob = await prisma.cleaningJob.update({
      where: { id: cleaningJob.id },
      data: {
        status: 'DONE',
        washCount: Math.max(cleaningJob.washCount || 0, 1),
        lastWashDate: washedAt,
        assignedStaffId: actorId,
        cleaningNotes: 'Washed, dried, and restocked to Main Warehouse.',
      },
    });
  }

  // Washed/restocked: no outstanding NEEDS_CLEANING hold for this loop.
  await prisma.inventoryCondition.deleteMany({
    where: {
      variantId,
      condition: 'NEEDS_CLEANING',
      notes: { contains: 'E2E' },
    },
  });
  // Also clear any leftover NEEDS_CLEANING rows that match the loop return note pattern.
  await prisma.inventoryCondition.deleteMany({
    where: {
      variantId,
      condition: 'NEEDS_CLEANING',
      notes: { contains: 'dirty after event use' },
    },
  });

  return {
    event,
    quotation,
    invoice,
    packingJob,
    trip,
    inspection,
    cleaningJob,
  };
}

async function main() {
  const company = await prisma.company.findFirst({ where: { deletedAt: null } });
  if (!company) throw new Error('No company found. Run seed-roles first.');

  const customer = await ensureCustomer(company.id);
  const eventType = await ensureEventType(company.id);
  const confirmedStatus = await ensureEventStatus(company.id, 'Confirmed', {
    color: '#22c55e',
  });
  const completedStatus = await ensureEventStatus(company.id, 'Completed', {
    color: '#64748b',
    isTerminal: true,
  });
  const { item, warehouse, variantId } = await ensureInventory(company.id);
  const { driver, vehicle } = await ensureFleet(company.id);
  const venue = await ensureVenue(company.id);

  const thin = await seedThinUpcomingDemo({
    company,
    customer,
    eventType,
    confirmedStatus,
    item,
    warehouse,
    variantId,
  });

  const loop = await seedCompleteOpsLoop({
    company,
    customer,
    eventType,
    completedStatus,
    item,
    warehouse,
    variantId,
    venue,
    driver,
    vehicle,
  });

  console.log('Seeding completed successfully!');
  console.log(
    JSON.stringify(
      {
        companyId: company.id,
        customerId: customer.id,
        thinDemo: {
          eventId: thin.event.id,
          eventTitle: thin.event.title,
          packingJobId: thin.packingJob.id,
          packingStatus: thin.packingJob.status,
        },
        e2eOpsLoop: {
          eventId: loop.event.id,
          eventTitle: loop.event.title,
          packingJobId: loop.packingJob.id,
          packingStatus: loop.packingJob.status,
          tripId: loop.trip.id,
          cleaningJobId: loop.cleaningJob.id,
          cleaningStatus: loop.cleaningJob.status,
          quotationId: loop.quotation.id,
          quotationNumber: LOOP_QUOTE_NUMBER,
          invoiceId: loop.invoice.id,
          invoiceNumber: LOOP_INVOICE_NUMBER,
          invoiceStatus: loop.invoice.status,
          paymentCount: loop.invoice.payments?.length ?? 0,
          itemId: item.id,
          variantId,
          warehouseId: warehouse.id,
          venueId: venue.id,
          vehicleId: vehicle.id,
          driverId: driver.id,
          stages: [
            'event created',
            'items reserved (packing lines)',
            'packed + verified',
            'dispatched (packing + trip)',
            'used at venue',
            'returned + inspected',
            'cleaning DONE (washed/restocked)',
            'invoice PAID',
          ],
        },
      },
      null,
      2
    )
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
