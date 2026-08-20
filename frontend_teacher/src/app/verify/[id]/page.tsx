import VerifyCertificatePage from "@/components/VerifyCertificatePage";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function VerifyCertificate({ params }: PageProps) {
  const { id } = await params;
  return <VerifyCertificatePage certificateId={id} />;
}
