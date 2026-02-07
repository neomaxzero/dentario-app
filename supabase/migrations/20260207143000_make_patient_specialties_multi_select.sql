-- Permite múltiples especialidades por paciente: ortopedia, ortodoncia o ambas.
-- Incluye migración de datos desde el formato anterior (texto simple).

alter table public.pacientes
drop constraint if exists pacientes_especialidad_check;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'pacientes'
      and column_name = 'especialidad'
      and data_type = 'text'
  ) then
    alter table public.pacientes
    alter column especialidad type text[]
    using case
      when especialidad is null then null
      else array[especialidad]
    end;
  end if;
end
$$;

update public.pacientes
set especialidad = null
where especialidad = '{}'::text[];

alter table public.pacientes
add constraint pacientes_especialidad_check
check (
  especialidad is null
  or (
    especialidad <@ array['ortopedia', 'ortodoncia']::text[]
    and cardinality(especialidad) between 1 and 2
  )
);
