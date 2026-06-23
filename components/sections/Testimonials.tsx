import type { Dictionary } from "@/lib/i18n";
import Reveal from "@/components/ui/Reveal";

export default function Testimonials({ dict }: { dict: Dictionary }) {
  return (
    <section className="testimonials">
      <div className="testimonials__inner">
        <Reveal className="testimonials__head">
          <p className="testimonials__eyebrow">{dict.testimonials.eyebrow}</p>
          <h2 className="testimonials__title">{dict.testimonials.title}</h2>
        </Reveal>

        <ul className="testimonials__grid">
          {dict.testimonials.items.map((t, i) => (
            <Reveal key={i} as="li" className="testimonial" delay={i * 90}>
              <p className="testimonial__quote">“{t.quote}”</p>
              <footer className="testimonial__author">
                <span className="testimonial__avatar" aria-hidden="true" />
                <span>
                  <strong className="testimonial__name">{t.author}</strong>
                  <span className="testimonial__role">{t.role}</span>
                </span>
              </footer>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
