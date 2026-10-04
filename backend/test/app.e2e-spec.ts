// Must be set before AppModule (and its ConfigModule) loads; real .env
// values, if any, are left alone — ConfigModule never overrides them.
process.env.JWT_ACCESS_SECRET ??= 'e2e-secret';

import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { Currency, Prisma } from '@prisma/client';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { PrismaService } from '../src/prisma/prisma.service';
import { createPrismaMock, PrismaMock } from './helpers/prisma-mock';

/**
 * Boots the WHOLE app (every module, guard, pipe and interceptor, set up
 * exactly like main.ts) against a fake database, then drives it over HTTP.
 * Catches what unit tests can't: a module that fails to boot (e.g. the
 * AuthGuard/JwtModule DI quirk in CLAUDE.md), routes left unguarded,
 * validation rules, and DTOs rejecting fields the frontend sends.
 */
describe('MFAH API (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaMock;
  let adminToken: string;
  let officeToken: string;

  const validMission = {
    clientId: 1,
    transportType: 'EXPORT',
    executionMode: 'IN_HOUSE',
    loadingLocation: 'Tanger',
    deliveryLocation: 'Madrid',
    clientPrice: 1000,
    currency: 'EUR',
    exchangeRate: 10.93,
    truckId: 10,
    driverId: 20,
    missionDate: '2026-09-01T00:00:00.000Z',
  };

  beforeAll(async () => {
    prisma = createPrismaMock();
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    app = moduleRef.createNestApplication({ logger: false });
    configureApp(app);
    await app.init();

    const jwt = new JwtService({ secret: process.env.JWT_ACCESS_SECRET });
    adminToken = jwt.sign({ sub: 1, email: 'admin@mfah.ma' });
    officeToken = jwt.sign({ sub: 2, email: 'office@mfah.ma' });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.users.findUnique.mockImplementation(({ where }) =>
      Promise.resolve(
        where.id === 1
          ? { id: 1, roles: { id: 1, name: 'admin' } }
          : { id: 2, roles: { id: 2, name: 'front office' } },
      ),
    );
    prisma.client.findUnique.mockResolvedValue({ id: 1 });
    prisma.truck.findUnique.mockResolvedValue({ id: 10 });
    prisma.driver.findUnique.mockResolvedValue({ id: 20 });
    prisma.mission.count.mockResolvedValue(0);
    prisma.mission.create.mockImplementation(({ data }) =>
      Promise.resolve({ id: 1, ...data }),
    );
  });

  const api = () => request(app.getHttpServer());

  it('boots and serves the public root route', () => {
    return api().get('/api').expect(200);
  });

  describe('authentication', () => {
    it.each([
      '/api/v1/missions',
      '/api/v1/trucks',
      '/api/v1/drivers',
      '/api/v1/clients',
      '/api/v1/subcontractors',
      '/api/v1/client-invoices',
      '/api/v1/subcontractor-bills',
      '/api/v1/dashboard/summary',
    ])('rejects %s without a token', (path) => {
      return api().get(path).expect(401);
    });

    it('rejects a token signed with the wrong secret', () => {
      const forged = new JwtService({ secret: 'not-the-secret' }).sign({
        sub: 1,
        email: 'admin@mfah.ma',
      });
      return api()
        .get('/api/v1/missions')
        .set('Authorization', `Bearer ${forged}`)
        .expect(401);
    });
  });

  describe('permissions', () => {
    it('lets a non-admin role without a grant get a 403', () => {
      prisma.permission.findUnique.mockResolvedValue(null);
      return api()
        .get('/api/v1/missions')
        .set('Authorization', `Bearer ${officeToken}`)
        .expect(403);
    });

    it('lets a non-admin role with a read grant through', () => {
      prisma.permission.findUnique.mockResolvedValue({ canRead: true });
      prisma.mission.findMany.mockResolvedValue([]);
      return api()
        .get('/api/v1/missions')
        .set('Authorization', `Bearer ${officeToken}`)
        .expect(200);
    });
  });

  describe('POST /api/v1/missions/admin/create', () => {
    const create = (body: object) =>
      api()
        .post('/api/v1/missions/admin/create')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(body);

    it('creates a EUR mission with an exchange rate', async () => {
      const res = await create(validMission).expect(201);

      expect(res.body.reference).toMatch(/^MIS-\d{4}-\d{6}$/);
      expect(res.body.exchangeRate).toBe('10.93'); // Decimal → string in JSON
      expect(prisma.mission.create.mock.calls[0][0].data.exchangeRate).toEqual(
        new Prisma.Decimal(10.93),
      );
    });

    it('rejects fields the API does not know (forbidNonWhitelisted)', () => {
      return create({ ...validMission, hackerField: 1 }).expect(400);
    });

    it('rejects an invalid currency', () => {
      return create({ ...validMission, currency: 'USD' }).expect(400);
    });

    it('rejects a zero or negative exchange rate', () => {
      return create({ ...validMission, exchangeRate: 0 }).expect(400);
    });

    it('rejects an IN_HOUSE mission with no truck', () => {
      const { truckId: _truckId, ...withoutTruck } = validMission;
      return create(withoutTruck).expect(400);
    });

    it('stores no rate on a MAD mission', async () => {
      await create({ ...validMission, currency: Currency.MAD }).expect(201);
      expect(
        prisma.mission.create.mock.calls[0][0].data.exchangeRate,
      ).toBeNull();
    });
  });

  describe('POST /api/v1/client-invoices/admin/:id/generate-pdf', () => {
    it('accepts every field the Generate PDF dialog sends', async () => {
      // A 400 here means a DTO field the frontend sends was removed/renamed.
      // The 404 (unknown invoice) proves the body passed validation.
      prisma.clientInvoice.findUnique.mockResolvedValue(null);

      await api()
        .post('/api/v1/client-invoices/admin/1/generate-pdf')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          client_name: 'ACME',
          client_address: 'Tanger',
          client_ice: '003770120000015',
          invoice_date: '22/09/2026',
          loading_date: '13/09/2026',
          delivery_date: '22/09/2026',
          operation: 'Import',
          designation: 'Transport international de Alicante à Tanger',
          matricule: '12345-A-67',
          remorque: 'REM-1',
          cmr: 'CMR-1',
          commande: 'PO-1',
          quantity: '1',
          unit_price: '1000.00 EUR',
          line_total: '1000.00 EUR',
          total_ht: '1000.00 EUR',
          tva: '100.00 EUR',
          total_ttc: '1100.00 EUR',
          amount_in_words: 'Mille cent euros et 00 centimes.',
          tmsa: '10',
          immobilisation: '10',
          double_equipage: '10',
          transitaire: '10',
          extras_total: '40.00 EUR',
          exchange_rate_line:
            'Taux de change EUR/MAD au 22/09/2026 : 1 EUR = 10,93 MAD',
          total_ttc_mad: '12023.00 DH',
        })
        .expect(404);
    });
  });
});
