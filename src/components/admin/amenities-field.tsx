"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Input } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type Props = { value: string[]; onChange: (next: string[]) => void };

export function AmenitiesField({ value, onChange }: Props) {
  const [custom, setCustom] = useState("");
  const suggestions = siteConfig.amenitySuggestions as readonly string[];
  const extras = value.filter((v) => !suggestions.includes(v));

  const toggle = (item: string) => {
    onChange(value.includes(item) ? value.filter((v) => v !== item) : [...value, item]);
  };

  const addCustom = () => {
    const item = custom.trim();
    if (!item) return;
    if (!value.includes(item)) onChange([...value, item]);
    setCustom("");
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Tiện nghi gợi ý">
        {suggestions.map((item) => {
          const active = value.includes(item);
          return (
            <button
              key={item}
              type="button"
              onClick={() => toggle(item)}
              aria-pressed={active}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                active ? "border-brand-600 bg-brand-600 text-white" : "border-stone-300 bg-white text-ink hover:border-brand-400",
              )}
            >
              {item}
            </button>
          );
        })}
      </div>
      {extras.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-2" aria-label="Tiện nghi tự thêm">
          {extras.map((item) => (
            <li key={item} className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-800">
              {item}
              <button type="button" onClick={() => toggle(item)} className="rounded-full p-0.5 hover:bg-brand-100" aria-label={`Bỏ ${item}`}>
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-3 flex gap-2">
        <Input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCustom();
            }
          }}
          placeholder="Thêm tiện nghi khác…"
          aria-label="Thêm tiện nghi khác"
          maxLength={60}
        />
        <Button variant="secondary" onClick={addCustom} disabled={!custom.trim()}>
          <Plus className="size-4" aria-hidden="true" />
          Thêm
        </Button>
      </div>
    </div>
  );
}
