"use client";

import type { CSSProperties, KeyboardEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { ArrowDown01Icon, Tick01Icon } from "hugeicons-react";

import styles from "./ColorInputSelect.module.scss";
import { Dropdown } from "@/components/Dropdown/Dropdown";
import { cn } from "@/lib/cn";

export type ColorInputSelectOption = {
  value: string;
  label: string;
  gradient: string;
  keywords?: string[];
};

type ColorInputSelectProps = {
  className?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  options: ReadonlyArray<ColorInputSelectOption>;
  onValueChange?: (value: string) => void;
};

const DEFAULT_CUSTOM_SWATCH = "linear-gradient(135deg, #ff5f6d 0%, #ffc371 25%, #7be495 55%, #4da6ff 80%, #b47cff 100%)";

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

export function ColorInputSelect({
  className,
  value,
  defaultValue,
  placeholder = "Выберите или введите цвет",
  disabled = false,
  options,
  onValueChange
}: Readonly<ColorInputSelectProps>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? "");

  const selectedValue = value ?? uncontrolledValue;
  const selectedNormalized = normalizeText(selectedValue);

  const selectedOption = useMemo(
    () =>
      options.find((option) => {
        const optionValue = normalizeText(option.value);
        const optionLabel = normalizeText(option.label);
        return selectedNormalized === optionValue || selectedNormalized === optionLabel;
      }) ?? null,
    [options, selectedNormalized]
  );

  const filteredOptions = useMemo(() => {
    const normalizedQuery = normalizeText(query);

    if (!normalizedQuery) {
      return options;
    }

    return options.filter((option) => {
      const searchableText = [option.label, option.value, ...(option.keywords ?? [])].join(" ").toLowerCase();
      return searchableText.includes(normalizedQuery);
    });
  }, [options, query]);

  useEffect(() => {
    if (highlightedIndex > filteredOptions.length - 1) {
      setHighlightedIndex(0);
    }
  }, [filteredOptions.length, highlightedIndex]);

  const inputValue = open ? query : selectedValue;
  const hasCustomQuery = query.trim().length > 0 && !options.some((option) => normalizeText(option.label) === normalizeText(query));
  const selectedSwatchGradient = selectedOption?.gradient ?? (selectedValue ? DEFAULT_CUSTOM_SWATCH : "transparent");

  const commitValue = (nextValue: string) => {
    if (value === undefined) {
      setUncontrolledValue(nextValue);
    }

    onValueChange?.(nextValue);
  };

  const commitOption = (option: ColorInputSelectOption) => {
    commitValue(option.label);
    setQuery("");
    setOpen(false);
  };

  const commitCustomQuery = () => {
    const customValue = query.trim();

    if (!customValue) {
      return;
    }

    commitValue(customValue);
    setQuery("");
  };

  const handleInputFocus = () => {
    if (disabled) {
      return;
    }

    setOpen(true);
    setQuery(selectedValue);
  };

  const handleInputChange = (nextValue: string) => {
    setQuery(nextValue);
    setOpen(true);
    commitValue(nextValue);
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!open && (event.key === "ArrowDown" || event.key === "Enter")) {
      event.preventDefault();
      setOpen(true);
      return;
    }

    if (!open) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((current) => {
        if (filteredOptions.length === 0) {
          return 0;
        }

        return current >= filteredOptions.length - 1 ? 0 : current + 1;
      });
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((current) => {
        if (filteredOptions.length === 0) {
          return 0;
        }

        return current <= 0 ? filteredOptions.length - 1 : current - 1;
      });
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const highlightedOption = filteredOptions[highlightedIndex];

      if (highlightedOption) {
        commitOption(highlightedOption);
        return;
      }

      commitCustomQuery();
      setOpen(false);
    }

    if (event.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  };

  return (
    <Dropdown
      className={cn(styles.colorInputSelect, className)}
      triggerClassName={styles.trigger}
      panelClassName={styles.panel}
      trigger={
        <div className={cn(styles.field, disabled && styles.disabled, open && styles.open)}>
          <span className={styles.swatch} style={{ "--swatch-gradient": selectedSwatchGradient } as CSSProperties} />
          <input
            className={styles.input}
            value={inputValue}
            placeholder={placeholder}
            disabled={disabled}
            onFocus={handleInputFocus}
            onClick={(event) => {
              event.stopPropagation();
              handleInputFocus();
            }}
            onChange={(event) => handleInputChange(event.target.value)}
            onKeyDown={handleInputKeyDown}
          />
          <span className={styles.icon} aria-hidden="true">
            <ArrowDown01Icon size={16} />
          </span>
        </div>
      }
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);

        if (!nextOpen) {
          setQuery("");
        }
      }}
      panelWidth="trigger"
      align="left"
      disabled={disabled}
    >
      <div className={styles.list} role="listbox" aria-label="Список цветов">
        {filteredOptions.length > 0 ? (
          filteredOptions.map((option, index) => {
            const selected = selectedOption?.value === option.value;

            return (
              <button
                key={option.value}
                className={cn(styles.option, selected && styles.selected, index === highlightedIndex && styles.highlighted)}
                type="button"
                role="option"
                aria-selected={selected}
                onMouseEnter={() => setHighlightedIndex(index)}
                onClick={() => commitOption(option)}
              >
                <span className={styles.optionMain}>
                  <span
                    className={styles.swatch}
                    style={{ "--swatch-gradient": option.gradient } as CSSProperties}
                  />
                  <span className={styles.optionLabel}>{option.label}</span>
                </span>
                {selected ? (
                  <span className={styles.optionIcon} aria-hidden="true">
                    <Tick01Icon size={14} />
                  </span>
                ) : null}
              </button>
            );
          })
        ) : (
          <div className={styles.empty}>Ничего не найдено</div>
        )}

        {hasCustomQuery ? (
          <div className={styles.customHint}>
            Будет использован ваш цвет: <span>{query.trim()}</span>
          </div>
        ) : null}
      </div>
    </Dropdown>
  );
}
