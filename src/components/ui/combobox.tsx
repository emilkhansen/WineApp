"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "cmdk";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface ComboboxOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
  allowCustomValue?: boolean;
  renderValue?: (option: ComboboxOption | undefined, value: string) => React.ReactNode;
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  disabled = false,
  className,
  allowCustomValue = false,
  renderValue,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const selectedOption = options.find((option) => option.value === value);
  const displayValue = selectedOption?.label || value || "";

  const filteredOptions = React.useMemo(() => {
    if (!search) return options;
    const searchLower = search.toLowerCase();
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(searchLower) ||
        option.description?.toLowerCase().includes(searchLower)
    );
  }, [options, search]);

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue === value ? "" : selectedValue);
    setOpen(false);
    setSearch("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (allowCustomValue && e.key === "Enter" && search && filteredOptions.length === 0) {
      e.preventDefault();
      onValueChange(search);
      setOpen(false);
      setSearch("");
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal",
            !displayValue && !renderValue && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <span className="truncate">
            {renderValue
              ? renderValue(selectedOption, value || "")
              : (displayValue || placeholder)}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false} className="border-none">
          <CommandInput
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={setSearch}
            onKeyDown={handleKeyDown}
            className="h-9"
          />
          <CommandList>
            <CommandEmpty>
              {allowCustomValue && search ? (
                <button
                  className="w-full px-2 py-1.5 text-sm text-left hover:bg-accent"
                  onClick={() => {
                    onValueChange(search);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  Add &quot;{search}&quot;
                </button>
              ) : (
                emptyText
              )}
            </CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option, index) => (
                <CommandItem
                  key={`${option.value}-${index}`}
                  value={option.value}
                  onSelect={() => handleSelect(option.value)}
                  className={cn("cursor-pointer", option.className)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 shrink-0",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
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
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
