/* eslint-disable @typescript-eslint/no-explicit-any */
import { Policy } from './policy';
import { Store } from '../store/store';

interface MutationPersistencePolicyOptions<T> {
  key: string;
  storage: Storage | 'indexeddb';
  replayQueue: () => Promise<void>;
  getQueueSnapshot: () => QueuedMutation<T>[];
  restoreQueue: (items: QueuedMutation<T>[]) => void;
}

interface QueuedMutation<T> {
  url: string;
  body: T | undefined;
  key: string | number;
  method: 'POST' | 'PUT' | 'DELETE';
}

export class MutationPersistencePolicy<T> extends Policy<T> {
  private storage: Storage | 'indexeddb';
  private storageKey: string;
  private getQueueSnapshot: () => QueuedMutation<T>[];
  private restoreQueue: (items: QueuedMutation<T>[]) => void;
  private replayQueue: () => Promise<void>;

  constructor(options: MutationPersistencePolicyOptions<T>) {
    super();
    this.storage = options.storage;
    this.storageKey = options.key;
    this.getQueueSnapshot = options.getQueueSnapshot;
    this.restoreQueue = options.restoreQueue;
    this.replayQueue = options.replayQueue;
  }

  async onAttach(_store: Store<T>): Promise<void> {
    await this.loadPersistedQueue();
  }

  async onChange(_key: string | number, _value: T | undefined): Promise<void> {
    await this.saveQueueSnapshot();
  }

  private async loadPersistedQueue() {
    const queue = await this.read();

    if (Array.isArray(queue)) {
      this.restoreQueue(queue);
      await this.replayQueue();
    }
  }

  private async saveQueueSnapshot() {
    const queue = this.getQueueSnapshot();

    await this.write(queue);
  }

  private async read(): Promise<any[] | undefined> {
    if (this.storage === 'indexeddb') {
      return await this.readIndexedDB();
    }

    const data = this.storage.getItem(this.storageKey);

    return data ? JSON.parse(data) : undefined;
  }

  private async write(data: any[]) {
    if (this.storage === 'indexeddb') {
      await this.writeIndexedDB(data);
    } else {
      this.storage.setItem(this.storageKey, JSON.stringify(data));
    }
  }

  private async readIndexedDB(): Promise<any[] | undefined> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('MutationPersistenceDB', 1);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        db.createObjectStore('mutations');
      };

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction('mutations', 'readonly');
        const store = transaction.objectStore('mutations');
        const getRequest = store.get(this.storageKey);

        getRequest.onsuccess = () => resolve(getRequest.result);
        getRequest.onerror = () => reject(getRequest.error);
      };
    });
  }

  private async writeIndexedDB(data: any[]) {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('MutationPersistenceDB', 1);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        db.createObjectStore('mutations');
      };

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction('mutations', 'readwrite');
        const store = transaction.objectStore('mutations');
        const putRequest = store.put(data, this.storageKey);

        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };
    });
  }
}
