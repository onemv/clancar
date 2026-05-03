"use client";

export type StoredPhotoDropzoneItem<TEdit> = {
  id: string;
  sourceFile: File;
  displayBlob: Blob | null;
  edit: TEdit;
  createdAt: number;
};

const DATABASE_NAME = "clancar-photo-drafts";
const DATABASE_VERSION = 1;
const STORE_NAME = "photoDropzoneDrafts";

type StoredDraft<TEdit> = {
  storageKey: string;
  photos: StoredPhotoDropzoneItem<TEdit>[];
  updatedAt: number;
};

function openPhotoDraftsDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "storageKey" });
      }
    };
  });
}

function runStoreTransaction<T>(
  mode: IDBTransactionMode,
  handler: (store: IDBObjectStore) => IDBRequest<T>
) {
  return openPhotoDraftsDatabase().then(
    (database) =>
      new Promise<T>((resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, mode);
        const store = transaction.objectStore(STORE_NAME);
        const request = handler(store);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        transaction.oncomplete = () => database.close();
        transaction.onerror = () => {
          database.close();
          reject(transaction.error);
        };
      })
  );
}

export async function loadPhotoDropzoneDraft<TEdit>(storageKey: string) {
  if (typeof indexedDB === "undefined") {
    return [];
  }

  const draft = await runStoreTransaction<StoredDraft<TEdit> | undefined>("readonly", (store) =>
    store.get(storageKey)
  );

  return draft?.photos ?? [];
}

export async function savePhotoDropzoneDraft<TEdit>(
  storageKey: string,
  photos: StoredPhotoDropzoneItem<TEdit>[]
) {
  if (typeof indexedDB === "undefined") {
    return;
  }

  await runStoreTransaction<IDBValidKey>("readwrite", (store) =>
    store.put({
      storageKey,
      photos,
      updatedAt: Date.now()
    } satisfies StoredDraft<TEdit>)
  );
}

export async function clearPhotoDropzoneDraft(storageKey: string) {
  if (typeof indexedDB === "undefined") {
    return;
  }

  await runStoreTransaction<undefined>("readwrite", (store) => store.delete(storageKey));
}
