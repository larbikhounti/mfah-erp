import { Test } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { comparePassword } from '../../helpers/helper.helpers';
import {
  createPrismaMock,
  PrismaMock,
} from '../../../test/helpers/prisma-mock';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaMock;

  beforeEach(async () => {
    prisma = createPrismaMock();
    const moduleRef = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = moduleRef.get(UsersService);
  });

  it('stores a hash of the password, never the password itself', async () => {
    prisma.users.create.mockResolvedValue({});

    await service.create({ email: 'a@mfah.ma', password: 's3cret', name: 'A' });

    const { data } = prisma.users.create.mock.calls[0][0];
    expect(data.password).not.toBe('s3cret');
    await expect(comparePassword('s3cret', data.password)).resolves.toBe(true);
  });

  it('looks users up by email', async () => {
    prisma.users.findUnique.mockResolvedValue({ id: 1, email: 'a@mfah.ma' });

    await expect(service.findOne('a@mfah.ma')).resolves.toMatchObject({
      id: 1,
    });
    expect(prisma.users.findUnique).toHaveBeenCalledWith({
      where: { email: 'a@mfah.ma' },
    });
  });
});
