"use client";

import { clearPhotoDropzoneDraft } from "@/components/PhotoDropzone/photoDropzoneStorage";

export const CARS_ADD_DRAFT_SESSION_KEY = "clancar:cars:add:draft-active";
export const CARS_ADD_PHOTOS_STORAGE_KEY = "clancar:cars:add:photos";
export const CARS_ADD_PDF_STORAGE_KEY = "clancar:cars:add:pdf";
export const CARS_ADD_VIDEO_STORAGE_KEY = "clancar:cars:add:video";

export async function clearCarsAddDraft() {
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(CARS_ADD_DRAFT_SESSION_KEY);
  }

  await clearPhotoDropzoneDraft(CARS_ADD_PHOTOS_STORAGE_KEY);
  await clearPhotoDropzoneDraft(CARS_ADD_PDF_STORAGE_KEY);
  await clearPhotoDropzoneDraft(CARS_ADD_VIDEO_STORAGE_KEY);
}
