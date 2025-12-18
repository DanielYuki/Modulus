import { useSyncExternalStore } from "react";

type Listener = () => void;

/**
 * LocalStore - Observable pattern with localStorage persistence.
 * Uses useSyncExternalStore for React integration.
 */
export class LocalStore<T> {
  private key: string;
  private state: T;
  private listeners: Set<Listener> = new Set();

  constructor(key: string, initialValue: T) {
    this.key = key;
    this.state = this.loadFromStorage() ?? initialValue;
  }

  private loadFromStorage(): T | null {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem(this.key);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private saveToStorage(): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.key, JSON.stringify(this.state));
  }

  getState = (): T => this.state;

  setState = (update: Partial<T> | ((prev: T) => Partial<T>)): void => {
    const partial = typeof update === "function" ? update(this.state) : update;
    this.state = { ...this.state, ...partial };
    this.saveToStorage();
    this.notify();
  };

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }
}

/**
 * React hook to use a LocalStore.
 */
export function useStore<T>(store: LocalStore<T>): T {
  return useSyncExternalStore(store.subscribe, store.getState, store.getState);
}
