import Header from "./_components/Header";
import Hero from "./_components/Hero";
import FeaturedProperties from "./_components/FeaturedProperties";
import Services from "./_components/Services";
import Testimonials from "./_components/Testimonials";
import CallToAction from "./_components/CallToAction";
import Footer from "./_components/Footer";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export default async function Home() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  const isAdmin = user?.app_metadata?.role === "admin";

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
