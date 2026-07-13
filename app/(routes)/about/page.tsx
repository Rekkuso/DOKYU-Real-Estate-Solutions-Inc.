import {
  Award,
  BadgeCheck,
  Briefcase,
  Eye,
  Globe,
  GraduationCap,
  Handshake,
  Heart,
  Rocket,
  Shield,
  Star,
  Target,
  Users,
} from "lucide-react";
import Footer from "../../_components/Footer";

const credentials = [
  {
    icon: BadgeCheck,
    text: "Licensed Real Estate Broker since 2011",
  },
  {
    icon: Briefcase,
    text: "More than 30 years in the Real Estate Service industry",
  },
  {
    icon: Award,
    text: "Licensed Real Estate Broker (PRC License No. 04741)",
  },
  {
    icon: GraduationCap,
    text: "MBA Graduate - NCBA",
  },
  {
    icon: Globe,
    text: "Certified International Property Specialist (CIPS) Designee",
  },
];

const teamMembers = [
  {
    name: "Rocelinda Jornales",
    role: "President",
    initials: "RJ",
    gradient: "from-blue-600 to-indigo-600",
    shadow: "shadow-blue-500/25",
  },
  {
    name: "Isaiah John Jornales",
    role: "Vice President",
    initials: "IJ",
    gradient: "from-indigo-600 to-purple-600",
    shadow: "shadow-indigo-500/25",
  },
  {
    name: "Rex S. Jornales",
    role: "Treasurer",
    initials: "RJ",
    gradient: "from-purple-600 to-pink-600",
    shadow: "shadow-purple-500/25",
  },
  {
    name: "Mary Ivon B. Jornales",
    role: "Corporate Secretary",
    initials: "MJ",
    gradient: "from-pink-600 to-rose-600",
    shadow: "shadow-pink-500/25",
  },
];

