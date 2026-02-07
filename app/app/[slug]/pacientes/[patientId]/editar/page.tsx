import { EditPatientForm } from "@/components/patients/edit-patient-form";

type EditPatientRouteProps = {
  params: Promise<{ slug: string; patientId: string }>;
};

export default async function EditPatientRoute({ params }: EditPatientRouteProps) {
  const { slug, patientId } = await params;

  return <EditPatientForm clinicSlug={slug} patientId={patientId} />;
}
