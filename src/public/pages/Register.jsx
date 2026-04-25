import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../shared/api";
import { useBranding } from "../../shared/hooks/useBranding";
export default function Register() {
  const navigate = useNavigate();
  const brand = useBranding();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (!/^[0-9]{10}$/.test(form.phone)) {
      return setError("Enter valid 10-digit phone number");
    }
    try {
      const { data } = await api.post("/auth/register", form);

      // Save auth
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);

      // Redirect based on role
      if (data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/student");
      }
    } catch (err) {
      console.log(err)
      setError(
        err.response?.data?.message ||
        "Registration failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-w-screen text-black mx-auto py-20 md:px-10 bg-gray-100">
      <div className="max-w-md mx-auto md:px-6 ">
        <div className="bg-white  rounded-xl p-8 space-y-6 shadow-sm ">

          <div>
            <h2 className={`text-2xl font-semibold ${brand.colors.primary} ${brand.theme.shape?.radius || ""}`}>
              Create your account
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Start learning today.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">

            <input
              type="text"
              name="name"
              placeholder="Full Name"
              required
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
            <div className="flex">
              <span className="px-3 flex items-center bg-gray-100 border rounded-l-lg text-sm">
                +91
              </span>
              <input
                type="tel"
                name="phone"
                placeholder="9876543210"
                required
                value={form.phone}
                onChange={handleChange}
                className="w-full border border-l-0 rounded-r-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              minLength={6}
              value={form.password}
              onChange={handleChange}
              className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ background: brand.colors.primary }} className="w-full py-3 bg-black text-white rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

          <p className="text-sm text-center text-gray-500">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-black cursor-pointer underline"
            >
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
