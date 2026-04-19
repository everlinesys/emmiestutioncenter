import { useEffect, useState, useRef } from "react";
import api from "../../shared/api";

export default function UnitEditor({ unit }) {
  const [chapters, setChapters] = useState([]);

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState(null);

  const [editing, setEditing] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const fileRef = useRef();

  // ================= LOAD =================
  async function load() {
    const res = await api.get(`/chapters?unitId=${unit.id}`);
    setChapters(res.data);
  }

  useEffect(() => {
    load();
  }, [unit.id]);

  // =========================================================
  // 🔥 VIDEO UPLOAD HELPER (used for create & edit)
  // =========================================================
  async function uploadVideo(titleForVideo) {
    const { data } = await api.post(
      "/admin/bunny/create-video-simple",
      { title: titleForVideo },
      {
        headers: {
          Authorization:
            "Bearer " + localStorage.getItem("token"),
        },
      }
    );

    const { videoId, uploadUrl, accessKey } = data;

    await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadUrl);

      xhr.setRequestHeader("AccessKey", accessKey);
      xhr.setRequestHeader(
        "Content-Type",
        file.type || "application/octet-stream"
      );

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress(
            Math.floor((e.loaded / e.total) * 100)
          );
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300)
          resolve();
        else reject(xhr.responseText);
      };

      xhr.onerror = reject;
      xhr.send(file);
    });

    return videoId;
  }

  // ================= CREATE =================
  async function createChapter(e) {
    e.preventDefault();

    if (!title || !file)
      return alert("Title and video required");

    try {
      setUploading(true);
      setProgress(0);

      const videoId = await uploadVideo(title);

      await api.post(
        "/chapters",
        {
          unitId: unit.id,
          title,
          description: desc,
          bunnyVideoId: videoId,
          bunnyLibraryId:
            import.meta.env.VITE_BUNNY_LIBRARY_ID,
        },
        {
          headers: {
            Authorization:
              "Bearer " + localStorage.getItem("token"),
          },
        }
      );

      resetForm();
      load();

    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  // ================= START EDIT =================
  function startEdit(chapter) {
    setEditing(chapter.id);
    setTitle(chapter.title);
    setDesc(chapter.description || "");
  }

  // ================= SAVE EDIT =================
  async function saveEdit(e) {
    e.preventDefault();

    try {
      setUploading(true);

      let videoId;

      // If new file selected → upload new video
      if (file) {
        videoId = await uploadVideo(title);
      }

      await api.put(
        `/chapters/${editing}`,
        {
          title,
          description: desc,
          ...(videoId && {
            bunnyVideoId: videoId,
            bunnyLibraryId:
              import.meta.env.VITE_BUNNY_LIBRARY_ID,
          }),
        },
        {
          headers: {
            Authorization:
              "Bearer " + localStorage.getItem("token"),
          },
        }
      );

      resetForm();
      load();

    } catch (err) {
      console.error(err);
      alert("Update failed");
    } finally {
      setUploading(false);
    }
  }

  // ================= DELETE =================
  async function deleteChapter(id) {
    if (!confirm("Delete chapter?")) return;

    await api.delete(`/chapters/${id}`, {
      headers: {
        Authorization:
          "Bearer " + localStorage.getItem("token"),
      },
    });

    load();
  }

  function resetForm() {
    setEditing(null);
    setTitle("");
    setDesc("");
    setFile(null);
    setProgress(0);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="space-y-10">

      {/* HEADER */}
      <div className="flex justify-between">
        <h3 className="text-xl font-bold text-white">
          {unit.title}
        </h3>
        <span className="text-xs text-slate-400">
          {chapters.length} chapters
        </span>
      </div>
      {/* ===== CHAPTER LIST ===== */}
      <div className="space-y-3">
        {chapters.map((c, index) => (
          <div
            key={c.id}
            className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex justify-between"
          >
            <div>
              <h4 className="font-semibold text-white">
                {index + 1}. {c.title}
              </h4>

              {c.description && (
                <p className="text-sm text-slate-400 mt-1 leading-relaxed whitespace-pre-line">
                  {c.description}
                </p>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => startEdit(c)}
                className="text-indigo-400 text-sm"
                style={{ background: "transparent", padding: "0px" }}
              >
                Edit
              </button>

              <button
                onClick={() => deleteChapter(c.id)}
                className="text-red-400 text-sm"
                style={{ background: "transparent", padding: "0px" }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      {/* ===== CREATE / EDIT FORM ===== */}
      <form
        onSubmit={editing ? saveEdit : createChapter}
        className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-5"
      >
        <h4 className="font-semibold">
          {editing ? "Edit Chapter" : "Add Chapter"}
        </h4>

        <input
          className="w-full bg-slate-950 border border-slate-700 p-3 rounded-lg"
          placeholder="Chapter title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="w-full bg-slate-950 border border-slate-700 p-3 rounded-lg"
          placeholder="Description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />

        {/* VIDEO PICKER */}
        <label className="block cursor-pointer bg-slate-950 border border-slate-700 rounded-lg p-4 text-center text-sm text-slate-400 hover:border-indigo-500">
          <input
            ref={fileRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => setFile(e.target.files[0])}
          />
          {file
            ? file.name
            : editing
              ? "Select new video to replace (optional)"
              : "Click to select video"}
        </label>

        {uploading && (
          <div>
            <div className="text-sm text-indigo-400 mb-1">
              Uploading {progress}%
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full">
              <div
                className="bg-indigo-500 h-2 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            disabled={uploading}
            className="px-6 py-2 bg-indigo-600 rounded-lg"
          >
            {editing ? "Save Changes" : "Create Chapter"}
          </button>

          {editing && (
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-2 border rounded-lg"
            >
              Cancel
            </button>
          )}
        </div>
      </form>


    </div>
  );
}
