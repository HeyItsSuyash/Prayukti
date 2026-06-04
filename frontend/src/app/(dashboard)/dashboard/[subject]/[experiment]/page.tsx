import ExperimentPage from '@/components/ExperimentPage';

export const metadata = {
  title: 'Experiment - Prayukti x MMMUT',
};

export default async function DashboardExperimentRoute({
  params,
}: {
  params: Promise<{ subject: string; experiment: string }>;
}) {
  const { experiment } = await params;
  return <ExperimentPage id={experiment} />;
}
