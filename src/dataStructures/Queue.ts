/**
 * Manual implementation of a FIFO Queue.
 * Uses an internal array with a head index pointer to guarantee O(1) amortized dequeue operations.
 */
export class Queue<T> {
  private items: T[] = [];
  private head: number = 0;

  constructor(initialItems?: T[]) {
    if (initialItems && initialItems.length > 0) {
      this.items = [...initialItems];
    }
  }

  /**
   * Add an item to the end of the queue.
   * Time Complexity: O(1)
   */
  enqueue(item: T): void {
    this.items.push(item);
  }

  /**
   * Remove and return the front item of the queue.
   * Time Complexity: O(1) amortized
   */
  dequeue(): T | undefined {
    if (this.isEmpty()) {
      return undefined;
    }
    const item = this.items[this.head];
    this.head++;

    // Periodic cleanup when head exceeds half of the array
    if (this.head > 50 && this.head * 2 >= this.items.length) {
      this.items = this.items.slice(this.head);
      this.head = 0;
    }

    return item;
  }

  /**
   * Inspect the front item without removing it.
   * Time Complexity: O(1)
   */
  peek(): T | undefined {
    if (this.isEmpty()) return undefined;
    return this.items[this.head];
  }

  /**
   * Check if the queue contains any items.
   */
  isEmpty(): boolean {
    return this.head >= this.items.length;
  }

  /**
   * Number of items currently in the queue.
   */
  size(): number {
    return Math.max(0, this.items.length - this.head);
  }

  /**
   * Returns a snapshot of the current items in the queue (from front to back).
   */
  toArray(): T[] {
    return this.items.slice(this.head);
  }

  /**
   * Clear all items from the queue.
   */
  clear(): void {
    this.items = [];
    this.head = 0;
  }
}
