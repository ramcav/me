import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Hero from './components/hero/Hero';
import About from './components/about/About';
import Projects from './components/projects/Projects';
import Skills from './components/skills/Skills';
import ContributionsArt from './components/contributions/ContributionsArt';
import Contact from './components/contact/Contact';
import ChatWidget from './components/chat/ChatWidget';

export default function App() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Projects />
        <Skills />
        <ContributionsArt />
        <Contact />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
