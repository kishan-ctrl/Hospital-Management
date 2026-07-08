import React from 'react';
import { ArrowRight } from 'lucide-react';
import { IMAGES } from '../constants/images';
import ScrollReveal from './ScrollReveal';

export default function News() {
  const articles = [
    {
      title: 'Importance of Regular Health Checkups',
      tag: 'Health Tips',
      tagColor: 'bg-teal-50 text-teal-600 border-teal-100',
      date: 'May 02, 2024',
      image: IMAGES.newsCheckups
    },
    {
      title: 'Boost Your Immunity Naturally',
      tag: 'Nutrition',
      tagColor: 'bg-blue-50 text-blue-600 border-blue-100',
      date: 'May 01, 2024',
      image: IMAGES.newsImmunity
    },
    {
      title: 'Advances in Modern Medicine',
      tag: 'Pharma News',
      tagColor: 'bg-blue-900/5 text-blue-900 border-blue-900/10',
      date: 'Apr 30, 2024',
      image: IMAGES.newsModern
    }
  ];

  return (
    <section id="products" className="py-24 bg-white border-t border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header Row */}
        <ScrollReveal className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-16 text-left">
          <div>
            <h2 className="text-3xl font-extrabold text-blue-950 tracking-tight">
              Health Tips & <span className="text-teal-500">News</span>
            </h2>
            <p className="mt-2 text-slate-500 font-medium">
              Stay updated with the latest health tips and news.
            </p>
          </div>
          
          <button 
            onClick={() => alert('View All Articles function')}
            className="shine-hover inline-flex items-center gap-2 rounded-full border-2 border-slate-200 bg-white px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-700 transition duration-300 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50/20 shrink-0 cursor-pointer"
          >
            View All Articles
            <ArrowRight className="h-4 w-4" />
          </button>
        </ScrollReveal>

        {/* Articles Grid (3 Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {articles.map((article, idx) => (
            <ScrollReveal key={idx} delay={idx * 150} className="h-full">
              <article className="group premium-hover-card rounded-3xl bg-slate-50 border border-slate-100 overflow-hidden flex flex-col justify-between h-full hover:shadow-lg hover:border-teal-100/50 transition-all duration-300">
                <div>
                  <div className="h-48 w-full bg-slate-200 overflow-hidden">
                    <img className="h-full w-full object-cover group-hover:scale-105 transition duration-500 ease-out" src={article.image} alt={article.title} />
                  </div>
                  <div className="p-6 space-y-3.5">
                    <span className={`inline-block rounded-md px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide border ${article.tagColor}`}>
                      {article.tag}
                    </span>
                    <h3 className="text-base font-extrabold text-blue-950 group-hover:text-blue-600 transition duration-300">
                      <a href={`#article-${idx}`}>{article.title}</a>
                    </h3>
                  </div>
                </div>
                <div className="px-6 pb-6 pt-2 border-t border-slate-200/40 text-[11px] font-bold text-slate-400">
                  {article.date}
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>

      </div>
    </section>
  );
}

