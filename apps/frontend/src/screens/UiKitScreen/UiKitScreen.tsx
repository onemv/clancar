"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import {
  DashboardSquare01Icon,
  Home01Icon,
  Menu02Icon,
  Notification02Icon
} from "hugeicons-react";

import styles from "./UiKitScreen.module.scss";
import { BrandMark } from "@/components/BrandMark/BrandMark";
import { Breadcrumbs } from "@/components/Breadcrumbs/Breadcrumbs";
import { Button } from "@/components/Button/Button";
import { Dropdown } from "@/components/Dropdown/Dropdown";
import { DropdownMenu } from "@/components/DropdownMenu/DropdownMenu";
import { IconButton } from "@/components/IconButton/IconButton";
import { Input } from "@/components/Input/Input";
import { NavItem } from "@/components/NavItem/NavItem";
import { Tabs } from "@/components/Tabs/Tabs";
import { ThemeSwitch } from "@/components/ThemeSwitch/ThemeSwitch";
import { UserBadge } from "@/components/UserBadge/UserBadge";
import sectionStyles from "@/components/WorkspaceSection/WorkspaceSection.module.scss";
import { WorkspaceSection } from "@/components/WorkspaceSection/WorkspaceSection";
import { routes } from "@/constants/routes";
import { PageLayout } from "@/layers/PageLayout/PageLayout";
import { WorkspaceShell } from "@/layers/WorkspaceShell/WorkspaceShell";
import { cn } from "@/lib/cn";
import { useSidebarStore } from "@/store/sidebar/sidebar.store";
import { useThemeStore } from "@/store/theme/theme.store";
import type { ThemeId } from "@/theme/types";

type GroupProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  size?: "1" | "1/2" | "1/3" | "1/4" | "1/5" | "2/3" | "3/4" | "2/5" | "3/5" | "4/5";
};

type DemoCardProps = {
  title: string;
  hint?: string;
  children: ReactNode;
  className?: string;
};

type ToggleChipProps = {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
};

type WorkspaceDemoSize =
  | "1"
  | "1/2"
  | "1/3"
  | "1/4"
  | "1/5"
  | "2/3"
  | "3/4"
  | "2/5"
  | "3/5"
  | "4/5";

function Group({ title, description, children, className, size = "1" }: Readonly<GroupProps>) {
  return (
    <WorkspaceSection className={cn(styles.group, className)} size={size}>
      <div className={styles.groupHeader}>
        <div className={styles.groupTitle}>{title}</div>
        {description ? <p className={styles.groupDescription}>{description}</p> : null}
      </div>
      <div className={styles.groupBody}>{children}</div>
    </WorkspaceSection>
  );
}

function DemoCard({ title, hint, children, className }: Readonly<DemoCardProps>) {
  return (
    <div className={cn(styles.demoCard, className)}>
      <div className={styles.demoCardHeader}>
        <div className={styles.demoCardTitle}>{title}</div>
        {hint ? <p className={styles.demoCardHint}>{hint}</p> : null}
      </div>
      <div className={styles.demoCardBody}>{children}</div>
    </div>
  );
}

