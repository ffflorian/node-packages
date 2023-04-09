import {ListElement, ListElementValue} from './ListElement.js';

/**
 * The linked list. By default the head and the tail are set to `null` since they don't exist yet.
 * Also the size is set to 0 because the list doesn't contain any elements yet.
 */
export class LinkedList {
  /**
   * The current head (first element).
   * ```
   * _______     _______
   * |*|**|*|   | |  | |
   * |*|**|*<---> |  | |
   * |_|__|_|   |_|__|_|
   *  head       next
   * ```
   */
  private head: ListElement | null;

  /** The size of the list. */
  private size: number;

  /**
   * The current tail (last element).
   * ```
   * _______     _______
   * | |  | |   |*|**|*|
   * | |  | <--->*|**|*|
   * |_|__|_|   |_|__|_|
   *   prev       tail
   * ```
   */
  private tail: ListElement | null;

  constructor() {
    this.head = null;
    this.size = 0;
    this.tail = null;
  }

  /**
   * Adds an element to the end of the list by inserting
   *  the new element at the end of the list.
   * ```
   * _______    _______    _______
   * | |  | |   | |  | |   |*|**|*|
   * | |  | <---> |  | <--->*|**|*|
   * |_|__|_|   |_|__|_|   |_|__|_|
   *    n         tail       new
   * ```
   * @param value The value which the element should contain.
   * @param index The index where the element should be inserted.
   * @throws `TypeError` if the value is `null`.
   * @throws `Error` If both head and tail are `null`.
   */
  add(value: ListElementValue, index?: number): void {
    const newElement = new ListElement(value);

    if (index) {
      if (index < 0 || index >= this.getSize()) {
        throw new Error(`Index ${index} is out of bounds.`);
      }

      if (this.tail === null && this.head === null) {
        // Set head and tail both to be the new element
        // because they don't exist yet and thus
        // the new element is both head and tail (empty list).
        this.head = newElement;
        this.tail = newElement;
        this.size++;
      } else if ((this.tail === null && this.head !== null) || (this.head === null && this.tail !== null)) {
        // Something went wrong and they are not both null.
        const message = `We've made a terrible mistake! Head: ${String(this.head)}, tail: ${String(this.tail)}`;
        throw new Error(message);
      } else {
        // nextElement points to the object behind
        // which the new element should be added.
        const nextElement = this.getElementAtIndex(index);
        // prevElement points to the position
        // behind which the new element should be added.
        const prevElement = nextElement !== null ? nextElement.getPrev() : null;

        // Insert the new element between prev and next.
        if (prevElement !== null) {
          newElement.setPrev(prevElement);
          prevElement.setNext(newElement);
        } else {
          // if there is no previous element we have a new head
          this.head = newElement;
        }
        if (nextElement !== null) {
          newElement.setNext(nextElement);
          nextElement.setPrev(newElement);
        }
        this.size++;
      }
    } else {
      let prevElement;

      if (this.tail === null && this.head === null) {
        // Set `head` and `tail` both to be the new element
        // because they don't exist yet and thus
        // the new element is both `head` and `tail`.
        this.head = newElement;
        this.tail = newElement;
        this.size++;
      } else if ((this.tail === null && this.head !== null) || (this.head === null && this.tail !== null)) {
        const message = `We've made a terrible mistake! Head: ${String(this.head)}, tail: ${String(this.tail)}`;
        throw new Error(message);
      } else {
        // Insert the new element at the end of the list.
        prevElement = this.tail;
        if (prevElement !== null) {
          prevElement.setNext(newElement);
        }
        if (prevElement !== null) {
          newElement.setPrev(prevElement);
        }
        this.tail = newElement;
        this.size++;
      }
    }
  }

  /**
   * Searches the list for an element with a certain value.
   * @param value The value to search for.
   * @returns The first found element's value. `null` otherwise.
   */
  contains(value: ListElementValue): ListElementValue | null {
    if (value === null || typeof value === 'undefined') {
      throw new TypeError('Invalid argument.');
    }

    const firstElement = this.getFirstElement(value);
    return firstElement !== null ? firstElement.getValue() : null;
  }

  /**
   * Returns the value of an element at a certain position.
   * @param index The position to look at.
   * @returns The found value. `null` otherwise.
   * @throws `Error` if the passed index is not within the bounds of the list.
   * @throws `TypeError` if the index is `null`.
   */
  get(index: number): ListElementValue | null {
    if (typeof index !== 'number') {
      throw new TypeError('Invalid index type.');
    }

    if (index < 0 || index >= this.getSize()) {
      throw new Error(`Index ${index} is out of bounds.`);
    }

    const elementAtIndex = this.getElementAtIndex(index);
    return elementAtIndex !== null ? elementAtIndex.getValue() : null;
  }

  /**
   * Returns a ListElement at a certain position.
   * @param index The position to find the element at.
   * @throws `TypeError` When `index` is not a number.
   */
  getElementAtIndex(index: number): ListElement | null {
    if (typeof index !== 'number') {
      throw new TypeError('Invalid argument.');
    }

    let element = this.head;

    for (let searchIndex = 1; searchIndex <= index; searchIndex++) {
      element = element !== null ? element.getNext() : null;
    }

    return element;
  }

