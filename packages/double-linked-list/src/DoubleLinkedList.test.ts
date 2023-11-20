/* eslint-disable no-magic-numbers */
import {expect, describe, test, beforeEach, assert} from 'vitest';
import {LinkedList, ListElement} from './index.js';

describe('ListElement', () => {
  test('has a value', () => {
    const element = new ListElement('hello');
    expect(element.getValue()).toEqual('hello');
  });

  test('connects two elements', () => {
    const element1 = new ListElement('one');
    const element2 = new ListElement('two');

    element1.setNext(element2);

    const nextElement = element1.getNext();

    if (!nextElement) {
      return assert.fail('No next element.');
    }

    expect(nextElement.getValue()).toEqual('two');

    element2.setPrev(element1);

    const previousElement = element2.getPrev();

    if (!previousElement) {
      return assert.fail('No previous element.');
    }

    expect(previousElement.getValue()).toEqual('one');
  });

  test(`doesn't connect an invalid next element`, () => {
    const element1 = new ListElement('one');

    try {
      element1.setNext('error' as any);
      assert.fail();
    } catch (error) {
      expect((error as Error).message).toBe('Invalid next element.');
    }
  });

  test(`doesn't connect an invalid previous element`, () => {
    const element1 = new ListElement('one');

    try {
      element1.setPrev('error' as any);
      assert.fail();
    } catch (error) {
      expect((error as Error).message).toBe('Invalid previous element.');
    }
  });

  test(`doesn't accept an invalid value`, () => {
    try {
      new (ListElement as any)();
      assert.fail();
    } catch (error) {
      expect((error as Error).message).toBe('Invalid value.');
    }

    try {
      new ListElement(null);
      assert.fail();
    } catch (error) {
      expect((error as Error).message).toBe('Invalid value.');
    }

    const element1 = new ListElement('');

    try {
      element1.setValue(undefined as any);
      assert.fail();
    } catch (error) {
      expect((error as Error).message).toBe('Invalid value.');
    }

    try {
      element1.setValue(null);
      assert.fail();
    } catch (error) {
      expect((error as Error).message).toBe('Invalid value.');
    }
  });
});

describe('LinkedList', () => {
  let list: LinkedList;

  beforeEach(() => {
    list = new LinkedList();
  });

  test('can add an element', () => {
    list.add('zero');
    list.add('one');
    list.add('two');
    list.add('three');

    expect(list.get(0)).toEqual('zero');
    expect(list.get(1)).toEqual('one');
    expect(list.get(2)).toEqual('two');
    expect(list.get(3)).toEqual('three');
  });

  test('can add an element at a certain index', () => {
    list.add('zero');
    list.add('one');
    list.add('three');
    list.add('two', 2);

    expect(list.get(0)).toEqual('zero');
    expect(list.get(1)).toEqual('one');
    expect(list.get(2)).toEqual('two');
    expect(list.get(3)).toEqual('three');
  });

  test(`doesn't find a non-existing element`, () => {
    list.add('zero');
    list.add('one');
    list.add('two');

    expect(list.get(0)).toEqual('zero');
    expect(list.get(1)).toEqual('one');
    expect(list.get(2)).toEqual('two');
    expect(list.contains('error')).toBeNull();
  });

  test(`doesn't go outside the list's bounds`, () => {
    try {
      list.get(0);
      assert.fail();
    } catch (error) {
      expect((error as Error).message).toBe('Index 0 is out of bounds.');
    }

    list.add('zero');

    try {
      list.get(2);
      assert.fail();
    } catch (error) {
      expect((error as Error).message).toBe('Index 2 is out of bounds.');
    }

    try {
      list.remove(2);
      assert.fail();
    } catch (error) {
      expect((error as Error).message).toBe('Index 2 is out of bounds.');
    }
  });

  test(`gets the list's head and tail`, () => {
    list.add('zero');
    list.add('one');
    list.add('two');

    expect(list.getHead()).toEqual('zero');
    expect(list.getTail()).toEqual('two');
  });

  test('gets the correct index', () => {
    expect(list.indexOf('error')).toEqual(-1);

    list.add('zero');
    list.add('one');
    list.add('two');

    expect(list.indexOf('error')).toEqual(-1);
    expect(list.indexOf('one')).toEqual(1);
  });

  test('gets the correct size', () => {
    expect(list.getSize()).toEqual(0);

    list.add('zero');
    list.add('one');
    list.add('two');

    expect(list.getSize()).toEqual(3);
  });

  test('removes the correct element', () => {
    list.add('zero');
    list.add('one');
    list.add('two');
    list.add('three');
    list.remove(1);

    expect(list.get(1)).toEqual('two');
    list.remove('two');

    expect(list.get(1)).toEqual('three');
  });

  test('iterates with next over the list', () => {
    const iterator = list.iterator();

    list.add('zero');
    list.add('one');
    list.add('two');
    list.add('three');

    expect(iterator.next().value).toEqual('zero');
    expect(iterator.next().value).toEqual('one');
    expect(iterator.next().value).toEqual('two');
    expect(iterator.next().value).toEqual('three');
    expect(iterator.next().done).toEqual(true);
  });

  test('iterates with for over the list', () => {
    let str = '';

    list.add('zero');
    list.add('one');
    list.add('two');
    list.add('three');

    for (const element of list.iterator()) {
      str += element;
    }

    expect(str).toEqual('zeroonetwothree');
  });
});
