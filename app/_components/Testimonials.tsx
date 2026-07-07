import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Maria Santos",
    role: "Homeowner",
    initials: "MS",
    gradient: "from-blue-500 to-indigo-500",
    rating: 5,
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. DOKYU made finding our dream home an absolute breeze. The team was incredibly professional and supportive throughout the entire process.",
  },
  {
    name: "Juan Dela Cruz",
    role: "Property Investor",
    initials: "JD",
    gradient: "from-emerald-500 to-teal-500",
    rating: 5,
    text: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Their market insights helped me make smart investment decisions.",
  },
  {
    name: "Ana Reyes",
    role: "First-time Buyer",
    initials: "AR",
    gradient: "from-purple-500 to-pink-500",
    rating: 5,
    text: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. I never thought buying a home could be this seamless.",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-sm font-semibold mb-4 tracking-wide">
            TESTIMONIALS
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            What Our{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Clients Say
            </span>
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Hear from
            our satisfied clients about their experience.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="relative p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 group"
            >
              {/* Quote icon */}
              <Quote className="h-8 w-8 text-gray-100 group-hover:text-blue-100 absolute top-6 right-6 transition-colors duration-500" />

              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              {/* Quote text */}
              <p className="text-gray-600 leading-relaxed mb-8 text-[15px]">
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white text-sm font-bold shadow-md`}
                >
                  {t.initials}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">
                    {t.name}
                  </div>
                  <div className="text-xs text-gray-400">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
