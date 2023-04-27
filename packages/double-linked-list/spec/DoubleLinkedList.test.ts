/* eslint-disable no-magic-numbers */

import {LinkedList, ListElement} from '../src/index.js';

describe('ListElement', () => {
  it('has a value', () => {
    const element = new ListElement('hello');
    expect(element.getValue()).toEqual('hello');
  });

  it('connects two elements', () => {
    const element1 = new ListElement('one');
    const element2 = new ListElement('two');

    element1.setNext(element2);

    const nextElement = element1.getNext();

    if (!nextElement) {
      return fail('No next element.');
    }

    expect(nextElement.getValue()).toEqual('two');

    element2.setPrev(element1);

    const previousElement = element2.getPrev();

    if (!previousElement) {
      return fail('No previous element.');
    }

    expect(previousElement.getValue()).toEqual('one');
  });

  it(`doesn't connect an invalid next element`, () => {
    const element1 = new ListElement('one');

    try {
      element1.setNext('error' as any);
      fail();
    } catch (error) {
      expect((error as Error).message).toBe('Invalid next element.');
    }
  });

  it(`doesn't connect an invalid previous element`, () => {
    const element1 = new ListElement('one');

    try {
      element1.setPrev('error' as any);
      fail();
    } catch (error) {
      expect((error as Error).message).toBe('Invalid previous element.');
    }
  });

  it(`doesn't accept an invalid value`, () => {
    try {
      new (ListElement as any)();
      fail();
    } catch (error) {
      expect((error as Error).message).toBe('Invalid value.');
    }

    try {
      new ListElement(null);
      fail();
    } catch (error) {
      expect((error as Error).message).toBe('Invalid value.');
    }

    const element1 = new ListElement('');

    try {
      element1.setValue(undefined as any);
      fail();
    } catch (error) {
      expect((error as Error).message).toBe('Invalid value.');
    }

    try {
      element1.setValue(null);
      fail();
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

  it('can add an element', () => {
    list.add('zero');
    list.add('one');
    list.add('two');
    list.add('three');

    expect(list.get(0)).toEqual('zero');
    expect(list.get(1)).toEqual('one');
    expect(list.get(2)).toEqual('two');
    expect(list.get(3)).toEqual('three');
  });

  it('can add an element at a certain index', () => {
    list.add('zero');
    list.add('one');
    list.add('three');
    list.add('two', 2);

    expect(list.get(0)).toEqual('zero');
    expect(list.get(1)).toEqual('one');
    expect(list.get(2)).toEqual('two');
    expect(list.get(3)).toEqual('three');
  });

  it(`doesn't find a non-existing element`, () => {
    list.add('zero');
    list.add('one');
    list.add('two');

    expect(list.get(0)).toEqual('zero');
    expect(list.get(1)).toEqual('one');
    expect(list.get(2)).toEqual('two');
    expect(list.contains('error')).toBeNull();
  });

  it(`doesn't go outside the list's bounds`, () => {
    try {
      list.get(0);
      fail();
    } catch (error) {
      expect((error as Error).message).toBe('Index 0 is out of bounds.');
    }

    list.add('zero');

    try {
      list.get(2);
      fail();
    } catch (error) {
      expect((error as Error).message).toBe('Index 2 is out of bounds.');
    }

    try {
      list.remove(2);
      fail();
    } catch (error) {
      expect((error as Error).message).toBe('Index 2 is out of bounds.');
    }
  });

  it(`gets the list's head and tail`, () => {
    list.add('zero');
    list.add('one');
    list.add('two');

    expect(list.getHead()).toEqual('zero');
    expect(list.getTail()).toEqual('two');
  });

  it('gets the correct index', () => {
    expect(list.indexOf('error')).toEqual(-1);

    list.add('zero');
    list.add('one');
    list.add('two');

    expect(list.indexOf('error')).toEqual(-1);
    expect(list.indexOf('one')).toEqual(1);
  });

  it('gets the correct size', () => {
    expect(list.getSize()).toEqual(0);

    list.add('zero');
    list.add('one');
    list.add('two');

    expect(list.getSize()).toEqual(3);
  });

  it('removes the correct element', () => {
    list.add('zero');
    list.add('one');
    list.add('two');
    list.add('three');
    list.remove(1);

    expect(list.get(1)).toEqual('two');
    list.remove('two');

    expect(list.get(1)).toEqual('three');
  });

  it('iterates with next over the list', () => {
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

  it('iterates with for over the list', () => {
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
