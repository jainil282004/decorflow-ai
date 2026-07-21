const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const company = await prisma.company.findFirst();
  if (!company) throw new Error('No company found. Run seed-roles first.');

  let customer = await prisma.customer.findFirst({
    where: { companyId: company.id, deletedAt: null },
  });
  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        companyId: company.id,
        type: 'INDIVIDUAL',
        name: 'Demo Customer',
        email: 'demo.customer@decorflow.com',
        phone: '9999999999',
      },
    });
  }

  let eventType = await prisma.eventType.findFirst({ where: { companyId: company.id } });
  if (!eventType) {
    eventType = await prisma.eventType.create({
      data: { companyId: company.id, name: 'Wedding' },
    });
  }

  let eventStatus = await prisma.eventStatus.findFirst({ where: { companyId: company.id } });
  if (!eventStatus) {
    eventStatus = await prisma.eventStatus.create({
      data: { companyId: company.id, name: 'Confirmed', color: '#22c55e' },
    });
  }

  let event = await prisma.event.findFirst({
    where: { companyId: company.id, deletedAt: null },
    orderBy: { createdAt: 'desc' },
  });
  if (!event) {
    const start = new Date();
    start.setDate(start.getDate() + 7);
    const end = new Date(start);
    end.setHours(end.getHours() + 8);
    event = await prisma.event.create({
      data: {
        companyId: company.id,
        customerId: customer.id,
        typeId: eventType.id,
        statusId: eventStatus.id,
        title: 'Demo Mandap Setup',
        startDate: start,
        endDate: end,
      },
    });
  }

  let category = await prisma.inventoryCategory.findFirst({ where: { companyId: company.id } });
  if (!category) {
    category = await prisma.inventoryCategory.create({
      data: { companyId: company.id, name: 'Decor' },
    });
  }

  let item = await prisma.inventoryItem.findFirst({
    where: { companyId: company.id, deletedAt: null },
    include: { variants: true },
  });
  if (!item) {
    item = await prisma.inventoryItem.create({
      data: {
        companyId: company.id,
        categoryId: category.id,
        name: 'White Chadarva',
        sku: 'CHAD-WHITE-001',
        status: 'AVAILABLE',
        currentQuantity: 20,
        availableQuantity: 20,
        minStock: 2,
        variants: {
          create: [{ name: 'Standard', sku: 'CHAD-WHITE-001-STD' }],
        },
      },
      include: { variants: true },
    });
  } else if (!item.variants.length) {
    await prisma.inventoryVariant.create({
      data: { itemId: item.id, name: 'Standard', sku: `${item.sku}-STD` },
    });
    item = await prisma.inventoryItem.findFirst({
      where: { id: item.id },
      include: { variants: true },
    });
  }

  let warehouse = await prisma.warehouse.findFirst({ where: { companyId: company.id } });
  if (!warehouse) {
    warehouse = await prisma.warehouse.create({
      data: { companyId: company.id, name: 'Main Warehouse', address: 'HQ' },
    });
  }

  const variantId = item.variants[0].id;
  let packingJob = await prisma.packingJob.findFirst({
    where: { companyId: company.id, deletedAt: null },
  });
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

  console.log(
    JSON.stringify(
      {
        companyId: company.id,
        customerId: customer.id,
        eventId: event.id,
        itemId: item.id,
        variantId,
        warehouseId: warehouse.id,
        packingJobId: packingJob.id,
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
