import { CreatePatientForm } from "@/components/patients/create-patient-form";

type NewPatientPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function NewPatientPage({ params }: NewPatientPageProps) {
  const { slug } = await params;

  return <CreatePatientForm clinicSlug={slug} />;
}
