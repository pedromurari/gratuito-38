import { useEffect } from 'react';
import HeroSection from '@/components/HeroSection';
import CourseCalendarSection from '@/components/CourseCalendarSection';
import CourseSection from '@/components/CourseSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import InstituteSection from '@/components/InstituteSection';
import InstructorsSection from '@/components/InstructorsSection';
import FAQSection from '@/components/FAQSection';
import FinalCTASection from '@/components/FinalCTASection';
import Footer from '@/components/Footer';

const fbq = (...args: unknown[]) => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq(...args);
  }
};

const Index = () => {
  // ViewContent ao carregar a página
  useEffect(() => {
    fbq('track', 'ViewContent', {
      content_name: 'Curso Gratuito Psicanálise Integrativa',
      content_category: 'Curso',
    });
  }, []);

  // Scroll depth tracking
  useEffect(() => {
    const thresholds = [25, 50, 75, 100];
    const fired = new Set<number>();

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);

      thresholds.forEach((threshold) => {
        if (scrollPercent >= threshold && !fired.has(threshold)) {
          fired.add(threshold);
          fbq('trackCustom', 'ScrollDepth', { depth: threshold });
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <CourseCalendarSection />
      <CourseSection />
      <TestimonialsSection />
      <InstituteSection />
      <InstructorsSection />
      <FAQSection />
      <FinalCTASection />
      <Footer />
    </div>
  );
};

export default Index;
