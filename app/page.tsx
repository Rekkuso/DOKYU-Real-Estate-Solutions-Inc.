import Header from "./_components/Header";
import Hero from "./_components/Hero";
import FeaturedProperties from "./_components/FeaturedProperties";
import Services from "./_components/Services";
import Testimonials from "./_components/Testimonials";
import CallToAction from "./_components/CallToAction";
import Footer from "./_components/Footer";

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <FeaturedProperties />
      <Services />
      <Testimonials />
      <CallToAction />
      <Footer />
    </main>
  );
}
