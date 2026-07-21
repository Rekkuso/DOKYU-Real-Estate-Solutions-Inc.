import Header from "./_components/Header";
import Hero from "./_components/Hero";
import FeaturedProperties from "./_components/FeaturedProperties";
import Services from "./_components/Services";
import Testimonials from "./_components/Testimonials";
import CallToAction from "./_components/CallToAction";
import Footer from "./_components/Footer";
import { getIsAdmin } from "./_actions/admin";

export default async function Home() {
  const isAdmin = await getIsAdmin();

  return (
    <main>
      <Header isAdmin={isAdmin} />
      <Hero />
      <FeaturedProperties />
      <Services />
      <Testimonials />
      <CallToAction />
      <Footer />
    </main>
  );
}
