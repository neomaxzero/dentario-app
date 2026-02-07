export type PatientSex = "masculino" | "femenino" | "otro" | null;
export type PatientSpecialty = "ortopedia" | "ortodoncia";

export type Patient = {
  id: number;
  clinica_id: number;
  foto_perfil_url: string | null;
  nombre: string;
  apellido: string;
  dni: string | null;
  email: string | null;
  obra_social: string | null;
  plan_obra_social: string | null;
  especialidad: PatientSpecialty[] | null;
  numero_interno: string | null;
  sexo: PatientSex;
  fecha_nacimiento: string;
  ciudad: string | null;
  direccion: string | null;
  telefono_principal: string | null;
  telefono_alternativo: string | null;
  observaciones: string | null;
  created_at: string;
};

export type PatientSearchResult = {
  id: number;
  nombre: string;
  apellido: string;
  foto_perfil_url: string | null;
  dni: string | null;
  telefono_principal: string | null;
  obra_social: string | null;
};

export type CreatePatientInput = {
  fotoPerfilUrl?: string | null;
  nombre: string;
  apellido: string;
  dni?: string | null;
  email?: string | null;
  obraSocial?: string | null;
  planObraSocial?: string | null;
  especialidad?: PatientSpecialty[];
  numeroInterno?: string | null;
  sexo?: Exclude<PatientSex, null> | "";
  fechaNacimiento: string;
  ciudad?: string | null;
  direccion?: string | null;
  telefonoPrincipal?: string | null;
  telefonoAlternativo?: string | null;
  observaciones?: string | null;
};
