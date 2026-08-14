import { Suspense } from 'react';
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
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-white">
        <i className="bx bx-loader2 w-8 h-8 animate-spin text-[#059669]"  />
      </div>
    }>
      <ExperimentPage id={experiment} />
    </Suspense>
  );
}
