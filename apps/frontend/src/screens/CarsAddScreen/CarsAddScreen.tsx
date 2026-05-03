"use client";

import { useEffect, useState } from "react";

import styles from "./CarsAddScreen.module.scss";
import {
  bodyTypeOptions,
  carColorOptions,
  carFormSteps,
  driveTypeOptions,
  fuelTypeOptions,
  identificationNumberVariantOptions,
  mileageUnitVariantOptions,
  powerUnitVariantOptions,
  ptsTypeOptions,
  transmissionOptions
} from "./carsAddFormOptions";
import { Breadcrumbs } from "@/components/Breadcrumbs/Breadcrumbs";
import { ColorInputSelect } from "@/components/ColorInputSelect/ColorInputSelect";
import { DropdownMenu } from "@/components/DropdownMenu/DropdownMenu";
import { Input } from "@/components/Input/Input";
import { InputWithVariant } from "@/components/InputWithVariant/InputWithVariant";
import { MediaFileDropzone } from "@/components/MediaFileDropzone/MediaFileDropzone";
import { PhotoDropzone } from "@/components/PhotoDropzone/PhotoDropzone";
import sectionStyles from "@/components/WorkspaceSection/WorkspaceSection.module.scss";
import { WorkspaceSection } from "@/components/WorkspaceSection/WorkspaceSection";
import { routes } from "@/constants/routes";
import { Tabs } from "@/components/Tabs/Tabs";
import { cn } from "@/lib/cn";
import { PageLayout } from "@/layers/PageLayout/PageLayout";
import { WorkspaceShell } from "@/layers/WorkspaceShell/WorkspaceShell";
import {
  CARS_ADD_DRAFT_SESSION_KEY,
  CARS_ADD_PHOTOS_STORAGE_KEY,
  CARS_ADD_PDF_STORAGE_KEY,
  CARS_ADD_VIDEO_STORAGE_KEY,
  clearCarsAddDraft
} from "@/lib/carsAddDraft";

