"use client";

import type {
  CSSProperties,
  ChangeEvent,
  DragEvent as ReactDragEvent,
  PointerEvent as ReactPointerEvent,
  SVGProps
} from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  DashedLineCircleIcon,
  BackgroundIcon,
  BrushIcon,
  Cancel01Icon,
  Crown03Icon,
  Delete02Icon,
  MenuCircleIcon,
  ViewIcon
} from "hugeicons-react";
import Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Circle, Group, Image as KonvaImage, Layer, Line, Stage, Transformer } from "react-konva";

import styles from "./PhotoDropzone.module.scss";
import { Button } from "@/components/Button/Button";
import { IconButton } from "@/components/IconButton/IconButton";
import { Modal } from "@/components/Modal/Modal";
import {
  loadPhotoDropzoneDraft,
  savePhotoDropzoneDraft,
  type StoredPhotoDropzoneItem
} from "@/components/PhotoDropzone/photoDropzoneStorage";
import { cn } from "@/lib/cn";

type PhotoPoint = {
  x: number;
  y: number;
};

type PhotoCircle = {
  id: string;
  x: number;
  y: number;
  radius: number;
};

type PhotoBlurArea = {
  id: string;
  points: [PhotoPoint, PhotoPoint, PhotoPoint, PhotoPoint];
};

type PhotoEditState = {
  rotation: number;
  circles: PhotoCircle[];
  blurAreas: PhotoBlurArea[];
};

type PhotoItem = {
  id: string;
  sourceFile: File;
  displayBlob: Blob | null;
  sourceUrl: string;
  displayUrl: string;
  edit: PhotoEditState;
  createdAt: number;
};

type PhotoDropzoneProps = {
  className?: string;
  storageKey?: string;
};

type SortablePhotoCardProps = {
  id: string;
  order: number;
  previewUrl: string;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

type EditorTool = "select" | "circle" | "blur";
type SelectedShape = { kind: "circle" | "blur"; id: string } | null;

const EDITOR_FIXED_HEIGHT = 530;
const EDITOR_MOBILE_BREAKPOINT = 768;
const EDITOR_MOBILE_SIDE_GAP = 40;
const EDITOR_MOBILE_VERTICAL_RESERVE = 248;
const EDITOR_MIN_HEIGHT = 240;
const DEFAULT_CIRCLE_RADIUS_RATIO = 0.1;
const SELECTION_ACCENT = "#bed95a";
const CIRCLE_STROKE = "#f2cf67";
const BLUR_STROKE = "rgba(255, 255, 255, 0.74)";
const MIN_POINT_GAP = 0.02;
const BLUR_RADIUS = 18;

type EditorIconProps = SVGProps<SVGSVGElement> & { size?: number };

function IterationCcwIcon({ size = 18, ...props }: Readonly<EditorIconProps>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M20 10c0-4.4-3.6-8-8-8s-8 3.6-8 8 3.6 8 8 8h8" />
      <polyline points="16 14 20 18 16 22" />
    </svg>
  );
}

function IterationCwIcon({ size = 18, ...props }: Readonly<EditorIconProps>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 10c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8H4" />
      <polyline points="8 22 4 18 8 14" />
    </svg>
  );
}

function isImageFile(file: File) {
  return file.type.startsWith("image/");
}

function createEmptyEditState(): PhotoEditState {
  return {
    rotation: 0,
    circles: [],
    blurAreas: []
  };
}

function isEditStateEqual(left: PhotoEditState, right: PhotoEditState) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeRotation(rotation: number) {
  const normalized = rotation % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

function getImageDisplaySize(width: number, height: number) {
  if (width <= 0 || height <= 0) {
    return { width: Math.round((1600 / 1200) * EDITOR_FIXED_HEIGHT), height: EDITOR_FIXED_HEIGHT };
  }

  const scale = EDITOR_FIXED_HEIGHT / height;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: EDITOR_FIXED_HEIGHT
  };
}

function getPolygonPoints(points: ReadonlyArray<PhotoPoint>, width: number, height: number) {
  return points.flatMap((point) => [point.x * width, point.y * height]);
}

function clampPoint(point: PhotoPoint): PhotoPoint {
  return {
    x: clamp(point.x, 0, 1),
    y: clamp(point.y, 0, 1)
  };
}

function moveBlurArea(area: PhotoBlurArea, deltaX: number, deltaY: number): PhotoBlurArea {
  const minX = Math.min(...area.points.map((point) => point.x));
  const maxX = Math.max(...area.points.map((point) => point.x));
  const minY = Math.min(...area.points.map((point) => point.y));
  const maxY = Math.max(...area.points.map((point) => point.y));
  const safeDeltaX = clamp(deltaX, -minX, 1 - maxX);
  const safeDeltaY = clamp(deltaY, -minY, 1 - maxY);

  return {
    ...area,
    points: area.points.map((point) => ({
      x: point.x + safeDeltaX,
      y: point.y + safeDeltaY
    })) as PhotoBlurArea["points"]
  };
}

