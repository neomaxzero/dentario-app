"use client";

import UploadButton from "@rpldy/upload-button";
import Uploady, {
  useItemErrorListener,
  useItemFinishListener,
  useItemStartListener,
} from "@rpldy/uploady";
import { Loader2, Upload } from "lucide-react";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

type UploadResult = {
  publicUrl?: string;
  error?: string;
};

function parseUploadResult(data: unknown): UploadResult {
  if (!data) {
    return {};
  }

  if (typeof data === "string") {
    try {
      return JSON.parse(data) as UploadResult;
    } catch {
      return {};
    }
  }

  if (typeof data === "object") {
    return data as UploadResult;
  }

  return {};
}

function UploadEvents({
  onChange,
  onError,
  onStart,
  setUploading,
}: {
  onChange: (url: string) => void;
  onError: (message: string) => void;
  onStart: () => void;
  setUploading: (value: boolean) => void;
}) {
  useItemFinishListener((item) => {
    setUploading(false);
    const response = parseUploadResult(item.uploadResponse?.data);
    if (response.publicUrl) {
      onChange(response.publicUrl);
      return;
    }

    onError("No se pudo procesar la imagen subida.");
  });

  useItemErrorListener((item) => {
    setUploading(false);
    const response = parseUploadResult(item.uploadResponse?.data);
    onError(response.error ?? "Error al subir la imagen.");
  });

  useItemStartListener(() => {
    onStart();
    setUploading(true);
  });

  return null;
}

export function PatientAvatarUploader({
  clinicSlug,
  value,
  onChange,
}: {
  clinicSlug: string;
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="grid gap-3">
      <div className="flex flex-col items-center gap-3">
        <Uploady
          destination={{
            url: `/api/clinics/${encodeURIComponent(
              clinicSlug
            )}/patients/upload-avatar`,
            method: "POST",
          }}
          accept="image/*"
          multiple={false}
        >
          <UploadEvents
            setUploading={setIsUploading}
            onStart={() => setError(null)}
            onChange={(url) => {
              setError(null);
              onChange(url);
            }}
            onError={(message) => setError(message)}
          />
          <UploadButton
            extraProps={{ type: "button" }}
            className="group relative inline-flex rounded-full"
          >
            <Avatar className="h-24 w-24 ring-2 ring-border transition-opacity group-hover:opacity-90">
              {value ? <AvatarImage src={value} alt="Foto de perfil" /> : null}
              <AvatarFallback className="text-sm font-semibold">PF</AvatarFallback>
            </Avatar>
            <span className="absolute bottom-1 right-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
            </span>
          </UploadButton>
          <p className="text-xs text-muted-foreground">
            {isUploading ? "Subiendo..." : "Subir foto"}
          </p>
        </Uploady>
        {value ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => onChange(null)}
          >
            Quitar
          </Button>
        ) : null}
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
