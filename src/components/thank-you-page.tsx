import { useEffect } from "react";
import { CheckCircle, FileText } from "lucide-react";
import { ProgressBar } from "@/components/ui/progress-bar";
import { CTAButton } from "@/components/ui/cta-button";
import { InfoCard } from "@/components/ui/info-card";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function ThankYouPage() {
  const nome = new URLSearchParams(window.location.search).get("nome") ?? "";
  const primeiroNome = nome.split(" ")[0];

  useEffect(() => {
    if (typeof window.fbq === "function") {
      window.fbq("track", "CompleteRegistration");
    }
  }, []);

  const whatsappLink = "https://chat.whatsapp.com/EzebszSzZyUDdtrQ35YwMY";

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">

        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            🎉 <span className="text-primary">Parabéns{primeiroNome ? `, ${primeiroNome}` : ""}</span> pelo seu <span className="text-primary">cadastro!</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Você garantiu sua vaga no nosso <span className="text-primary font-semibold">Curso Gratuito!</span> O evento será nos dias <span className="text-primary font-semibold">30 de Junho, 01 e 02 de Julho.</span>
          </p>
        </div>

        {/* Progress Bar */}
        <ProgressBar
          percentage={80}
          label="80% das vagas preenchidas"
        />

        {/* Main CTA Section */}
        <div className="text-center mb-12 max-w-4xl mx-auto">
          <div className="bg-card border border-border rounded-xl p-8 mb-8">
            <div className="text-center mb-6">
              <p className="text-lg leading-relaxed">
                <span className="text-success font-bold">✅ Seu cadastro foi realizado com sucesso!</span>
              </p>
              <p className="text-lg leading-relaxed mt-4">
                <span className="font-semibold">Mas atenção:</span> para concluir seu cadastro e garantir o acesso às aulas, materiais e conteúdos exclusivos, é <span className="text-primary font-bold">obrigatório</span> clicar no botão abaixo e entrar no grupo do WhatsApp.
              </p>
            </div>

            <CTAButton
              href={whatsappLink || "#"}
              pulse={true}
              size="lg"
              className="w-full md:w-auto text-lg py-6 px-10"
            >
              📲 Entre no Grupo Vip do Curso Gratuito!
            </CTAButton>
          </div>
        </div>

        {/* Info Cards Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-5xl mx-auto">
          <InfoCard
            icon={<CheckCircle className="w-16 h-16 text-success" />}
            title="Entre agora no Grupo do Curso"
            description="Toque no botão abaixo para entrar no grupo de WhatsApp do curso e acessar as aulas."
            button={
              <CTAButton
                href={whatsappLink || "#"}
                variant="success"
                size="default"
                className="w-full"
              >
                Acessar Grupo Agora!
              </CTAButton>
            }
          />

          <InfoCard
            icon={<FileText className="w-16 h-16 text-warning" />}
            title="Enviamos o E-book no seu WhatsApp"
            description="Baixe o conteúdo enviado e já comece a estudar antes do curso começar."
          />
        </div>

        {/* Footer */}
        <footer className="border-t border-border pt-8 text-center text-sm text-muted-foreground max-w-4xl mx-auto">
          <div className="space-y-4">
            <p>
              <strong>Aviso importante:</strong> Este site não é afiliado ao Facebook ou a qualquer entidade do Facebook.
              Depois que você sair do Facebook, a responsabilidade não é deles e sim do nosso site.
            </p>
            <p>
              Fazemos todos os esforços para indicar claramente e mostrar todas as provas do produto
              e usamos resultados reais.
            </p>
            <div className="pt-4 border-t border-border">
              <p>© 2026 Instituto Despertamente. Todos os direitos reservados.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
