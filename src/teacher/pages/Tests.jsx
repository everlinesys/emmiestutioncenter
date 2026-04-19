import { useEffect, useState } from "react";
import api from "../../shared/api";
import { Plus, Trash2, FileText, Award, X, ChevronRight, CheckCircle2 } from "lucide-react";

export default function Tests() {
  const [tests, setTests] = useState([]);
  const [courses, setCourses] = useState([]);
  const [activeTab, setActiveTab] = useState("tests");

  const [showModal, setShowModal] = useState(false);
  const [viewGroup, setViewGroup] = useState(null);
  const [editingQ, setEditingQ] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");

  const [form, setForm] = useState({
    title: "",
    questions: [],
  });

  const [question, setQuestion] = useState({
    text: "",
    options: ["", "", "", ""],
    correctIndex: 0,
  });

  const [newQ, setNewQ] = useState({
    text: "",
    options: ["", "", "", ""],
    correctIndex: 0,
  });

  // ---------------- LOAD ----------------
  async function loadTests() {
    const res = await api.get("/final-tests");
    setTests(res.data || []);
  }

  async function loadCertificates() {
    const res = await api.get("/certificate/admin/certificates");
    setCertificates(res.data || []);
  }

  async function loadCourses() {
    const res = await api.get("/courses");
    setCourses(res.data || []);
  }

  useEffect(() => {
    loadTests();
    loadCourses();
    loadCertificates();
  }, []);

  // ---------------- ADD QUESTION (CREATE MODAL) ----------------
  function addQuestion() {
    if (!question.text) return alert("Enter question");

    setForm((prev) => ({
      ...prev,
      questions: [...prev.questions, question],
    }));

    setQuestion({
      text: "",
      options: ["", "", "", ""],
      correctIndex: 0,
    });
  }

  function removeQuestion(index) {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  }

  // ---------------- SAVE TEST ----------------
  async function saveTest() {
    if (!form.title) return alert("Enter title");
    if (!selectedCourseId) return alert("Select course");
    if (form.questions.length === 0)
      return alert("Add at least one question");

    await Promise.all(
      form.questions.map((q) =>
        api.post("/final-tests", {
          title: form.title,
          question: q.text,
          options: JSON.stringify(q.options),
          answer: q.options[q.correctIndex],
          courseId: selectedCourseId,
        })
      )
    );

    alert("Test created");

    setShowModal(false);
    setForm({ title: "", questions: [] });
    setSelectedCourseId("");
    loadTests();
  }

  // ---------------- GROUP ----------------
  const groupedTests = Object.values(
    tests.reduce((acc, t) => {
      const key = `${t.title}-${t.courseId}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(t);
      return acc;
    }, {})
  );

  function getCourseName(id) {
    return courses.find((c) => c.id === id)?.title || "Unknown Course";
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("tests")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === "tests"
              ? "bg-indigo-600 text-white"
              : "bg-gray-200"
              }`}
          >
            Tests
          </button>

          <button
            onClick={() => setActiveTab("certificates")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === "certificates"
              ? "bg-indigo-600 text-white"
              : "bg-gray-200"
              }`}
          >
            Certificates
          </button>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm"
        >
          <Plus size={18} /> Create New Test
        </button>
      </div>

      {/* TEST LIST GRID */}
      {activeTab != "certificates" && (<div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groupedTests.map((group, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                  Final Exam
                </span>
                <span className="text-gray-400 text-xs flex items-center gap-1">
                  <FileText size={12} /> {group.length} Qns
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 leading-tight">{group[0].title}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-1 italic">{getCourseName(group[0].courseId)}</p>
              </div>
            </div>

            <button
              onClick={() => setViewGroup(group)}
              className="mt-6 flex items-center justify-center gap-2 w-full py-2 bg-gray-900 hover:bg-black text-white text-sm font-medium rounded-lg transition-colors"
            >
              Manage Content <ChevronRight size={14} />
            </button>
          </div>
        ))}

        {groupedTests.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-xl border-2 border-dashed border-gray-200">
            <FileText className="mx-auto text-gray-300 mb-2" size={48} />
            <p className="text-gray-500">No tests created yet. Get started by clicking "Create New Test".</p>
          </div>
        )}
      </div>)}
      {activeTab === "certificates" && (
        <div className="max-w-7xl mx-auto bg-white border rounded-xl overflow-hidden">

          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Student</th>
                <th className="px-4 py-3 text-left">Course</th>
                <th className="px-4 py-3 text-left">Score</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {certificates.map((c) => (
                <tr key={c.id} className="border-t hover:bg-gray-50">

                  <td className="px-4 py-3 font-medium">
                    {c.User?.name || "User"}
                  </td>

                  <td className="px-4 py-3">
                    {c.course?.title || "Course"}
                  </td>

                  <td className="px-4 py-3">
                    {c.score}%
                  </td>

                  <td className="px-4 py-3 text-gray-500">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>

                  <td className="px-4 py-3">
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">
                      Passed
                    </span>
                  </td>

                </tr>
              ))}

              {certificates.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-gray-400">
                    No certificates generated yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-800">New Assessment</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Step 1: Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Assign to Course</label>
                  <select
                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(Number(e.target.value))}
                  >
                    <option value="">Select a course...</option>
                    {courses
                      .filter((c) => !tests.some((t) => t.courseId === c.id))
                      .map((c) => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Test Title</label>
                  <input
                    placeholder="e.g., Semester 1 Final"
                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
              </div>

              {/* Step 2: Add Question Builder */}
              <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-3">
                <h4 className="text-sm font-bold text-indigo-900">Question Builder</h4>
                <input
                  placeholder="Enter the question text"
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={question.text}
                  onChange={(e) => setQuestion({ ...question, text: e.target.value })}
                />

                <div className="grid grid-cols-2 gap-3">
                  {question.options.map((opt, i) => (
                    <input
                      key={i}
                      placeholder={`Option ${i + 1}`}
                      className={`w-full border p-2.5 rounded-lg text-sm transition-all outline-none ${question.correctIndex === i ? 'border-green-500 bg-green-50 ring-1 ring-green-500' : 'border-gray-300'}`}
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...question.options];
                        newOpts[i] = e.target.value;
                        setQuestion({ ...question, options: newOpts });
                      }}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <select
                    value={question.correctIndex}
                    onChange={(e) => setQuestion({ ...question, correctIndex: Number(e.target.value) })}
                    className="flex-1 border border-gray-300 p-2 rounded-lg text-sm font-medium"
                  >
                    {question.options.map((_, i) => (
                      <option key={i} value={i}>Correct Answer: Option {i + 1}</option>
                    ))}
                  </select>
                  <button
                    onClick={addQuestion}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
                  >
                    <Plus size={16} /> Add to List
                  </button>
                </div>
              </div>

              {/* Step 3: Question Queue */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  Added Questions <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">{form.questions.length}</span>
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {form.questions.map((q, i) => (
                    <div key={i} className="flex justify-between items-center bg-white border border-gray-200 p-3 rounded-lg text-sm group">
                      <span className="font-medium text-gray-700 truncate max-w-[80%]">{i + 1}. {q.text}</span>
                      <button onClick={() => removeQuestion(i)} className="text-red-400 hover:text-red-600 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors">
                Cancel
              </button>
              <button onClick={saveTest} className="flex-[2] py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-lg shadow-indigo-200 transition-all">
                Publish Final Test
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {viewGroup && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="min-h-full flex items-start justify-center p-6">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden mt-10">

              <div className="p-6 border-b border-gray-100 bg-gray-900 text-white flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold leading-tight">{viewGroup[0].title}</h2>
                  <p className="text-gray-400 text-xs mt-1">{getCourseName(viewGroup[0].courseId)}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      if (!window.confirm("Are you sure you want to delete this entire test?")) return;
                      await Promise.all(viewGroup.map((q) => api.delete(`/final-tests/${q.id}`)));
                      setViewGroup(null);
                      loadTests();
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                    title="Delete Test"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button onClick={() => setViewGroup(null)} className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg transition-colors">
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* IN-VIEW ADD QN */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Append New Question</h4>
                  <input
                    placeholder="Question Text"
                    className="w-full border border-gray-300 p-2 rounded-lg text-sm outline-none focus:border-indigo-500"
                    value={newQ.text}
                    onChange={(e) => setNewQ({ ...newQ, text: e.target.value })}
                  />

                  <div className="grid grid-cols-2 gap-2">
                    {newQ.options.map((opt, i) => (
                      <input
                        key={i}
                        placeholder={`Option ${i + 1}`}
                        className="w-full border border-gray-300 p-2 rounded-lg text-xs outline-none focus:border-indigo-500"
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...newQ.options];
                          newOpts[i] = e.target.value;
                          setNewQ({ ...newQ, options: newOpts });
                        }}
                      />
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <select
                      value={newQ.correctIndex}
                      onChange={(e) => setNewQ({ ...newQ, correctIndex: Number(e.target.value) })}
                      className="flex-1 border border-gray-300 p-2 rounded-lg text-xs font-medium"
                    >
                      <option value={0}>Correct Answer: 1</option>
                      <option value={1}>Correct Answer: 2</option>
                      <option value={2}>Correct Answer: 3</option>
                      <option value={3}>Correct Answer: 4</option>
                    </select>
                    <button
                      onClick={async () => {
                        const base = viewGroup[0];
                        await api.post("/final-tests", {
                          title: base.title,
                          courseId: base.courseId,
                          question: newQ.text,
                          options: JSON.stringify(newQ.options),
                          answer: newQ.options[newQ.correctIndex],
                        });
                        setNewQ({ text: "", options: ["", "", "", ""], correctIndex: 0 });
                        setViewGroup(null);
                        loadTests();
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xs font-bold"
                    >
                      Append Question
                    </button>
                  </div>
                </div>

                {/* QUESTIONS LIST */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Questions in this test</h4>
                  {viewGroup.map((q, idx) => {
                    const opts = JSON.parse(q.options || "[]");
                    return (
                      <div key={q.id} className="border border-gray-200 p-4 rounded-xl space-y-3 relative group">
                        <div className="flex justify-between items-start">
                          <p className="font-semibold text-gray-800 pr-10">{idx + 1}. {q.question}</p>
                          <button
                            onClick={() => setEditingQ({ ...q, options: opts })}
                            className="text-indigo-600 hover:text-indigo-800 text-xs font-bold bg-indigo-50 px-2 py-1 rounded"
                          >
                            Edit
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {opts.map((o, i) => (
                            <div key={i} className={`flex items-center gap-2 p-2 rounded-lg text-sm ${o === q.answer ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-600 border border-gray-100'}`}>
                              {o === q.answer ? <CheckCircle2 size={14} /> : <div className="w-3.5 h-3.5 rounded-full border border-gray-300" />}
                              {o}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT SINGLE QUESTION MODAL */}
      {editingQ && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800">Edit Question</h3>
              <button onClick={() => setEditingQ(null)} className="text-gray-400"><X size={18} /></button>
            </div>

            <div className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Question Text</label>
                <input
                  value={editingQ.question}
                  onChange={(e) => setEditingQ({ ...editingQ, question: e.target.value })}
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Answer Options</label>
                <div className="grid grid-cols-1 gap-2">
                  {editingQ.options.map((opt, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...editingQ.options];
                          newOpts[i] = e.target.value;
                          setEditingQ({ ...editingQ, options: newOpts });
                        }}
                        className={`w-full border p-2 rounded-lg text-sm ${opt === editingQ.answer ? 'border-green-500 ring-1 ring-green-500' : 'border-gray-300'}`}
                      />
                      <button
                        onClick={() => setEditingQ({ ...editingQ, answer: opt })}
                        className={`px-2 rounded-lg border ${opt === editingQ.answer ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-400 border-gray-300'}`}
                      >
                        <CheckCircle2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={async () => {
                  await api.put(`/final-tests/${editingQ.id}`, {
                    question: editingQ.question,
                    options: JSON.stringify(editingQ.options),
                    answer: editingQ.answer,
                  });
                  setEditingQ(null);
                  setViewGroup(null);
                  loadTests();
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 w-full rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all mt-2"
              >
                Update Question
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}