import { useSearchParams } from "react-router-dom";
import { useMemo } from "react";

export function useQueryParams<T extends Record<string, any>>(defaults: T) {
  const [searchParams, setSearchParams] = useSearchParams();

  const params = useMemo(() => {
    const result = { ...defaults };
    for (const key of Object.keys(defaults) as Array<keyof T>) {
      const value = searchParams.get(key as string);
      if (value !== null) {
        if (typeof defaults[key] === "number") (result[key] as any) = Number(value);
        else if (typeof defaults[key] === "boolean") (result[key] as any) = value === "true";
        else (result[key] as any) = value;
      }
    }
    return result;
  }, [searchParams, defaults]);

  const setParams = (newParams: Partial<T>) => {
    const updated = { ...params, ...newParams };
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(updated)) {
      if (v !== undefined && v !== null && v !== "") sp.set(k, String(v));
    }
    setSearchParams(sp);
  };

  return [params, setParams] as const;
}