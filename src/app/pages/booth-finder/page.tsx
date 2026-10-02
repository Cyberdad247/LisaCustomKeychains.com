import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LisaKineticBoutiqueEngine from '@/components/LisaKineticBoutiqueEngine';

export const metadata: Metadata = {
  title: 'Live Booth Finder & Express Customizer | Lisa’s Custom Keychains',
  description: 'Locate Lisa’s physical craft presence at local maker festivals and place geofenced on-site custom keychain orders for express counter pickup.',
};

export default function BoothFinderPage() {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Navbar />
      <div className="h-28"></div>
      <main>
        <LisaKineticBoutiqueEngine />
      </main>
      <Footer />
    </div>
  );
}
