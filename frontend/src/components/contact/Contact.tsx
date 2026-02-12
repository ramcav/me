import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Github, Linkedin, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import SectionHeading from '../ui/SectionHeading';
import Button from '../ui/Button';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { api } from '../../services/api';
import type { ContactForm as ContactFormType } from '../../types';

const SOCIALS = [
  {
    icon: Github,
    label: 'GitHub',
    href: 'https://github.com/ramcav',
  },
  {
    icon: Linkedin,
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/',
  },
  {
    icon: Mail,
    label: 'Email',
    href: 'mailto:hello@ramcav.dev',
  },
];

export default function Contact() {
  const { ref, isInView } = useScrollReveal();
  const [form, setForm] = useState<ContactFormType>({
    name: '',
    email: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;

    setStatus('sending');
    try {
      await api.submitContact(form);
      setStatus('success');
      setForm({ name: '', email: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          label="// contact"
          title="Get in Touch"
          subtitle="Have a question, opportunity, or just want to connect? Reach out."
        />

        <motion.div
          ref={ref}
          className="mx-auto max-w-2xl"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          {/* Social links */}
          <div className="mb-10 flex justify-center gap-4">
            {SOCIALS.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl border border-border bg-surface px-5 py-3 font-mono text-sm text-text-secondary transition-all hover:border-cyan/40 hover:text-cyan hover:shadow-[0_0_15px_rgba(0,229,255,0.1)]"
              >
                <Icon size={18} />
                {label}
              </a>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block font-mono text-xs text-text-dim">
                  name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text outline-none transition-colors focus:border-cyan/40 placeholder:text-text-dim"
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block font-mono text-xs text-text-dim">
                  email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text outline-none transition-colors focus:border-cyan/40 placeholder:text-text-dim"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-xs text-text-dim">
                message
              </label>
              <textarea
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                rows={5}
                className="w-full resize-none rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text outline-none transition-colors focus:border-cyan/40 placeholder:text-text-dim"
                placeholder="What's on your mind?"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <Button
                type="submit"
                disabled={status === 'sending'}
              >
                {status === 'sending' ? (
                  'Sending...'
                ) : (
                  <>
                    <Send size={16} /> Send Message
                  </>
                )}
              </Button>

              {status === 'success' && (
                <motion.span
                  className="flex items-center gap-1.5 font-mono text-sm text-cyan"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <CheckCircle size={16} /> Message sent!
                </motion.span>
              )}
              {status === 'error' && (
                <motion.span
                  className="flex items-center gap-1.5 font-mono text-sm text-orange"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <AlertCircle size={16} /> Backend offline — try email.
                </motion.span>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
