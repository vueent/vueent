/**
 * An array of rollback mask.
 */
export type RollbackArrayMask = {
  /**
   * Marks a data field as an array.
   */
  $array: boolean;

  /**
   * A list of indexes which should be processed.
   */
  $index?: number[];

  /**
   * Named fields of the data object.
   */
  [key: string]: RollbackMask | RollbackArrayMask | boolean | number[] | undefined;
};

/**
 * Guards an array mask type.
 *
 * @param mask - rollback mask
 * @returns - is the mask a `RollbackArrayMask`
 */
export function isRollbackArrayMaskUnsafe(mask: RollbackMask | RollbackArrayMask): mask is RollbackArrayMask {
  return typeof mask['$array'] === 'boolean';
}

/**
 * Rollback mask type.
 */
export type RollbackMask = {
  /**
   * Named fields of the data object.
   */
  [key: string]: RollbackMask | RollbackArrayMask | boolean;
};
