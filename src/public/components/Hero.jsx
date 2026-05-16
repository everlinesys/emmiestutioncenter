import { MdWhatsapp } from "react-icons/md";
import { useBranding } from "../../shared/hooks/useBranding";
import { useState } from "react";
export default function Hero() {
  const brand = useBranding();
  const initials =
    brand.name
      ?.replace(/[^A-Za-z ]/g, "")
      .split(" ")
      .filter(Boolean)
      .map(w => w[0].toUpperCase())
      .slice(0, 2) || ["A", "U"];

  const avatarLetters = [...initials, ...initials].slice(0, 4);
  const [open, setOpen] = useState(true);

  const whatsappNumber = brand.contact?.whatsapp;

  const openWhatsApp = () => {
    const text = `Hello ${brand.siteName}, I want to know more about your courses.`;
    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  return (
    <section className={`${brand.theme.layout.container} relative overflow-hidden`}>

      {/* Decorative Background Elements (Leave As Design Layer) */}
      {/* <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full blur-3xl opacity-30"
        style={{ backgroundColor: brand.colors.primary }}
      ></div>

      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full blur-3xl opacity-20"
        style={{ backgroundColor: brand.colors.primary }}
      ></div> */}

      <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center p-8 md:p-16">

        {/* LEFT */}
        <div className="space-y-6 text-center md:text-left">

          {/* Image top mobile only */}
          <div className="relative md:hidden md:block group ">

            {brand.hero.image ? (
              <img
                src={brand.hero.image}
                alt={brand.siteName}
                className={`relative z-10 ${brand.theme.shape?.radius || ""}  object-cover aspect-[4/5] w-full `}
              />
            ) : (
              <div className={`relative z-10 ${brand.theme.layout.panel} aspect-[4/3] w-full flex items-center justify-center`}>
                <div className="text-white/10 font-black text-8xl uppercase -rotate-12 select-none tracking-tighter">
                  Learn
                </div>
              </div>
            )}

          </div>
          {/* Badge */}
          <div className={`inline-flex items-center gap-2 px-3 py-1 ${brand.theme.layout.panel} ${brand.theme.shape?.radius || ""}`}>
            <span className="relative flex h-2 w-2">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ backgroundColor: brand.colors.primary }}
              />
              <span
                className="relative inline-flex rounded-full h-2 w-2"
                style={{ backgroundColor: brand.colors.accent }}
              />
            </span>

            <span className={`text-[10px] uppercase tracking-widest ${brand.theme.text?.label || ""}`}>
              Live Learning Portal
            </span>
          </div>

          {/* Title */}
          <h1
            className="text-4xl md:text-5xl font-bold leading-[1.1] tracking-tight"
          // style={{ color: brand.colors.primary }}
          >
            {brand.hero?.title || "Welcome to eLearn"}
          </h1>

          {/* Subtitle */}
          <p className={`${brand.theme.text?.body || ""} opacity-80 max-w-lg text-xl md:text-xl`}>
            {brand.hero?.subtitle || "Practical courses for real growth."}
          </p>

          {/* CTA Row */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">

            {/* Button */}
            <a
              href="#courses"
              className={`group inline-flex items-center justify-center px-8 py-4 font-black text-sm tracking-wide transition-all duration-300 active:scale-95 ${brand.theme.button.primary} ${brand.theme.shape?.radius || ""}`}
              style={{ background: brand.colors.primary,  color: "white" }}
            >
              <span className="flex items-center gap-2" >
                Browse Courses
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </a>

            {/* Avatars */}
            <div className="flex -space-x-3 overflow-hidden">
              {/* {avatarLetters.map((letter, i) => (
                <div
                  key={i}
                  className="inline-flex h-8 w-8 rounded-full border border-black/20 items-center justify-center text-[11px] font-black"
                  style={{
                    backgroundColor: brand.colors.primary,
                    color: brand.colors.accent,
                  }}
                >
                  {letter}
                </div>
              ))} */}

              {/* {[1, 2, 3, 4].map((num, i) => (
                <div
                  key={i}
                  className="inline-flex h-8 w-8 rounded-full border border-black/20 items-center justify-center overflow-hidden"
                  style={{
                    backgroundColor: brand.colors.primary,
                  }}
                >
                  <img
                    src={`/icns/${num}.ico`}
                    alt={`icon-${num}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))} */}

              <div className="pl-5 pt-3 text-xs font-bold opacity-70 uppercase tracking-tighter">
                {brand.students} Students
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div className="relative hidden md:block group">

          {/* <div className={`absolute inset-0 ${brand.theme.layout.panel} rotate-3 transition-transform group-hover:rotate-6`} /> */}

          {brand.hero?.image ? (
            <img
              src={brand.hero.image}
              alt="Learning"
              className={`relative z-10 ${brand.theme.shape?.radius || ""}  object-cover aspect-[4/5] w-full `}
            />
          ) : (
            <div className={`relative z-10 ${brand.theme.layout.panel} aspect-[4/3] w-full flex items-center justify-center`}>
              <div className="text-white/10 font-black text-8xl uppercase -rotate-12 select-none tracking-tighter">
                Learn
              </div>
            </div>
          )}

        </div>

      </div>
      <div className="fixed bottom-6 right-6 z-50">

        {/* Expanded Chat Box */}
        {open && (
          <div
            className="w-72 rounded-2xl shadow-2xl overflow-hidden mb-3"
            style={{ backgroundColor: "white" }}
          >
            {/* Header */}
            <div className="px-4 py-3 text-white font-bold bg-emerald-600 flex justify-between items-center">
              {brand.siteName} Support
              <button
                style={{ background: "none" }}
                onClick={() => setOpen(false)}
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-4 text-sm text-gray-700 space-y-2">
              <p className="font-semibold">Hi 👋</p>

              <p>
                Welcome to <span className="font-semibold">{brand.siteName}</span>.
              </p>

              <p>Have questions about courses or enrollment?</p>

              <p className="text-xs text-gray-500">
                Our team typically replies instantly on WhatsApp.
              </p>
            </div>

            {/* Action */}
            <div className="p-3 pt-0">
              <button
                onClick={openWhatsApp}
                className="w-full py-3 text-white font-semibold transition"
                style={{
                  background: "rgb(5 150 105)",
                  borderRadius: "50px",
                }}
              >
                <MdWhatsapp className="inline mr-2" size={20} />
                Chat on WhatsApp
              </button>
            </div>
          </div>

        )}

        {/* Floating Button */}
        {!open && (
          <button
            onClick={() => setOpen(!open)}
            className="w-18 h-18 rounded-full flex items-center justify-center text-white shadow-xl"
            style={{ background: "rgb(5 150 105)", color: "white", borderRadius: "40%" }}
          >
            <MdWhatsapp size={28} />
          </button>
        )}



      </div>
    </section>

  );
}