import React from "react";
import {
  Instagram,
  MessageCircle,
  BookOpen,
  Star,
  GraduationCap,
  CheckCircle2,
} from "lucide-react";
import { MdWhatsapp } from "react-icons/md";

export default function About() {
  const instagramUrl = "https://instagram.com/emmiestuitioncenter/";
  const whatsappUrl = "https://wa.me/918606834949";

  return (
    <div className="bg-[#f5f5f5] text-slate-900 min-h-screen py-0 my-0">

      {/* HERO SECTION */}
      <section className="relative bg-gradient-to-br from-[#0f172a] via-[#0b3b7a] to-[#111827] text-white py-24 px-6 overflow-hidden px-5 md:px-16">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-yellow-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-blue-500 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium tracking-wider uppercase bg-yellow-400/20 border border-yellow-300/30 rounded-full text-yellow-200">
            Online Tuition Center
          </span>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
            Emmie's <span className="text-yellow-400">Tuition Center</span>
          </h1>

          <p className="text-lg md:text-xl opacity-90 max-w-3xl mx-auto leading-relaxed">
            Customized online learning experience with dedicated one-to-one
            guidance for students from Class 1 to 12 across CBSE, ICSE, IB,
            IGCSE, and State syllabus.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a
              href={whatsappUrl}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 transition-all px-8 py-3 rounded-full font-bold shadow-lg"
            >
              <MessageCircle size={20} /> Join Now
            </a>

            <a
              href={instagramUrl}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all px-8 py-3 rounded-full font-bold border border-white/10"
            >
              <Instagram size={20} /> Follow Updates
            </a>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-24 px-5 md:px-16">

        {/* ABOUT SECTION */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-32">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Why <span className="text-yellow-500">Emmie's</span> Stands Out
            </h2>

            <p className="text-slate-600 text-lg leading-relaxed mb-6">
              At Emmie's Tuition Center, we focus on personalized learning,
              concept clarity, and academic confidence. Every student receives
              individual attention with flexible learning support from expert
              teachers.
            </p>

            <div className="space-y-4">
              {[
                "One-to-One Personalized Classes",
                "Expert Teaching Staff",
                "Flexible Learning Schedule",
                "Affordable Fee Structure",
                "Dedicated Academic Guidance"
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 font-medium text-slate-700"
                >
                  <CheckCircle2 className="text-yellow-500" size={20} />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100">
            <div className="grid grid-cols-2 gap-4">

              <div className="p-6 bg-yellow-50 rounded-2xl text-center">
                <BookOpen className="mx-auto mb-2 text-yellow-600" />
                <div className="font-bold text-2xl">1 - 12</div>
                <div className="text-xs uppercase text-slate-500">
                  Classes Covered
                </div>
              </div>

              <div className="p-6 bg-blue-50 rounded-2xl text-center">
                <GraduationCap className="mx-auto mb-2 text-blue-600" />
                <div className="font-bold text-2xl">5+</div>
                <div className="text-xs uppercase text-slate-500">
                  Syllabus Support
                </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-2xl text-center col-span-2">
                <Star className="mx-auto mb-2 text-yellow-500" />
                <div className="font-bold text-xl text-slate-800 italic">
                  "Learning with Clarity & Confidence"
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COURSES GRID */}
        <h3 className="text-3xl font-bold text-center mb-12">
          Our Learning Programs
        </h3>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

          {[
            {
              title: "Primary Classes",
              desc: "Strong basics for young learners.",
              list: [
                "Class 1 - 5",
                "All Subjects",
                "Foundation Learning"
              ],
              color: "border-t-yellow-500"
            },
            {
              title: "Middle School",
              desc: "Concept-focused academic guidance.",
              list: [
                "Class 6 - 8",
                "Science & Maths",
                "Language Support"
              ],
              color: "border-t-blue-500"
            },
            {
              title: "High School",
              desc: "Exam-oriented preparation.",
              list: [
                "Class 9 - 12",
                "Board Exam Preparation",
                "Advanced Subject Support"
              ],
              color: "border-t-emerald-500"
            },
            {
              title: "Syllabus Covered",
              desc: "Comprehensive syllabus support.",
              list: [
                "CBSE",
                "ICSE",
                "IB",
                "IGCSE",
                "STATE"
              ],
              color: "border-t-orange-500"
            }
          ].map((course, index) => (
            <div
              key={index}
              className={`bg-white p-8 rounded-2xl shadow-sm border-t-4 ${course.color} hover:shadow-md transition-shadow group`}
            >
              <h3 className="text-xl font-bold mb-2 group-hover:text-yellow-600 transition-colors">
                {course.title}
              </h3>

              <p className="text-sm text-slate-500 mb-6">
                {course.desc}
              </p>

              <ul className="space-y-3">
                {course.list.map((li, i) => (
                  <li
                    key={i}
                    className="text-sm flex items-center gap-2 text-slate-700"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                    {li}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div className="mt-32 pt-12 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-8">

          <div>
            <h4 className="text-2xl font-bold text-slate-900">
              Emmie's Tuition Center
            </h4>

            <p className="text-slate-500">
              Customized learning for better results.
            </p>
          </div>

          <div className="flex gap-4">
            <a
              href={instagramUrl}
              className="p-3 bg-white rounded-full border border-slate-200 text-pink-600 hover:scale-110 transition-transform shadow-sm"
              aria-label="Instagram"
            >
              <Instagram size={24} />
            </a>

            <a
              href={whatsappUrl}
              className="p-3 bg-white rounded-full border border-slate-200 text-green-600 hover:scale-110 transition-transform shadow-sm"
              aria-label="WhatsApp"
            >
              <MdWhatsapp size={24} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}