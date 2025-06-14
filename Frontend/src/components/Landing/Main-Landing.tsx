import { Hero } from "./Hero";
import { Footer } from "./Footer";
 import { Team } from "./Team";
import { Features } from "./Features";
// import { Navbar } from "../Navbar";
//import { Testimonials } from "./Testimonial";

export function MainLanding() {
  return (
    <div>
      <div className="absolute w-full rounded-none">
        {/* <Navbar title="BrainBolt" icon={Home} /> */}
      </div>
      <Hero />
      <Features />
      <Team />
      {/* <Testimonials /> */}
      <Footer />
    </div>
  );
}