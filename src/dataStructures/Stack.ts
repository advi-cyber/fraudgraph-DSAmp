/**
 * Manual implementation of a LIFO Stack.
 * Standard DSA structure supporting push, pop, and top inspection.
 */
export class Stack<T> {
  private items: T[] = [];

  constructor(initialItems?: T[]) {
    if (initialItems && initialItems.length > 0) {
      this.items = [...initialItems];
    }
  }

  /**
   * Push an item onto the top of the stack.
   * Time Complexity: O(1)
   */
  push(item: T): void {
    this.items.push(item);
  }

  /**
   * Remove and return the top item from the stack.
   * Time Complexity: O(1)
   */
  pop(): T | undefined {
    return this.items.pop();
  }

  /**
   * Inspect the top item of the stack without removing it.
   * Time Complexity: O(1)
   */
  peek(): T | undefined {
    if (this.isEmpty()) return undefined;
    return this.items[this.items.length - 1];
  }

  /**
   * Check if the stack is empty.
   */
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  /**
   * Return the number of elements in the stack.
   */
  size(): number {
    return this.items.length;
  }

  /**
   * Return items as an array from top to bottom.
   */
  toArray(): T[] {
    return [...this.items].reverse();
  }

  /**
   * Clear all elements.
   */
  clear(): void {
    this.items = [];
  }
}
