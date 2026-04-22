import { useNavigate } from "react-router-dom";
import { useBranding } from "../../shared/hooks/useBranding";
import { MapPin, ArrowRight, ExternalLink } from "lucide-react";

export default function CTASection() {
  const navigate = useNavigate();
  const brand = useBranding();

  // Direct link for the "Open in Maps" button (using the same CID from your iframe)
  const mapDirectUrl = "https://www.google.com/maps?cid=8753244243642334399";

  return (
    <section className="relative overflow-hidden py-20" style={{ background: brand.colors.primary }}>
      {/* Decorative background glass blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-black/20 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">

          {/* LEFT COLUMN: TEXT CONTENT */}
          <div className="space-y-8 text-center md:text-left">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
                Ready to start <span className="text-emerald-400">learning?</span>
              </h2>
              <p className="text-lg text-white/80 max-w-lg mx-auto md:mx-0">
                Join thousands of students at {brand.siteName || "our platform"} and unlock your potential with expert-led courses.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button
                onClick={() => navigate("/register")}
                className="group px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-black/20"
                style={{
                  backgroundColor: brand.colors.accent || "#34d399",
                  color: brand.colors.primary,
                }}
              >
                Get Started Now
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-3 text-white/60 justify-center md:justify-start pt-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-9 h-9 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <p className="text-sm font-medium tracking-wide">
                Trusted by <span className="text-white">10,000+</span> active learners
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: MAP CARD */}
          <div className="space-y-4">
            <div className="group relative rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 bg-white/5 p-2 backdrop-blur-sm">
              <iframe
                title="Google Maps Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.638550754802!2d75.9868772!3d10.9908871!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba74b4074bcbd39%3A0x799f3030a9e9debf!2sPonmala%20pallipadi%20Poovad%20road!5e0!3m2!1sen!2sin!4v1715852445678!5m2!1sen!2sin"
                className="w-full h-[380px] rounded-[1.5rem] border-0 grayscale-[0.3] contrast-[1.1] brightness-[0.9] group-hover:grayscale-0 transition-all duration-700"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />

              {/* Interaction Overlay */}
              <a
                href={mapDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[2px]"
              >
                <div className="bg-white text-slate-900 px-6 py-3 rounded-2xl font-bold shadow-2xl flex items-center gap-2 transform translate-y-8 group-hover:translate-y-0 transition-all duration-500">
                  <ExternalLink size={18} />
                  Open in Google Maps
                </div>
              </a>
            </div>

            {/* Address Footer */}
            <div className="flex items-center justify-between px-4">
              <div className="flex items-start gap-3 text-white/90">
                <div className="mt-1 w-8 h-8 rounded-full bg-emerald-400/20 flex items-center justify-center">
                  <MapPin size={16} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-bold tracking-tight">Main Campus</p>
                  <p className="text-xs text-white/60 leading-relaxed">
                    Pallippadi, Ponmala, Othukkungal<br />Kerala 676528, India
                  </p>
                </div>
              </div>
              
              <a
                href={mapDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold uppercase tracking-widest text-emerald-400 hover:text-white transition-colors flex items-center gap-1"
              >
                Directions
                <ArrowRight size={14} />
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}