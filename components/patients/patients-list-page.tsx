"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { usePatients } from "@/lib/hooks/use-patients";

function getInitials(name: string, lastName: string) {
  const fullName = `${name} ${lastName}`.trim();

  return (
    fullName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "U"
  );
}

export function PatientsListPage({ clinicSlug }: { clinicSlug: string }) {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const { data, isPending, isFetching, error } = usePatients(clinicSlug, {
    page,
    pageSize,
  });

  const patients = data?.patients ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const hasPatients = patients.length > 0;

  useEffect(() => {
    setPage(1);
  }, [clinicSlug]);

  useEffect(() => {
    if (!pagination) {
      return;
    }

    if (page > pagination.totalPages) {
      setPage(pagination.totalPages);
    }
  }, [page, pagination]);

  const visiblePages = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (page <= 3) {
      return [1, 2, 3, 4, 5];
    }

    if (page >= totalPages - 2) {
      return [
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [page - 2, page - 1, page, page + 1, page + 2];
  }, [page, totalPages]);

  return (
    <div className="flex min-h-[calc(100dvh-6rem)] flex-col rounded-xl border border-border/60 bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">Pacientes</h1>
          {isFetching && !isPending ? (
            <p className="text-xs text-muted-foreground">
              Actualizando pacientes...
            </p>
          ) : null}
        </div>
        <Button asChild>
          <Link href={`/app/${encodeURIComponent(clinicSlug)}/pacientes/nuevo`}>
            Agregar paciente
          </Link>
        </Button>
      </div>

      <div className="flex-1 overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="pb-2 pr-2 font-medium">Foto</th>
              <th className="pb-2 pr-2 font-medium">Nombre</th>
              <th className="pb-2 pr-2 font-medium">DNI</th>
              <th className="pb-2 pr-2 font-medium">Obra social</th>
              <th className="pb-2 pr-2 font-medium">Telefono principal</th>
            </tr>
          </thead>
          <tbody>
            {error ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-8 text-center text-sm text-destructive"
                >
                  {error.message}
                </td>
              </tr>
            ) : isPending && !hasPatients ? (
              Array.from({ length: pageSize }, (_, index) => (
                <tr
                  key={`loading-row-${index}`}
                  className="border-b border-border/60"
                >
                  <td className="py-2 pr-2">
                    <div className="h-9 w-9 animate-pulse rounded-lg bg-muted" />
                  </td>
                  <td className="py-2 pr-2">
                    <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                  </td>
                  <td className="py-2 pr-2">
                    <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                  </td>
                  <td className="py-2 pr-2">
                    <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                  </td>
                  <td className="py-2 pr-2">
                    <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                  </td>
                </tr>
              ))
            ) : !hasPatients ? (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  <p className="text-sm text-muted-foreground">
                    Agrega tu primer paciente.
                  </p>
                </td>
              </tr>
            ) : (
              patients.map((patient) => (
                <tr key={patient.id} className="border-b border-border/60">
                  <td className="py-2 pr-2">
                    <Avatar className="h-9 w-9 rounded-lg">
                      {patient.foto_perfil_url ? (
                        <AvatarImage
                          src={patient.foto_perfil_url}
                          alt={`${patient.nombre} ${patient.apellido}`}
                          className="object-cover"
                        />
                      ) : null}
                      <AvatarFallback className="rounded-lg bg-sidebar-accent text-[11px] font-semibold">
                        {getInitials(patient.nombre, patient.apellido)}
                      </AvatarFallback>
                    </Avatar>
                  </td>
                  <td className="py-2 pr-2">
                    {patient.nombre} {patient.apellido}
                  </td>
                  <td className="py-2 pr-2">{patient.dni}</td>
                  <td className="py-2 pr-2">{patient.obra_social}</td>
                  <td className="py-2 pr-2">{patient.telefono_principal}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && !error ? (
        <div className="mt-auto pt-5">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  aria-disabled={page <= 1}
                  className={
                    page <= 1 ? "pointer-events-none opacity-50" : undefined
                  }
                  onClick={(event) => {
                    event.preventDefault();
                    setPage((currentPage) => Math.max(1, currentPage - 1));
                  }}
                />
              </PaginationItem>

              {visiblePages[0] !== 1 ? (
                <>
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        setPage(1);
                      }}
                    >
                      1
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                </>
              ) : null}

              {visiblePages.map((pageNumber) => (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    href="#"
                    isActive={pageNumber === page}
                    onClick={(event) => {
                      event.preventDefault();
                      setPage(pageNumber);
                    }}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              ))}

              {visiblePages[visiblePages.length - 1] !== totalPages ? (
                <>
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        setPage(totalPages);
                      }}
                    >
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                </>
              ) : null}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  aria-disabled={page >= totalPages}
                  className={
                    page >= totalPages
                      ? "pointer-events-none opacity-50"
                      : undefined
                  }
                  onClick={(event) => {
                    event.preventDefault();
                    setPage((currentPage) =>
                      Math.min(totalPages, currentPage + 1),
                    );
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      ) : null}
    </div>
  );
}
