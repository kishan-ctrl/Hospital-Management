import React from 'react';
import { ArrowRight } from 'lucide-react';
import { IMAGES } from '../constants/images';
import ScrollReveal from './ScrollReveal';

export default function Services({ onBookClick }) {
  const serviceList = [
    { title: 'Pharmacy', desc: 'Genuine medicines at best prices.', image: IMAGES.pharmacy },
    { title: 'Cardiology', desc: 'Advanced care for your heart.', image: IMAGES.cardiology },
    { title: 'Neurology', desc: 'Expert treatment for brain & nervous system.', image: IMAGES.neurology },
    { title: 'Pathology Lab', desc: 'Accurate reports, trusted results.', image: IMAGES.pathology },
    { title: 'Pediatrics', desc: 'Special care for your little ones.', image: IMAGES.pediatrics },
  ];

  return (
    <section id="our-services" className="py-24 bg-white">
      <div id="services-section" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <ScrollReveal className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-blue-950 tracking-tight sm:text-4xl">
            Our <span className="text-teal-500">Healthcare</span> Services
          </h2>
          <p className="mt-3 text-slate-500 font-medium">
            Comprehensive healthcare solutions for you and your family.
          </p>
        </ScrollReveal>

        {/* Services Grid (5 Items) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {serviceList.map((service, idx) => (
            <ScrollReveal key={idx} delay={idx * 100} className="h-full">
              <div className="group premium-hover-card rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden text-left flex flex-col h-full hover:shadow-lg hover:border-teal-100/50 transition-all duration-300">
                <div className="h-44 w-full bg-slate-200 overflow-hidden">
                  <img className="h-full w-full object-cover group-hover:scale-105 transition duration-500 ease-out" src={service.image} alt={`${service.title} service`} />
                </div>
                <div className="p-5 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-blue-950 transition duration-300 group-hover:text-blue-600">{service.title}</h3>
                    <p className="mt-2 text-xs text-slate-500 font-medium leading-relaxed">
                      {service.desc}
                    </p>
                  </div>
                  <div className="mt-5 flex justify-end">
                    <button 
                      onClick={onBookClick}
                      className="shine-hover flex h-9 w-9 items-center justify-center rounded-full bg-teal-500 text-white hover:bg-teal-600 hover:scale-105 active:scale-95 shadow-sm transition cursor-pointer"
                    >
                      <ArrowRight className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

      </div>
    </section>
  );
}

