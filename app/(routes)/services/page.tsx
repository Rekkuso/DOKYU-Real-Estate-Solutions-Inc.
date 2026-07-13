import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  FileCheck,
  FileText,
  Handshake,
  Landmark,
  MapPin,
  Megaphone,
  Phone,
  Scale,
  ScrollText,
  Shield,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Footer from "../../_components/Footer";

const documentationServices = [
  { icon: FileCheck, text: "Title transfer" },
  { icon: Shield, text: "Title verification" },
  { icon: Scale, text: "Extra-Judicial Settlement of Estate" },
  { icon: ScrollText, text: "Cancellation of annotation on the title" },
  {
    icon: FileText,
    text: "Assistance in the reconstitution of a lost title",
  },
  {
    icon: MapPin,
    text: "Assistance on relocation/subdivision of title",
  },
  {
    icon: BadgeCheck,
    text: "Assistance with the application for securing a License to Sell and Certificate of Registration",
  },
  {
    icon: Landmark,
    text: "Assistance with the turnover of the subdivision to the Local Government Unit",
  },
  { icon: FileText, text: "Other real estate documentation" },
];

const mainServices = [
  {
    icon: Megaphone,
    title: "Real Estate Sales & Marketing",
    description:
      "We match the right buyers with the right properties using strategic marketing and a trusted network of licensed brokers, ensuring maximum visibility and return.",
    gradient: "from-blue-600 to-indigo-600",
    bgLight: "bg-blue-50",
    textColor: "text-blue-600",
    shadow: "shadow-blue-500/20",
  },
  {
    icon: Users,
    title: "Manning & Team Leadership",
    description:
      "We lead and manage a skilled team of agents and brokers with professionalism, ensuring high-performance operations and ethical client service at every level.",
    gradient: "from-indigo-600 to-purple-600",
    bgLight: "bg-indigo-50",
    textColor: "text-indigo-600",
    shadow: "shadow-indigo-500/20",
  },
  {
    icon: Building2,
    title: "Property Management",
    description:
      "From leasing to maintenance, we take care of your investment. Our team ensures your properties are well-managed, profitable, and tenant-ready year-round.",
    gradient: "from-purple-600 to-pink-600",
    bgLight: "bg-purple-50",
    textColor: "text-purple-600",
    shadow: "shadow-purple-500/20",
  },
];

export default function ServicesPage() {
  return (
    <main>
      {/* ═══════════════ HERO BANNER ═══════════════ */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/backgroundPhoto.webp')" }}
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/75 via-black/60 to-black/85" />

        {/* Floating shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/5 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/3 right-1/5 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-2/3 left-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-500" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium mb-8 animate-fade-in">
            <Shield className="w-4 h-4 text-blue-400" />
            Our Expert Services
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6 tracking-tight animate-fade-in">
            Solutions That{" "}
            <span className="bg-linear-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Secure
            </span>
            <br />
            Your Investment
          </h1>

          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed animate-fade-in delay-500">
            Invest with confidence through our expert services. We deliver
            end-to-end real estate solutions built on trust, security, and
            results.
          </p>
        </div>
      </section>

      {/* ═══════════════ DOCUMENTATION SERVICES ═══════════════ */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left: Heading */}
            <div className="lg:sticky lg:top-32">
              <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold tracking-wide mb-4">
                DOCUMENTATION SERVICES
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Complete{" "}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Documentation
                </span>
                <br />
                Solutions
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-8">
                We handle the complexities of real estate documentation so you
                don&apos;t have to. Our team ensures every document is accurate,
                compliant, and processed efficiently.
              </p>

              {/* Decorative card */}
              <div className="hidden lg:block relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 p-8">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <Handshake className="w-10 h-10 text-white/80 mb-4" />
                <p className="text-white font-semibold text-lg mb-2">
                  End-to-End Support
                </p>
                <p className="text-white/70 text-sm leading-relaxed">
                  From initial verification to final closing, we guide you
                  through every step with professionalism and care.
                </p>
              </div>
            </div>

            {/* Right: Services List */}
            <div className="space-y-4">
              {documentationServices.map((service, index) => (
                <div
                  key={service.text}
                  className="group flex items-start gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-white hover:border-blue-100 hover:shadow-lg transition-all duration-500 hover:-translate-y-0.5"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center flex-shrink-0 transition-colors duration-300">
                    <service.icon className="w-5.5 h-5.5 text-blue-600" />
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 font-medium text-base leading-snug">
                        {service.text}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-gray-300 mt-1">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ MAIN SERVICES ═══════════════ */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-sm font-semibold tracking-wide mb-4">
              OUR SERVICES
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What We{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Deliver
              </span>
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Comprehensive real estate solutions designed to protect your
              investment and maximize your returns.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {mainServices.map((service) => (
              <div
                key={service.title}
                className="group relative p-8 md:p-10 rounded-3xl bg-white border border-gray-100 hover:border-transparent hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden"
              >
                {/* Hover gradient background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />

                <div className="relative z-10">
                  {/* Icon */}
                  <div
                    className={`w-16 h-16 ${service.bgLight} group-hover:bg-white/20 rounded-2xl flex items-center justify-center mb-8 transition-colors duration-500`}
                  >
                    <service.icon
                      className={`h-8 w-8 ${service.textColor} group-hover:text-white transition-colors duration-500`}
                    />
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 group-hover:text-white mb-4 transition-colors duration-500">
                    {service.title}
                  </h3>
                  <p className="text-gray-500 group-hover:text-white/80 leading-relaxed text-base transition-colors duration-500">
                    {service.description}
                  </p>

                  {/* Arrow link */}
                  <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-gray-400 group-hover:text-white transition-colors duration-500">
                    Learn more
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ CTA SECTION ═══════════════ */}
      <section className="py-24 px-4 bg-white">
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
                Ready to Get
                <br />
                Started?
              </h2>
              <p className="text-white/70 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
                Let our team of experts handle your real estate needs with
                professionalism, security, and care. Reach out to us today.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/properties">
                  <Button className="px-8 py-4 h-auto bg-white text-indigo-700 hover:bg-gray-100 rounded-xl font-semibold text-base shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
                    Browse Properties
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

      <Footer />
    </main>
  );
}
