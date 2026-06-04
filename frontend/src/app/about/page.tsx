import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import AboutPage from '@/components/AboutPage';

export const metadata = {
  title: 'About | Prayukti x MMMUT',
  description: 'Learn about Prayukti — the virtual laboratory platform built for MMMUT engineering students.',
};

export default function Page() {
  return (
    <>
      <Navbar pathname="/about" />
      <AboutPage />
      <Footer />
    </>
  );
}
