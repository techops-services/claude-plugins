import type { FeedbackEntry, ResponseEntry } from "./types.js";

export class FeedbackStore {
  private entries: FeedbackEntry[] = [];

  add(entry: FeedbackEntry): void {
    this.entries.push(entry);
  }

  getOldestPending(): FeedbackEntry | undefined {
    return this.entries.find((e) => !e.processed);
  }

  getAll(): FeedbackEntry[] {
    return [...this.entries];
  }

  getPending(): FeedbackEntry[] {
    return this.entries.filter((e) => !e.processed);
  }

  markProcessed(id: string): boolean {
    const entry = this.entries.find((e) => e.id === id);
    if (entry) {
      entry.processed = true;
      return true;
    }
    return false;
  }

  clear(id?: string): number {
    if (id) {
      const idx = this.entries.findIndex(
        (e) => e.id === id && e.processed,
      );
      if (idx !== -1) {
        this.entries.splice(idx, 1);
        return 1;
      }
      return 0;
    }
    const before = this.entries.length;
    this.entries = this.entries.filter((e) => !e.processed);
    return before - this.entries.length;
  }

  get pendingCount(): number {
    return this.entries.filter((e) => !e.processed).length;
  }
}

export class ResponseStore {
  private entries: ResponseEntry[] = [];

  add(entry: ResponseEntry): void {
    this.entries.push(entry);
  }

  getUndelivered(): ResponseEntry[] {
    return this.entries.filter((e) => !e.delivered);
  }

  markDelivered(id: string): boolean {
    const entry = this.entries.find((e) => e.id === id);
    if (entry) {
      entry.delivered = true;
      return true;
    }
    return false;
  }

  get pendingCount(): number {
    return this.entries.filter((e) => !e.delivered).length;
  }
}
