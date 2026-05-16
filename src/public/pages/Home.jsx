import Hero from "../components/Hero";
import Testimonials from "../components/Testimonials";
import PreviewVideo from "../components/PreviewVideo";
import CTASection from "../components/CTASection";
import Enroll from "../components/Enroll";
import Courses from "./Courses";
import FeaturedCoursesStrip from "../components/CourseStrip";
import Team from "../components/Team";
import MissionVision from "../components/MissionVision";
import AboutUs from "../components/AboutUs";


export default function Home() {
  return (
    <div className="">
      <Hero />
      <PreviewVideo />

      <FeaturedCoursesStrip />
      {/* <MissionVision /> */}
      {/* <AboutUs /> */}
      <Testimonials />
      <Enroll />
      <CTASection />
    </div>
  );
}
