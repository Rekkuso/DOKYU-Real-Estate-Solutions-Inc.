import {
  Home,
  TrendingUp,
  Shield,
  Handshake,
  ClipboardCheck,
  HeadphonesIcon,
} from "lucide-react";

const services = [
  {
    icon: Home,
    title: "Property Listings",
    description:
      "Discover a wide range of premium real estate options. Browse thousands of verified properties across the country.",
    color: "from-blue-500 to-blue-600",
    bgLight: "bg-blue-50",
    textColor: "text-blue-600",
  },
  {
    icon: TrendingUp,
    title: "Market Analysis",
    description:
      "Make informed decisions with our data-driven approach. Get real-time market insights and trends.",
    color: "from-emerald-500 to-emerald-600",
    bgLight: "bg-emerald-50",
    textColor: "text-emerald-600",
  },
  {
    icon: Shield,
    title: "Secure Transactions",
    description:
      "We ensure every step of your property journey is safe, transparent, and completely protected.",
    color: "from-purple-500 to-purple-600",
    bgLight: "bg-purple-50",
    textColor: "text-purple-600",
  },
  {
    icon: Handshake,
    title: "Expert Consultation",
    description:
      "Connect with our experienced agents who provide personalized guidance tailored to your real estate goals.",
    color: "from-orange-500 to-orange-600",
    bgLight: "bg-orange-50",
    textColor: "text-orange-600",
  },
  {
    icon: ClipboardCheck,
    title: "Property Management",
    description:
      "Enjoy peace of mind with our professional property management services covering maintenance and tenant relations.",
    color: "from-rose-500 to-rose-600",
    bgLight: "bg-rose-50",
    textColor: "text-rose-600",
  },
  {
    icon: HeadphonesIcon,
    title: "24/7 Support",
    description:
      "Our dedicated support team is always available to answer your questions and assist you at any time.",
    color: "from-indigo-500 to-indigo-600",
    bgLight: "bg-indigo-50",
    textColor: "text-indigo-600",
  },
];

export default function Services() {
  return (
    <section id="services" className="py-24 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-sm font-semibold mb-4 tracking-wide">
            OUR SERVICES
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            What We{" "}
            <span className="bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Offer
            </span>
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Whether you are buying, selling, or investing, we provide
            comprehensive real estate solutions tailored to your needs.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.title}
              className="group relative p-8 rounded-2xl bg-white border border-gray-100 hover:border-transparent hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden"
            >
              {/* Hover gradient background */}
              <div
                className={`absolute inset-0 bg-linear-to-br ${service.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />

              {/* Content */}
              <div className="relative z-10">
                {/* Icon */}
                <div
                  className={`w-14 h-14 ${service.bgLight} group-hover:bg-white/20 rounded-xl flex items-center justify-center mb-6 transition-colors duration-500`}
                >
                  <service.icon
                    className={`h-7 w-7 ${service.textColor} group-hover:text-white transition-colors duration-500`}
                  />
                </div>

                <h3 className="text-xl font-bold text-gray-900 group-hover:text-white mb-3 transition-colors duration-500">
                  {service.title}
                </h3>
                <p className="text-gray-500 group-hover:text-white/80 leading-relaxed transition-colors duration-500">
                  {service.description}
                </p>

                {/* Arrow link */}
                <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-gray-400 group-hover:text-white transition-colors duration-500">
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
  );
}
