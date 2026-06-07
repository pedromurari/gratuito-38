
import { useState } from 'react';
import { Play, X } from 'lucide-react';

const TestimonialsSection = () => {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const testimonials = [
    {
      id: 1,
      title: "Transformei minha vida através da psicanálise",
      author: "Aluno iDM",
      videoId: "wDQiV0VoBT4",
      thumbnail: "https://img.youtube.com/vi/wDQiV0VoBT4/maxresdefault.jpg"
    },
    {
      id: 2,
      title: "Mudança completa de perspectiva sobre a vida",
      author: "Aluno iDM",
      videoId: "B_lpIOk1RQo",
      thumbnail: "https://img.youtube.com/vi/B_lpIOk1RQo/maxresdefault.jpg"
    },
    {
      id: 3,
      title: "Descobri ferramentas poderosas para o autoconhecimento",
      author: "Aluno iDM",
      videoId: "D4xbxCXSWoM",
      thumbnail: "https://img.youtube.com/vi/D4xbxCXSWoM/maxresdefault.jpg"
    }
  ];

  const openVideo = (videoId: string) => {
    setSelectedVideo(videoId);
  };

  const closeVideo = () => {
    setSelectedVideo(null);
  };

  return (
    <section className="py-10 px-4 bg-gradient-to-b from-secondary/10 to-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="text-foreground">O que dizem nossos </span>
            <span className="text-primary">Alunos</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Histórias reais de transformação e sucesso profissional através da nossa formação em Psicanálise Clínica Integrativa.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="group relative bg-card/30 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              onClick={() => openVideo(testimonial.videoId)}
            >
              {/* Thumbnail */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={testimonial.thumbnail}
                  alt={testimonial.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center transform transition-all duration-300 group-hover:scale-110">
                    <Play className="w-6 h-6 text-primary-foreground ml-1" fill="currentColor" />
                  </div>
                </div>
                {/* "Ver depoimento" button */}
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-secondary/80 backdrop-blur-sm rounded-full text-xs font-medium text-foreground">
                    ▷ Ver depoimento
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3 leading-tight">
                  "{testimonial.title}"
                </h3>
                
                {/* Rating */}
                <div className="flex items-center space-x-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-primary text-lg">★</span>
                  ))}
                </div>

                <p className="text-sm font-medium text-primary">
                  {testimonial.author}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Video Modal */}
        {selectedVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-4xl mx-4">
              {/* Close Button */}
              <button
                onClick={closeVideo}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              >
                <X className="w-8 h-8" />
              </button>

              {/* Video Container */}
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1&rel=0`}
                  title="Depoimento"
                  className="absolute top-0 left-0 w-full h-full rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialsSection;
