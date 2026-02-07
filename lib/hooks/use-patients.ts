"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  CreatePatientInput,
  ObraSocial,
  Patient,
  PatientSearchResult,
} from "@/lib/patients";

type PatientsResponse = {
  patients?: Patient[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  error?: string;
};

type UploadAvatarResponse = {
  path?: string;
  publicUrl?: string;
  error?: string;
};

type SearchPatientsResponse = {
  patients?: PatientSearchResult[];
  error?: string;
};

type PatientResponse = {
  patient?: Patient;
  error?: string;
};

type SocialInsurancesResponse = {
  obrasSociales?: ObraSocial[];
  error?: string;
};

async function parseResponse<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(data.error ?? "La solicitud falló.");
  }

  return data;
}

export function useSocialInsurances(clinicSlug: string) {
  return useQuery({
    queryKey: ["social-insurances", clinicSlug],
    queryFn: async ({ signal }) => {
      const response = await fetch(
        `/api/clinics/${encodeURIComponent(clinicSlug)}/obras-sociales`,
        { signal },
      );
      const data = await parseResponse<SocialInsurancesResponse>(response);
      return data.obrasSociales ?? [];
    },
    enabled: Boolean(clinicSlug),
    staleTime: 60_000,
  });
}

export function usePatients(
  clinicSlug: string,
  options?: { page?: number; pageSize?: number },
) {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 10;

  return useQuery({
    queryKey: ["patients", clinicSlug, page, pageSize],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      const response = await fetch(
        `/api/clinics/${encodeURIComponent(clinicSlug)}/patients?${params.toString()}`,
      );
      const data = await parseResponse<PatientsResponse>(response);
      return {
        patients: data.patients ?? [],
        pagination: data.pagination ?? {
          page,
          pageSize,
          total: data.patients?.length ?? 0,
          totalPages: 1,
        },
      };
    },
    enabled: Boolean(clinicSlug),
    placeholderData: (previousData) => previousData,
  });
}

export function useCreatePatient(clinicSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreatePatientInput) => {
      const response = await fetch(`/api/clinics/${encodeURIComponent(clinicSlug)}/patients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      return parseResponse<{ patient: Patient }>(response);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["patients", clinicSlug] });
    },
  });
}

export function useUpdatePatient(clinicSlug: string, patientId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreatePatientInput) => {
      const response = await fetch(
        `/api/clinics/${encodeURIComponent(clinicSlug)}/patients/${patientId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      return parseResponse<{ patient: Patient }>(response);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["patients", clinicSlug] }),
        queryClient.invalidateQueries({ queryKey: ["patient", clinicSlug, patientId] }),
        queryClient.invalidateQueries({ queryKey: ["patients-search", clinicSlug] }),
      ]);
    },
  });
}

export function useUploadPatientAvatar(clinicSlug: string) {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `/api/clinics/${encodeURIComponent(clinicSlug)}/patients/upload-avatar`,
        {
          method: "POST",
          body: formData,
        }
      );

      return parseResponse<UploadAvatarResponse>(response);
    },
  });
}

export function useSearchPatients(clinicSlug: string, query: string) {
  const normalizedQuery = query.trim();

  return useQuery({
    queryKey: ["patients-search", clinicSlug, normalizedQuery],
    queryFn: async ({ signal }) => {
      const params = new URLSearchParams({
        q: normalizedQuery,
        limit: "8",
      });
      const response = await fetch(
        `/api/clinics/${encodeURIComponent(clinicSlug)}/patients/search?${params.toString()}`,
        { signal },
      );
      const data = await parseResponse<SearchPatientsResponse>(response);
      return data.patients ?? [];
    },
    enabled: Boolean(clinicSlug) && normalizedQuery.length >= 2,
    staleTime: 30_000,
  });
}

export function usePatient(clinicSlug: string, patientId: number | null) {
  return useQuery({
    queryKey: ["patient", clinicSlug, patientId],
    queryFn: async ({ signal }) => {
      if (!patientId) {
        return null;
      }

      const response = await fetch(
        `/api/clinics/${encodeURIComponent(clinicSlug)}/patients/${patientId}`,
        { signal },
      );
      const data = await parseResponse<PatientResponse>(response);
      return data.patient ?? null;
    },
    enabled: Boolean(clinicSlug) && typeof patientId === "number" && patientId > 0,
  });
}
