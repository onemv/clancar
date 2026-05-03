"use client";

import type { ChangeEvent, DragEvent as ReactDragEvent } from "react";
import { useEffect, useRef, useState } from "react";
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Delete02Icon } from "hugeicons-react";

import styles from "./MediaFileDropzone.module.scss";
import { Button } from "@/components/Button/Button";
import { DropdownMenu, type DropdownMenuOption } from "@/components/DropdownMenu/DropdownMenu";
import { Input } from "@/components/Input/Input";
import {
  loadPhotoDropzoneDraft,
  savePhotoDropzoneDraft,
  type StoredPhotoDropzoneItem
} from "@/components/PhotoDropzone/photoDropzoneStorage";
import { cn } from "@/lib/cn";

type MediaFileKind = "pdf" | "video";
type MediaFileCategory = "Документ" | "Диагностика" | "Заказ-наряд" | "Отчет о проверке";

const MEDIA_FILE_CATEGORY_OPTIONS: DropdownMenuOption[] = [
  { value: "Документ", label: "Документ" },
  { value: "Диагностика", label: "Диагностика" },
  { value: "Заказ-наряд", label: "Заказ-наряд" },
  { value: "Отчет о проверке", label: "Отчет о проверке" }
];

type MediaFileDropzoneProps = {
  title: string;
  hint: string;
  kind: MediaFileKind;
  storageKey?: string;
  className?: string;
};

type MediaFileItem = {
  id: string;
  file: File;
  previewUrl: string;
  displayName: string;
  category: MediaFileCategory;
  createdAt: number;
};

type SortableMediaCardProps = {
  id: string;
  kind: MediaFileKind;
  displayName: string;
  previewUrl: string;
  category: MediaFileCategory;
  onDisplayNameChange: (nextName: string) => void;
  onCategoryChange: (nextCategory: MediaFileCategory) => void;
  onDelete: () => void;
};

function isValidFile(file: File, kind: MediaFileKind) {
  if (kind === "pdf") {
    return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  }

  return file.type.startsWith("video/");
}

function createStoredItems(items: ReadonlyArray<MediaFileItem>) {
  return items.map(
    (item): StoredPhotoDropzoneItem<{ category: MediaFileCategory; displayName: string }> => ({
      id: item.id,
      sourceFile: item.file,
      displayBlob: null,
      edit: { category: item.category, displayName: item.displayName },
      createdAt: item.createdAt
    })
  );
}

function getDefaultDisplayName(fileName: string) {
  return fileName;
}

function createItemFromStorage(
  item: StoredPhotoDropzoneItem<{ category: MediaFileCategory; displayName: string }>,
  fallbackCreatedAt = Date.now()
): MediaFileItem {
  return {
    id: item.id,
    file: item.sourceFile,
    previewUrl: URL.createObjectURL(item.sourceFile),
    displayName: item.edit?.displayName ?? getDefaultDisplayName(item.sourceFile.name),
    category: item.edit?.category ?? "Документ",
    createdAt: item.createdAt ?? fallbackCreatedAt
  };
}

function revokeItemUrl(item: MediaFileItem) {
  URL.revokeObjectURL(item.previewUrl);
}

function SortableMediaCard({
  id,
  kind,
  displayName,
  previewUrl,
  category,
  onDisplayNameChange,
  onCategoryChange,
  onDelete
}: Readonly<SortableMediaCardProps>) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({
      id
    });

  return (
    <article
      ref={setNodeRef}
      className={cn(styles.card, isDragging && styles.cardDragging)}
      style={{
        transform: CSS.Transform.toString(transform),
        transition
      }}
    >
      <div
        ref={setActivatorNodeRef}
        className={styles.dragLayer}
        aria-label="Перетащить файл"
        {...attributes}
        {...listeners}
      />

      <div className={styles.preview}>
        {kind === "pdf" ? (
          <embed className={styles.previewPdf} src={previewUrl} type="application/pdf" />
        ) : (
          <video className={styles.previewVideo} src={previewUrl} muted playsInline preload="metadata" />
        )}
      </div>

      <div className={styles.cardMeta}>
        <Input
          className={styles.nameInput}
          value={displayName}
          aria-label="Наименование файла"
          placeholder="Наименование файла"
          onPointerDown={(event) => {
            event.stopPropagation();
          }}
          onClick={(event) => {
            event.stopPropagation();
          }}
          onChange={(event) => onDisplayNameChange(event.target.value)}
        />

        <div className={styles.typeRow}>
          <DropdownMenu
            className={styles.typeDropdown}
            fullWidth
            options={MEDIA_FILE_CATEGORY_OPTIONS}
            value={category}
            onValueChange={(value) => onCategoryChange(value as MediaFileCategory)}
          />

          <Button
            variant="outline"
            className={styles.deleteButton}
            aria-label="Удалить файл"
            onPointerDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
          >
            <Delete02Icon className={styles.deleteIcon} size={16} />
          </Button>
        </div>
      </div>
    </article>
  );
}