function createBlurArea(points: ReadonlyArray<PhotoPoint>): PhotoBlurArea | null {
  if (points.length !== 4) {
    return null;
  }

  const normalizedPoints = points.map(clampPoint);
  const minX = Math.min(...normalizedPoints.map((point) => point.x));
  const maxX = Math.max(...normalizedPoints.map((point) => point.x));
  const minY = Math.min(...normalizedPoints.map((point) => point.y));
  const maxY = Math.max(...normalizedPoints.map((point) => point.y));

  if (maxX - minX < MIN_POINT_GAP || maxY - minY < MIN_POINT_GAP) {
    return null;
  }

  return {
    id: crypto.randomUUID(),
    points: normalizedPoints as PhotoBlurArea["points"]
  };
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Не удалось загрузить изображение: ${url}`));
    image.src = url;
  });
}

function drawRotatedImage(
  context: CanvasRenderingContext2D,
  image: CanvasImageSource,
  width: number,
  height: number,
  rotation: number
) {
  const normalized = normalizeRotation(rotation);

  context.save();

  if (normalized === 90) {
    context.translate(width, 0);
    context.rotate(Math.PI / 2);
    context.drawImage(image, 0, 0, height, width);
  } else if (normalized === 180) {
    context.translate(width, height);
    context.rotate(Math.PI);
    context.drawImage(image, 0, 0, width, height);
  } else if (normalized === 270) {
    context.translate(0, height);
    context.rotate(-Math.PI / 2);
    context.drawImage(image, 0, 0, height, width);
  } else {
    context.drawImage(image, 0, 0, width, height);
  }

  context.restore();
}

function getBlobFromCanvas(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }

      reject(new Error("Не удалось подготовить отредактированное изображение"));
    }, "image/png");
  });
}

async function renderEditedPhoto(sourceUrl: string, edit: PhotoEditState) {
  const image = await loadImage(sourceUrl);
  const rotation = normalizeRotation(edit.rotation);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas context is unavailable");
  }

  const rotatedWidth = rotation === 90 || rotation === 270 ? image.naturalHeight : image.naturalWidth;
  const rotatedHeight = rotation === 90 || rotation === 270 ? image.naturalWidth : image.naturalHeight;

  canvas.width = rotatedWidth;
  canvas.height = rotatedHeight;

  drawRotatedImage(context, image, rotatedWidth, rotatedHeight, rotation);

  if (edit.blurAreas.length > 0) {
    const blurredCanvas = document.createElement("canvas");
    blurredCanvas.width = rotatedWidth;
    blurredCanvas.height = rotatedHeight;
    const blurredContext = blurredCanvas.getContext("2d");

    if (!blurredContext) {
      throw new Error("Blur canvas context is unavailable");
    }

    blurredContext.filter = `blur(${BLUR_RADIUS}px)`;
    blurredContext.drawImage(canvas, 0, 0);
    blurredContext.filter = "none";

    edit.blurAreas.forEach((blurArea) => {
      const polygonPoints = getPolygonPoints(blurArea.points, rotatedWidth, rotatedHeight);

      context.save();
      context.beginPath();
      context.moveTo(polygonPoints[0] ?? 0, polygonPoints[1] ?? 0);

      for (let index = 2; index < polygonPoints.length; index += 2) {
        context.lineTo(polygonPoints[index] ?? 0, polygonPoints[index + 1] ?? 0);
      }

      context.closePath();
      context.clip();
      context.drawImage(blurredCanvas, 0, 0);
      context.restore();
    });
  }

  edit.circles.forEach((circle) => {
    context.beginPath();
    context.arc(
      circle.x * rotatedWidth,
      circle.y * rotatedHeight,
      circle.radius * Math.min(rotatedWidth, rotatedHeight),
      0,
      Math.PI * 2
    );
    context.strokeStyle = CIRCLE_STROKE;
    context.lineWidth = 4;
    context.stroke();
  });

  return getBlobFromCanvas(canvas);
}

function SortablePhotoCard({
  id,
  order,
  previewUrl,
  onView,
  onEdit,
  onDelete
}: Readonly<SortablePhotoCardProps>) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({
      id
    });
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);

  const previewStyle = {
    backgroundImage: `url("${previewUrl}")`
  } as CSSProperties;

  const handleActionPress =
    (callback: () => void) =>
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      setIsActionMenuOpen(false);
      callback();
    };

  const handleActionMenuToggle = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setIsActionMenuOpen((isOpen) => !isOpen);
  };

  return (
    <article
      ref={setNodeRef}
      className={cn(styles.card, isDragging && styles.cardDragging)}
      style={{
        transform: CSS.Transform.toString(transform),
        transition
      }}
    >
      <div className={styles.preview} style={previewStyle}>
        <div
          ref={setActivatorNodeRef}
          className={cn(styles.dragArea, isActionMenuOpen && styles.dragAreaDisabled)}
          {...attributes}
          {...listeners}
          aria-label="Перетащить фотографию"
        />
        <div className={styles.orderBadge}>
          <span>{order}</span>
          {order === 1 ? <Crown03Icon className={styles.orderCrown} size={11} /> : null}
        </div>

        <div
          className={cn(
            styles.actions,
            isActionMenuOpen && styles.actionsOpen,
            isActionMenuOpen && styles.actionsVisible
          )}
        >
          <div
            className={cn(styles.actionMenuItems, isActionMenuOpen && styles.actionMenuItemsOpen)}
            aria-hidden={!isActionMenuOpen}
          >
            <button
              className={styles.actionButton}
              type="button"
              aria-label="Редактировать фото"
              tabIndex={isActionMenuOpen ? 0 : -1}
              onPointerDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              onPointerUp={handleActionPress(onEdit)}
            >
              <BrushIcon size={16} />
            </button>
            <button
              className={styles.actionButton}
              type="button"
              aria-label="Просмотр фото"
              tabIndex={isActionMenuOpen ? 0 : -1}
              onPointerDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              onPointerUp={handleActionPress(onView)}
            >
              <ViewIcon size={16} />
            </button>
            <button
              className={cn(styles.actionButton, styles.actionDanger)}
              type="button"
              aria-label="Удалить фото"
              tabIndex={isActionMenuOpen ? 0 : -1}
              onPointerDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              onPointerUp={handleActionPress(onDelete)}
            >
              <Delete02Icon size={16} />
            </button>
          </div>
          <button
            className={cn(styles.actionButton, styles.actionMenuButton)}
            type="button"
            aria-label={isActionMenuOpen ? "Скрыть действия с фото" : "Показать действия с фото"}
            aria-expanded={isActionMenuOpen}
            onPointerDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            onPointerUp={handleActionMenuToggle}
          >
            {isActionMenuOpen ? <Cancel01Icon size={17} /> : <MenuCircleIcon size={17} />}
          </button>
        </div>
      </div>
    </article>
  );
}

type PhotoViewerModalProps = {
  open: boolean;
  photos: ReadonlyArray<PhotoItem>;
  currentIndex: number;
  onClose: () => void;
};

function PhotoViewerModal({
  open,
  photos,
  currentIndex,
  onClose
}: Readonly<PhotoViewerModalProps>) {
  const [selectedIndex, setSelectedIndex] = useState(currentIndex);

  useEffect(() => {
    if (!open) {
      return;
    }

    setSelectedIndex(currentIndex);
  }, [currentIndex, open]);

  const currentPhoto = photos[selectedIndex] ?? null;

  return (
    <Modal
      open={open}
      title=""
      onClose={onClose}
      showOverlay
      showHeader={false}
      plainContent
      closeOnOverlayClick={false}
      forceBackgroundBlur
    >
      <div className={styles.viewerLayout}>
        {currentPhoto ? (
          <div className={styles.viewerFrame}>
            <div className={styles.viewerTopbar}>
              <IconButton
                className={styles.viewerCloseButton}
                aria-label="Закрыть просмотр"
                onClick={onClose}
              >
                <Cancel01Icon size={18} />
              </IconButton>
            </div>

            <figure className={styles.viewerFigure}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className={styles.viewerImage}
                src={currentPhoto.displayUrl}
                alt={`Фотография автомобиля ${selectedIndex + 1}`}
              />
            </figure>

            <div className={styles.viewerBottomBar}>
              <div className={styles.viewerControls}>
                <IconButton
                  aria-label="Предыдущая фотография"
                  disabled={selectedIndex <= 0}
                  onClick={() => setSelectedIndex((index) => Math.max(index - 1, 0))}
                >
                  <ArrowLeft01Icon size={18} />
                </IconButton>
                <div className={styles.viewerMeta}>
                  {Math.min(selectedIndex + 1, photos.length)} / {photos.length}
                </div>
                <IconButton
                  aria-label="Следующая фотография"
                  disabled={selectedIndex >= photos.length - 1}
                  onClick={() => setSelectedIndex((index) => Math.min(index + 1, photos.length - 1))}
                >
                  <ArrowRight01Icon size={18} />
                </IconButton>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}

type PhotoEditorModalProps = {
  open: boolean;
  photo: PhotoItem | null;
  onClose: () => void;
  onSave: (photoId: string, edit: PhotoEditState, displayBlob: Blob) => void;
};

function PhotoEditorModal({ open, photo, onClose, onSave }: Readonly<PhotoEditorModalProps>) {
  const [draft, setDraft] = useState<PhotoEditState>(createEmptyEditState());
  const [tool, setTool] = useState<EditorTool>("select");
  const [selectedShape, setSelectedShape] = useState<SelectedShape>(null);
  const [pendingBlurPoints, setPendingBlurPoints] = useState<PhotoPoint[]>([]);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toolbarWidth, setToolbarWidth] = useState<number | null>(null);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const groupRef = useRef<Konva.Group | null>(null);
  const transformerRef = useRef<Konva.Transformer | null>(null);
  const rotationTweenRef = useRef<Konva.Tween | null>(null);
  const isRotationInitializedRef = useRef(false);
  const circleRefs = useRef<Record<string, Konva.Circle | null>>({});
  const blurImageRefs = useRef<Record<string, Konva.Image | null>>({});
  const toolsRef = useRef<HTMLDivElement | null>(null);

  const destroyTweenSafely = useCallback((tween: Konva.Tween | null) => {
    if (!tween) {
      return;
    }

    try {
      tween.destroy();
    } catch {
      // Поглощаем повторный destroy, чтобы избежать runtime-краша в Konva.
    }
  }, []);

  const clearRotationTween = useCallback(() => {
    destroyTweenSafely(rotationTweenRef.current);
    rotationTweenRef.current = null;
  }, [destroyTweenSafely]);

  useEffect(() => {
    if (!open || !photo) {
      return;
    }

    setDraft(photo.edit);
    setTool("select");
    setSelectedShape(null);
    setPendingBlurPoints([]);
    setIsSaving(false);
    isRotationInitializedRef.current = false;
    clearRotationTween();
  }, [clearRotationTween, open, photo]);

  useEffect(() => {
    if (!photo) {
      setImageElement(null);
      return;
    }

    let isActive = true;

    loadImage(photo.sourceUrl)
      .then((image) => {
        if (isActive) {
          setImageElement(image);
        }
      })
      .catch(() => {
        if (isActive) {
          setImageElement(null);
        }
      });

    return () => {
      isActive = false;
    };
  }, [photo]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const syncViewportSize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    syncViewportSize();
    window.addEventListener("resize", syncViewportSize);
    window.addEventListener("orientationchange", syncViewportSize);

    return () => {
      window.removeEventListener("resize", syncViewportSize);
      window.removeEventListener("orientationchange", syncViewportSize);
    };
  }, [open]);

  const naturalWidth = imageElement?.naturalWidth ?? 1600;
  const naturalHeight = imageElement?.naturalHeight ?? 1200;
  const rotation = normalizeRotation(draft.rotation);
  const baseDisplaySize = getImageDisplaySize(naturalWidth, naturalHeight);
  const isMobileEditor = viewportSize.width > 0 && viewportSize.width <= EDITOR_MOBILE_BREAKPOINT;
  const maxDisplayWidth = isMobileEditor
    ? Math.max(220, viewportSize.width - EDITOR_MOBILE_SIDE_GAP)
    : baseDisplaySize.width;
  const maxDisplayHeight = isMobileEditor
    ? Math.max(EDITOR_MIN_HEIGHT, viewportSize.height - EDITOR_MOBILE_VERTICAL_RESERVE)
    : baseDisplaySize.height;
  const fitScale = Math.min(
    1,
    maxDisplayWidth / baseDisplaySize.width,
    maxDisplayHeight / baseDisplaySize.height
  );
  const displayWidth = Math.max(1, Math.round(baseDisplaySize.width * fitScale));
  const displayHeight = Math.max(1, Math.round(baseDisplaySize.height * fitScale));
  const baseSize = Math.min(displayWidth, displayHeight);

  useEffect(() => {
    const transformer = transformerRef.current;

    if (!transformer) {
      return;
    }

    if (!selectedShape || selectedShape.kind !== "circle") {
      transformer.nodes([]);
      transformer.getLayer()?.batchDraw();
      return;
    }

    const node = circleRefs.current[selectedShape.id];

    if (!node) {
      transformer.nodes([]);
      transformer.getLayer()?.batchDraw();
      return;
    }

    transformer.nodes([node]);
    transformer.getLayer()?.batchDraw();
  }, [draft, selectedShape]);

  useEffect(() => {
    Object.entries(blurImageRefs.current).forEach(([id, node]) => {
      if (!node || !draft.blurAreas.some((blurArea) => blurArea.id === id)) {
        delete blurImageRefs.current[id];
        return;
      }

      node.clearCache();
      node.cache();
    });

    groupRef.current?.getLayer()?.batchDraw();
  }, [draft.blurAreas, imageElement]);

  useEffect(() => {
    const group = groupRef.current;

    if (!group) {
      return;
    }

    clearRotationTween();

    if (!isRotationInitializedRef.current) {
      group.rotation(rotation);
      group.getLayer()?.batchDraw();
      isRotationInitializedRef.current = true;
      return;
    }

    const tween = new Konva.Tween({
      node: group,
      rotation,
      duration: 0.24,
      easing: Konva.Easings.EaseInOut
    });

    rotationTweenRef.current = tween;
    tween.play();

    return () => {
      if (rotationTweenRef.current === tween) {
        clearRotationTween();
        return;
      }

      destroyTweenSafely(tween);
    };
  }, [clearRotationTween, destroyTweenSafely, rotation]);

  useEffect(() => {
    const toolsElement = toolsRef.current;

    if (!toolsElement || typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];

      if (!entry) {
        return;
      }

      setToolbarWidth(Math.round(entry.contentRect.width));
    });

    observer.observe(toolsElement);

    return () => {
      observer.disconnect();
    };
  }, []);

  if (!photo) {
    return null;
  }

  const getRelativePointerPosition = () => {
    const group = groupRef.current;
    const point = group?.getRelativePointerPosition();

    if (!point) {
      return null;
    }

    return {
      x: clamp(point.x / displayWidth, 0, 1),
      y: clamp(point.y / displayHeight, 0, 1)
    };
  };

  const applyToolAtPoint = (point: PhotoPoint) => {
    if (tool === "circle") {
      const nextCircle: PhotoCircle = {
        id: crypto.randomUUID(),
        x: point.x,
        y: point.y,
        radius: DEFAULT_CIRCLE_RADIUS_RATIO
      };

      setDraft((current) => ({
        ...current,
        circles: [...current.circles, nextCircle]
      }));
      setSelectedShape({ kind: "circle", id: nextCircle.id });
      return true;
    }

    if (tool === "blur") {
      const nextPoints = [...pendingBlurPoints, point];

      if (nextPoints.length < 4) {
        setPendingBlurPoints(nextPoints);
        return true;
      }

      const blurArea = createBlurArea(nextPoints);
      setPendingBlurPoints([]);

      if (!blurArea) {
        return true;
      }

      setDraft((current) => ({
        ...current,
        blurAreas: [...current.blurAreas, blurArea]
      }));
      setSelectedShape({ kind: "blur", id: blurArea.id });
      return true;
    }

    return false;
  };

  const handleCanvasPointerDown = (event: KonvaEventObject<PointerEvent>) => {
    const clickedEmptySpace = event.target === event.target.getStage();
    const point = getRelativePointerPosition();

    if (point && applyToolAtPoint(point)) {
      return;
    }

    if (clickedEmptySpace) {
      setSelectedShape(null);
    }
  };

  const handleCircleTransformEnd = (circleId: string) => {
    const node = circleRefs.current[circleId];

    if (!node) {
      return;
    }

    const nextRadius = clamp((node.radius() * node.scaleX()) / baseSize, 0.02, 0.45);
    node.scaleX(1);
    node.scaleY(1);

    setDraft((current) => ({
      ...current,
      circles: current.circles.map((circle) =>
        circle.id === circleId
          ? {
              ...circle,
              x: clamp(node.x() / displayWidth, 0, 1),
              y: clamp(node.y() / displayHeight, 0, 1),
              radius: nextRadius
            }
          : circle
      )
    }));
  };

  const removeSelectedShape = () => {
    if (!selectedShape) {
      return;
    }

    setDraft((current) => {
      if (selectedShape.kind === "circle") {
        return {
          ...current,
          circles: current.circles.filter((circle) => circle.id !== selectedShape.id)
        };
      }

      return {
        ...current,
        blurAreas: current.blurAreas.filter((blurArea) => blurArea.id !== selectedShape.id)
      };
    });
    setSelectedShape(null);
  };

  const handleSave = async () => {
    if (isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      const displayBlob = await renderEditedPhoto(photo.sourceUrl, draft);
      onSave(photo.id, draft, displayBlob);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const hasDraftChanges = !isEditStateEqual(draft, photo.edit);

  return (
    <Modal
      open={open}
      title=""
      onClose={onClose}
      showOverlay
      showHeader={false}
      plainContent
      closeOnOverlayClick={false}
      forceBackgroundBlur
    >
      <div className={cn(styles.editorLayout, isMobileEditor && styles.editorLayoutMobile)}>
        <div
          className={styles.editorTopbar}
          style={displayWidth ? { width: `${displayWidth}px` } : undefined}
        >
          <IconButton
            className={styles.editorCloseButton}
            aria-label="Закрыть редактор"
            onClick={onClose}
          >
            <Cancel01Icon size={18} />
          </IconButton>
        </div>

        <div className={styles.editorCanvas}>
          <div className={styles.editorCanvasFrame}>
            {imageElement ? (
              <Stage
                width={displayWidth}
                height={displayHeight}
                className={styles.editorStage}
                onPointerDown={handleCanvasPointerDown}
              >
                <Layer>
                  <Group
                    ref={(node) => {
                      groupRef.current = node;
                    }}
                    x={displayWidth / 2}
                    y={displayHeight / 2}
                    offsetX={displayWidth / 2}
                    offsetY={displayHeight / 2}
                  >
                    <KonvaImage image={imageElement} width={displayWidth} height={displayHeight} />

                    {draft.blurAreas.map((blurArea) => {
                      const polygonPoints = getPolygonPoints(blurArea.points, displayWidth, displayHeight);
                      const isSelected =
                        selectedShape?.kind === "blur" && selectedShape.id === blurArea.id;

                      return (
                        <Group
                          key={blurArea.id}
                          draggable
                          onClick={() => setSelectedShape({ kind: "blur", id: blurArea.id })}
                          onTap={() => setSelectedShape({ kind: "blur", id: blurArea.id })}
                          onDragEnd={(event) => {
                            const deltaX = event.target.x() / displayWidth;
                            const deltaY = event.target.y() / displayHeight;
                            event.target.position({ x: 0, y: 0 });

                            setDraft((current) => ({
                              ...current,
                              blurAreas: current.blurAreas.map((area) =>
                                area.id === blurArea.id ? moveBlurArea(area, deltaX, deltaY) : area
                              )
                            }));
                          }}
                        >
                          <Group
                            clipFunc={(context) => {
                              context.beginPath();
                              context.moveTo(polygonPoints[0] ?? 0, polygonPoints[1] ?? 0);

                              for (let index = 2; index < polygonPoints.length; index += 2) {
                                context.lineTo(polygonPoints[index] ?? 0, polygonPoints[index + 1] ?? 0);
                              }

                              context.closePath();
                            }}
                          >
                            <KonvaImage
                              ref={(node) => {
                                if (node) {
                                  blurImageRefs.current[blurArea.id] = node;
                                } else {
                                  delete blurImageRefs.current[blurArea.id];
                                }
                              }}
                              image={imageElement}
                              width={displayWidth}
                              height={displayHeight}
                              filters={[Konva.Filters.Blur]}
                              blurRadius={BLUR_RADIUS}
                              listening={false}
                            />
                          </Group>

                          <Line
                            points={polygonPoints}
                            closed
                            stroke={isSelected ? SELECTION_ACCENT : BLUR_STROKE}
                            strokeWidth={1.5}
                            dash={[6, 4]}
                          />

                          {isSelected
                            ? blurArea.points.map((point, pointIndex) => (
                                <Circle
                                  key={`${blurArea.id}-${pointIndex}`}
                                  x={point.x * displayWidth}
                                  y={point.y * displayHeight}
                                  radius={5}
                                  fill={SELECTION_ACCENT}
                                  stroke="#101214"
                                  strokeWidth={1}
                                  draggable
                                  onDragMove={(event) => {
                                    const nextX = clamp(event.target.x() / displayWidth, 0, 1);
                                    const nextY = clamp(event.target.y() / displayHeight, 0, 1);

                                    setDraft((current) => ({
                                      ...current,
                                      blurAreas: current.blurAreas.map((area) =>
                                        area.id === blurArea.id
                                          ? {
                                              ...area,
                                              points: area.points.map((currentPoint, currentIndex) =>
                                                currentIndex === pointIndex
                                                  ? { x: nextX, y: nextY }
                                                  : currentPoint
                                              ) as PhotoBlurArea["points"]
                                            }
                                          : area
                                      )
                                    }));
                                  }}
                                />
                              ))
                            : null}
                        </Group>
                      );
                    })}

                    {draft.circles.map((circle) => {
                      const isSelected =
                        selectedShape?.kind === "circle" && selectedShape.id === circle.id;

                      return (
                        <Circle
                          key={circle.id}
                          ref={(node) => {
                            circleRefs.current[circle.id] = node;
                          }}
                          x={circle.x * displayWidth}
                          y={circle.y * displayHeight}
                          radius={circle.radius * baseSize}
                          stroke={isSelected ? SELECTION_ACCENT : CIRCLE_STROKE}
                          strokeWidth={2}
                          draggable
                          onClick={() => setSelectedShape({ kind: "circle", id: circle.id })}
                          onTap={() => setSelectedShape({ kind: "circle", id: circle.id })}
                          onDragEnd={(event) => {
                            setDraft((current) => ({
                              ...current,
                              circles: current.circles.map((item) =>
                                item.id === circle.id
                                  ? {
                                      ...item,
                                      x: clamp(event.target.x() / displayWidth, 0, 1),
                                      y: clamp(event.target.y() / displayHeight, 0, 1)
                                    }
                                  : item
                              )
                            }));
                          }}
                          onTransformEnd={() => handleCircleTransformEnd(circle.id)}
                        />
                      );
                    })}

                    {pendingBlurPoints.length > 0 ? (
                      <>
                        <Line
                          points={getPolygonPoints(pendingBlurPoints, displayWidth, displayHeight)}
                          stroke={SELECTION_ACCENT}
                          strokeWidth={2}
                          dash={[6, 4]}
                        />
                        {pendingBlurPoints.map((point, index) => (
                          <Circle
                            key={`pending-${index}`}
                            x={point.x * displayWidth}
                            y={point.y * displayHeight}
                            radius={4}
                            fill={SELECTION_ACCENT}
                          />
                        ))}
                      </>
                    ) : null}

                    <Transformer
                      ref={(node) => {
                        transformerRef.current = node;
                      }}
                      rotateEnabled={false}
                      borderStroke={SELECTION_ACCENT}
                      anchorFill={SELECTION_ACCENT}
                      anchorStroke={SELECTION_ACCENT}
                      anchorSize={8}
                      padding={4}
                    />
                  </Group>
                </Layer>
              </Stage>
            ) : (
              <div className={styles.editorLoading}>Загрузка изображения...</div>
            )}
          </div>
        </div>

        <div className={styles.editorToolbar}>
          <div ref={toolsRef} className={styles.editorActions}>
            <div className={styles.editorPrimaryTools}>
              <IconButton
                aria-label="Повернуть влево"
                title="Повернуть влево"
                onClick={() => setDraft((current) => ({ ...current, rotation: current.rotation - 90 }))}
              >
                <IterationCcwIcon size={18} />
              </IconButton>
              <IconButton
                aria-label="Повернуть вправо"
                title="Повернуть вправо"
                onClick={() => setDraft((current) => ({ ...current, rotation: current.rotation + 90 }))}
              >
                <IterationCwIcon size={18} />
              </IconButton>
              <IconButton
                aria-label="Добавить круг"
                title="Добавить круг"
                className={cn(tool === "circle" && styles.editorToolActive)}
                onClick={() => {
                  setPendingBlurPoints([]);
                  setTool((current) => (current === "circle" ? "select" : "circle"));
                }}
              >
                <DashedLineCircleIcon size={18} />
              </IconButton>
              <IconButton
                aria-label="Блюр по 4 точкам"
                title="Блюр по 4 точкам"
                className={cn(tool === "blur" && styles.editorToolActive)}
                onClick={() => {
                  setPendingBlurPoints([]);
                  setTool((current) => (current === "blur" ? "select" : "blur"));
                }}
              >
                <BackgroundIcon size={18} />
              </IconButton>
            </div>
            <div
              className={cn(
                styles.editorDeleteTool,
                selectedShape !== null && styles.editorDeleteToolVisible
              )}
            >
              <IconButton
                aria-label="Удалить выделение"
                title="Удалить выделение"
                disabled={selectedShape === null}
                onClick={removeSelectedShape}
              >
                <Delete02Icon size={18} />
              </IconButton>
            </div>
          </div>
        </div>

        <div
          className={cn(styles.editorSaveRow, hasDraftChanges && styles.editorSaveRowVisible)}
          style={toolbarWidth ? { width: `${toolbarWidth}px` } : undefined}
        >
          <Button
            className={styles.editorSaveButton}
            variant="primary"
            disabled={!hasDraftChanges || isSaving || !imageElement}
            onClick={handleSave}
          >
            {isSaving ? "Сохранение..." : "Сохранить"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function createStoredPhotos(photos: ReadonlyArray<PhotoItem>) {
  return photos.map(
    (photo): StoredPhotoDropzoneItem<PhotoEditState> => ({
      id: photo.id,
      sourceFile: photo.sourceFile,
      displayBlob: photo.displayBlob,
      edit: photo.edit,
      createdAt: photo.createdAt
    })
  );
}

function revokePhotoUrls(photo: PhotoItem) {
  URL.revokeObjectURL(photo.sourceUrl);

  if (photo.displayUrl !== photo.sourceUrl) {
    URL.revokeObjectURL(photo.displayUrl);
  }
}

function createPhotoFromStoredItem(
  item: StoredPhotoDropzoneItem<PhotoEditState>,
  fallbackCreatedAt = Date.now()
): PhotoItem {
  const sourceUrl = URL.createObjectURL(item.sourceFile);
  const displayUrl = item.displayBlob ? URL.createObjectURL(item.displayBlob) : sourceUrl;

  return {
    id: item.id,
    sourceFile: item.sourceFile,
    displayBlob: item.displayBlob,
    sourceUrl,
    displayUrl,
    edit: item.edit,
    createdAt: item.createdAt ?? fallbackCreatedAt
  };
}

export function PhotoDropzone({ className, storageKey }: Readonly<PhotoDropzoneProps>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepthRef = useRef(0);
  const photosRef = useRef<PhotoItem[]>([]);
  const isDraftLoadedRef = useRef(!storageKey);
  const draftSaveQueueRef = useRef(Promise.resolve());
  const [isDragging, setIsDragging] = useState(false);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [viewerPhotoId, setViewerPhotoId] = useState<string | null>(null);
  const [editorPhotoId, setEditorPhotoId] = useState<string | null>(null);
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
    photosRef.current = photos;
  }, [photos]);

  useEffect(() => {
    return () => {
      photosRef.current.forEach(revokePhotoUrls);
    };
  }, []);

  useEffect(() => {
    if (!storageKey) {
      isDraftLoadedRef.current = true;
      return;
    }

    let isActive = true;
    isDraftLoadedRef.current = false;

    loadPhotoDropzoneDraft<PhotoEditState>(storageKey)
      .then((storedPhotos) => {
        if (!isActive) {
          return;
        }

        setPhotos((current) => {
          current.forEach(revokePhotoUrls);
          return storedPhotos.map((photo) => createPhotoFromStoredItem(photo));
        });
      })
      .catch(() => {
        if (isActive) {
          setPhotos([]);
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

    const storedPhotos = createStoredPhotos(photos);
    draftSaveQueueRef.current = draftSaveQueueRef.current
      .then(() => savePhotoDropzoneDraft(storageKey, storedPhotos))
      .catch(() => {});
  }, [photos, storageKey]);

  useEffect(() => {
    if (viewerPhotoId && !photos.some((photo) => photo.id === viewerPhotoId)) {
      setViewerPhotoId(null);
    }
    if (editorPhotoId && !photos.some((photo) => photo.id === editorPhotoId)) {
      setEditorPhotoId(null);
    }
  }, [editorPhotoId, photos, viewerPhotoId]);

  const appendFiles = (fileList: FileList | null) => {
    if (!fileList) {
      return;
    }

    const nextPhotos = Array.from(fileList)
      .filter(isImageFile)
      .map((file) => {
        const sourceUrl = URL.createObjectURL(file);
        return {
          id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
          sourceFile: file,
          displayBlob: null,
          sourceUrl,
          displayUrl: sourceUrl,
          edit: createEmptyEditState(),
          createdAt: Date.now()
        };
      });

    if (nextPhotos.length === 0) {
      return;
    }

    setPhotos((current) => [...current, ...nextPhotos]);
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

  const handleDragLeave = (event: ReactDragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);

    if (dragDepthRef.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (event: ReactDragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: ReactDragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragDepthRef.current = 0;
    setIsDragging(false);
    appendFiles(event.dataTransfer.files);
  };

  const handleSortEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setPhotos((current) => {
      const oldIndex = current.findIndex((photo) => photo.id === active.id);
      const newIndex = current.findIndex((photo) => photo.id === over.id);

      if (oldIndex < 0 || newIndex < 0) {
        return current;
      }

      return arrayMove(current, oldIndex, newIndex);
    });
  };

  const handleEditSave = (photoId: string, edit: PhotoEditState, displayBlob: Blob) => {
    const displayUrl = URL.createObjectURL(displayBlob);

    setPhotos((current) =>
      current.map((photo) => {
        if (photo.id !== photoId) {
          return photo;
        }

        if (photo.displayUrl !== photo.sourceUrl) {
          URL.revokeObjectURL(photo.displayUrl);
        }

        return { ...photo, displayBlob, displayUrl, edit };
      })
    );
  };

  const handleDeletePhoto = (photoId: string) => {
    setPhotos((current) => {
      const target = current.find((photo) => photo.id === photoId);

      if (target) {
        revokePhotoUrls(target);
      }

      return current.filter((photo) => photo.id !== photoId);
    });
  };

  const viewerIndex = viewerPhotoId ? photos.findIndex((photo) => photo.id === viewerPhotoId) : -1;
  const editingPhoto = editorPhotoId ? photos.find((photo) => photo.id === editorPhotoId) ?? null : null;

  return (
    <>
      <div className={cn(styles.root, className)}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Фотографии автомобиля</h2>
            <p className={styles.description}>
              Добавьте изображения кнопкой или перетащите их в область ниже.
            </p>
          </div>

          <Button variant="outline" onClick={() => inputRef.current?.click()}>
            Добавить фото
          </Button>
        </div>

        <div
          className={cn(
            styles.dropzone,
            photos.length > 0 && styles.dropzoneFilled,
            isDragging && styles.dragging
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            className="sr-only"
            type="file"
            accept="image/*"
            multiple
            onChange={handleInputChange}
          />

          <div className={styles.dropzoneContent}>
            {photos.length === 0 ? (
              <div className={styles.dropzoneBody}>
                <div className={styles.dropzoneTitle}>Перетащите фотографии сюда</div>
                <p className={styles.dropzoneHint}>
                  Или используйте кнопку добавления. Поддерживаются JPG, PNG, WEBP и HEIC.
                </p>
              </div>
            ) : null}

            {photos.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleSortEnd}
              >
                <SortableContext
                  items={photos.map((photo) => photo.id)}
                  strategy={rectSortingStrategy}
                >
                  <div className={styles.grid}>
                    {photos.map((photo, index) => (
                      <SortablePhotoCard
                        key={photo.id}
                        id={photo.id}
                        order={index + 1}
                        previewUrl={photo.displayUrl}
                        onView={() => setViewerPhotoId(photo.id)}
                        onEdit={() => setEditorPhotoId(photo.id)}
                        onDelete={() => handleDeletePhoto(photo.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : null}
          </div>
        </div>
      </div>

      <PhotoViewerModal
        open={viewerIndex >= 0}
        photos={photos}
        currentIndex={Math.max(viewerIndex, 0)}
        onClose={() => setViewerPhotoId(null)}
      />

      <PhotoEditorModal
        open={editingPhoto !== null}
        photo={editingPhoto}
        onClose={() => setEditorPhotoId(null)}
        onSave={handleEditSave}
      />

    </>
  );
}
