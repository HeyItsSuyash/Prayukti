import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import ExplorePage from '@/components/ExplorePage';

export const metadata = {
  title: 'Explore Labs | Prayukti x MMMUT',
  description: 'Browse and filter all virtual experiments by branch, semester, and difficulty. Start practising right in your browser.',
};

export default function Page() {
  return (
    <>
      <Navbar pathname="/explore" />
      <ExplorePage />
      <Footer />
    </>
  );
}
