import React from 'react';
import { HeartPulse } from 'lucide-react';

export default function Footer() {
  return (
    <footer id="contact-us" className="bg-slate-900 text-slate-400 pt-20 pb-8 border-t border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-slate-800">
          
          {/* Col 1: About */}
          <div className="md:col-span-4 text-left space-y-6">
            
            <div className="flex items-center gap-2.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
                <HeartPulse className="h-6.5 w-6.5" />
              </div>
              <div className="text-left">
                <span className="text-xl font-extrabold tracking-tight text-white block leading-none">
                  MediWell
                </span>
                <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase leading-none">
                  PHARMA
                </span>
              </div>
            </div>

            <p className="text-xs font-semibold text-slate-400 leading-relaxed max-w-sm">
              Committed to a healthier tomorrow through innovation, care, and trusted medicine.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3">
              
              {/* Facebook */}
              <a href="#social-fb" className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 hover:border-teal-500 hover:text-white transition">
                <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                </svg>
              </a>

              {/* Twitter / X */}
              <a href="#social-tw" className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 hover:border-teal-500 hover:text-white transition">
                <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* Linkedin */}
              <a href="#social-li" className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 hover:border-teal-500 hover:text-white transition">
                <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                </svg>
              </a>

              {/* Instagram */}
              <a href="#social-ig" className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 hover:border-teal-500 hover:text-white transition">
                <svg className="h-4.5 w-4.5 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>

            </div>

          </div>

          {/* Col 2: Quick Links */}
          <div className="md:col-span-2 text-left space-y-4">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-widest">Quick Links</h4>
            <ul className="space-y-3 text-xs font-semibold">
              {['Home', 'About Us', 'Our Services', 'Products', 'Contact Us'].map((link) => (
                <li key={link}>
                  <a href={`#${link.toLowerCase().replace(' ', '-')}`} className="hover:text-teal-400 transition">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Services */}
          <div className="md:col-span-2 text-left space-y-4">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-widest">Our Services</h4>
            <ul className="space-y-3 text-xs font-semibold">
              {['Pharmacy', 'Cardiology', 'Neurology', 'Lab Tests', 'Pediatrics'].map((link) => (
                <li key={link}>
                  <a href="#our-services" className="hover:text-teal-400 transition">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Support */}
          <div className="md:col-span-2 text-left space-y-4">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-widest">Support</h4>
            <ul className="space-y-3 text-xs font-semibold">
              {['Help Center', 'FAQs', 'Privacy Policy', 'Terms & Conditions', 'Sitemap'].map((link) => (
                <li key={link}>
                  <a href="#support" className="hover:text-teal-400 transition">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5: Contact Info */}
          <div className="md:col-span-2 text-left space-y-4">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-widest">Contact Us</h4>
            <ul className="space-y-3 text-xs font-semibold leading-relaxed">
              <li className="flex gap-2">
                <span className="text-teal-500 font-extrabold">📍</span>
                <span>123/3 Koswatta Battaramulla, Sri-Lanka</span>
              </li>
              <li className="flex gap-2">
                <span className="text-teal-500 font-extrabold">📞</span>
                <a href="tel:+94764593961" className="hover:text-white transition">+94 764593961</a>
              </li>
              <li className="flex gap-2">
                <span className="text-teal-500 font-extrabold">✉️</span>
                <a href="mailto:info@mediwellpharma.com" className="hover:text-white transition">info@mediwellpharma.com</a>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-center gap-4 text-[11px] font-bold text-slate-500">
          <p>© 2026 MediWell Pharma. All Rights Reserved.</p>
          <p>Designed for excellence in clinical solutions.</p>
        </div>

      </div>
    </footer>
  );
}
