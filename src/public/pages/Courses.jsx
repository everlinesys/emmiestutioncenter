import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../shared/api";
import { useBranding } from "../../shared/hooks/useBranding";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState({});

  const brand = useBranding();
  const navigate = useNavigate();

  const primary = brand?.primaryColor || "#059669";
  const API_BASE = api.defaults.baseURL.replace("/api", "");

  useEffect(() => {
    async function load() {
      try {
        const courseRes = await api.get("/courses");
        setCourses(courseRes.data || []);
      } catch (err) {
        console.error("Courses failed:", err);
      }

      try {
        const groupRes = await api.get("/course-groups");
        setGroups(groupRes.data || []);
      } catch {
        setGroups([]);
      }

      setLoading(false);
    }
    load();
  }, []);

  function toggleGroup(id) {
    setExpandedGroups((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  // ✅ collect grouped course IDs
  const groupedCourseIds = new Set(
    groups.flatMap((g) =>
      (g.courses || []).map((c) => c.course?.id)
    )
  );

  // ✅ filter standalone courses
  const standaloneCourses = courses.filter(
    (c) => !groupedCourseIds.has(c.id)
  );

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="text-sm opacity-60">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <header
        className="py-20 text-center text-white px-6"
        style={{ backgroundColor: primary }}
      >
        <h1 className="text-4xl md:text-5xl font-black mb-4">
          {brand.preview?.title || "Explore Our Courses"}
        </h1>

        <p className="opacity-90 max-w-xl mx-auto">
          {brand.preview?.description ||
            "Structured learning designed for real-world success."}
        </p>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16 md:px-16 space-y-16">

        {/* ================= GROUPS ================= */}
        {groups.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-8 text-gray-800">
              Course Bundles
            </h2>

            <div className="space-y-12">

              {groups.map((group) => {
                const isExpanded = expandedGroups[group.id];
                const coursesToShow = isExpanded
                  ? group.courses
                  : group.courses.slice(0, 3);

                return (
                  <div key={group.id} className="space-y-4">

                    {/* HEADER */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {group.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {group.description}
                        </p>
                      </div>

                      {group.courses.length > 3 && (
                        <button
                          onClick={() => toggleGroup(group.id)}
                          className="text-sm font-semibold"
                          style={{ color: primary }}
                        >
                          {isExpanded ? "Show less ↑" : "Show more →"}
                        </button>
                      )}
                    </div>

                    {/* SAME COURSE CARD UI */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
                      {coursesToShow.map(({ course }) => (
                        <div
                          key={course.id}
                          onClick={() => navigate(`/courses/${course.id}`)}
                          className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition cursor-pointer"
                        >
                          <div className="h-52 bg-gray-100 overflow-hidden">
                            {course.thumbnail ? (
                              <img
                                src={`${API_BASE}${course.thumbnail}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition"
                              />
                            ) : (
                              <div className="h-full flex items-center justify-center text-gray-400">
                                No image
                              </div>
                            )}
                          </div>

                          <div className="p-6 space-y-3">
                            <h3 className="text-xl font-bold text-gray-800">
                              {course.title}
                            </h3>

                            <p className="text-sm text-gray-500 line-clamp-2">
                              {course.description}
                            </p>

                            <span
                              className="inline-block mt-2 text-sm font-semibold"
                              style={{ color: primary }}
                            >
                              View Details →
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                );
              })}

            </div>
          </section>
        )}

        {/* ================= STANDALONE COURSES ================= */}
        {standaloneCourses.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-8 text-gray-800">
              All Courses
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {standaloneCourses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => navigate(`/courses/${course.id}`)}
                  className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition cursor-pointer"
                >
                  <div className="h-52 bg-gray-100 overflow-hidden">
                    {course.thumbnail ? (
                      <img
                        src={`${API_BASE}${course.thumbnail}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="p-6 space-y-3">
                    <h3 className="text-xl font-bold text-gray-800">
                      {course.title}
                    </h3>

                    <p className="text-sm text-gray-500 line-clamp-2">
                      {course.description}
                    </p>

                    <span
                      className="inline-block mt-2 text-sm font-semibold"
                      style={{ color: primary }}
                    >
                      View Details →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>
    </div>
  );
}