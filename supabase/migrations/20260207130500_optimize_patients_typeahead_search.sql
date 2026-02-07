-- Optimiza el typeahead de pacientes por nombre, apellido y dni.
-- Idempotente para poder ejecutarse en entornos existentes sin fallar por duplicados.

create extension if not exists pg_trgm;

create index if not exists pacientes_clinica_id_idx
  on public.pacientes (clinica_id);

create index if not exists pacientes_nombre_trgm_idx
  on public.pacientes using gin (lower(nombre) gin_trgm_ops);

create index if not exists pacientes_apellido_trgm_idx
  on public.pacientes using gin (lower(apellido) gin_trgm_ops);

create index if not exists pacientes_dni_trgm_idx
  on public.pacientes using gin (lower(dni) gin_trgm_ops);
