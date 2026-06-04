import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import FeaturesPage from '@/components/FeaturesPage';

export const metadata = {
  title: 'Features | Prayukti x MMMUT',
  description: 'Explore the powerful features of Prayukti vLAB — syllabus-mapped experiments, real-time simulations, integrated code editor, and more.',
};

export default function Page() {
  return (
    <>
      <Navbar pathname="/features" />
      <FeaturesPage />
      <Footer />
    </>
  );
}