export function MediaFileDropzone({
  title,
  hint,
  kind,
  storageKey,
  className
}: Readonly<MediaFileDropzoneProps>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepthRef = useRef(0);
  const itemsRef = useRef<MediaFileItem[]>([]);
  const isDraftLoadedRef = useRef(!storageKey);
  const draftSaveQueueRef = useRef(Promise.resolve());
  const [items, setItems] = useState<MediaFileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 6
      }
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 220,
        tolerance: 8
      }
    })
  );

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    return () => {
      itemsRef.current.forEach(revokeItemUrl);
    };
  }, []);

  useEffect(() => {
    if (!storageKey) {
      isDraftLoadedRef.current = true;
      return;
    }

    let isActive = true;
    isDraftLoadedRef.current = false;

    loadPhotoDropzoneDraft<{ category: MediaFileCategory; displayName: string }>(storageKey)
      .then((storedItems) => {
        if (!isActive) {
          return;
        }

        setItems((current) => {
          current.forEach(revokeItemUrl);
          return storedItems.map((item) => createItemFromStorage(item));
        });
      })
      .catch(() => {
        if (isActive) {
          setItems([]);
        }
      })
      .finally(() => {
        if (isActive) {
          isDraftLoadedRef.current = true;
        }
      });

    return () => {
      isActive = false;
    };
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey || !isDraftLoadedRef.current) {
      return;
    }

    draftSaveQueueRef.current = draftSaveQueueRef.current
      .then(() => savePhotoDropzoneDraft(storageKey, createStoredItems(items)))
      .catch(() => {});
  }, [items, storageKey]);

  const appendFiles = (fileList: FileList | null) => {
    if (!fileList) {
      return;
    }

    const nextItems = Array.from(fileList)
      .filter((file) => isValidFile(file, kind))
      .map((file) => ({
        id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
        file,
        previewUrl: URL.createObjectURL(file),
        displayName: getDefaultDisplayName(file.name),
        category: "Документ" as MediaFileCategory,
        createdAt: Date.now()
      }));

    if (nextItems.length === 0) {
      return;
    }

    setItems((current) => [...current, ...nextItems]);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    appendFiles(event.target.files);
    event.target.value = "";
  };

  const handleDragEnter = (event: ReactDragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragDepthRef.current += 1;
    setIsDragging(true);
  };

  const handleDragOver = (event: ReactDragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDragLeave = (event: ReactDragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);

    if (dragDepthRef.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDrop = (event: ReactDragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragDepthRef.current = 0;
    setIsDragging(false);
    appendFiles(event.dataTransfer.files);
  };

  const handleDelete = (id: string) => {
    setItems((current) => {
      const removed = current.find((item) => item.id === id);

      if (removed) {
        revokeItemUrl(removed);
      }

      return current.filter((item) => item.id !== id);
    });
  };

  const handleDisplayNameChange = (id: string, nextName: string) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, displayName: nextName } : item))
    );
  };

  const handleCategoryChange = (id: string, nextCategory: MediaFileCategory) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, category: nextCategory } : item))
    );
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) {
      return;
    }

    setItems((current) => {
      const oldIndex = current.findIndex((item) => item.id === active.id);
      const newIndex = current.findIndex((item) => item.id === over.id);

      if (oldIndex === -1 || newIndex === -1) {
        return current;
      }

      return arrayMove(current, oldIndex, newIndex);
    });
  };

  return (
    <div className={cn(styles.root, className)}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.hint}>{hint}</p>
        </div>
        <Button variant="outline" onClick={() => inputRef.current?.click()}>
          {kind === "pdf" ? "Добавить PDF" : "Добавить видео"}
        </Button>
      </div>

      <div
        className={cn(styles.dropzone, items.length > 0 && styles.dropzoneFilled, isDragging && styles.dragging)}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          className={styles.input}
          type="file"
          accept={kind === "pdf" ? "application/pdf" : "video/*"}
          multiple
          onChange={handleInputChange}
        />

        <div className={styles.content}>
          {items.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyTitle}>
                {kind === "pdf" ? "Перетащите PDF сюда" : "Перетащите видео сюда"}
              </div>
              <p className={styles.emptyHint}>Или используйте кнопку добавления справа сверху.</p>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={items.map((item) => item.id)} strategy={rectSortingStrategy}>
                <div className={styles.grid}>
                  {items.map((item) => (
                    <SortableMediaCard
                      key={item.id}
                      id={item.id}
                      kind={kind}
                      displayName={item.displayName}
                      previewUrl={item.previewUrl}
                      category={item.category}
                      onDisplayNameChange={(nextName) => handleDisplayNameChange(item.id, nextName)}
                      onCategoryChange={(nextCategory) => handleCategoryChange(item.id, nextCategory)}
                      onDelete={() => handleDelete(item.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
    </div>
  );
}
