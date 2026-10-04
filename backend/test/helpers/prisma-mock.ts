import { PrismaService } from '../../src/prisma/prisma.service';

const MODEL_METHODS = [
  'findUnique',
  'findUniqueOrThrow',
  'findFirst',
  'findMany',
  'count',
  'create',
  'update',
  'updateMany',
  'upsert',
  'delete',
  'deleteMany',
  'aggregate',
  'groupBy',
] as const;

const MODELS = [
  'users',
  'roles',
  'permission',
  'client',
  'subcontractor',
  'contractorTruck',
  'truck',
  'driver',
  'mission',
  'clientInvoice',
  'subcontractorBill',
  'attachment',
  'driverCredential',
  'fuelEntry',
  'pushSubscription',
] as const;

type ModelMock = Record<(typeof MODEL_METHODS)[number], jest.Mock>;

export type PrismaMock = Record<(typeof MODELS)[number], ModelMock> & {
  $transaction: jest.Mock;
};

/**
 * A PrismaService stand-in where every `prisma.<model>.<method>` is a
 * jest.fn(). `$transaction([...])` resolves the array of (already-invoked)
 * operations in order, like the real batch form does — so tests can assert
 * both on what was queued and on what the service returns.
 */
// Property names Nest/Jest/Node probe on any object (lifecycle hooks,
// thenables, matchers, inspection) — never treated as a lazy model.
const NOT_A_MODEL =
  /^(\$|on[A-Z]|before[A-Z]|then$|toJSON$|constructor$|asymmetricMatch$|nodeType$|inspect$)/;
const isLazyModelName = (name: string) => !NOT_A_MODEL.test(name);

export function createPrismaMock(): PrismaMock {
  const modelMock = () => {
    const model = {} as ModelMock;
    for (const method of MODEL_METHODS) model[method] = jest.fn();
    return model;
  };

  const mock = {} as PrismaMock;
  for (const model of MODELS) mock[model] = modelMock();
  mock.$transaction = jest.fn((ops: unknown) =>
    Array.isArray(ops)
      ? Promise.all(ops)
      : (ops as (tx: PrismaMock) => unknown)(mock),
  );

  // Any other model (e.g. activityLog, written by a global interceptor) is
  // created on first access, so code paths a test doesn't care about don't
  // crash on `undefined.create`.
  return new Proxy(mock, {
    get(target, prop: string | symbol) {
      if (
        typeof prop === 'string' &&
        !(prop in target) &&
        isLazyModelName(prop)
      ) {
        (target as Record<string, unknown>)[prop] = modelMock();
      }
      return Reflect.get(target, prop);
    },
  });
}

export function asPrismaService(mock: PrismaMock): PrismaService {
  return mock as unknown as PrismaService;
}
