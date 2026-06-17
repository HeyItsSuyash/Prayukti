import { Suspense } from 'react';
import ExperimentPage from '@/components/ExperimentPage';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: 'Experiment - Prayukti x MMMUT',
};

export default async function DashboardExperimentRoute({
  params,
}: {
  params: Promise<{ subject: string; experiment: string }>;
}) {
  const { experiment } = await params;
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    }>
      <ExperimentPage id={experiment} />
    </Suspense>
  );
}
