import { Link, NavLink } from "react-router-dom";
import { getUser } from "../../shared/auth";
import { useBranding } from "../../shared/hooks/useBranding";
import themes from "../../config/themes.json";

export default function PublicHeader() {
  const user = getUser();
  const brand = useBranding();

  const theme = themes?.[brand.theme] || themes.darkModern;

  return (
    <header className={` shadow-sm md:px-16`} style={{ backgroundColor: "#eeecec" || brand.colors.accent , color:  "#13205f" ||brand.colors.primary  }}>
      <div className="max-w-7xl mx-auto px-3 h-16 flex items-center justify-between">

        {/* Logo + Small Title */}
        <Link to="/" className="flex items-center gap-3">

          {brand.logo ? (
            <img
              src={brand.logo}
              alt={brand.siteName}
              className="h-15 w-auto object-contain"
            />
          ) : (
            <div className=" h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center text-sm font-bold">
              {brand.siteName?.charAt(0)}
            </div>
          )}

          {/* Small Title */}
          {/* <span className={`text-sm font-semibold `}>
            {brand.siteName}
          </span> */}

        </Link>

        {/* Navigation */}
        <nav className={`hidden md:flex gap-6 text-sm `}>
          <NavLink to="/courses" className="hover:opacity-80 transition">
            Courses
          </NavLink>

          <NavLink to="/contact" className="hover:opacity-80 transition">
            Contact
          </NavLink> <NavLink to="/aboutus" className="hover:opacity-80 transition">
            About Us
          </NavLink>
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center gap-4 text-sm">

          {!user && (
            <>
              <Link
                to="/login"
                className={` hover:opacity-80`}
              >
                Login
              </Link>

              <Link
                to="/register"
                className={`${theme.button.primary} px-4 py-2 bg-[#F59E0B] ${theme.shape.buttonRadius}`}
                style={{ background: brand.colors?.primary || "#F59E0B", color: "#ffffff" }}
              >
                Register
              </Link>
            </>
          )}

          {user?.role === "student" && (
            <Link
              to="/student"
              className={`${theme.button.secondary} px-4 py-2 ${theme.shape.buttonRadius}`}
            >
              Dashboard
            </Link>
          )}

          {user?.role === "ADMIN" && (
            <Link
              to="/admin"
              className={`${theme.button.secondary} px-4 py-2 ${theme.shape.buttonRadius}`}
            >
              Admin Panel
            </Link>
          )}
          {user?.role === "TEACHER" && (
            <Link
              to="/teacher"
              className={`${theme.button.secondary} px-4 py-2 ${theme.shape.buttonRadius}`}
            >
              Teacher Dashboard
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}