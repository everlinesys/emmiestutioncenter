import React from "react";
import { Instagram, MessageCircle, BookOpen, Star, GraduationCap, CheckCircle2 } from "lucide-react";
import { MdWhatsapp } from "react-icons/md";

export default function About() {
  const instagramUrl = "https://instagram.com/tutorx.learning.academy/";
  const whatsappUrl = "https://wa.me/9497340940";

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen  py-0 my-0">
      
      {/* HERO SECTION */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-24 px-6 overflow-hidden  px-5 md:px-16">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-indigo-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium tracking-wider uppercase bg-blue-500/20 border border-blue-400/30 rounded-full">
            Empowering Next-Gen Learners
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
            TutorX <span className="text-blue-400">Learning Academy</span>
          </h1>
          <p className="text-lg md:text-xl opacity-80 max-w-2xl mx-auto leading-relaxed">
            Building unbreakable academic foundations for Class 1 to 10 with 
            personalized mentorship and a future-ready curriculum.
          </p>
          
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a href={whatsappUrl} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 transition-all px-8 py-3 rounded-full font-bold shadow-lg shadow-green-900/20">
              <MessageCircle size={20} /> Enroll Now
            </a>
            <a href={instagramUrl} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all px-8 py-3 rounded-full font-bold border border-white/10">
              <Instagram size={20} /> Follow Updates
            </a>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-24  px-5 md:px-16">
        
        {/* ABOUT SECTION */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-32">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Why <span className="text-blue-600">TutorX</span> Stands Out
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed mb-6">
              We don't just teach; we ignite curiosity. At TutorX, we believe every child has a unique learning pace. Our structured tuition ensures clarity in concepts and confidence in exams.
            </p>
            <div className="space-y-4">
              {[
                "Personalized Attention",
                "Concept-Driven Learning",
                "Regular Performance Tracking",
                "Expert Mentorship"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 font-medium text-slate-700">
                  <CheckCircle2 className="text-blue-500" size={20} /> {item}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100">
            <div className="grid grid-cols-2 gap-4">
               <div className="p-6 bg-blue-50 rounded-2xl text-center">
                  <BookOpen className="mx-auto mb-2 text-blue-600" />
                  <div className="font-bold text-2xl">100%</div>
                  <div className="text-xs uppercase text-slate-500">Clarity</div>
               </div>
               <div className="p-6 bg-indigo-50 rounded-2xl text-center">
                  <GraduationCap className="mx-auto mb-2 text-indigo-600" />
                  <div className="font-bold text-2xl">Class 1-10</div>
                  <div className="text-xs uppercase text-slate-500">Expertise</div>
               </div>
               <div className="p-6 bg-purple-50 rounded-2xl text-center col-span-2">
                  <Star className="mx-auto mb-2 text-purple-600" />
                  <div className="font-bold text-xl text-slate-800 italic">"Making Learning Playful & Precise"</div>
               </div>
            </div>
          </div>
        </div>

        {/* COURSES GRID */}
        <h3 className="text-3xl font-bold text-center mb-12">Our Specialized Programs</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* CARDS */}
          {[
            {
              title: "Foundation Classes",
              desc: "Building basics for early learners.",
              list: ["English", "Malayalam", "Mathematics", "Hindi", "Arabic"],
              color: "border-t-blue-500"
            },
            {
              title: "Elite Programs",
              desc: "Mastery for advanced students.",
              list: ["Elite English (Advanced)", "Elite Hindi (Advanced)"],
              color: "border-t-indigo-500"
            },
            {
              title: "Kerala Syllabus",
              desc: "State syllabus excellence.",
              list: ["Classes 5 – 10", "English Medium", "Malayalam Medium"],
              color: "border-t-emerald-500"
            },
            {
              title: "CBSE Syllabus",
              desc: "Full academic support.",
              list: ["Classes 1 – 10", "All Major Subjects", "Exam Prep"],
              color: "border-t-orange-500"
            }
          ].map((course, index) => (
            <div key={index} className={`bg-white p-8 rounded-2xl shadow-sm border-t-4 ${course.color} hover:shadow-md transition-shadow group`}>
              <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
                {course.title}
              </h3>
              <p className="text-sm text-slate-500 mb-6">{course.desc}</p>
              <ul className="space-y-3">
                {course.list.map((li, i) => (
                  <li key={i} className="text-sm flex items-center gap-2 text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                    {li}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* FOOTER / SOCIALS */}
        <div className="mt-32 pt-12 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <h4 className="text-2xl font-bold text-slate-900">TutorX Learning Academy</h4>
            <p className="text-slate-500">Where Talent meet Excellence.</p>
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