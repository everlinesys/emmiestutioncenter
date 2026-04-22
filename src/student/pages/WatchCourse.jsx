import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../shared/api";
import { getUser } from "../../shared/auth";
import { useBranding } from "../../shared/hooks/useBranding";
import { ChevronLeft, ChevronRight, PlayCircle, CheckCircle, GraduationCap } from "lucide-react";

import MobileSyllabus from "../components/MobileSyllabus";
import VideoPlayer from "../../shared/video/VideoPlayer";

export default function WatchCourse() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const user = getUser();
  const brand = useBranding();

  const theme = brand.theme;
  const primaryColor = brand.colors?.primary || "#111827";
  const accentColor = brand.colors?.accent || "#ffffff";

  const [course, setCourse] = useState(null);
  const [units, setUnits] = useState([]);
  const [chaptersByUnit, setChaptersByUnit] = useState({});
  const [currentChapter, setCurrentChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasPassed, setHasPassed] = useState(false);

  const allChapters = useMemo(() => {
    return units.flatMap((unit) => chaptersByUnit[unit.id] || []);
  }, [units, chaptersByUnit]);

  const currentIndex = allChapters.findIndex((ch) => ch.id === currentChapter?.id);
  const hasNext = currentIndex < allChapters.length - 1;
  const hasPrev = currentIndex > 0;
  const isLastChapter = !hasNext;
  const [installments, setInstallments] = useState([]);
  const [nextInstallment, setNextInstallment] = useState(null);
  const now = new Date();

  const dueDate = nextInstallment?.dueDate
    ? new Date(nextInstallment.dueDate)
    : null;

  const diff = dueDate ? dueDate - now : null;

  const isDue = dueDate && now >= dueDate;
  const isNearDue = dueDate && diff <= 3 * 24 * 60 * 60 * 1000 && diff > 0;
  const isFar = dueDate && diff > 3 * 24 * 60 * 60 * 1000;

  useEffect(() => {
    async function load() {
      try {
        const [courseRes, unitsRes] = await Promise.all([
          api.get(`/courses/${courseId}`),
          api.get(`/units?courseId=${courseId}`),
        ]);

        const chaptersMap = {};
        for (const unit of unitsRes.data) {
          const chRes = await api.get(`/chapters?unitId=${unit.id}`);
          chaptersMap[unit.id] = chRes.data;
        }
        const instRes = await api.get(`/payments/installments?courseId=${courseId}`);

        console.log("Installments:", instRes.data);
        setInstallments(instRes.data);

        const next = instRes.data.find(i => !i.paid);
        setNextInstallment(next || null);
        setCourse(courseRes.data);
        setUnits(unitsRes.data);
        setChaptersByUnit(chaptersMap);

        const firstChapter = chaptersMap[unitsRes.data?.[0]?.id]?.[0];
        if (firstChapter) setCurrentChapter(firstChapter);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (courseId) load();
  }, [courseId]);

  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await api.get(`/final-tests/status/${courseId}`);
        setHasPassed(res.data.passed);
      } catch (err) {
        console.error(err);
      }
    }
    if (courseId) checkStatus();
  }, [courseId]);

  async function payNextInstallment() {
    const orderRes = await api.post("/payments/create-next-installment-order", {
      courseId,
    });

    const options = {
      key: orderRes.data.key,
      amount: orderRes.data.amount,
      currency: orderRes.data.currency,
      order_id: orderRes.data.orderId,
      name: brand.siteName,
      description: "Installment Payment",

      handler: async function (response) {
        await api.post("/payments/verify-next-installment", {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          courseId,
        });

        window.location.reload(); // refresh state
      },
    };

    new window.Razorpay(options).open();
  }


  const handleNext = () => hasNext && setCurrentChapter(allChapters[currentIndex + 1]);
  const handlePrev = () => hasPrev && setCurrentChapter(allChapters[currentIndex - 1]);

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
        <p className="text-sm font-medium text-slate-500">Loading your learning experience...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex h-screen items-center justify-center p-10 text-center">
        <div className="max-w-xs">
          <p className="text-lg font-semibold text-slate-900">Course not found</p>
          <p className="text-sm text-slate-500 mt-2">The course you are looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-white ${theme.layout.container}`}>
      <MobileSyllabus
        units={units}
        chaptersByUnit={chaptersByUnit}
        onSelectChapter={setCurrentChapter}
        currentChapterId={currentChapter?.id}
      />

      <div className="mx-auto flex max-w-[1600px]">
        {/* ===== SIDEBAR ===== */}
        <aside className="sticky top-0 hidden h-screen w-80 flex-col border-r border-slate-100 bg-slate-50/50 lg:flex">
          <div className="p-8">
            <span className="inline-block rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
              Course Content
            </span>
            <h1 className="mt-2 text-xl font-bold tracking-tight text-slate-900 line-clamp-2">
              {course.title}
            </h1>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 pb-10 custom-scrollbar">
            {units.map((unit, uIdx) => (
              <div key={unit.id} className="mb-6">
                <h3 className="mb-2 px-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Unit {uIdx + 1}: {unit.title}
                </h3>
                <div className="space-y-1">
                  {(chaptersByUnit[unit.id] || []).map((ch) => {
                    const active = currentChapter?.id === ch.id;
                    return (
                      <button
                        key={ch.id}
                        onClick={() => setCurrentChapter(ch)}
                        className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all ${active
                          ? "bg-white shadow-sm ring-1 ring-slate-200/60"
                          : "hover:bg-slate-100"
                          }`}
                      >
                        <div
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors ${active ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-500 group-hover:bg-slate-300"
                            }`}
                          style={active ? { backgroundColor: primaryColor, color: accentColor } : {}}
                        >
                          <PlayCircle size={14} />
                        </div>
                        <span className={`line-clamp-2 ${active ? "font-semibold text-slate-900" : "text-slate-600"}`}>
                          {ch.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* ===== CONTENT ===== */}
        <main className="min-w-0 flex-1 lg:bg-white">
          <div className="mx-auto max-w-5xl px-4 py-6 lg:p-12">

            {/* VIDEO PLAYER CONTAINER */}
            <div className="relative overflow-hidden rounded-2xl bg-black shadow-2xl ring-1 ring-slate-900/10">
              <div className="aspect-video w-full">
                {currentChapter && (
                  <VideoPlayer videoId={currentChapter.bunnyVideoId} />
                )}
              </div>
            </div>
            {/* ===== PDF VIEWER ===== */}
            {currentChapter?.pdfUrls?.length > 0 && (
              <div className="mt-6 space-y-6">
                <h3 className="text-sm font-semibold text-slate-500">
                  Study Materials
                </h3>

                {currentChapter.pdfUrls.map((url, i) => (
                  <div
                    key={i}
                    className="rounded-xl overflow-hidden border border-slate-200"
                  > {url}
                    <iframe
                      src={`https://${url}#toolbar=0&navpanes=0&scrollbar=1`}
                      className="w-full h-[600px]"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* HEADER & NAVIGATION */}
            {currentChapter && (
              <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                    <span>{course.title}</span>
                    <span>/</span>
                    <span className="text-slate-600">Current Lesson</span>
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
                    {currentChapter.title}
                  </h2>
                  {currentChapter.description && (
                    <p className="max-w-2xl text-base leading-relaxed text-slate-500 leading-relaxed whitespace-pre-line">
                      {currentChapter.description}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-3 bg-slate-50 p-2 rounded-2xl lg:bg-transparent lg:p-0">
                  <button
                    disabled={!hasPrev}
                    onClick={handlePrev}
                    className="flex h-11 items-center gap-2 rounded-xl px-6 text-sm font-bold transition shadow-md hover:opacity-90 active:scale-95 disabled:opacity-50"
                    style={{ backgroundColor: primaryColor, color: accentColor }}
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <button
                    onClick={handleNext}
                    className="flex h-11 items-center gap-2 rounded-xl px-6 text-sm font-bold transition shadow-md hover:opacity-90 active:scale-95 disabled:opacity-50"
                    style={{ backgroundColor: primaryColor, color: accentColor }}
                  >
                    {hasNext ? (
                      <>
                        Next Lesson <ChevronRight size={18} />
                      </>
                    ) : (
                      "Complete Course"
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* COMPLETION STATE CARD */}
            {isLastChapter && (
              <div className="mt-12 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/50 p-8 text-center ring-1 ring-slate-200/50">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
                  <GraduationCap size={32} style={{ color: primaryColor }} />
                </div>

                {!hasPassed ? (
                  <div className="max-w-sm mx-auto">
                    <h3 className="text-xl font-bold text-slate-900">Ready for the final step?</h3>
                    <p className="mt-2 text-sm text-slate-500">
                      You've finished all the lessons. Complete the final assessment to earn your official certificate.
                    </p>
                    <button
                      onClick={async () => {
                        const res = await api.get(`/final-tests/${courseId}`);
                        if (!res.data.length) {
                          alert("No test available for this course yet");
                          return;
                        }
                        window.location.href = `/student/test/${courseId}`;
                      }}
                      className="mt-6 w-full rounded-xl py-3.5 text-sm font-bold shadow-xl transition-transform active:scale-[0.98]"
                      style={{ backgroundColor: primaryColor, color: accentColor }}
                    >
                      🎓 Take Final Test
                    </button>
                  </div>
                ) : (
                  <div className="max-w-sm mx-auto">
                    <div className="flex items-center justify-center gap-2 text-green-600 font-bold mb-2">
                      <CheckCircle size={18} />
                      <span>Course Certified</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Congratulations, {user.name}!</h3>
                    <p className="mt-1 text-sm text-slate-500">Your certificate is ready for download.</p>

                    <button
                      onClick={() => navigate(`/student/certificates`)}
                      className="mt-6 w-full rounded-xl border-2 border-slate-900 bg-slate-900 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                    >
                      View Certificate
                    </button>
                  </div>
                )}
              </div>
            )}
            {nextInstallment && (
              <div
                className={`mb-6 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4
    ${isDue
                    ? "bg-red-50 border border-red-200"
                    : isNearDue
                      ? "bg-yellow-50 border border-yellow-200"
                      : "bg-slate-50 border border-slate-200"
                  }`}
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {isDue
                      ? "Payment overdue"
                      : isNearDue
                        ? "Payment due soon"
                        : "Next payment"}
                  </p>

                  <p className="text-sm font-medium text-slate-800">
                    ₹{nextInstallment.amount}
                  </p>

                  {dueDate && (
                    <p className="text-xs text-slate-400">
                      Due on {dueDate.toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* BUTTON ONLY WHEN NEEDED */}
                {(isDue || isNearDue) && (
                  <button
                    onClick={payNextInstallment}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition active:scale-95"
                    style={{ backgroundColor: primaryColor, color: accentColor }}
                  >
                    Pay Now
                  </button>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}