const Footer = () => {
  return (
    <footer className="bg-background border-t border-border/30 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Copyright and legal */}
        <div className="text-center mb-8">
          <p className="text-lg font-semibold text-foreground mb-4">
            © Instituto Despertamente - Copyright 2026 Todos os direitos reservados
          </p>
          
          <div className="max-w-4xl mx-auto text-sm text-muted-foreground leading-relaxed space-y-4">
            <p>
              Este site não é afiliado ao Facebook ou a qualquer entidade do Facebook. Depois que você sair do Facebook, 
              a responsabilidade não é deles e sim do nosso site. Fazemos todos os esforços para indicar claramente 
              e mostrar todas as provas do produto e usamos resultados reais. Nós não vendemos o seu e-mail ou qualquer 
              informação para terceiros. Jamais fazemos nenhum tipo de spam.
            </p>
            
            <p>
              Se você tiver alguma dúvida, sinta-se à vontade para usar o link de contato e falar conosco em horário 
              comercial de Segunda a Sextas das 09h00 às 18h00. Lemos e respondemos todas as mensagens por ordem de chegada.
            </p>
          </div>
        </div>

        {/* Contact and social links could go here */}
        <div className="border-t border-border/20 pt-8 text-center">
          <div className="flex flex-wrap justify-center items-center space-x-6 text-sm text-muted-foreground">
            <span>Instituto DespertaMente</span>
            <span>•</span>
            <span>Psicanálise Integrativa</span>
            <span>•</span>
            <span>Desenvolvimento Humano</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;