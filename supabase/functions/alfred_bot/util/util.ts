export default class Util {
  public static deepEqual(object1: object, object2: object): boolean {
    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);

    if (keys1.length !== keys2.length) {
      return false;
    }

    for (const keyString of keys1) {
      const key: keyof object = keyString as keyof typeof object1;

      const val1 = object1[key];
      const val2 = object2[key];

      const areArrays: boolean = this.isArray(val1) && this.isArray(val2);
      const areObjects: boolean = this.isObject(val1) && this.isObject(val2);

      if (areArrays && !this.arrayEqual(val1, val2)) {
        return false;
      }

      if (areObjects && !this.deepEqual(val1, val2)) {
        return false;
      }

      if (!areArrays && !areObjects && val1 !== val2) {
        return false;
      }
    }

    return true;
  }

  public static isObject(object: object): boolean {
    return object !== null && typeof object === "object";
  }

  public static isArray(object: object): boolean {
    return object !== null && Array.isArray(object);
  }

  public static arrayEqual(
    array1: Array<string | number>,
    array2: Array<string | number>
  ): boolean {
    return (
      array1.length === array2.length &&
      array1.every((element, index) => element === array2[index])
    );
  }
}
