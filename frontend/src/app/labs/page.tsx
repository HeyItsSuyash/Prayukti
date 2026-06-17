import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import LabsPage from '@/components/LabsPage';

export const metadata = {
  title: 'Virtual Labs | Prayukti x MMMUT',
  description: 'Explore all virtual lab experiments — syllabus-mapped simulations across CSE, ECE, and more.',
};

export default function Page() {
  return (
    <>
      <Navbar pathname="/labs" />
      <LabsPage />
      <Footer />
    </>
  );
}
