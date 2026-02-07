import { PatientsListPage } from "@/components/patients/patients-list-page";

type PatientsPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PatientsPage({ params }: PatientsPageProps) {
  const { slug } = await params;

  return <PatientsListPage clinicSlug={slug} />;
}
