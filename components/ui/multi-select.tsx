"use client";

import * as React from "react";
import { CheckIcon, ChevronDown, XIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type MultiSelectOption = {
  value: string;
  label: string;
};

type MultiSelectProps = {
  options: MultiSelectOption[];
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyIndicator?: string;
  disabled?: boolean;
  className?: string;
};

// Basado en el componente de sersavan/shadcn-multi-select-component.
export function MultiSelect({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = "Seleccionar opciones",
  searchPlaceholder = "Buscar...",
  emptyIndicator = "Sin resultados.",
  disabled = false,
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState<string[]>(() => defaultValue ?? []);
  const selected = value ?? internalValue;

  const areValuesEqual = React.useCallback((a: string[], b: string[]) => {
    if (a.length !== b.length) {
      return false;
    }

    return a.every((valueItem, index) => valueItem === b[index]);
  }, []);

  React.useEffect(() => {
    if (value !== undefined) {
      return;
    }

    const nextDefaultValue = defaultValue ?? [];
    setInternalValue((currentValue) =>
      areValuesEqual(currentValue, nextDefaultValue) ? currentValue : nextDefaultValue,
    );
  }, [areValuesEqual, defaultValue, value]);

  function updateValue(next: string[]) {
    if (value === undefined) {
      setInternalValue(next);
    }

    onValueChange?.(next);
  }

  function toggleValue(optionValue: string) {
    const next = selected.includes(optionValue)
      ? selected.filter((item) => item !== optionValue)
      : [...selected, optionValue];

    updateValue(next);
  }

  function removeValue(optionValue: string) {
    updateValue(selected.filter((item) => item !== optionValue));
  }

  function clearAll() {
    updateValue([]);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "h-auto min-h-9 w-full justify-between px-3 py-2 text-left font-normal",
            className,
          )}
          disabled={disabled}
        >
          <span className="flex min-h-5 flex-1 flex-wrap gap-1">
            {selected.length === 0 ? (
              <span className="text-sm text-muted-foreground">{placeholder}</span>
            ) : (
              selected.map((selectedValue) => {
                const option = options.find((item) => item.value === selectedValue);
                const label = option?.label ?? selectedValue;

                return (
                  <Badge
                    key={selectedValue}
                    variant="secondary"
                    className="flex items-center gap-1 rounded-md px-2 py-0.5"
                  >
                    <span className="text-xs">{label}</span>
                    <button
                      type="button"
                      className="rounded-sm p-0.5 hover:bg-muted"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        removeValue(selectedValue);
                      }}
                      aria-label={`Quitar ${label}`}
                    >
                      <XIcon className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })
            )}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyIndicator}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selected.includes(option.value);

                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => toggleValue(option.value)}
                  >
                    <CheckIcon
                      className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")}
                    />
                    {option.label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
          {selected.length > 0 ? (
            <div className="border-t border-border p-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full justify-center"
                onClick={clearAll}
              >
                Limpiar selección
              </Button>
            </div>
          ) : null}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