export default function AboutPage() {
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
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-500" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium mb-8 animate-fade-in">
            <Heart className="w-4 h-4 text-rose-400" />
            About Dokyu Real Estate Solutions
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6 tracking-tight animate-fade-in">
            YOUR TRUSTED{" "}
            <span className="bg-linear-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              PROPERTY
            </span>
            <br />
            PARTNERS
          </h1>

          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed animate-fade-in delay-500">
            Built on integrity, driven by excellence — serving the Philippine
            real estate industry with professionalism and trust.
          </p>
        </div>
      </section>

      {/* ═══════════════ FOUNDER SECTION ═══════════════ */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-sm font-semibold tracking-wide">
              OUR FOUNDER
            </span>
          </div>

          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50/50 border border-gray-100 p-8 md:p-12 lg:p-16">
            {/* Decorative accents */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-100/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-10 items-center">
              {/* Avatar */}
              <div className="lg:col-span-2 flex justify-center">
                <div className="relative">
                  <div className="w-52 h-52 md:w-64 md:h-64 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-500/20">
                    <span className="text-6xl md:text-7xl font-bold text-white">
                      RJ
                    </span>
                  </div>
                  {/* Badge */}
                  <div className="absolute -bottom-3 -right-3 bg-white rounded-xl px-3 py-1.5 shadow-lg border border-gray-100 flex items-center gap-1.5">
                    <BadgeCheck className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-semibold text-gray-700">
                      Licensed Broker
                    </span>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="lg:col-span-3">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  Ms. Rose J.
                </h2>
                <p className="text-indigo-600 font-semibold text-lg mb-6">
                  Founder, Dokyu Real Estate Solutions, Inc.
                </p>

                <p className="text-gray-600 leading-relaxed text-base md:text-lg mb-8">
                  Ms. Rose J. brings years of experience in the real estate
                  industry, with a strong background in property documentation,
                  client relations, and legal compliance. As a trusted
                  professional, she is known for her attention to detail,
                  efficiency in processing real estate documents, and commitment
                  to guiding clients through smooth and secure transactions. Her
                  expertise ensures that every step—from title verification to
                  closing—meets the highest standards of integrity and service.
                </p>

                {/* Credentials */}
                <div className="space-y-3">
                  {credentials.map((cred) => (
                    <div
                      key={cred.text}
                      className="flex items-start gap-3 group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center flex-shrink-0 transition-colors duration-300">
                        <cred.icon className="w-4.5 h-4.5 text-blue-600" />
                      </div>
                      <span className="text-gray-700 text-sm md:text-base font-medium pt-1.5">
                        {cred.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ VISION & MISSION ═══════════════ */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Vision */}
            <div className="group relative rounded-3xl overflow-hidden bg-white border border-gray-100 p-8 md:p-10 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600" />
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50/60 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

              <div className="relative z-10">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <Eye className="w-7 h-7 text-blue-600" />
                </div>

                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  Our{" "}
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Vision
                  </span>
                </h3>

                <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                  To be a trusted and globally recognized real estate firm,
                  delivering secure, seamless and professional property solutions
                  with integrity and excellence.
                </p>
              </div>
            </div>

            {/* Mission */}
            <div className="group relative rounded-3xl overflow-hidden bg-white border border-gray-100 p-8 md:p-10 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-600 to-purple-600" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-50/60 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

              <div className="relative z-10">
                <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <Target className="w-7 h-7 text-purple-600" />
                </div>

                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  Our{" "}
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Mission
                  </span>
                </h3>

                <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-4">
                  To redefine real estate services in the Philippines by
                  delivering professional, reliable, and high-quality solutions
                  in property management, documentation services, sales and
                  marketing.
                </p>
                <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                  Through best practices and collaboration with top brokers,
                  agents and developers, we aim to protect our clients&apos;
                  investments, ensuring security, legitimacy, and seamless
                  transactions in every deal we handle.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ OUR TEAM ═══════════════ */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-sm font-semibold tracking-wide mb-4">
              OUR TEAM
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Meet the{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Leadership
              </span>
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Our dedicated leadership team brings together decades of combined
              experience in real estate, management, and client service.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member) => (
              <div
                key={member.name}
                className="group relative text-center p-8 rounded-3xl bg-white border border-gray-100 hover:border-transparent hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              >
                {/* Avatar */}
                <div className="relative inline-flex mb-6">
                  <div
                    className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${member.gradient} flex items-center justify-center ${member.shadow} shadow-lg group-hover:scale-110 transition-transform duration-500`}
                  >
                    <span className="text-2xl font-bold text-white">
                      {member.initials}
                    </span>
                  </div>
                </div>

                <h4 className="text-lg font-bold text-gray-900 mb-1">
                  {member.name}
                </h4>
                <span
                  className={`inline-block px-3 py-1 rounded-full bg-gradient-to-r ${member.gradient} text-white text-xs font-semibold`}
                >
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ OUR AFFILIATES ═══════════════ */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-sm font-semibold tracking-wide mb-4">
              OUR AFFILIATES
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Trusted{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Partners
              </span>
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              We collaborate with leading organizations and industry bodies to
              deliver the highest quality service and standards.
            </p>
          </div>

          {/* Affiliate placeholders */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Shield, label: "PRC" },
              { icon: Handshake, label: "PAREB" },
              { icon: Globe, label: "CIPS" },
              { icon: Star, label: "REBAP" },
            ].map((affiliate) => (
              <div
                key={affiliate.label}
                className="group flex flex-col items-center justify-center p-8 rounded-2xl bg-white border border-gray-100 hover:border-indigo-200 hover:shadow-lg transition-all duration-500 hover:-translate-y-1"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                  <affiliate.icon className="w-8 h-8 text-indigo-400 group-hover:text-indigo-600 transition-colors duration-300" />
                </div>
                <span className="text-sm font-semibold text-gray-500 group-hover:text-indigo-600 transition-colors duration-300">
                  {affiliate.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ VALUES STRIP ═══════════════ */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: Shield, value: "Integrity", sub: "In every transaction" },
              {
                icon: Rocket,
                value: "Excellence",
                sub: "Highest standards",
              },
              {
                icon: Users,
                value: "Trust",
                sub: "Client-centered service",
              },
              {
                icon: Globe,
                value: "Global Reach",
                sub: "Internationally recognized",
              },
            ].map((item) => (
              <div key={item.value} className="group">
                <item.icon className="w-8 h-8 text-white/80 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                <div className="text-2xl font-bold text-white mb-1">
                  {item.value}
                </div>
                <div className="text-sm text-white/60">{item.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
