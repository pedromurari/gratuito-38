import { Button } from '@/components/ui/button';
import { Clock, Users, Gift } from 'lucide-react';

const FinalCTASection = () => {
  const handleCTAClick = () => {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'InitiateCheckout');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="py-10 px-4 bg-gradient-to-r from-secondary/20 via-primary/5 to-secondary/20">{/* Reduced py-20 to py-10 */}
      <div className="max-w-4xl mx-auto text-center">
        {/* Urgency indicators */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-destructive" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Vagas Limitadas
            </p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Mais de 5000 Inscritos
            </p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4">
              <Gift className="w-8 h-8 text-accent" />
            </div>
            <p className="text-sm font-medium text-foreground">
              100% Gratuito
            </p>
          </div>
        </div>

        {/* Main CTA */}
        <div className="relative">
          {/* Background elements */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl transform rotate-1" />
          <div className="absolute inset-0 bg-gradient-to-l from-secondary/20 to-primary/10 rounded-3xl transform -rotate-1" />
          
          {/* Content */}
          <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              <span className="text-destructive">Vagas limitadas.</span>
              <br />
              <span className="text-foreground">Corra para garantir a sua.</span>
            </h2>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Não perca a oportunidade de transformar sua vida através do autoconhecimento. 
              As inscrições podem ser encerradas a qualquer momento.
            </p>

            <Button 
              onClick={handleCTAClick}
              className="btn-primary text-lg md:text-xl lg:text-2xl py-6 md:py-8 px-8 md:px-12 animate-glow w-full max-w-md mx-auto leading-tight"
            >
              <span className="text-center">
                FAZER INSCRIÇÃO<br />GRATUITA!
              </span>
            </Button>

            {/* Bonus reminder */}
            <div className="mt-8 p-6 bg-gradient-to-r from-accent/10 to-primary/10 rounded-xl border border-accent/20">
              <p className="text-lg font-semibold text-foreground">
                🎁 <span className="text-accent">BÔNUS EXCLUSIVO:</span> Ebook "Desenvolvimento da Personalidade"
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                + Certificado de Participação + Material Complementar
              </p>
            </div>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-12 flex flex-wrap justify-center items-center space-x-8 text-sm text-muted-foreground">
          <span>✓ Evento 100% Gratuito</span>
          <span>✓ Certificado Incluso</span>
          <span>✓ Material Complementar</span>
          <span>✓ Ao Vivo no YouTube</span>
        </div>
      </div>
    </section>
  );
};

export default FinalCTASection;