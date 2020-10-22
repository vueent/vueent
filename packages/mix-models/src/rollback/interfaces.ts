export type RollbackArrayMask = {
  $array: boolean;
  $index?: number[];
  [key: string]: RollbackMask | RollbackArrayMask | boolean | number[] | undefined;
};

export function isRollbackArrayMaskUnsafe(mask: RollbackMask | RollbackArrayMask): mask is RollbackArrayMask {
  return typeof mask['$array'] === 'boolean';
}

export type RollbackMask = { [key: string]: RollbackMask | RollbackArrayMask | boolean };
