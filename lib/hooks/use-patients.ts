"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { CreatePatientInput, Patient } from "@/lib/patients";

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

async function parseResponse<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(data.error ?? "Request failed.");
  }

  return data;
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
