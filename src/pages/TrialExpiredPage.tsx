import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';

// ─── Paleta V5.3: Rio Negro + Açaí + Solimões ──────────────────────────────
const C = {
  bg:          '#040308',        // Rio Negro profundo
  surface:     'rgba(255,255,255,0.035)',
  border:      'rgba(255,255,255,0.08)',
  acai:        '#6D28A8',        // Açaí roxo
  acaiLight:   '#A855F7',        // Neon violeta
  solimoes:    '#C8933A',        // Solimões dourado/argila
  solimoesLight: '#F59E0B',      // Neon dourado
  slate:       '#94a3b8',
  slateDim:    '#64748b',
  white:       '#f8fafc',
};

const WA_SUPPORT = '5541992557600';

const TrialExpiredPage: React.FC = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<'feedback' | 'done'>('feedback');
  const [nps, setNps] = useState<number | null>(null);
  const [liked, setLiked] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nps === null) {
      setError('Por favor, selecione sua nota de satisfação.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Salvar feedback no Supabase (tabela trial_feedback — pode criar depois)
      await supabase.from('trial_feedback').insert({
        nps_score:   nps,
        liked:       liked.trim() || null,
        suggestion:  suggestion.trim() || null,
        consent_marketing: consent,
        created_at:  new Date().toISOString(),
      }).throwOnError();
    } catch (_e) {
      // Silente — não bloqueia o fluxo se a tabela não existir ainda
    } finally {
      setSubmitting(false);
      setStep('done');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/showcase');
  };

  const closeBusiness = () => {
    window.open(
      `https://wa.me/${WA_SUPPORT}?text=${encodeURIComponent('Olá Lidi! Testei o Provadágua e quero fechar negócio pelo CRM personalizado. Podemos conversar?')}`,
      '_blank'
    );
  };

  const referralShare = () => {
    const text = 'Testei o CRM do Encontro D\'Água Hub (Provadágua) e recomendo! Usa meu link e ganhe 20% de desconto: https://prova.encontrodagua.com';
    if (navigator.share) {
      navigator.share({ text, title: 'Provadágua — CRM Personalizado' }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => alert('Link copiado!'));
    }
  };

  // Orb animations style block
  const orbStyle: React.CSSProperties = {
    position: 'absolute', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: C.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      fontFamily: "'Inter', 'Outfit', sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />

      {/* Ambient orbs */}
      <div aria-hidden style={{ ...orbStyle, top: '-10%', left: '-10%', width: '500px', height: '500px', background: 'rgba(109,40,168,0.12)' }} />
      <div aria-hidden style={{ ...orbStyle, bottom: '-15%', right: '-10%', width: '450px', height: '450px', background: 'rgba(200,147,58,0.10)' }} />

      <div style={{ maxWidth: '600px', width: '100%', position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img src="/logos/logo-icon-gold-transp.png" alt="Hub" style={{ width: '64px', height: '64px', objectFit: 'contain', margin: '0 auto 1rem' }} />
          <div style={{
            display: 'inline-block',
            background: 'rgba(109,40,168,0.12)',
            border: '1px solid rgba(109,40,168,0.35)',
            borderRadius: '20px',
            padding: '6px 18px',
            fontSize: '0.72rem',
            fontWeight: 700,
            color: C.acaiLight,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '1rem',
          }}>
            Provadágua — Trial Encerrado
          </div>
          <h1 style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
            fontWeight: 900,
            color: C.white,
            marginBottom: '0.5rem',
            lineHeight: 1.2,
          }}>
            Seu período de teste chegou ao fim 🌊
          </h1>
          <p style={{ color: C.slate, fontSize: '1rem', lineHeight: 1.6 }}>
            Obrigada por testar o ecossistema Provadágua! Antes de sair, que tal nos contar o que achou?
          </p>
        </div>

        {/* ── Feedback Form ─────────────────────────────────────────────────── */}
        {step === 'feedback' && (
          <form onSubmit={handleSubmitFeedback}>
            <div style={{
              background: 'rgba(255,255,255,0.035)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '24px',
              padding: 'clamp(1.5rem, 4vw, 2.5rem)',
              marginBottom: '1.5rem',
            }}>
              {/* NPS */}
              <div style={{ marginBottom: '1.8rem' }}>
                <p style={{ color: '#e2e8f0', fontSize: '0.92rem', fontWeight: 600, marginBottom: '0.8rem' }}>
                  Em uma escala de 0 a 10, quanto você recomendaria o Provadágua? <span style={{ color: C.acaiLight }}>*</span>
                </p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {[...Array(11)].map((_, i) => (
                    <button
                      key={i} type="button"
                      onClick={() => setNps(i)}
                      style={{
                        width: '38px', height: '38px',
                        borderRadius: '10px',
                        border: nps === i ? `2px solid ${C.acaiLight}` : '1px solid rgba(255,255,255,0.12)',
                        background: nps === i ? 'rgba(109,40,168,0.25)' : 'rgba(255,255,255,0.04)',
                        color: nps === i ? C.acaiLight : C.slate,
                        fontWeight: nps === i ? 800 : 500,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        transition: 'all 0.18s',
                      }}
                    >
                      {i}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                  <span style={{ color: C.slateDim, fontSize: '0.72rem' }}>0 = Não recomendaria</span>
                  <span style={{ color: C.slateDim, fontSize: '0.72rem' }}>10 = Recomendo muito</span>
                </div>
              </div>

              {/* Liked */}
              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', color: '#e2e8f0', fontSize: '0.92rem', fontWeight: 600, marginBottom: '0.6rem' }}>
                  O que você mais gostou?
                </label>
                <textarea
                  value={liked}
                  onChange={e => setLiked(e.target.value)}
                  rows={2}
                  placeholder="Ex: O Kanban, a IA, a facilidade de uso..."
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.10)', borderRadius: '12px',
                    padding: '10px 14px', color: '#f1f5f9', fontSize: '0.88rem',
                    outline: 'none', resize: 'vertical', lineHeight: 1.5,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Suggestion */}
              <div style={{ marginBottom: '1.4rem' }}>
                <label style={{ display: 'block', color: '#e2e8f0', fontSize: '0.92rem', fontWeight: 600, marginBottom: '0.6rem' }}>
                  Alguma sugestão de melhoria?
                </label>
                <textarea
                  value={suggestion}
                  onChange={e => setSuggestion(e.target.value)}
                  rows={2}
                  placeholder="Sua sugestão nos ajuda a evoluir..."
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.10)', borderRadius: '12px',
                    padding: '10px 14px', color: '#f1f5f9', fontSize: '0.88rem',
                    outline: 'none', resize: 'vertical', lineHeight: 1.5,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* LGPD Consent */}
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', marginBottom: '1.2rem' }}>
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={e => setConsent(e.target.checked)}
                  style={{ marginTop: '2px', accentColor: C.acaiLight, width: '16px', height: '16px', flexShrink: 0 }}
                />
                <span style={{ color: C.slateDim, fontSize: '0.78rem', lineHeight: 1.5 }}>
                  Autorizo o contato da equipe Encontro D'Água Hub para ofertas e novidades (LGPD — você pode revogar a qualquer momento).
                </span>
              </label>

              {error && (
                <p style={{ color: '#f87171', fontSize: '0.82rem', marginBottom: '0.8rem', padding: '8px 12px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px' }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%', padding: '14px',
                  background: `linear-gradient(135deg, ${C.acai}, ${C.acaiLight})`,
                  color: '#fff', border: 'none', borderRadius: '14px',
                  fontSize: '1rem', fontWeight: 800, cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.7 : 1, transition: 'all 0.2s',
                  boxShadow: '0 8px 32px rgba(109,40,168,0.35)',
                }}
              >
                {submitting ? 'Enviando...' : '✨ Enviar Feedback'}
              </button>
            </div>
          </form>
        )}

        {/* ── Done: Upsell + CTAs ───────────────────────────────────────────── */}
        {step === 'done' && (
          <div style={{
            background: 'rgba(255,255,255,0.035)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '24px',
            padding: 'clamp(1.5rem, 4vw, 2.5rem)',
            textAlign: 'center',
            marginBottom: '1.5rem',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🙏</div>
            <h2 style={{ fontFamily: "'Outfit'", fontSize: '1.5rem', fontWeight: 800, color: C.white, marginBottom: '0.6rem' }}>
              Obrigada pelo feedback!
            </h2>
            <p style={{ color: C.slate, fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              Seu trial foi incrível. Se o Provadágua fez sentido para o seu negócio, podemos construir juntas um CRM completamente personalizado para você.
            </p>

            {/* Promo 20% */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(200,147,58,0.12), rgba(245,158,11,0.08))',
              border: '1px solid rgba(200,147,58,0.3)',
              borderRadius: '16px',
              padding: '14px 20px',
              marginBottom: '1.8rem',
              textAlign: 'left',
            }}>
              <p style={{ color: C.solimoesLight, fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                🎁 Indica e Ganha — 20% de desconto para você e sua indicada
              </p>
              <p style={{ color: C.slate, fontSize: '0.8rem', lineHeight: 1.5 }}>
                Compartilhe o Provadágua com uma colega. Quando ela fechar, vocês duas ganham 20% de desconto no primeiro mês.
              </p>
            </div>

            {/* CTA buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                id="trial-close-deal-cta"
                onClick={closeBusiness}
                style={{
                  padding: '16px', background: `linear-gradient(135deg, ${C.acai}, ${C.acaiLight})`,
                  color: '#fff', border: 'none', borderRadius: '14px',
                  fontSize: '1rem', fontWeight: 800, cursor: 'pointer',
                  boxShadow: '0 8px 32px rgba(109,40,168,0.4)',
                  transition: 'all 0.2s',
                }}
              >
                💼 Fechar Negócio — CRM Personalizado
              </button>

              <button
                id="trial-referral-cta"
                onClick={referralShare}
                style={{
                  padding: '14px',
                  background: 'rgba(200,147,58,0.12)',
                  border: `1px solid ${C.solimoes}40`,
                  color: C.solimoesLight,
                  borderRadius: '14px',
                  fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                🔗 Indicar e Ganhar 20% de Desconto
              </button>

              <button
                onClick={handleSignOut}
                style={{
                  background: 'transparent', border: 'none',
                  color: C.slateDim, fontSize: '0.82rem',
                  cursor: 'pointer', padding: '8px', textDecoration: 'underline',
                  textUnderlineOffset: '3px',
                }}
              >
                Sair da conta
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <p style={{ textAlign: 'center', color: C.slateDim, fontSize: '0.72rem' }}>
          © {new Date().getFullYear()} Encontro D'Água Hub · Privacidade · LGPD
        </p>
      </div>
    </div>
  );
};

export default TrialExpiredPage;
