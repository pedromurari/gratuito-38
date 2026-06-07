import { Brain, Heart, Eye } from 'lucide-react';

const CourseSection = () => {
  const pillars = [
    {
      title: "O DESPERTAR",
      icon: Brain,
      items: [
        "Teoria do APARELHO",
        "Teoria ESTRUTURAL", 
        "Portas para o INCONSCIENTE"
      ],
      color: "from-primary to-accent"
    },
    {
      title: "A CURA",
      icon: Heart,
      items: [
        "Heranças traumáticas",
        "Narcisista – Efeitos da Falta e do Excesso",
        "Psicanálise Aplicada à Autoestima"
      ],
      color: "from-accent to-primary"
    },
    {
      title: "A REVELAÇÃO", 
      icon: Eye,
      items: [
        "Pulsão de morte",
        "O efeito do ESTRESSE",
        "Atos SUICIDAS"
      ],
      color: "from-secondary to-accent"
    }
  ];

  return (
    <section className="py-10 px-4 bg-gradient-to-b from-background to-secondary/10">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">
          <span className="text-foreground">VEJA OS </span>
          <span className="text-primary">3 PILARES</span>
          <span className="text-foreground"> DO CURSO:</span>
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {pillars.map((pillar, index) => {
            const IconComponent = pillar.icon;
            return (
              <div 
                key={index}
                className="group relative overflow-hidden"
              >
                {/* Card */}
                <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 h-full transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                  {/* Header with gradient background */}
                  <div className={`bg-gradient-to-r ${pillar.color} -mx-8 -mt-8 mb-6 p-6 rounded-t-2xl`}>
                    <div className="flex items-center justify-center mb-4">
                      <IconComponent className="w-12 h-12 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-center text-primary-foreground">
                      {pillar.title}
                    </h3>
                  </div>

                  {/* Content */}
                  <div className="space-y-4">
                    {pillar.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <p className="text-foreground font-medium leading-relaxed">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CourseSection;