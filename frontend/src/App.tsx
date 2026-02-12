import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Hero from './components/hero/Hero';
import About from './components/about/About';
import Projects from './components/projects/Projects';
import Skills from './components/skills/Skills';
import Research from './components/research/Research';
import ContributionsArt from './components/contributions/ContributionsArt';
import Contact from './components/contact/Contact';
import ChatWidget from './components/chat/ChatWidget';
import AsciiBackground from './components/ascii/AsciiBackground';

export default function App() {
  return (
    <div className="relative min-h-screen bg-bg text-text">
      {/* Global ASCII background — fixed canvas behind everything */}
      <AsciiBackground intensity={0.15} isHero />

      <Navbar />
      <main className="relative z-[1]">
        <Hero />
        <About />
        <Projects />
        <Skills />
        <Research />
        <ContributionsArt />
        <Contact />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
