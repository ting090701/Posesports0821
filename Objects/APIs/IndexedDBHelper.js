import { ACCURACY_DB_NAME, SCORE_DB_NAME } from "../../G.js";

export class IndexedDBHelper {
    static #instance = null; // 私有靜態實例

    static getInstance() {
        if (!IndexedDBHelper.#instance) {
            const helper = new IndexedDBHelper();
            helper.init();
            IndexedDBHelper.#instance = helper;
        }
        return IndexedDBHelper.#instance;
    }

    constructor(dbName = 'GameDB') {
        if (IndexedDBHelper.#instance) {
            throw new Error("Singleton class cannot be instantiated more than once.");
        }
        this.dbName = dbName;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(SCORE_DB_NAME)) {
                    db.createObjectStore(SCORE_DB_NAME, { keyPath: 'id', autoIncrement: true });
                }
                if (!db.objectStoreNames.contains(ACCURACY_DB_NAME)) {
                    db.createObjectStore(ACCURACY_DB_NAME, { keyPath: 'id', autoIncrement: true });
                }
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve();
            };

            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }
    async addPlayer(data, mode = SCORE_DB_NAME) {
        await this.#addToDB(mode, data);
    }

    #addToDB(storeName, data) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction([storeName], 'readwrite');
            const store = tx.objectStore(storeName);
            store.add(data);
            tx.oncomplete = () => resolve();
            tx.onerror = (e) => reject(e.target.error);
        });
    }

    async getSortedLeaderboard(mode = SCORE_DB_NAME, limit = 10) {
        const storeName = mode === ACCURACY_DB_NAME ? ACCURACY_DB_NAME : SCORE_DB_NAME;
        const sortField = storeName === ACCURACY_DB_NAME ? 'accuracy' : 'score';

        const data = await this.#getAll(storeName);
        const sorted = data.sort((a, b) => b[sortField] - a[sortField]);

        return sorted.slice(0, limit);
    }
    getAllDataByName(mode = SCORE_DB_NAME) {
        return this.#getAll(mode);
    }

    #getAll(storeName) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction([storeName], 'readonly');
            const store = tx.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = (e) => reject(e.target.error);
        });
    }
    async updatePlayerById(id, newData, mode = SCORE_DB_NAME) {
        const updateStore = async (storeName) => {
            return new Promise((resolve, reject) => {
                const tx = this.db.transaction([storeName], 'readwrite');
                const store = tx.objectStore(storeName);
                const request = store.put({ ...newData, id });

                request.onsuccess = () => resolve();
                request.onerror = (e) => reject(e.target.error);
            });
        };

        if (mode === SCORE_DB_NAME ) {
            await updateStore(SCORE_DB_NAME);
        }
        if (mode === ACCURACY_DB_NAME) {
            await updateStore(ACCURACY_DB_NAME);
        }
    }
    async clearAllData() {
            const storeNames = [SCORE_DB_NAME,ACCURACY_DB_NAME];

            for (const storeName of storeNames) {
                await new Promise((resolve, reject) => {
                    const tx = this.db.transaction([storeName], 'readwrite');
                    const store = tx.objectStore(storeName);
                    const request = store.clear();

                    request.onsuccess = () => resolve();
                    request.onerror = (e) => reject(e.target.error);
                });
            }
        }
    async isDuplicateFace(inputDescriptor, threshold = 0.4, mode = SCORE_DB_NAME) {
        const allData = await this.#getAll(mode);

        for (const entry of allData) {
            if (!entry.descriptor) continue;
            const dist = this.#euclideanDistance(entry.descriptor, inputDescriptor);
            if (dist < threshold) {
                return { isDuplicate: true, existing: entry, distance: dist };
            }
        }

        return { isDuplicate: false };
    }

  #euclideanDistance(a, b) {
      return Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0));
  }
}
