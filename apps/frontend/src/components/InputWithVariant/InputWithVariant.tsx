"use client";

import type { InputHTMLAttributes } from "react";
import { useMemo, useState } from "react";
import { ArrowDown01Icon, Tick01Icon } from "hugeicons-react";

import styles from "./InputWithVariant.module.scss";
import { Dropdown } from "@/components/Dropdown/Dropdown";
import { cn } from "@/lib/cn";

export type InputWithVariantOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type InputWithVariantProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  className?: string;
  options: ReadonlyArray<InputWithVariantOption>;
  variantValue?: string;
  defaultVariantValue?: string;
  onVariantValueChange?: (value: string) => void;
};

export function InputWithVariant({
  className,
  options,
  variantValue,
  defaultVariantValue,
  onVariantValueChange,
  disabled,
  ...inputProps
}: Readonly<InputWithVariantProps>) {
  const [open, setOpen] = useState(false);
  const [uncontrolledVariantValue, setUncontrolledVariantValue] = useState(defaultVariantValue);

  const selectedVariantValue = variantValue ?? uncontrolledVariantValue ?? options[0]?.value;

  const selectedVariant = useMemo(
    () => options.find((option) => option.value === selectedVariantValue) ?? options[0],
    [options, selectedVariantValue]
  );

  const commitVariant = (nextVariantValue: string) => {
    if (variantValue === undefined) {
      setUncontrolledVariantValue(nextVariantValue);
    }

    onVariantValueChange?.(nextVariantValue);
    setOpen(false);
  };

  return (
    <div className={cn(styles.field, disabled && styles.disabled, className)}>
      <input className={styles.input} disabled={disabled} {...inputProps} />

      <Dropdown
        className={styles.selectorDropdown}
        triggerClassName={styles.selectorTrigger}
        panelClassName={styles.panel}
        trigger={
          <div className={styles.selector} aria-hidden="true">
            <span className={styles.selectorLabel}>{selectedVariant?.label ?? ""}</span>
            <span className={styles.selectorIcon}>
              <ArrowDown01Icon size={16} />
            </span>
          </div>
        }
        open={open}
        disabled={disabled}
        onOpenChange={setOpen}
        panelWidth="trigger"
        align="right"
      >
        <div className={styles.list} role="listbox" aria-label="Вариация значения">
          {options.map((option) => {
            const selected = option.value === selectedVariant?.value;

            return (
              <button
                key={option.value}
                className={cn(styles.option, selected && styles.selected)}
                type="button"
                role="option"
                aria-selected={selected}
                disabled={option.disabled}
                onClick={() => commitVariant(option.value)}
              >
                <span className={styles.optionLabel}>{option.label}</span>
                {selected ? (
                  <span className={styles.optionIcon} aria-hidden="true">
                    <Tick01Icon size={14} />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </Dropdown>
    </div>
  );
}
