import { ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CallToAction() {
  return (
    <section id="cta" className="py-24 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700" />
          {/* Decorative shapes */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full blur-2xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          </div>

          {/* Content */}
          <div className="relative z-10 py-16 px-8 md:px-16 text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Ready to Find Your
              <br />
              Perfect Property?
            </h2>
            <p className="text-white/70 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Start your
              journey with DOKYU today and let us help you find the home of your
              dreams.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/add-new-listing">
                <Button className="px-8 py-4 h-auto bg-white text-indigo-700 hover:bg-gray-100 rounded-xl font-semibold text-base shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
                  Get Started
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Button className="px-8 py-4 h-auto bg-white/10 backdrop-blur-sm border border-white/30 text-white hover:bg-white/20 rounded-xl font-semibold text-base hover:scale-105 transition-all duration-300 cursor-pointer">
                <Phone className="h-5 w-5 mr-2" />
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
