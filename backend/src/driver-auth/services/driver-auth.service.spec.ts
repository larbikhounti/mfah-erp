import { HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { DriverAuthService } from './driver-auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { hashPassword } from '../../helpers/helper.helpers';
import { MAX_FAILED_PIN_ATTEMPTS } from '../driver-auth.constants';
import {
  createPrismaMock,
  PrismaMock,
} from '../../../test/helpers/prisma-mock';

const SECRET = 'test-secret';

describe('DriverAuthService', () => {
  let service: DriverAuthService;
  let prisma: PrismaMock;
  const jwt = new JwtService();
  let pinHash: string;

  const credential = (overrides: Record<string, unknown> = {}) => ({
    id: 3,
    driverId: 20,
    loginPhone: '212612345678',
    pinHash,
    failedPinAttempts: 0,
    lockedUntil: null,
    tokenVersion: 4,
    driver: { id: 20, fullName: 'Ahmed', phone: '0612345678', deletedAt: null },
    ...overrides,
  });

  const expectStatus = async (promise: Promise<unknown>, status: number) => {
    const error = await promise.catch((e: HttpException) => e);
    expect(error).toBeInstanceOf(HttpException);
    expect((error as HttpException).getStatus()).toBe(status);
  };

  beforeAll(async () => {
    pinHash = await hashPassword('246810');
  });

  beforeEach(async () => {
    prisma = createPrismaMock();
    const moduleRef = await Test.createTestingModule({
      providers: [
        DriverAuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) =>
              key === 'JWT_ACCESS_SECRET' ? SECRET : undefined,
          },
        },
      ],
    }).compile();
    service = moduleRef.get(DriverAuthService);
  });

  it('finds the driver by normalized phone, whatever the format typed', async () => {
    prisma.driverCredential.findUnique.mockResolvedValue(credential());

    await service.login({ phone: '06 12 34 56 78', pin: '246810' });

    expect(prisma.driverCredential.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { loginPhone: '212612345678' } }),
    );
  });

  it('issues a driver token carrying the token version', async () => {
    prisma.driverCredential.findUnique.mockResolvedValue(credential());

    const { access_token, driver } = await service.login({
      phone: '0612345678',
      pin: '246810',
    });

    const payload = await jwt.verifyAsync(access_token, { secret: SECRET });
    expect(payload).toMatchObject({ sub: 20, kind: 'driver', tokenVersion: 4 });
    expect(driver).toEqual({ id: 20, fullName: 'Ahmed', phone: '0612345678' });
  });

  it('resets the failed attempts after a correct PIN', async () => {
    prisma.driverCredential.findUnique.mockResolvedValue(
      credential({ failedPinAttempts: 3 }),
    );

    await service.login({ phone: '0612345678', pin: '246810' });

    expect(prisma.driverCredential.update.mock.calls[0][0].data).toMatchObject({
      failedPinAttempts: 0,
      lockedUntil: null,
    });
  });

  it('counts a wrong PIN', async () => {
    prisma.driverCredential.findUnique.mockResolvedValue(credential());

    await expectStatus(
      service.login({ phone: '0612345678', pin: '000000' }),
      HttpStatus.UNAUTHORIZED,
    );
    expect(prisma.driverCredential.update.mock.calls[0][0].data).toEqual({
      failedPinAttempts: 1,
    });
  });

  it('locks the account on the last allowed wrong PIN', async () => {
    prisma.driverCredential.findUnique.mockResolvedValue(
      credential({ failedPinAttempts: MAX_FAILED_PIN_ATTEMPTS - 1 }),
    );

    await expectStatus(
      service.login({ phone: '0612345678', pin: '000000' }),
      HttpStatus.TOO_MANY_REQUESTS,
    );
    const { data } = prisma.driverCredential.update.mock.calls[0][0];
    expect(data.lockedUntil.getTime()).toBeGreaterThan(Date.now());
  });

  it('refuses even the right PIN while locked', async () => {
    prisma.driverCredential.findUnique.mockResolvedValue(
      credential({ lockedUntil: new Date(Date.now() + 60_000) }),
    );

    await expectStatus(
      service.login({ phone: '0612345678', pin: '246810' }),
      HttpStatus.TOO_MANY_REQUESTS,
    );
  });

  it('gives the same answer for an unknown phone and a deleted driver', async () => {
    prisma.driverCredential.findUnique.mockResolvedValueOnce(null);
    await expectStatus(
      service.login({ phone: '0600000000', pin: '246810' }),
      HttpStatus.UNAUTHORIZED,
    );

    prisma.driverCredential.findUnique.mockResolvedValueOnce(
      credential({ driver: { id: 20, deletedAt: new Date() } }),
    );
    await expectStatus(
      service.login({ phone: '0612345678', pin: '246810' }),
      HttpStatus.UNAUTHORIZED,
    );
  });
});
