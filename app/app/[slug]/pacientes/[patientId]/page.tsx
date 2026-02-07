import { PatientDetailsPage } from "@/components/patients/patient-details-page";

type PatientDetailsRouteProps = {
  params: Promise<{ slug: string; patientId: string }>;
};

export default async function PatientDetailsRoute({ params }: PatientDetailsRouteProps) {
  const { slug, patientId } = await params;

  return <PatientDetailsPage clinicSlug={slug} patientId={patientId} />;
}
