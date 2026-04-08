"use client";

import type { KeyboardEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { ArrowDown01Icon, Cancel01Icon, Tick01Icon } from "hugeicons-react";

import styles from "./DropdownMenu.module.scss";
import { Dropdown } from "@/components/Dropdown/Dropdown";
import { cn } from "@/lib/cn";

export type DropdownMenuOption = {
  value: string;
  label: string;
  keywords?: string[];
  disabled?: boolean;
};

type DropdownMenuProps = {
  options: DropdownMenuOption[];
  placeholder?: string;
  emptyText?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  panelClassName?: string;
};

type SingleDropdownMenuProps = DropdownMenuProps & {
  multiple?: false;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

type MultipleDropdownMenuProps = DropdownMenuProps & {
  multiple: true;
  values?: string[];
  defaultValues?: string[];
  onValuesChange?: (values: string[]) => void;
};

type Props = SingleDropdownMenuProps | MultipleDropdownMenuProps;

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

export function DropdownMenu(props: Readonly<Props>) {
  const {
    options,
    placeholder = "Начните вводить",
    emptyText = "Ничего не найдено",
    disabled = false,
    fullWidth = false,
    className,
    panelClassName
  } = props;
  const multiple = props.multiple === true;
  const value = !multiple ? props.value : undefined;
  const defaultValue = !multiple ? props.defaultValue : undefined;
  const values = multiple ? props.values : undefined;
  const defaultValues = multiple ? props.defaultValues : undefined;
  const onValueChange = !multiple ? props.onValueChange : undefined;
  const onValuesChange = multiple ? props.onValuesChange : undefined;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const [uncontrolledValues, setUncontrolledValues] = useState(defaultValues ?? []);

  const selectedValue = value ?? uncontrolledValue;
  const selectedValues = values ?? uncontrolledValues;
  const selectedOption = options.find((option) => option.value === selectedValue);
  const selectedOptions = options.filter((option) => selectedValues.includes(option.value));

  const filteredOptions = useMemo(() => {
    const normalizedQuery = normalizeText(query);

    if (normalizedQuery.length === 0) {
      return options;
    }

    return options.filter((option) => {
      const searchableText = [option.label, option.value, ...(option.keywords ?? [])]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [options, query]);

  useEffect(() => {
    if (highlightedIndex > filteredOptions.length - 1) {
      setHighlightedIndex(0);
    }
  }, [filteredOptions.length, highlightedIndex]);

  const currentLabel = multiple
    ? selectedOptions.map((option) => option.label).join(", ")
    : (selectedOption?.label ?? "");
  const inputValue = open ? query : currentLabel;

  const commitValue = (nextValue: string) => {
    if (multiple) {
      const nextValues = selectedValues.includes(nextValue)
        ? selectedValues.filter((currentValue: string) => currentValue !== nextValue)
        : [...selectedValues, nextValue];

      if (values === undefined) {
        setUncontrolledValues(nextValues);
      }

      setQuery("");
      onValuesChange?.(nextValues);

      return;
    }

    if (value === undefined) {
      setUncontrolledValue(nextValue);
    }

    setQuery("");
    setOpen(false);
    onValueChange?.(nextValue);
  };

  const handleInputFocus = () => {
    if (disabled) {
      return;
    }

    setOpen(true);
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
      const highlightedOption = filteredOptions[highlightedIndex];

      if (!highlightedOption || highlightedOption.disabled) {
        return;
      }

      event.preventDefault();
      commitValue(highlightedOption.value);
    }

    if (event.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  };

  return (
    <Dropdown
      className={cn(styles.dropdownMenu, fullWidth && styles.fullWidth, className)}
      triggerClassName={styles.trigger}
      panelClassName={cn(styles.panel, panelClassName)}
      trigger={
        <div className={cn(styles.field, disabled && styles.disabled, open && styles.open)}>
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
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
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
    >
      <div
        className={styles.listWrap}
        role="listbox"
        aria-label="Список значений"
        aria-multiselectable={multiple || undefined}
      >
        {multiple && selectedOptions.length > 0 ? (
          <div className={styles.tags}>
            {selectedOptions.map((option) => (
              <button
                key={option.value}
                className={styles.tag}
                type="button"
                onClick={() => commitValue(option.value)}
              >
                <span>{option.label}</span>
                <span className={styles.tagIcon} aria-hidden="true">
                  <Cancel01Icon size={12} />
                </span>
              </button>
            ))}
          </div>
        ) : null}

        <div className={styles.list}>
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => {
              const selected = multiple
                ? selectedValues.includes(option.value)
                : option.value === selectedValue;

              return (
                <button
                  key={option.value}
                  className={cn(
                    styles.option,
                    selected && styles.selected,
                    index === highlightedIndex && styles.highlighted
                  )}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  disabled={option.disabled}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onClick={() => commitValue(option.value)}
                >
                  <span className={styles.optionLabel}>{option.label}</span>
                  {selected ? (
                    <span className={styles.optionIcon} aria-hidden="true">
                      <Tick01Icon size={14} />
                    </span>
                  ) : null}
                </button>
              );
            })
          ) : (
            <div className={styles.empty}>{emptyText}</div>
          )}
        </div>
      </div>
    </Dropdown>
  );
}
