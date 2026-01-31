"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";

export interface SimpleComboboxOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

interface SimpleComboboxProps {
  options: SimpleComboboxOption[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
  allowCustomValue?: boolean;
  onSearch?: (query: string) => Promise<SimpleComboboxOption[]>;
  debounceMs?: number;
  minSearchLength?: number;
  loadingText?: string;
  renderValue?: (option: SimpleComboboxOption | undefined, value: string) => React.ReactNode;
}

export function SimpleCombobox({
  options,
  value,
  onValueChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  disabled = false,
  className,
  allowCustomValue = false,
  onSearch,
  debounceMs = 300,
  minSearchLength = 1,
  loadingText = "Searching...",
  renderValue,
}: SimpleComboboxProps) {
  const [inputValue, setInputValue] = React.useState("");
  const [asyncOptions, setAsyncOptions] = React.useState<SimpleComboboxOption[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);

  const debouncedSearch = useDebounce(inputValue, debounceMs);
  const isAsyncMode = !!onSearch;

  React.useEffect(() => {
    if (!onSearch || debouncedSearch.length < minSearchLength) {
      setAsyncOptions([]);
      return;
    }

    let cancelled = false;
    setIsSearching(true);

    onSearch(debouncedSearch)
      .then((results) => {
        if (!cancelled) {
          setAsyncOptions(results);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsSearching(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, onSearch, minSearchLength]);

  const effectiveOptions = isAsyncMode ? asyncOptions : options;

  // Filter options based on input (for non-async mode)
  const filteredOptions = React.useMemo(() => {
    if (isAsyncMode) return effectiveOptions;
    if (!inputValue) return options;
    const searchLower = inputValue.toLowerCase();
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(searchLower) ||
        option.description?.toLowerCase().includes(searchLower)
    );
  }, [options, inputValue, isAsyncMode, effectiveOptions]);

  const selectedOption = options.find((opt) => opt.value === value)
    || effectiveOptions.find((opt) => opt.value === value);

  const handleValueChange = (newValue: string | null) => {
    onValueChange(newValue ?? "");
  };

  // searchPlaceholder kept for API compatibility
  void searchPlaceholder;

  // Compute the display placeholder
  const displayPlaceholder = React.useMemo(() => {
    if (renderValue && value) {
      const rendered = renderValue(selectedOption, value);
      // If renderValue returns a string, use it; otherwise fall back to label
      if (typeof rendered === "string") {
        return rendered;
      }
    }
    return selectedOption?.label || placeholder;
  }, [renderValue, value, selectedOption, placeholder]);

  return (
    <Combobox
      value={value || null}
      onValueChange={handleValueChange}
      inputValue={inputValue}
      onInputValueChange={setInputValue}
      disabled={disabled}
    >
      <ComboboxInput
        placeholder={displayPlaceholder}
        className={cn(
          "w-full",
          value && "[&_input::placeholder]:text-foreground",
          className
        )}
        showClear={!!value}
      />
      <ComboboxContent>
        {isSearching ? (
          <div className="flex items-center justify-center py-6 px-2">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">{loadingText}</span>
          </div>
        ) : (
          <>
            <ComboboxEmpty>
              {allowCustomValue && inputValue ? (
                <button
                  type="button"
                  className="w-full px-2 py-1.5 text-sm text-left hover:bg-accent rounded"
                  onClick={() => {
                    onValueChange(inputValue);
                    setInputValue("");
                  }}
                >
                  Add &quot;{inputValue}&quot;
                </button>
              ) : (
                emptyText
              )}
            </ComboboxEmpty>
            <ComboboxList>
              {filteredOptions.map((option) => (
                <ComboboxItem key={option.value} value={option.value}>
                  {option.icon && (
                    <span className="mr-2 shrink-0">{option.icon}</span>
                  )}
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="truncate">{option.label}</span>
                    {option.description && (
                      <span className="text-xs text-muted-foreground truncate">
                        {option.description}
                      </span>
                    )}
                  </div>
                  {option.badge && (
                    <span className="ml-2 shrink-0">{option.badge}</span>
                  )}
                </ComboboxItem>
              ))}
            </ComboboxList>
          </>
        )}
      </ComboboxContent>
    </Combobox>
  );
}
