import { redirect } from "next/navigation";

type ClinicPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export default async function ClinicPage({ params }: ClinicPageProps) {
  const { slug } = await params;
  redirect(`/app/${encodeURIComponent(slug)}/pacientes`);
}
