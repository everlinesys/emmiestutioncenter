import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../shared/api";
import { getUser } from "../../shared/auth";
import VideoPlayer from "../../shared/video/VideoPlayer";
import { useBranding } from "../../shared/hooks/useBranding";

export default function CourseDetails() {
  const { courseId } = useParams();
  const user = getUser();
  const brand = useBranding();
  const [selectedPlan, setSelectedPlan] = useState("full");
  const [course, setCourse] = useState(null);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [owned, setOwned] = useState(false);

  const primary = brand?.primaryColor || "#059669";
  const accent = brand?.accentColor || "#ffffff";

  useEffect(() => {
    async function load() {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
      try {
        const courseRes = await api.get(`/courses/${courseId}`);
        const unitsRes = await api.get(`/units?courseId=${courseId}`);

        const data = courseRes.data;

        setCourse({
          ...data,
          installmentOptions: Array.isArray(data.installmentOptions)
            ? data.installmentOptions
            : JSON.parse(data.installmentOptions || "[]"),
        });
        setUnits(unitsRes.data);

        if (user) {
          const pr = await api.get(`/purchase/my?userId=${user.id}`);
          const ownedIds = pr.data.map((p) => p.courseId);
          setOwned(ownedIds.includes(Number(courseId)));
        }
      } catch (err) {
        console.error("Course details error:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [courseId]);

  async function buy(courseId) {
    const user = getUser();
    if (!user) return (window.location = "/register");

    // const orderRes = await api.post("/payments/create-order", { courseId });
    const orderRes = await api.post("/payments/create-order", {
      courseId,
      plan: selectedPlan === "full" ? 1 : selectedPlan,
    });

    const options = {
      key: orderRes.data.key,
      amount: orderRes.data.amount,
      currency: orderRes.data.currency,
      order_id: orderRes.data.orderId,
      name: brand.siteName,
      description: course.title,
      handler: async function (response) {
        await api.post("/payments/verify", {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          courseId,
          plan: selectedPlan === "full" ? 1 : selectedPlan,
        });
        window.location = `/student/watch/${courseId}`;
      },
    };

    new window.Razorpay(options).open();
  }

  if (loading) return <div className="py-20 text-center">Loading course...</div>;
  if (!course) return <div className="py-20 text-center">Course not found!!!.</div>;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ===== HERO ===== */}
      <div
        className="text-white py-16 "
        style={{ backgroundColor: primary }}
      >
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">

          {/* LEFT */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-black">
              {course.title}
            </h1>

            <p className="opacity-90 max-w-lg leading-relaxed whitespace-pre-line">
              {course.description}
            </p>

            <div className="text-3xl  font-bold">
              ₹{course.price} <span className="line-through text-white/70 text-2xl"> ₹{course.oldPrice}</span>
              {/* PAYMENT OPTIONS */}
            </div>
            {course.installmentOptions?.length > 0 && !owned && (
              <div className="mt-6 space-y-3">

                <p className="text-sm opacity-80">Choose Payment Plan</p>

                <div className="flex flex-wrap gap-2">

                  {/* ONE TIME */}
                  <button
                    onClick={() => setSelectedPlan("full")}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold ${selectedPlan === "full"
                      ? "bg-white text-black"
                      : "bg-white/20 text-white"
                      }`}
                  >
                    One-time
                  </button>

                  {/* INSTALLMENTS */}
                  {course.installmentOptions
                    ?.filter((m) => Number.isFinite(m) && m > 0) // 👈 FILTER BAD VALUES
                    .map((months) => (
                      <button
                        key={months}
                        onClick={() => setSelectedPlan(months)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${selectedPlan === months
                          ? "bg-white text-black shadow"
                          : "bg-white/20 text-white hover:bg-white/30"
                          }`}
                      >
                        {months} mo
                      </button>
                    ))}
                </div>

                {/* 💰 PRICE PREVIEW */}
                {selectedPlan !== "full" && (
                  <p className="text-sm opacity-90">
                    ₹{Math.ceil(course.price / selectedPlan)} × {selectedPlan} months
                  </p>
                )}

              </div>
            )}

            {/* ACTION BUTTONS */}
            {!user && (
              <a
                href="/login"
                className="inline-block px-8 py-3 bg-white text-black rounded-xl font-semibold"
              >
                Login to Enroll
              </a>
            )}

            {user && owned && (
              <button
                onClick={() => (window.location = `/student/watch/${courseId}`)}
                className="px-8 py-3 bg-green-600 text-white rounded-xl font-semibold"
              >
                Continue Learning
              </button>
            )}

            {user && !owned && (
              <button
                onClick={() => buy(courseId)}
                className="px-8 py-3 bg-white text-black rounded-xl font-semibold"
              >
                Purchase Course
              </button>
            )}
          </div>

          {/* RIGHT — VIDEO */}
          <div className="rounded-2xl overflow-hidden shadow-2xl bg-black">

            {course.introBunnyVideoId ? (
              <VideoPlayer videoId={course.introBunnyVideoId} />
            ) : course.thumbnail ? (
              <img
                src={`${api.defaults.baseURL.replace("/api", "")}${course.thumbnail}`}
                className="w-full h-full object-cover"
                alt={course.title}
              />
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                No preview available
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ===== CURRICULUM ===== */}
      <div className="max-w-5xl mx-auto px-6 py-16 text-black" style={{ color: primary, background: accent }}>

        <h2 className="text-2xl font-bold ">
          Course Curriculum
        </h2>

        <div className="bg-white rounded-2xl shadow divide-y">
          {units.map((unit, index) => (
            <div key={unit.id} className="p-5 flex gap-4 items-center">

              <div
                className="w-8 h-8 min-w-[32px] min-h-[32px] flex-shrink-0 rounded-full text-white flex items-center justify-center text-sm font-bold"
                style={{ backgroundColor: primary }}
              >
                {index + 1}
              </div>

              <div className="font-medium text-gray-800">
                {unit.title}
              </div>

            </div>
          ))}
        </div>

      </div>

      <div className="items-center text-center py-20 ">


        {/* ACTION BUTTONS */}
        {!user && (
          <a
            href="/login"
            className="inline-block px-8 py-3  text-black rounded-xl font-semibold"
          >
            Login to Enroll
          </a>
        )}

        {user && owned && (
          <button
            onClick={() => (window.location = `/student/watch/${courseId}`)}
            className="px-8 py-3 bg-green-600 text-white rounded-xl font-semibold"
          >
            Continue Learning
          </button>
        )}

        {user && !owned && (
          <button
            onClick={() => buy(courseId)}
            className="px-8 py-3 bg-white text-black rounded-xl font-semibold"
          >
            Purchase Course
          </button>
        )}
      </div>
    </div>
  );
}
