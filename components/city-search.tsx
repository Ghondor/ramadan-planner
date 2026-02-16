"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

interface CitySearchProps {
  value: string;
  onSelect: (city: string, lat: string, lng: string) => void;
  placeholder?: string;
  className?: string;
}

export function CitySearch({
  value,
  onSelect,
  placeholder = "Search for a city...",
  className,
}: CitySearchProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSelected, setHasSelected] = useState(!!value);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    setQuery(value);
    setHasSelected(!!value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchCities = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
          new URLSearchParams({
            q: searchQuery,
            format: "json",
            limit: "5",
            addressdetails: "0",
            featuretype: "city",
          }),
        {
          headers: {
            "Accept-Language": "en",
          },
        }
      );
      const data: NominatimResult[] = await res.json();
      setResults(data);
      setIsOpen(data.length > 0);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setHasSelected(false);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchCities(val), 350);
  };

  const handleSelect = (result: NominatimResult) => {
    const cityName = result.display_name.split(",")[0].trim();
    setQuery(result.display_name.split(",").slice(0, 2).join(",").trim());
    setResults([]);
    setIsOpen(false);
    setHasSelected(true);
    onSelect(cityName, result.lat, result.lon);
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (results.length > 0 && !hasSelected) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="pl-9 pr-9"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
        )}
        {!isLoading && hasSelected && (
          <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg">
          <ul className="max-h-60 overflow-auto py-1">
            {results.map((result) => (
              <li key={result.place_id}>
                <button
                  type="button"
                  onClick={() => handleSelect(result)}
                  className="flex items-start gap-2 w-full px-3 py-2 text-sm text-left hover:bg-muted/50 transition-colors"
                >
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                  <span className="line-clamp-2">
                    {result.display_name}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <div className="border-t px-3 py-1.5">
            <p className="text-[10px] text-muted-foreground text-center">
              Powered by OpenStreetMap
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
