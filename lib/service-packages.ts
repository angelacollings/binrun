import type {
  BinType,
  ServiceBillingMode,
  ServicePackageCode,
  ServiceItemType,
} from '@prisma/client';

type PackageItemTemplate = {
  binType?: BinType;
  quantity: number;
  type: ServiceItemType;
};

export type ServicePackageDefinition = {
  billingMode: ServiceBillingMode;
  code: ServicePackageCode;
  description: string;
  items: PackageItemTemplate[];
  name: string;
  sortOrder: number;
  summary: string;
};

export const servicePackageDefinitions = [
  {
    billingMode: 'SUBSCRIPTION',
    code: 'REGULAR_RUN',
    description:
      'Weekly set-out and return for a standard home package of one wheelie bin and two recycling bins at one service address.',
    items: [
      {
        binType: 'RUBBISH_WHEELIE',
        quantity: 1,
        type: 'BIN_SET_OUT_RETURN',
      },
      {
        binType: 'RECYCLING_BINS',
        quantity: 2,
        type: 'BIN_SET_OUT_RETURN',
      },
    ],
    name: 'Regular Run',
    sortOrder: 10,
    summary: 'Weekly set-out and return for one wheelie bin and two recycling bins.',
  },
  {
    billingMode: 'SUBSCRIPTION',
    code: 'REGULAR_RUN_PLUS_WASH',
    description:
      'Weekly set-out and return with scheduled cleaning for households that want the regular run handled and the bins kept fresher.',
    items: [
      {
        binType: 'RUBBISH_WHEELIE',
        quantity: 1,
        type: 'BIN_SET_OUT_RETURN',
      },
      {
        binType: 'RECYCLING_BINS',
        quantity: 2,
        type: 'BIN_SET_OUT_RETURN',
      },
      {
        binType: 'RUBBISH_WHEELIE',
        quantity: 1,
        type: 'BIN_CLEANING',
      },
      {
        binType: 'RECYCLING_BINS',
        quantity: 2,
        type: 'BIN_CLEANING',
      },
    ],
    name: 'Regular Run + Wash',
    sortOrder: 20,
    summary: 'Weekly set-out and return with scheduled bin washing included.',
  },
  {
    billingMode: 'SUBSCRIPTION',
    code: 'CLEAN_BIN_VISIT',
    description:
      'Recurring cleaning visit for customers who only need bin washing, not weekly set-out and return.',
    items: [
      {
        binType: 'RUBBISH_WHEELIE',
        quantity: 1,
        type: 'BIN_CLEANING',
      },
    ],
    name: 'Clean Bin Visit',
    sortOrder: 30,
    summary: 'Recurring cleaning only, without weekly bin movement.',
  },
  {
    billingMode: 'ONE_OFF',
    code: 'ONE_OFF_CLEAN',
    description:
      'A single cleaning visit for a bin that needs a reset without starting a weekly subscription.',
    items: [
      {
        binType: 'RUBBISH_WHEELIE',
        quantity: 1,
        type: 'BIN_CLEANING',
      },
    ],
    name: 'One-Off Clean',
    sortOrder: 40,
    summary: 'One cleaning visit without an ongoing subscription.',
  },
  {
    billingMode: 'CUSTOM',
    code: 'CUSTOM',
    description:
      'Tailored service for multiple properties, rental blocks, body corporates, or larger service needs.',
    items: [],
    name: 'Custom Package',
    sortOrder: 50,
    summary: 'Tailored pricing for multiple properties or larger service needs.',
  },
] satisfies ServicePackageDefinition[];

export const publicServicePackages = servicePackageDefinitions.filter(
  (servicePackage) => servicePackage.code !== 'CUSTOM'
);

export const signupServicePackages = servicePackageDefinitions.filter(
  (servicePackage) => servicePackage.code !== 'CUSTOM'
);

export const servicePackageCodes = servicePackageDefinitions.map(
  (servicePackage) => servicePackage.code
);

export function servicePackageByCode(code: ServicePackageCode) {
  return servicePackageDefinitions.find((servicePackage) => servicePackage.code === code);
}
