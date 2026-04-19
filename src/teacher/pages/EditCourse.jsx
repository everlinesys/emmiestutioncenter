import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../shared/api";

export default function EditCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const isNew = id === "new";
  const PLAN_OPTIONS = [2, 3, 6, 12];
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    oldPrice: "",
    thumbnail: "",
    introBunnyVideoId: "",
    installmentOptions: [],
  });

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // ================= LOAD COURSE =================
  useEffect(() => {
    if (isNew) return;

    async function load() {
      try {
        const { data } = await api.get(`/courses/${id}`);

        setForm({
          title: data.title || "",
          description: data.description || "",
          price: data.price ?? "",
          oldPrice: data.oldPrice ?? "",
          thumbnail: data.thumbnail || "",
          introBunnyVideoId: data.introBunnyVideoId || "",
          installmentOptions: Array.isArray(data.installmentOptions)
            ? data.installmentOptions
            : JSON.parse(data.installmentOptions || "[]"),
        });
      } catch (err) {
        console.error(err);
      }
    }

    load();
  }, [id, isNew]);

  // ================= THUMBNAIL =================
  async function uploadThumbnail(file) {
    if (!file) return;

    const fd = new FormData();
    fd.append("thumbnail", file);

    setUploading(true);

    try {
      const res = await api.post("/uploads/course-thumbnail", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setForm((p) => ({ ...p, thumbnail: res.data.url }));
    } catch (err) {
      console.error(err);
    }

    setUploading(false);
  }

  // ================= VIDEO =================
  async function uploadVideo(file) {
    if (!file) return;
    setError("");
    setUploading(true);
    setProgress(0);

    try {
      const { data } = await api.post(
        "/admin/bunny/create-video-simple",
        { title: file.name }
      );

      const { videoId, uploadUrl, accessKey } = data; // 👈 include accessKey

      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadUrl);

      // ✅ REQUIRED HEADERS (missing before)
      xhr.setRequestHeader("AccessKey", accessKey);
      xhr.setRequestHeader(
        "Content-Type",
        file.type || "application/octet-stream"
      );

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress(Math.floor((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setForm((p) => ({
            ...p,
            introBunnyVideoId: videoId,
          }));
          setError("");
        } else {

          setError("Upload failed");
        }

        setUploading(false);
      };

      xhr.onerror = () => {
        setError("Upload error");
        setUploading(false);
      };

      xhr.send(file);
    } catch (err) {
      console.error(err);
      setUploading(false);
    }
  }

  // ================= SAVE =================
  async function save(e) {
    e.preventDefault();

    if (!form.title || !form.description) {
      alert("Title & description required");
      return;
    }

    if (!form.price) {
      alert("Price is required");
      return;
    }

    const payload = {
      ...form,
      price: Number(form.price),
      oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
      installmentOptions: form.installmentOptions || [],
    };

    try {
      if (isNew) {
        await api.post("/courses", payload);
      } else {
        await api.put(`/courses/${id}`, payload);
      }

      navigate("/admin/courses");
    } catch (err) {
      console.error(err);
      alert("Failed to save course");
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 px-2 py-10">

      <h2 className="text-2xl font-semibold">
        {isNew ? "Create Course" : "Edit Course"}
      </h2>

      <form onSubmit={save} className="space-y-8 max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-100">

        {/* SECTION: BASIC INFO */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Course Details</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
            <input
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="e.g. Advanced React Architecture"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              rows={4}
              placeholder="What will students learn?"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
        </div>

        {/* SECTION: PRICING */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Price ($)</label>
            <input
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 outline-none"
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Old Price ($)</label>
            <input
              className="w-full border border-gray-300 rounded-lg p-3 bg-gray-50 text-gray-500"
              type="number"
              value={form.oldPrice}
              onChange={(e) => setForm({ ...form, oldPrice: e.target.value })}
            />
          </div>
        </div>

        {/* SECTION: INSTALLMENTS */}
        {/* SECTION: PAYMENT PLANS */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-800">Payment Plans</h3>

          <div className="flex flex-wrap gap-2">

            {/* ONE TIME (ALWAYS AVAILABLE) */}
            <div className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-900 text-white">
              One-time
            </div>

            {/* DYNAMIC INSTALLMENTS */}
            {PLAN_OPTIONS.map((months) => {
              const active = form.installmentOptions.includes(months);

              return (
                <button
                  key={months}
                  type="button"
                  onClick={() => {
                    setForm((p) => ({
                      ...p,
                      installmentOptions: active
                        ? p.installmentOptions.filter(x => x !== months)
                        : [...p.installmentOptions, months].sort((a, b) => a - b)
                    }));
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${active
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
                    }`}
                >
                  {months} mo
                </button>
              );
            })}
          </div>

          <p className="text-xs text-gray-400">
            Users will always have one-time payment. Select optional installment plans.
          </p>
        </div>

        {/* SECTION: MEDIA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* THUMBNAIL */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Cover Image</label>
            <div className="relative group border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-blue-400 transition-colors">
              {form.thumbnail ? (
                <img
                  src={import.meta.env.VITE_API_URL.replace("/api", "") + form.thumbnail}
                  className="w-full h-32 object-cover rounded-lg mb-2"
                />
              ) : (
                <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 text-xs text-center">
                  No image uploaded
                </div>
              )}
              <label className="cursor-pointer block text-center text-sm font-semibold text-blue-600 hover:text-blue-700">
                Upload New
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => uploadThumbnail(e.target.files[0])}
                />
              </label>
            </div>
          </div>

          {/* INTRO VIDEO */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Intro Video</label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center min-h-[160px]">
              {uploading ? (
                <div className="w-full space-y-2">
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                  </div>
                  <p className="text-xs text-center text-gray-500">Uploading {progress}%</p>
                </div>
              ) : (
                <label className="cursor-pointer text-center">
                  <div className="bg-blue-50 p-3 rounded-full mb-2 inline-block">
                    <span className="text-blue-600 text-xl">▶</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-600">Click to upload video</p>
                  <input
                    type="file"
                    className="hidden"
                    accept="video/*"
                    onChange={(e) => {
                      uploadVideo(e.target.files[0]);
                      e.target.value = null;
                    }}
                  />
                </label>
              )}
              {form.introBunnyVideoId && !uploading && (
                <p className="text-xs font-medium text-green-600 mt-2 flex items-center gap-1">
                  <span className="text-lg">✓</span> Video Ready
                </p>
              )}
            </div>
          </div>
        </div>

        {/* SAVE BUTTON */}
        <div className="pt-4">
          <button className="w-full md:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95">
            {isNew ? "Create New Course" : "Update Course Settings"}
          </button>
        </div>

      </form>
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  );
}