function ToggleChip({ active, children, onClick }: Readonly<ToggleChipProps>) {
  return (
    <button
      className={cn(styles.toggleChip, active && styles.toggleChipActive)}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function UiKitScreen() {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const collapsed = useSidebarStore((state) => state.collapsed);
  const setCollapsed = useSidebarStore((state) => state.setCollapsed);
  const [dynamicSectionSize, setDynamicSectionSize] = useState<WorkspaceDemoSize>("1/2");
  const [activeCarStep, setActiveCarStep] = useState("media");

  const statusOptions = [
    { value: "new", label: "Новый лот" },
    { value: "inspection", label: "Проверка", keywords: ["осмотр", "диагностика"] },
    { value: "auction", label: "Аукцион", keywords: ["торги", "ставки"] },
    { value: "sold", label: "Продан", keywords: ["закрыт", "завершен"] }
  ];
  const sectionSizeOptions = [
    { value: "1", label: "1 (вся ширина)" },
    { value: "1/2", label: "1/2" },
    { value: "1/3", label: "1/3" },
    { value: "1/4", label: "1/4" },
    { value: "1/5", label: "1/5" },
    { value: "2/3", label: "2/3" },
    { value: "3/4", label: "3/4" },
    { value: "2/5", label: "2/5" },
    { value: "3/5", label: "3/5" },
    { value: "4/5", label: "4/5" }
  ];
  const carFormSteps = [
    { value: "media", label: "Медиа" },
    { value: "main", label: "Основная информация" },
    { value: "equipment", label: "Комплектация" },
    { value: "damages", label: "Повреждения" }
  ];

  return (
    <WorkspaceShell>
      <PageLayout
        header={
          <>
            <span className={styles.kicker}>UI Kit</span>
            <h1 className={styles.title}>Коллекция компонентов</h1>
            <p className={styles.description}>
              Экран собран по сценариям использования: сначала управление состоянием интерфейса,
              затем поля, действия и элементы оболочки.
            </p>
          </>
        }
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: "Дашборд", href: routes.dashboard },
              { label: "UI Kit", href: routes.uiKit, current: true }
            ]}
          />
        }
        contentClassName={cn(sectionStyles.workspaceSections, styles.layout)}
      >
        <Group
          title="Состояние интерфейса"
          description="Быстрые переключатели для проверки темы и поведения shell."
          size="1"
        >
          <div className={styles.controlsPanel}>
            <div className={styles.controlSection}>
              <div className={styles.controlTitle}>Тема</div>
              <div className={styles.row}>
                {(["dark", "light"] as ThemeId[]).map((themeId) => (
                  <ToggleChip
                    key={themeId}
                    active={theme === themeId}
                    onClick={() => setTheme(themeId)}
                  >
                    {themeId}
                  </ToggleChip>
                ))}
              </div>
            </div>

            <div className={styles.controlSection}>
              <div className={styles.controlTitle}>Sidebar</div>
              <div className={styles.row}>
                <ToggleChip active={!collapsed} onClick={() => setCollapsed(false)}>
                  expanded
                </ToggleChip>
                <ToggleChip active={collapsed} onClick={() => setCollapsed(true)}>
                  collapsed
                </ToggleChip>
              </div>
            </div>

            <div className={styles.controlMeta}>
              <span className={styles.metaLabel}>Активный режим</span>
              <span className={styles.metaValue}>
                {theme} / {collapsed ? "collapsed" : "expanded"}
              </span>
            </div>
          </div>
        </Group>

        <Group
          title="Поля и выбор"
          description="Базовые элементы для форм, фильтров и операционных действий."
          size="1"
        >
          <div className={styles.controlsGrid}>
            <DemoCard title="Обычное поле" hint="Текстовый ввод">
              <Input variant="classic" placeholder="classic" />
            </DemoCard>

            <DemoCard title="Пароль" hint="Ввод с переключением видимости">
              <Input variant="password" placeholder="password" defaultValue="auction-2026" />
            </DemoCard>

            <DemoCard title="Dropdown" hint="Один выбор с поиском">
              <DropdownMenu
                fullWidth
                options={statusOptions}
                placeholder="Выберите статус"
                defaultValue="inspection"
              />
            </DemoCard>

            <DemoCard title="Multi dropdown" hint="Множественный выбор с тегами">
              <DropdownMenu
                multiple
                fullWidth
                options={statusOptions}
                placeholder="Выберите статусы"
                defaultValues={["inspection", "auction"]}
              />
            </DemoCard>

            <DemoCard title="Tabs" hint="Свободное переключение между этапами формы">
              <div className={styles.tabsPreview}>
                <Tabs
                  options={carFormSteps}
                  value={activeCarStep}
                  onValueChange={setActiveCarStep}
                />
                <p className={styles.tabsMeta}>Активный этап: {activeCarStep}</p>
              </div>
            </DemoCard>
          </div>
        </Group>

        <Group
          title="Действия"
          description="Кнопки и action-элементы, которые обычно запускают сценарии."
          size="2/5"
        >
          <div className={styles.stack}>
            <DemoCard title="Кнопки" hint="Основные варианты действий">
              <div className={styles.buttonRow}>
                <Button variant="primary">primary</Button>
                <Button variant="danger">danger</Button>
                <Button variant="outline">outline</Button>
                <Button variant="shadow">shadow</Button>
                <Button variant="unactive">unactive</Button>
              </div>
            </DemoCard>

            <DemoCard title="Action dropdown" hint="Локальное меню быстрых действий">
              <Dropdown
                trigger={<div className={styles.dropdownTrigger}>Действия</div>}
                panelWidth="trigger"
              >
                <div className={styles.dropdownMenu}>
                  <button className={styles.dropdownItem} type="button">
                    Открыть карточку
                  </button>
                  <button className={styles.dropdownItem} type="button">
                    Дублировать запись
                  </button>
                  <button className={styles.dropdownItem} type="button">
                    Переместить в архив
                  </button>
                </div>
              </Dropdown>
            </DemoCard>
          </div>
        </Group>

        <Group
          title="Элементы оболочки"
          description="Компоненты, которые живут в header, toolbar и пользовательском блоке."
          size="3/5"
        >
          <div className={styles.stack}>
            <DemoCard title="Identity" hint="Бренд, переключатель темы и блок пользователя">
              <div className={styles.inline}>
                <BrandMark />
                <ThemeSwitch />
                <UserBadge />
              </div>
            </DemoCard>

            <DemoCard title="Icon actions" hint="Компактные иконки для header и toolbar">
              <div className={styles.inline}>
                <IconButton aria-label="Меню" onClick={() => undefined}>
                  <Menu02Icon size={20} />
                </IconButton>
                <IconButton aria-label="Домой" onClick={() => undefined}>
                  <Home01Icon size={20} />
                </IconButton>
                <IconButton aria-label="Уведомления" onClick={() => undefined}>
                  <Notification02Icon size={20} />
                </IconButton>
              </div>
            </DemoCard>
          </div>
        </Group>

        <Group
          title="Сетка секций workspace"
          description="Один блок меняет ширину в 5-колоночной сетке через готовый DropdownMenu."
          size="1"
        >
          <div className={styles.workspaceSizeControl}>
            <DropdownMenu
              options={sectionSizeOptions}
              value={String(dynamicSectionSize)}
              onValueChange={(value) => {
                const allowedSizes: WorkspaceDemoSize[] = [
                  "1",
                  "1/2",
                  "1/3",
                  "1/4",
                  "1/5",
                  "2/3",
                  "3/4",
                  "2/5",
                  "3/5",
                  "4/5"
                ];

                if (allowedSizes.includes(value as WorkspaceDemoSize)) {
                  setDynamicSectionSize(value as WorkspaceDemoSize);
                }
              }}
            />
          </div>

          <div className={cn(sectionStyles.workspaceSections, styles.workspaceDemoGrid)}>
            <WorkspaceSection className={styles.workspaceDemoCard} size={dynamicSectionSize}>
              <div className={styles.workspaceDemoTitle}>Динамический блок</div>
              <p className={styles.workspaceDemoText}>Текущий размер: {dynamicSectionSize}</p>
            </WorkspaceSection>

            <WorkspaceSection className={styles.workspaceDemoCard} size="1/5">
              <div className={styles.workspaceDemoTitle}>Статичный блок</div>
              <p className={styles.workspaceDemoText}>1/5</p>
            </WorkspaceSection>

            <WorkspaceSection className={styles.workspaceDemoCard} size="2/5">
              <div className={styles.workspaceDemoTitle}>Статичный блок</div>
              <p className={styles.workspaceDemoText}>2/5</p>
            </WorkspaceSection>

            <WorkspaceSection className={styles.workspaceDemoCard} size="2/5">
              <div className={styles.workspaceDemoTitle}>Статичный блок</div>
              <p className={styles.workspaceDemoText}>2/5</p>
            </WorkspaceSection>
          </div>
        </Group>

        <Group
          title="Навигационный элемент"
          description="Базовое состояние пункта меню в обычном и свернутом shell."
          size="1"
        >
          <div className={styles.navGrid}>
            <div className={styles.navPreview}>
              <NavItem
                href="/dashboard"
                label="Dashboard"
                icon={<DashboardSquare01Icon size={18} />}
              />
            </div>
            <div className={styles.navPreview}>
              <NavItem
                href="/dashboard"
                label="Dashboard"
                icon={<DashboardSquare01Icon size={18} />}
                active
              />
            </div>
            <div className={cn(styles.navPreview, styles.navPreviewCollapsed)}>
              <NavItem
                href="/dashboard"
                label="Dashboard"
                icon={<DashboardSquare01Icon size={18} />}
                collapsed
              />
            </div>
            <div className={cn(styles.navPreview, styles.navPreviewCollapsed)}>
              <NavItem
                href="/dashboard"
                label="Dashboard"
                icon={<DashboardSquare01Icon size={18} />}
                active
                collapsed
              />
            </div>
          </div>
        </Group>
      </PageLayout>
    </WorkspaceShell>
  );
}
