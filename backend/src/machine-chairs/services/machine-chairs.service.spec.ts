import { Test, TestingModule } from '@nestjs/testing';
import { MachineChairsService } from './machine-chairs.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('MachineChairsService', () => {
  let service: MachineChairsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MachineChairsService,
        {
          provide: PrismaService,
          useValue: {
            machineChairs: {
              create: jest.fn(),
              findMany: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              updateMany: jest.fn(),
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<MachineChairsService>(MachineChairsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
