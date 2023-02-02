/**
 * Check if a given array is sorted ascending
 * @param arr The array to check
 */
export const isArraySortedAscending = (arr: number[]): true => {
  for (let index = 0; index < arr.length - 1; index++) {
    // walk through the whole array and return the function
    // if one element is bigger than the element behind it.
    if (arr[index] > arr[index + 1]) {
      throw new Error(`${arr[index]} > ${arr[index + 1]}`);
    }
  }
  return true;
};

/**
 * Get part of an array
 * @param arr The array to split
 * @param length The length of the splitted array
 */
export const getPartOfArray = (arr: number[], length: number): number[] => {
  if (length >= arr.length) {
    // if the given length is bigger or the same size
    // as the array, return the whole array as string
    throw new Error('Too large number given');
  }
  return arr.slice(0, length);
};
