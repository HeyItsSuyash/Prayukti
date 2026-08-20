import ExperimentPage from '@/components/ExperimentPage';

export const metadata = {
  title: 'Experiment - Prayukti x MMMUT',
};

export default async function ExperimentRoute({
  params,
}: {
  params: Promise<{ lab: string; course: string; experiment: string }>;
}) {
  const { experiment } = await params;
  return <ExperimentPage id={experiment} />;
}
