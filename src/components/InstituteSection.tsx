import React from 'react';

const InstituteSection = () => {
  return (
    <section className="py-10 px-4 bg-gradient-to-r from-secondary/20 via-background to-secondary/20">{/* Reduced py-20 to py-10 */}
      <div className="max-w-6xl mx-auto">
        <div className="text-center">
          {/* Logo IDM */}
          <div className="flex justify-center mb-12">
            <div className="w-48 h-48 flex items-center justify-center">
              <img 
                src="/lovable-uploads/1b0d4a56-e01f-4ce0-b2f7-0eecf33da536.png" 
                alt="Instituto DespertaMente Logo" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Content */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              <span className="text-primary">Instituto</span>{' '}
              <span className="text-foreground">DespertaMente</span>
            </h2>

            <p className="text-lg leading-relaxed text-foreground max-w-3xl mx-auto">
              O Instituto Despertamente é uma escola de desenvolvimento humano especializada no ensino da psicanálise. Nossa missão é tornar o autoconhecimento acessível, ajudando pessoas a compreenderem melhor suas emoções, seus padrões de comportamento e a transformação da mente.
            </p>

            {/* CTA within section */}
            <div className="mt-8 p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/20">
              <p className="text-center text-foreground font-semibold">
                Transforme sua vida através do autoconhecimento!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InstituteSection;