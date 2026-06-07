import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQSection = () => {
  const [openItem, setOpenItem] = useState<number | null>(0);

  const faqs = [
    {
      question: "O evento é realmente gratuito?",
      answer: "Sim! O curso é 100% gratuito. Não há taxas ocultas ou cobranças. Você terá acesso completo às 3 aulas ao vivo, certificado de participação e material complementar sem nenhum custo."
    },
    {
      question: "Como posso participar do evento?",
      answer: "Após se inscrever, você receberá por e-mail o link do YouTube onde as aulas acontecerão ao vivo. Também enviaremos lembretes antes de cada aula para que você não perca nenhum conteúdo."
    },
    {
      question: "Preciso ter conhecimento prévio sobre Psicanálise para participar?",
      answer: "Não! O curso foi desenvolvido tanto para iniciantes quanto para quem já tem algum conhecimento na área. Nossa metodologia é didática e acessível, permitindo que qualquer pessoa aprenda."
    },
    {
      question: "O evento será presencial ou online?",
      answer: "O evento é 100% online e ao vivo pelo YouTube. Isso permite que você participe de qualquer lugar do Brasil ou do mundo, precisando apenas de uma conexão com a internet."
    },
    {
      question: "Vou receber algum material complementar?",
      answer: "Sim! Além das aulas ao vivo, você receberá o ebook 'Desenvolvimento da Personalidade', certificado de participação e materiais complementares para aprofundar seus estudos."
    },
    {
      question: "Quanto tempo dura o curso?",
      answer: "O curso acontece em 3 dias consecutivos (09, 10 e 11 de setembro), sempre às 20h. Cada aula tem duração aproximada de 2 horas, totalizando cerca de 6 horas de conteúdo exclusivo."
    }
  ];

  const toggleItem = (index: number) => {
    setOpenItem(openItem === index ? null : index);
  };

  return (
    <section className="py-10 px-4 bg-gradient-to-b from-background to-secondary/10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="text-primary">Perguntas Frequentes</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Tire suas dúvidas!
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-primary/5 transition-colors duration-200"
              >
                <h3 className="text-lg font-semibold text-primary pr-4">
                  {faq.question}
                </h3>
                <div className="flex-shrink-0 text-primary">
                  {openItem === index ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </button>
              
              <div 
                className={`transition-all duration-300 ease-in-out ${
                  openItem === index 
                    ? 'max-h-96 opacity-100' 
                    : 'max-h-0 opacity-0'
                } overflow-hidden`}
              >
                <div className="px-6 pb-5">
                  <div className="pt-2 border-t border-border/30">
                    <p className="text-foreground leading-relaxed mt-3">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional CTA */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-accent/10 to-primary/10 rounded-full border border-accent/20">
            <span className="text-foreground font-medium">
              Ainda tem dúvidas? Entre em contato conosco!
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;