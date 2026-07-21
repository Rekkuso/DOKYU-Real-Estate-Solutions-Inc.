import Header from "./_components/Header";
import Hero from "./_components/Hero";
import FeaturedProperties from "./_components/FeaturedProperties";
import Services from "./_components/Services";
import Testimonials from "./_components/Testimonials";
import CallToAction from "./_components/CallToAction";
import Footer from "./_components/Footer";
import { getFeaturedListings } from "./_actions/listing";
import { getIsAdmin } from "./_actions/admin";

export default async function Home() {
  const isAdmin = await getIsAdmin();
  let featuredListings: any[] = [];
  try {
    featuredListings = await getFeaturedListings(6);
  } catch (error) {
    console.error("Error loading featured listings:", error);
  }

  return (
    <main>
      <Header isAdmin={isAdmin} />
      <Hero />
      <FeaturedProperties initialProperties={featuredListings} />
      <Services />
      <Testimonials />
      <CallToAction />
      <Footer />
    </main>
  );
}
