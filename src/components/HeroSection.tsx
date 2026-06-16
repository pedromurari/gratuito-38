import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
type UtmKey = typeof UTM_KEYS[number];

const captureUtms = (): Record<UtmKey, string> => {
  const urlParams = new URLSearchParams(window.location.search);
  const result = {} as Record<UtmKey, string>;
  UTM_KEYS.forEach((key) => {
    const fromUrl = urlParams.get(key);
    if (fromUrl) {
      sessionStorage.setItem(key, fromUrl);
      result[key] = fromUrl;
    } else {
      result[key] = sessionStorage.getItem(key) ?? '';
    }
  });
  return result;
};

const HeroSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [utms, setUtms] = useState<Record<UtmKey, string>>({
    utm_source: '', utm_medium: '', utm_campaign: '', utm_content: '', utm_term: ''
  });

  useEffect(() => {
    setUtms(captureUtms());
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Trim inputs for clean data and better comparison
    const trimmedEmail = formData.email.trim();
    const trimmedName = formData.name.trim();

    // Validate email format and check if it's identical to name (common autofill error)
    if (!isValidEmail(trimmedEmail, trimmedName)) {
      toast({
        title: "E-mail ou nome inválido",
        description: "Por favor, insira um e-mail válido que não seja igual ao seu nome.",
        variant: "destructive",
      });
      return;
    }

    // Validate phone number format before submitting
    if (!isValidPhone(formData.phone)) {
      toast({
        title: "Número de telefone inválido",
        description: "Por favor, insira um número no formato: (99) 9999-9999 ou (99) 9 9999-9999",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);

    // Format phone number for WhatsApp (remove formatting and add +55)
    const cleanPhone = formData.phone.replace(/\D/g, '');
    const whatsappNumber = `+55${cleanPhone}`;

    // Always show success message and redirect
    toast({
      title: "Inscrição realizada com sucesso!",
      description: "Você será redirecionado em instantes...",
    });

    // Gerar um ID de evento único para desduplicação (Pixel + CAPI)
    const eventId = `lead_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const urlParams = new URLSearchParams(window.location.search);
    const testCode = urlParams.get('testCode');

    // Disparar evento Lead para o Meta Pixel (browser-side) com Advanced Matching
    if (typeof window !== 'undefined' && (window as any).fbq) {
      const nameParts = trimmedName.split(' ');
      const advancedMatching: Record<string, string> = {
        em: trimmedEmail,
        ph: `55${cleanPhone}`,
        fn: nameParts[0],
      };
      if (nameParts.length > 1) advancedMatching['ln'] = nameParts[nameParts.length - 1];
      // Atualiza o Advanced Matching no Pixel antes de disparar o evento
      (window as any).fbq('init', '1472969447740954', advancedMatching);
      (window as any).fbq('track', 'Lead', { value: 0, currency: 'BRL' }, { eventID: eventId });
    }

    // Disparar evento Lead via Conversions API (server-side — ignora AdBlockers)
    fetch('/api/meta-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName: 'Lead',
        email: trimmedEmail,
        phone: whatsappNumber,
        name: trimmedName,
        sourceUrl: window.location.href,
        eventId: eventId,
        testCode: testCode,
      }),
      keepalive: true,
    }).catch((err) => console.error('Erro ao enviar CAPI:', err));

    // Salvar lead no Supabase (fire-and-forget)
    supabase?.from('sheet_leads_38').insert({
      'Nome': trimmedName,
      'E-mail': trimmedEmail,
      'Whatsapp': whatsappNumber,
      'Data': new Date().toISOString(),
      utm_source: utms.utm_source,
      utm_medium: utms.utm_medium,
      utm_campaign: utms.utm_campaign,
      utm_content: utms.utm_content,
      utm_term: utms.utm_term,
    }).then(({ error }) => {
      if (error) console.error('Erro ao salvar lead no Supabase:', error);
    });

    // Enviar lead ao CRM — aguarda para obter loginUrl de auto-login
    const membersAreaUrl = import.meta.env.VITE_MEMBERS_AREA_URL as string | undefined;
    let loginUrl: string | null = null;
    try {
      const crmResult = await Promise.race([
        fetch('/api/crm-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome: trimmedName, email: trimmedEmail, whatsapp: whatsappNumber, ...utms }),
        }).then(async (r) => ({ ok: r.ok, data: r.ok ? await r.json() : null })),
        new Promise<{ ok: false; data: null }>((resolve) =>
          setTimeout(() => resolve({ ok: false, data: null }), 4500)
        ),
      ]);
      if (crmResult.ok && crmResult.data?.loginUrl) {
        loginUrl = crmResult.data.loginUrl;
      }
    } catch (err) {
      console.error('Erro ao enviar lead ao CRM:', err);
    }

    const destination =
      loginUrl ??
      (membersAreaUrl
        ? `${membersAreaUrl}/login`
        : `/obrigado?nome=${encodeURIComponent(trimmedName)}`);
    window.location.href = destination;
  };

  const formatPhone = (value: string) => {
    // Remove all non-digits
    let digits = value.replace(/\D/g, '');
    
    // Prevent +55 duplicated DDI: If user pastes +55 and length > 11, strip it.
    if (digits.startsWith('55') && digits.length > 11) {
      digits = digits.slice(2);
    }
    
    // Limit to maximum 11 digits (DDD + 9 digits)
    const limitedDigits = digits.slice(0, 11);
    
    // Apply Brazilian phone mask based on length
    if (limitedDigits.length <= 2) {
      return limitedDigits;
    } else if (limitedDigits.length <= 3) {
      return `(${limitedDigits.slice(0, 2)}) ${limitedDigits.slice(2)}`;
    } else if (limitedDigits.length <= 7) {
      return `(${limitedDigits.slice(0, 2)}) ${limitedDigits.slice(2)}`;
    } else if (limitedDigits.length <= 10) {
      // Format for 8-digit numbers: (11) 7537-9719
      return `(${limitedDigits.slice(0, 2)}) ${limitedDigits.slice(2, 6)}-${limitedDigits.slice(6)}`;
    } else {
      // Format for 9-digit numbers: (11) 9 7537-9719
      return `(${limitedDigits.slice(0, 2)}) ${limitedDigits.slice(2, 3)} ${limitedDigits.slice(3, 7)}-${limitedDigits.slice(7)}`;
    }
  };

  const isValidPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    // Accept 10 digits (DDD + 8 digits) or 11 digits (DDD + 9 digits)
    return digits.length === 10 || digits.length === 11;
  };

  const isValidEmail = (email: string, name: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim().toLowerCase();
    
    // Safety check: common error where name is filled in email field
    if (trimmedName && trimmedEmail === trimmedName) return false;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(trimmedEmail);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData({ ...formData, phone: formatted });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-10">{/* Reduced py-20 to py-10 */}
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/20 to-background" />
      
      {/* Floating elements for visual interest */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full animate-float" />
      <div className="absolute bottom-32 right-16 w-16 h-16 bg-accent/10 rounded-full animate-float" style={{ animationDelay: '2s' }} />
      
      <div className="relative max-w-4xl mx-auto text-center">
        {/* Main heading */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
          <span className="text-foreground">Curso Gratuito de</span>
          <br />
          <span className="text-primary animate-pulse-slow">Psicanálise Integrativa!</span>
        </h1>

        {/* Subtitle */}
        <h2 className="text-xl md:text-2xl lg:text-3xl mb-8 text-muted-foreground font-medium">
          Uma sequência de 3 aulas ONLINE. 100% Gratuitas com Certificado + Material.
        </h2>

        {/* Event details */}
        <div className="mb-12 p-6 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50">
          <p className="text-sm md:text-base font-bold text-primary mb-2 tracking-widest">
            TURMA #38
          </p>
          <p className="text-lg md:text-xl font-semibold text-foreground">
            DIAS 23, 24 E 25 DE JUNHO
          </p>
          <p className="text-md md:text-lg text-accent font-medium">
            AO VIVO NO YOUTUBE ÀS 20 HORAS
          </p>
        </div>

        {/* Registration form */}
        <div className="max-w-md mx-auto bg-card/30 backdrop-blur-sm p-8 rounded-2xl border border-border/50 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name" className="sr-only">Nome completo</Label>
              <Input
                id="name"
                type="text"
                placeholder="Insira seu nome"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-form w-full text-lg"
                required
              />
            </div>

            <div>
              <Label htmlFor="email" className="sr-only">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="Insira seu melhor e-mail"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`input-form w-full text-lg ${
                  formData.email && !isValidEmail(formData.email, formData.name) 
                    ? 'border-red-500 focus:border-red-500' 
                    : ''
                }`}
                required
              />
              {formData.email && !isValidEmail(formData.email, formData.name) && (
                <p className="text-xs text-red-500 text-left mt-2">
                  Por favor, insira um e-mail com formato válido (ex: @dominio.com) e diferente do seu nome.
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="phone" className="sr-only">WhatsApp</Label>
              <div className="space-y-2">
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-border bg-muted text-muted-foreground text-sm">
                    BR +55
                  </span>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="WhatsApp - (99) 9999-9999"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    className={`input-form w-full text-lg rounded-l-none ${
                      formData.phone && !isValidPhone(formData.phone) 
                        ? 'border-red-500 focus:border-red-500' 
                        : ''
                    }`}
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground text-left">
                  Formatos aceitos: <span className="text-accent">(99) 9999-9999</span> ou <span className="text-accent">(99) 9 9999-9999</span>
                </p>
                {formData.phone && !isValidPhone(formData.phone) && (
                  <p className="text-xs text-red-500 text-left">
                    Número inválido. Use o formato correto.
                  </p>
                )}
              </div>
            </div>

            <Button 
              type="submit" 
              className="btn-primary w-full text-xl py-6 animate-glow"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'ENVIANDO...' : 'INSCREVER-SE AGORA!'}
            </Button>
          </form>

          {/* Legal notice */}
          <p className="text-xs text-muted-foreground mt-6 leading-relaxed">
            De acordo com a lei 12.965/2014 e 13.709/2018, autorizo enviarem comunicações por e-mail ou qualquer outro meio e concordo com a política de privacidade.
          </p>

          {/* Bonus */}
          <div className="mt-6 p-4 bg-accent/10 rounded-lg border border-accent/20">
            <p className="text-sm font-medium text-foreground">
              <span className="text-accent">Cadastre-se agora e ganhe o EBOOK:</span>
              <br />
              <span className="text-primary">Desenvolvimento da Personalidade.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
