import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import ContactPage from '@/components/ContactPage';

export const metadata = {
  title: 'Contact Us | Prayukti x MMMUT',
  description: 'Get in touch with the Prayukti team for support, suggestions, or university integration requests.',
};

export default function Page() {
  return (
    <>
      <Navbar pathname="/contact" />
      <ContactPage />
      <Footer />
    </>
  );
}
