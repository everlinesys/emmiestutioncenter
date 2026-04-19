import { useEffect, useState } from "react";
import api from "../../shared/api";

export default function AdminFinalTest({ courseId }) {
  const [questions, setQuestions] = useState([]);

  const [form, setForm] = useState({
    question: "",
    options: ["", "", "", ""],
    answerIndex: null,
  });

  const [loading, setLoading] = useState(false);

  // ================= LOAD =================
  async function load() {
    const res = await api.get(`/final-test/admin/${courseId}`);
    setQuestions(res.data);
  }

  useEffect(() => {
    if (courseId) load();
  }, [courseId]);

  // ================= FORM =================
  function updateOption(i, value) {
    const updated = [...form.options];
    updated[i] = value;
    setForm({ ...form, options: updated });
  }

  function resetForm() {
    setForm({
      question: "",
      options: ["", "", "", ""],
      answerIndex: null,
    });
  }

  // ================= ADD QUESTION =================
  async function addQuestion(e) {
    e.preventDefault();

    if (!form.question || form.answerIndex === null) {
      alert("Enter question and select correct answer");
      return;
    }

    const cleanOptions = form.options.filter(o => o.trim());

    await api.post("/final-test", {
      courseId,
      title: "Final Course Test",
      question: form.question,
      options: JSON.stringify(cleanOptions),
      answer: cleanOptions[form.answerIndex],
    });

    resetForm();
    load();
  }

  // ================= DELETE =================
  async function deleteQuestion(id) {
    if (!confirm("Delete this question?")) return;
    await api.delete(`/final-test/${id}`);
    load();
  }

  return (
    <div className="bg-white border rounded-xl shadow-sm">

      {/* HEADER */}
      <div className="px-5 py-3 border-b bg-gray-50 flex justify-between">
        <h2 className="font-semibold">
          🎓 Final Exam Builder
        </h2>
        <span className="text-sm text-gray-500">
          {questions.length} Questions
        </span>
      </div>

      <div className="p-6 space-y-8">

        {/* ADD QUESTION */}
        <form onSubmit={addQuestion} className="space-y-4">

          <textarea
            className="w-full border rounded-lg p-3"
            placeholder="Enter question"
            value={form.question}
            onChange={(e) =>
              setForm({ ...form, question: e.target.value })
            }
          />

          {/* OPTIONS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {form.options.map((opt, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 border rounded-lg p-3 ${
                  form.answerIndex === i
                    ? "bg-green-50 border-green-300"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  checked={form.answerIndex === i}
                  onChange={() =>
                    setForm({ ...form, answerIndex: i })
                  }
                />

                <input
                  className="flex-1 outline-none"
                  placeholder={`Option ${i + 1}`}
                  value={opt}
                  onChange={(e) =>
                    updateOption(i, e.target.value)
                  }
                />
              </div>
            ))}
          </div>

          <button className="px-6 py-3 bg-black text-white rounded-lg">
            Add Question
          </button>
        </form>

        {/* QUESTION LIST */}
        <div className="grid md:grid-cols-2 gap-4">

          {questions.map((q, index) => {
            const opts = JSON.parse(q.options);

            return (
              <div
                key={q.id}
                className="border rounded-lg p-4 space-y-3 relative"
              >
                <button
                  onClick={() => deleteQuestion(q.id)}
                  className="absolute top-3 right-3 text-red-500 text-sm"
                >
                  Delete
                </button>

                <div className="font-semibold">
                  Q{index + 1}. {q.question}
                </div>

                <div className="flex flex-wrap gap-2">
                  {opts.map((o, i) => (
                    <span
                      key={i}
                      className={`px-2 py-1 text-xs rounded border ${
                        o === q.answer
                          ? "bg-green-100 border-green-400 font-bold"
                          : "bg-gray-50"
                      }`}
                    >
                      {o}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}

        </div>

      </div>
    </div>
  );
}
