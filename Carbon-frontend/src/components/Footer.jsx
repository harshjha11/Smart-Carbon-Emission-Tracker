import {
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaInstagram,
  FaGithub,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaLeaf,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="mt-20 bg-gradient-to-b from-slate-900 to-slate-950 text-white relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6 py-16">
        {/* Top Section */}
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4 pb-12 border-b border-slate-800">
          {/* Brand */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <FaLeaf className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold">CarbonTracker</h3>
                <p className="text-xs text-slate-400">For Atmanirbhar Bharat</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Empowering individuals to track their carbon footprint and make
              sustainable choices for a greener India.
            </p>
            {/* Social Links */}
            <div className="flex gap-3 pt-2">
              {[
                {
                  icon: <FaTwitter />,
                  href: "https://x.com/itisharshjha",
                  label: "Twitter",
                },
                { icon: <FaLinkedin />, href: "#", label: "LinkedIn" },
                { icon: <FaInstagram />, href: "#", label: "Instagram" },
                { icon: <FaGithub />, href: "#", label: "GitHub" },
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-gradient-to-br hover:from-emerald-500 hover:to-teal-600 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300 hover:-translate-y-1"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Dashboard", path: "/dashboard" },
                { label: "Log Activity", path: "/activity" },
                { label: "Set Goals", path: "/goals" },
                { label: "Achievements", path: "/achievements" },
                { label: "Leaderboard", path: "/leaderboard" },
              ].map((link, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="text-sm text-slate-400 hover:text-emerald-400 transition-colors duration-200 hover:translate-x-1 inline-flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              About
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Our Mission", path: "/about" },
                { label: "How It Works", path: "/learn-more" },
                { label: "Privacy Policy", path: "/privacy" },
                { label: "Terms of Service", path: "/terms" },
                { label: "FAQ", path: "/faq" },
              ].map((link, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="text-sm text-slate-400 hover:text-emerald-400 transition-colors duration-200 hover:translate-x-1 inline-flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Contact Us
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FaEnvelope className="text-emerald-500 text-sm" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">
                    Email
                  </p>
                  <a
                    href="mailto:hello@carbontracker.in"
                    className="text-sm text-slate-300 hover:text-emerald-400 transition-colors"
                  >
                    hello@carbontracker.in
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FaPhone className="text-emerald-500 text-sm" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">
                    Phone
                  </p>
                  <a
                    href="tel:+911234567890"
                    className="text-sm text-slate-300 hover:text-emerald-400 transition-colors"
                  >
                    +91 12345 67890
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FaMapMarkerAlt className="text-emerald-500 text-sm" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">
                    Location
                  </p>
                  <p className="text-sm text-slate-300">New Delhi, India</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🇮🇳</span>
            <p className="text-sm text-slate-400">
              Made with <span className="text-red-500">❤️</span> in India for a
              Sustainable Future
            </p>
          </div>
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} CarbonTracker. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