  /**
   * Returns a ListElement with a certain value.
   * @param value The value to find in the list.
   * @returns The first found ListElement. `null` otherwise.
   */
  getFirstElement(value: ListElementValue): ListElement | null {
    let element = this.head;

    for (let index = 0; index <= this.getSize(); index++) {
      if (element !== null) {
        if (element.getValue() === value) {
          return element;
        }
        element = element !== null ? element.getNext() : null;
      }
    }

    return null;
  }

  /** Returns the current head's value (first element) of the list */
  getHead(): ListElementValue {
    return this.head !== null ? this.head.getValue() : null;
  }

  /** Returns the list's size. */
  getSize(): number {
    return this.size;
  }

  /** Returns the current tail's value (last element) of the list. */
  getTail(): ListElementValue {
    return this.tail !== null ? this.tail.getValue() : null;
  }

  /**
   * Returns the index of the first found element with a certain value.
   * @param value The value to search for.
   * @returns The position of the found element. -1 otherwise.
   * @throws `TypeError` if the value is `null` or `undefined`.
   */
  indexOf(value: ListElementValue): number {
    if (value === null || typeof value === 'undefined') {
      throw new TypeError('Invalid argument.');
    }

    let index = -1;
    let element = this.head;

    for (let searchIndex = 0; searchIndex <= this.getSize(); searchIndex++) {
      if (element !== null) {
        if (element.getValue() === value) {
          index = searchIndex;
          break;
        } else {
          element = element.getNext();
        }
      }
    }

    return index;
  }

  /**
   * An iterator for the double-linked list with the
   * help of generators.
   * @returns The new generator as iterator.
   */
  *iterator(): IterableIterator<ListElementValue> {
    let currentElement = this.head;
    let atHead = true;
    // needs to check if currentElement is null
    // otherwise we get a NullPointerException if
    // we iterate over an empty list.
    while (currentElement !== null && currentElement.getNext() !== null) {
      if (atHead === true) {
        atHead = false;
      } else {
        currentElement = currentElement.getNext();
      }
      yield currentElement !== null ? currentElement.getValue() : null;
    }
  }

  /**
   * Removes an element at a certain position from the list.
   * @param position The position to look at or the value to find.
   * @returns The removed element's value. `null` otherwise.
   * @throws `Error` if the passed index is not within the bounds of the list.
   * @throws `TypeError` if the argument is not a `string` or a `number`.
   */
  remove(position: string | number): ListElementValue {
    if (typeof position === 'string') {
      const element = this.getFirstElement(position);

      if (element !== null) {
        const value = element.getValue();
        this.removeElement(element);
        return value;
      }

      return null;
    } else if (typeof position === 'number') {
      if (position < 0 || position >= this.getSize()) {
        throw new Error(`Index ${position} is out of bounds.`);
      }

      const element = this.getElementAtIndex(position);
      const value = element !== null ? element.getValue() : '';

      if (element !== null) {
        this.removeElement(element);
      }
      return value;
    }

    throw new TypeError('Invalid argument.');
  }

  /**
   * Removes a certain ListElement from the list by
   *  connecting the elements before and after the
   *  old element.
   * ```
   * _______    _______    _______
   * |*|**|*|   | |  | |   |*|**|*|
   * |*|**|*<-------------->*|**|*|
   * |_|__|_|   |_|__|_|   |_|__|_|
   *   prev     current      next
   * ```
   * @param element The element to remove.
   * @throws `TypeError` when `currentElement` is not a ListElement
   */
  removeElement(element: ListElement): void {
    if (!(element instanceof ListElement)) {
      throw new TypeError('Invalid next element.');
    }

    const prevElement = element.getPrev();
    const nextElement = element.getNext();

    if (prevElement !== null && nextElement !== null) {
      prevElement.setNext(nextElement);
    } else {
      this.head = nextElement;
    }

    if (nextElement !== null && prevElement !== null) {
      nextElement.setPrev(prevElement);
    } else {
      this.tail = prevElement;
    }

    // Set the old element to null so the garbage collector can remove it.
    element = null as any;
    this.size--;
  }

  /** Returns the whole list as a detailed string, enclosed by brackets. */
  toDetailedString(): string {
    let index = this.head;
    let output = '';
    let separator = ', ';

    while (index !== null) {
      if (index.getNext() === null) {
        separator = '';
      }
      output += `${String(index.getPrev())}<-*${String(index.getValue())}*->${String(index.getNext())}${separator}`;
      index = index.getNext();
    }

    return `[ ${output} ]`;
  }

  /** Returns the whole list as a readable string, enclosed by brackets. */
  toString(): string {
    let index = this.head;
    let output = '';
    let separator = ', ';

    while (index !== null) {
      if (index.getNext() === null) {
        separator = '';
      }
      output += `${index.getValue()}${separator}`;
      index = index.getNext();
    }
    return `[ ${output} ]`;
  }
}
