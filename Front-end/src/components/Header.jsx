import React, { useState } from 'react';
import { HeartPulse, Phone, Menu, X } from 'lucide-react';

export default function Header({ onBookClick }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full glass-header shadow-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-2.5 group cursor-pointer">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 group-hover:scale-110 group-hover:bg-teal-500 transition duration-300">
              <HeartPulse className="h-6.5 w-6.5 group-hover:animate-pulse" />
            </div>
            <div className="text-left">
              <span className="text-xl font-extrabold tracking-tight text-blue-900 block leading-none">
                MediWell
              </span>
              <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase leading-none">
                PHARMA
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8">
            {['Home', 'About Us', 'Our Services', 'Products', 'Contact Us'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                className="nav-link text-[14px] font-semibold text-slate-600 hover:text-blue-600 transition-colors duration-200"
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Right Action Area */}
          <div className="hidden md:flex items-center gap-6">
            {/* Call support */}
            <div className="flex items-center gap-3 group phone-action-hover">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-100 group-hover:bg-blue-100 group-hover:scale-110 transition duration-300">
                <Phone className="h-4.5 w-4.5 transition-transform" />
              </div>
              <div className="text-left">
                <a href="tel:+12345678900" className="text-sm font-extrabold text-blue-900 hover:text-blue-600 block leading-tight transition-colors">
                  +1 234 567 8900
                </a>
                <span className="text-[10px] font-semibold text-slate-500 block">
                  24/7 Support
                </span>
              </div>
            </div>

            {/* Book button */}
            <button 
              onClick={onBookClick}
              className="shine-hover rounded-full bg-teal-500 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-teal-500/25 transition-all duration-300 hover:bg-teal-600 hover:shadow-lg hover:shadow-teal-600/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
            >
              Book Appointment
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-blue-600 transition"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white/95 backdrop-blur-lg px-4 pt-4 pb-6 space-y-3 shadow-lg">
          {['Home', 'About Us', 'Our Services', 'Products', 'Contact Us'].map((item) => (
            <a 
              key={item} 
              href={`#${item.toLowerCase().replace(' ', '-')}`}
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors text-left"
            >
              {item}
            </a>
          ))}
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-4">
            <div className="flex items-center gap-3 px-4 text-left group phone-action-hover">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                <Phone className="h-4.5 w-4.5" />
              </div>
              <div>
                <a href="tel:+12345678900" className="text-sm font-extrabold text-blue-900 block leading-tight">+1 234 567 8900</a>
                <p className="text-[10px] font-medium text-slate-500">24/7 Emergency Support</p>
              </div>
            </div>
            <button 
              onClick={() => {
                setMobileMenuOpen(false);
                onBookClick();
              }}
              className="shine-hover w-full rounded-full bg-teal-500 py-3 text-center text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-teal-500/20 hover:bg-teal-600 transition"
            >
              Book Appointment
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

