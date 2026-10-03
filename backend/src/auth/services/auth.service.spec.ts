import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { UsersService } from '../../users/services/users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { hashPassword } from '../../helpers/helper.helpers';
import {
  createPrismaMock,
  PrismaMock,
} from '../../../test/helpers/prisma-mock';

const SECRET = 'test-secret';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaMock;
  let users: { findOne: jest.Mock };
  const jwt = new JwtService();
  const res = {} as Response;

  beforeEach(async () => {
    prisma = createPrismaMock();
    users = { findOne: jest.fn() };
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: users },
        { provide: JwtService, useValue: jwt },
        { provide: ConfigService, useValue: { get: () => SECRET } },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = moduleRef.get(AuthService);

    users.findOne.mockResolvedValue({
      id: 7,
      email: 'ops@mfah.ma',
      name: 'Ops',
      password: await hashPassword('right-password'),
    });
  });

  it('returns a token carrying the user id and email on a correct login', async () => {
    const result = await service.signIn(
      { email: 'ops@mfah.ma', password: 'right-password' },
      res,
    );

    expect(result).toMatchObject({ email: 'ops@mfah.ma', name: 'Ops' });
    const payload = await jwt.verifyAsync(result.access_token, {
      secret: SECRET,
    });
    expect(payload).toMatchObject({ sub: 7, email: 'ops@mfah.ma' });
  });

  it('stores only a hash of the issued token', async () => {
    const result = await service.signIn(
      { email: 'ops@mfah.ma', password: 'right-password' },
      res,
    );

    const { data } = prisma.users.update.mock.calls[0][0];
    expect(data.accessToken).toBeDefined();
    expect(data.accessToken).not.toBe(result.access_token);
  });

  it('rejects a wrong password', async () => {
    await expect(
      service.signIn({ email: 'ops@mfah.ma', password: 'wrong' }, res),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(prisma.users.update).not.toHaveBeenCalled();
  });

  it('rejects an unknown email', async () => {
    users.findOne.mockResolvedValue(null);
    await expect(
      service.signIn({ email: 'nobody@mfah.ma', password: 'x' }, res),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
