export interface PQElement<T> {
  item: T;
  priority: number;
}

/**
 * Manual implementation of a Minimum Binary Heap (Priority Queue).
 * Used by Dijkstra's shortest path algorithm.
 * Time Complexities:
 * - Insert: O(log N)
 * - ExtractMin: O(log N)
 * - Peek: O(1)
 */
export class PriorityQueue<T> {
  private heap: PQElement<T>[] = [];

  constructor() {}

  /**
   * Insert a new element with an associated numeric priority.
   * Lower numerical priority values have higher priority (min-heap).
   */
  insert(item: T, priority: number): void {
    const element: PQElement<T> = { item, priority };
    this.heap.push(element);
    this.bubbleUp(this.heap.length - 1);
  }

  /**
   * Remove and return the element with the lowest priority value.
   */
  extractMin(): PQElement<T> | undefined {
    if (this.isEmpty()) return undefined;

    const min = this.heap[0];
    const end = this.heap.pop()!;

    if (this.heap.length > 0) {
      this.heap[0] = end;
      this.sinkDown(0);
    }

    return min;
  }

  /**
   * Look at the root element without removing it.
   */
  peek(): PQElement<T> | undefined {
    return this.heap[0];
  }

  /**
   * Check if priority queue has any elements.
   */
  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  /**
   * Current number of elements.
   */
  size(): number {
    return this.heap.length;
  }

  /**
   * Update the priority of an existing element if new priority is lower.
   */
  decreaseKey(predicate: (item: T) => boolean, newPriority: number): boolean {
    const index = this.heap.findIndex((el) => predicate(el.item));
    if (index === -1) return false;

    if (newPriority < this.heap[index].priority) {
      this.heap[index].priority = newPriority;
      this.bubbleUp(index);
      return true;
    }
    return false;
  }

  /**
   * Check if an element matching predicate is inside the heap.
   */
  contains(predicate: (item: T) => boolean): boolean {
    return this.heap.some((el) => predicate(el.item));
  }

  /**
   * Snapshot of heap elements ordered by current array layout.
   */
  toArray(): PQElement<T>[] {
    return [...this.heap];
  }

  /**
   * Clear the priority queue.
   */
  clear(): void {
    this.heap = [];
  }

  private bubbleUp(index: number): void {
    const element = this.heap[index];
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      const parent = this.heap[parentIndex];

      if (element.priority >= parent.priority) break;

      this.heap[index] = parent;
      this.heap[parentIndex] = element;
      index = parentIndex;
    }
  }

  private sinkDown(index: number): void {
    const length = this.heap.length;
    const element = this.heap[index];

    while (true) {
      const leftChildIndex = 2 * index + 1;
      const rightChildIndex = 2 * index + 2;
      let swapIndex: number | null = null;

      if (leftChildIndex < length) {
        const leftChild = this.heap[leftChildIndex];
        if (leftChild.priority < element.priority) {
          swapIndex = leftChildIndex;
        }
      }

      if (rightChildIndex < length) {
        const rightChild = this.heap[rightChildIndex];
        const comparePriority =
          swapIndex === null ? element.priority : this.heap[leftChildIndex].priority;
        if (rightChild.priority < comparePriority) {
          swapIndex = rightChildIndex;
        }
      }

      if (swapIndex === null) break;

      this.heap[index] = this.heap[swapIndex];
      this.heap[swapIndex] = element;
      index = swapIndex;
    }
  }
}
