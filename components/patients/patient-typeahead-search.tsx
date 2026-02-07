"use client";

import { useState } from "react";
import { Search } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { useSearchPatients } from "@/lib/hooks/use-patients";

function getInitials(name: string, lastName: string) {
  const fullName = `${name} ${lastName}`.trim();

  return (
    fullName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "P"
  );
}

function getSecondaryLine(
  dni: string | null,
  phone: string | null,
  insurance: string | null,
) {
  return dni ?? phone ?? insurance ?? "Sin datos adicionales";
}

export function PatientTypeaheadSearch({ clinicSlug }: { clinicSlug: string }) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const debouncedQuery = useDebouncedValue(query, 300);
  const normalizedQuery = query.trim();
  const shouldSearch = normalizedQuery.length >= 2;
  const { data, isFetching, error } = useSearchPatients(
    clinicSlug,
    debouncedQuery,
  );
  const results = data ?? [];
  const shouldShowDropdown =
    isFocused && (shouldSearch || normalizedQuery.length > 0);

  return (
    <div className="relative w-full max-w-sm">
      <label htmlFor="patient-typeahead" className="sr-only">
        Buscar pacientes
      </label>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <input
        id="patient-typeahead"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          window.setTimeout(() => setIsFocused(false), 120);
        }}
        placeholder="Buscar pacientes..."
        className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />

      {shouldShowDropdown ? (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-40 w-full rounded-md border border-border bg-popover p-1 shadow-md">
          {!shouldSearch ? (
            <p className="px-2 py-2 text-xs text-muted-foreground">
              Escribí al menos 2 caracteres.
            </p>
          ) : isFetching ? (
            <p className="px-2 py-2 text-xs text-muted-foreground">
              Buscando pacientes...
            </p>
          ) : error ? (
            <p className="px-2 py-2 text-xs text-destructive">
              No se pudo buscar pacientes.
            </p>
          ) : results.length === 0 ? (
            <p className="px-2 py-2 text-xs text-muted-foreground">
              No hay resultados.
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto py-1">
              {results.map((patient) => (
                <li key={patient.id}>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      setQuery(`${patient.nombre} ${patient.apellido}`.trim());
                      setIsFocused(false);
                    }}
                    className="group flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left hover:bg-accent hover:text-accent-foreground"
                  >
                    <Avatar className="h-7 w-7">
                      {patient.foto_perfil_url ? (
                        <AvatarImage
                          src={patient.foto_perfil_url}
                          alt={`${patient.nombre} ${patient.apellido}`}
                          className="object-cover"
                        />
                      ) : null}
                      <AvatarFallback className="text-[10px] font-semibold">
                        {getInitials(patient.nombre, patient.apellido)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">
                        {patient.nombre} {patient.apellido}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground hover:text-accent-foreground group-hover:text-accent-foreground">
                        {getSecondaryLine(
                          patient.dni,
                          patient.telefono_principal,
                          patient.obra_social,
                        )}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