export function CarsAddScreen() {
  const [activeStep, setActiveStep] = useState<string>(carFormSteps[0].value);
  const [isPhotoDraftReady, setIsPhotoDraftReady] = useState(false);

  useEffect(() => {
    let isActive = true;

    const prepareDraft = async () => {
      const hasActiveDraft = window.sessionStorage.getItem(CARS_ADD_DRAFT_SESSION_KEY) === "1";

      if (!hasActiveDraft) {
        await clearCarsAddDraft();
      }

      window.sessionStorage.setItem(CARS_ADD_DRAFT_SESSION_KEY, "1");

      if (isActive) {
        setIsPhotoDraftReady(true);
      }
    };

    prepareDraft().catch(() => {
      if (isActive) {
        setIsPhotoDraftReady(true);
      }
    });

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <WorkspaceShell>
      <PageLayout
        header={
          <div className={styles.header}>
            <h1 className={styles.pageTitle}>Добавление автомобиля</h1>
            <Tabs
              className={styles.steps}
              options={carFormSteps}
              value={activeStep}
              onValueChange={setActiveStep}
            />
          </div>
        }
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: "Дашборд", href: routes.dashboard },
              { label: "Мои автомобили", href: routes.carsMy },
              { label: "Добавть автомобиль", href: routes.carsAdd, current: true }
            ]}
          />
        }
        contentClassName={cn(sectionStyles.workspaceSections, styles.mediaLayout)}
      >
        {activeStep === "media" && isPhotoDraftReady ? (
          <>
            <WorkspaceSection size="3/5" className={styles.photoSection}>
              <PhotoDropzone className={styles.photoDropzone} storageKey={CARS_ADD_PHOTOS_STORAGE_KEY} />
            </WorkspaceSection>
            <WorkspaceSection size="2/5" className={cn(styles.sideSection, styles.sideSectionTop)}>
              <MediaFileDropzone
                className={styles.sideDropzone}
                title="Документы PDF"
                hint="Загрузите файлы PDF, измените порядок перетаскиванием и удаляйте лишние."
                kind="pdf"
                storageKey={CARS_ADD_PDF_STORAGE_KEY}
              />
            </WorkspaceSection>
            <WorkspaceSection size="2/5" className={cn(styles.sideSection, styles.sideSectionBottom)}>
              <MediaFileDropzone
                className={styles.sideDropzone}
                title="Видео"
                hint="Загрузите видеофайлы, меняйте порядок и удаляйте ненужные."
                kind="video"
                storageKey={CARS_ADD_VIDEO_STORAGE_KEY}
              />
            </WorkspaceSection>
          </>
        ) : null}

        {activeStep === "main" ? (
          <WorkspaceSection size="1" className={styles.mainInfoSection}>
            <div className={styles.mainInfoGrid}>
              <div className={styles.field}>
                <span className={styles.label}>Идентификационный номер</span>
                <InputWithVariant
                  className={styles.control}
                  placeholder="Введите номер"
                  options={identificationNumberVariantOptions}
                  defaultVariantValue="vin"
                />
              </div>

              <div className={styles.field}>
                <span className={styles.label}>Гос номер</span>
                <Input className={styles.control} placeholder="Введите гос номер" />
              </div>

              <div className={styles.field}>
                <span className={styles.label}>Город</span>
                <Input className={styles.control} placeholder="Введите город" />
              </div>

              <div className={styles.field}>
                <span className={styles.label}>Марка</span>
                <Input className={styles.control} placeholder="Введите марку" />
              </div>

              <div className={styles.field}>
                <span className={styles.label}>Модель</span>
                <Input className={styles.control} placeholder="Введите модель" />
              </div>

              <div className={styles.field}>
                <span className={styles.label}>Поколение</span>
                <Input className={styles.control} placeholder="Введите поколение" />
              </div>

              <div className={styles.field}>
                <span className={styles.label}>Модификация</span>
                <Input className={styles.control} placeholder="Введите модификацию" />
              </div>

              <div className={styles.field}>
                <span className={styles.label}>Тип топлива</span>
                <DropdownMenu
                  className={styles.control}
                  fullWidth
                  options={fuelTypeOptions}
                  placeholder="Выберите тип топлива"
                />
              </div>

              <div className={styles.field}>
                <span className={styles.label}>Объем двигателя</span>
                <Input className={styles.control} placeholder="Например: 2.0" />
              </div>

              <div className={styles.field}>
                <span className={styles.label}>Мощность</span>
                <InputWithVariant
                  className={styles.control}
                  placeholder="Введите мощность"
                  options={powerUnitVariantOptions}
                  defaultVariantValue="hp"
                />
              </div>

              <div className={styles.field}>
                <span className={styles.label}>Тип КПП</span>
                <DropdownMenu
                  className={styles.control}
                  fullWidth
                  options={transmissionOptions}
                  placeholder="Выберите тип КПП"
                />
              </div>

              <div className={styles.field}>
                <span className={styles.label}>Привод</span>
                <DropdownMenu
                  className={styles.control}
                  fullWidth
                  options={driveTypeOptions}
                  placeholder="Выберите привод"
                />
              </div>

              <div className={styles.field}>
                <span className={styles.label}>Кузов</span>
                <DropdownMenu
                  className={styles.control}
                  fullWidth
                  options={bodyTypeOptions}
                  placeholder="Выберите кузов"
                />
              </div>

              <div className={styles.field}>
                <span className={styles.label}>Цвет</span>
                <ColorInputSelect className={styles.control} options={carColorOptions} />
              </div>

              <div className={styles.field}>
                <span className={styles.label}>Пробег</span>
                <InputWithVariant
                  className={styles.control}
                  placeholder="Введите пробег"
                  options={mileageUnitVariantOptions}
                  defaultVariantValue="km"
                />
              </div>

              <div className={styles.field}>
                <span className={styles.label}>Количество владельцев</span>
                <Input className={styles.control} type="number" min={0} placeholder="Введите количество" />
              </div>

              <div className={styles.field}>
                <span className={styles.label}>Тип ПТС</span>
                <DropdownMenu className={styles.control} fullWidth options={ptsTypeOptions} placeholder="Выберите тип ПТС" />
              </div>
            </div>
          </WorkspaceSection>
        ) : null}
      </PageLayout>
    </WorkspaceShell>
  );
}
