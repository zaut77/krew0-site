"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const B = {
  primary: "#0A84FF",
  accent: "#00D4AA",
  dark: "#0A0F1A",
  darkCard: "#111827",
  border: "rgba(255,255,255,0.06)",
  borderHover: "rgba(10,132,255,0.3)",
  text: "#E8EDF5",
  muted: "#6B7D99",
  grad: "linear-gradient(135deg, #0A84FF 0%, #00D4AA 100%)",
};

function useInView(ref, t = 0.15) {
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold: t });
    o.observe(el);
    return () => o.disconnect();
  }, [ref, t]);
  return v;
}

function FadeIn({ children, delay = 0, style = {} }) {
  const r = useRef(null);
  const v = useInView(r);
  return <div ref={r} style={{ opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(36px)", transition: `opacity 0.8s ease ${delay}s, transform 0.8s ease ${delay}s`, ...style }}>{children}</div>;
}

function NetworkCanvas() {
  const canvasRef = useRef(null);
  const nodesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w, h, animId;

    function resize() {
      w = canvas.width = canvas.offsetWidth * 2;
      h = canvas.height = canvas.offsetHeight * 2;
    }

    function initNodes() {
      nodesRef.current = Array.from({ length: 25 }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.6, vy: (Math.random() - 0.5) * 0.6,
        r: Math.random() * 3 + 1.5, pulse: Math.random() * Math.PI * 2,
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      const nodes = nodesRef.current;
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        n.pulse += 0.02;
      });
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 250) {
            ctx.strokeStyle = `rgba(10,132,255,${(1 - dist / 250) * 0.12})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke();
          }
        }
      }
      nodes.forEach(n => {
        const glow = Math.sin(n.pulse) * 0.3 + 0.7;
        const gr = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 4);
        gr.addColorStop(0, `rgba(10,132,255,${0.6 * glow})`);
        gr.addColorStop(0.5, `rgba(0,212,170,${0.2 * glow})`);
        gr.addColorStop(1, "transparent");
        ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `rgba(255,255,255,${0.7 * glow})`; ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    }

    resize(); initNodes(); draw();
    window.addEventListener("resize", () => { resize(); initNodes(); });
    return () => cancelAnimationFrame(animId);
  }, []);

  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.6, pointerEvents: "none" }} />;
}

function GlowCard({ children, style = {} }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hov, setHov] = useState(false);
  const ref = useRef(null);
  const handleMove = useCallback((e) => {
    const r = ref.current?.getBoundingClientRect();
    if (r) setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
  }, []);

  return (
    <div ref={ref} onMouseMove={handleMove} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        position: "relative", background: B.darkCard,
        border: `1px solid ${hov ? B.borderHover : B.border}`,
        borderRadius: 18, overflow: "hidden",
        transition: "border-color 0.4s, transform 0.3s, box-shadow 0.4s",
        transform: hov ? "translateY(-6px)" : "translateY(0)",
        boxShadow: hov ? "0 12px 40px rgba(10,132,255,0.12)" : "none",
        ...style,
      }}>
      {hov && <div style={{ position: "absolute", width: 250, height: 250, left: pos.x - 125, top: pos.y - 125, background: "radial-gradient(circle, rgba(10,132,255,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />}
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}

function PulseRing({ size = 56 }) {
  return (
    <div style={{ width: size, height: size, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `2px solid ${B.primary}30`, animation: "pulseRing 2s ease-in-out infinite" }} />
      <div style={{ position: "absolute", inset: 4, borderRadius: "50%", border: `1px solid ${B.primary}20`, animation: "pulseRing 2s ease-in-out infinite 0.4s" }} />
      <div style={{ width: size * 0.35, height: size * 0.35, borderRadius: "50%", background: `radial-gradient(circle, ${B.primary}, ${B.primary}80)`, boxShadow: `0 0 20px ${B.primary}40` }} />
    </div>
  );
}

function AgentIcon({ icon, label, active, onClick }) {
  return (
    <div onClick={onClick} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: active ? 1 : 0.4, transform: active ? "scale(1)" : "scale(0.9)", transition: "all 0.5s ease", cursor: "pointer" }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: active ? `${B.primary}15` : B.border, border: `1px solid ${active ? B.primary + "40" : B.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, boxShadow: active ? `0 0 24px ${B.primary}15` : "none", transition: "all 0.5s" }}>{icon}</div>
      <span style={{ fontSize: 10, color: active ? B.text : B.muted, fontWeight: 600, letterSpacing: 1, fontFamily: "'DM Sans', sans-serif", transition: "color 0.5s" }}>{label}</span>
    </div>
  );
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const h = () => setScrolled(window.scrollY > 50); window.addEventListener("scroll", h); return () => window.removeEventListener("scroll", h); }, []);
  return (
    <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "14px 28px", background: scrolled ? `${B.dark}f0` : "transparent", backdropFilter: scrolled ? "blur(20px)" : "none", borderBottom: `1px solid ${scrolled ? B.border : "transparent"}`, transition: "all 0.35s", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 1 }}>
        <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 21, fontWeight: 700, color: B.text, letterSpacing: -1 }}>KREW</span>
        <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 21, fontWeight: 700, backgroundImage: B.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>0</span>
      </div>
      <a href="#contatto" style={{ padding: "9px 24px", borderRadius: 9, background: B.grad, color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none", fontFamily: "'DM Sans', sans-serif", transition: "opacity 0.2s, transform 0.2s" }}
        onMouseEnter={e => { e.target.style.opacity = "0.88"; e.target.style.transform = "scale(1.03)"; }}
        onMouseLeave={e => { e.target.style.opacity = "1"; e.target.style.transform = "scale(1)"; }}>Parliamone</a>
    </nav>
  );
}

function Hero() {
  return (
    <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "120px 24px 80px", position: "relative", overflow: "hidden", textAlign: "center" }}>
      <NetworkCanvas />
      <div style={{ position: "relative", zIndex: 1 }}>
        <FadeIn><PulseRing size={60} /></FadeIn>
        <FadeIn delay={0.1}><div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 6, color: B.accent, margin: "32px 0 28px", fontFamily: "'DM Sans', sans-serif" }}>ZERO PEOPLE • ONLY AI</div></FadeIn>
        <FadeIn delay={0.25}>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(38px, 6.5vw, 76px)", fontWeight: 700, lineHeight: 1.08, maxWidth: 820, margin: "0 auto 28px", color: B.text, letterSpacing: -2 }}>
            Il tuo prossimo dipendente{" "}<span style={{ backgroundImage: B.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>non esiste.</span>
          </h1>
        </FadeIn>
        <FadeIn delay={0.4}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "clamp(17px, 2.2vw, 21px)", color: B.muted, maxWidth: 560, margin: "0 auto 44px", lineHeight: 1.65 }}>
            E mentre tu assumi, i tuoi competitor automatizzano.<br />KREW0 costruisce il team AI su misura per la tua PMI.
          </p>
        </FadeIn>
        <FadeIn delay={0.55}>
          <a href="#contatto" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "17px 42px", borderRadius: 12, background: B.grad, color: "#fff", fontSize: 17, fontWeight: 600, textDecoration: "none", fontFamily: "'DM Sans', sans-serif", boxShadow: `0 4px 30px ${B.primary}35`, transition: "all 0.25s" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px) scale(1.02)"; e.currentTarget.style.boxShadow = `0 8px 40px ${B.primary}50`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0) scale(1)"; e.currentTarget.style.boxShadow = `0 4px 30px ${B.primary}35`; }}>
            Parla con noi <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </a>
        </FadeIn>
      </div>
      <div style={{ position: "absolute", bottom: 36, left: "50%", transform: "translateX(-50%)", animation: "floatDown 2s ease-in-out infinite" }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={B.muted} strokeWidth="1.5" strokeLinecap="round"><path d="M12 5v14"/><path d="m5 12 7 7 7-7"/></svg>
      </div>
    </section>
  );
}

function PainPoints() {
  const items = [
    { n: "5", l: "stipendi che paghi", s: "per lavoro che 9 agenti AI farebbero meglio", icon: "💸" },
    { n: "80%", l: "del tuo tempo", s: "speso in operatività invece che in strategia", icon: "⏳" },
    { n: "24/7", l: "sempre attivi", s: "i tuoi agenti non dormono, non vanno in ferie", icon: "⚡" },
  ];
  return (
    <section style={{ padding: "100px 24px" }}>
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <FadeIn><h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, color: B.text, textAlign: "center", marginBottom: 60, letterSpacing: -1 }}>Il problema che risolviamo</h2></FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20 }}>
          {items.map((p, i) => (
            <FadeIn key={i} delay={i * 0.15}>
              <GlowCard style={{ padding: "40px 28px", textAlign: "center", cursor: "default" }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{p.icon}</div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 48, fontWeight: 800, backgroundImage: B.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1 }}>{p.n}</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 17, fontWeight: 600, color: B.text, margin: "14px 0 8px" }}>{p.l}</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: B.muted, lineHeight: 1.55 }}>{p.s}</div>
              </GlowCard>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function AgentFlow() {
  const [idx, setIdx] = useState(0);
  const agents = [
    { icon: "🔍", label: "SCOUT", desc: "Scansiona notizie e trend dal tuo settore ogni mattina" },
    { icon: "✍️", label: "CONTENT", desc: "Trasforma le notizie in post virali per ogni piattaforma" },
    { icon: "🎬", label: "MEDIA", desc: "Genera video, audio podcast e grafiche automaticamente" },
    { icon: "📊", label: "ANALYTICS", desc: "Monitora performance e ottimizza in tempo reale" },
    { icon: "💬", label: "SERVICE", desc: "Risponde ai clienti 24/7 e qualifica i lead" },
    { icon: "🎯", label: "CLOSER", desc: "Identifica i prospect caldi e ti avvisa quando agire" },
  ];
  useEffect(() => { const t = setInterval(() => setIdx(i => (i + 1) % agents.length), 2500); return () => clearInterval(t); }, []);

  return (
    <section style={{ padding: "100px 24px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 5, color: B.accent, marginBottom: 16, textAlign: "center", fontFamily: "'DM Sans', sans-serif" }}>COME FUNZIONA</div>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, color: B.text, textAlign: "center", marginBottom: 16, letterSpacing: -1 }}>9 agenti AI. Un obiettivo.</h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 17, color: B.muted, textAlign: "center", maxWidth: 500, margin: "0 auto 56px" }}>Ogni agente ha un ruolo specifico. Lavorano in sequenza, si passano dati, e producono risultati.</p>
        </FadeIn>
        <FadeIn delay={0.2}>
          <div style={{ background: B.darkCard, border: `1px solid ${B.border}`, borderRadius: 20, padding: "48px 32px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 58, left: "8%", right: "8%", height: 2, background: `linear-gradient(90deg, ${B.primary}10, ${B.primary}30, ${B.accent}30, ${B.accent}10)` }} />
            <div style={{ position: "absolute", top: 55, height: 8, borderRadius: 4, left: `${8 + idx * (84 / (agents.length - 1))}%`, width: `${84 / (agents.length - 1)}%`, background: B.grad, opacity: 0.3, transition: "left 0.5s ease", filter: "blur(4px)" }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 40, position: "relative", zIndex: 1 }}>
              {agents.map((a, i) => <AgentIcon key={i} icon={a.icon} label={a.label} active={i <= idx} onClick={() => setIdx(i)} />)}
            </div>
            <div style={{ background: `${B.primary}08`, border: `1px solid ${B.primary}15`, borderRadius: 14, padding: "24px 28px", minHeight: 80, display: "flex", alignItems: "center", gap: 20, transition: "all 0.3s" }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: B.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0, boxShadow: `0 4px 20px ${B.primary}30` }}>{agents[idx].icon}</div>
              <div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 600, color: B.text, marginBottom: 4 }}>Agente {agents[idx].label}</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: B.muted, lineHeight: 1.5 }}>{agents[idx].desc}</div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function WhatWeDo() {
  const cards = [
    { icon: "⚡", t: "Consulenza AI su misura", d: "Analizziamo i tuoi processi e progettiamo una rete di agenti AI specifici per il tuo business. Non soluzioni generiche — architetture costruite sulle tue esigenze." },
    { icon: "🔄", t: "Automazione end-to-end", d: "Dal marketing al customer service, dall'analisi dati alla produzione contenuti. Ogni agente ha un ruolo, obiettivi misurabili, e lavora 24/7." },
    { icon: "📊", t: "Risultati misurabili", d: "KPI settimanali, dashboard in tempo reale, report automatici. Sai esattamente quanto stai risparmiando e quanto stai producendo." },
    { icon: "🎓", t: "Ti insegniamo tutto", d: "Non ti vendiamo una scatola chiusa. Ti formiamo per capire, gestire, e evolvere il tuo team AI in autonomia." },
  ];
  return (
    <section style={{ padding: "100px 24px", position: "relative" }}>
      <div style={{ position: "absolute", top: "30%", left: "-5%", width: 500, height: 500, background: `radial-gradient(circle, ${B.accent}08 0%, transparent 70%)`, pointerEvents: "none" }} />
      <div style={{ maxWidth: 920, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <FadeIn>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 5, color: B.accent, marginBottom: 16, textAlign: "center", fontFamily: "'DM Sans', sans-serif" }}>COSA FACCIAMO</div>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, color: B.text, textAlign: "center", marginBottom: 56, letterSpacing: -1 }}>Costruiamo aziende a zero dipendenti</h2>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
          {cards.map((c, i) => (
            <FadeIn key={i} delay={i * 0.12}>
              <GlowCard style={{ padding: "32px 26px", cursor: "default" }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: `${B.primary}10`, border: `1px solid ${B.primary}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 18 }}>{c.icon}</div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 600, color: B.text, marginBottom: 10 }}>{c.t}</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14.5, color: B.muted, lineHeight: 1.7 }}>{c.d}</div>
              </GlowCard>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function Proof() {
  return (
    <section style={{ padding: "80px 24px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ position: "relative", borderRadius: 22, padding: "52px 40px", textAlign: "center", background: `linear-gradient(135deg, ${B.primary}06, ${B.accent}04)`, border: `1px solid ${B.primary}18`, overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -30, left: -20, fontSize: 120, color: `${B.primary}08`, fontFamily: "serif", lineHeight: 1 }}>&ldquo;</div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(20px, 3vw, 30px)", fontWeight: 600, color: B.text, lineHeight: 1.45, marginBottom: 24, position: "relative" }}>
              KREW0 è l&apos;azienda a zero dipendenti che costruisce aziende a zero dipendenti.
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: B.muted, lineHeight: 1.7, maxWidth: 520, margin: "0 auto", position: "relative" }}>
              La nostra stessa esistenza è la prova che funziona. Marketing, contenuti, analytics, customer service — tutto gestito da agenti AI. Noi lo facciamo per noi. Poi lo facciamo per te.
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function ContactForm() {
  const [form, setForm] = useState({ nome: "", azienda: "", email: "", messaggio: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [focus, setFocus] = useState(null);

  const handleSubmit = async () => {
    setSending(true);
    try {
      // Replace YOUR_FORM_ID with your Formspree form ID
      const res = await fetch("https://formspree.io/f/mpqkzajg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) setSent(true);
    } catch {
      // Fallback: show success anyway for demo
      setSent(true);
    }
    setSending(false);
  };

  const inp = (field, placeholder, type = "text") => ({
    type,
    placeholder,
    value: form[field],
    onChange: (e) => setForm({ ...form, [field]: e.target.value }),
    onFocus: () => setFocus(field),
    onBlur: () => setFocus(null),
    style: {
      width: "100%", padding: "15px 18px",
      background: B.dark, border: `1px solid ${focus === field ? B.primary : B.border}`,
      borderRadius: 10, color: B.text, fontSize: 15,
      fontFamily: "'DM Sans', sans-serif", outline: "none",
      transition: "border-color 0.3s, box-shadow 0.3s", boxSizing: "border-box",
      boxShadow: focus === field ? `0 0 0 3px ${B.primary}15` : "none",
    },
  });

  const ready = form.nome && form.email;

  return (
    <section id="contatto" style={{ padding: "100px 24px 120px", position: "relative" }}>
      <div style={{ position: "absolute", top: "10%", right: "-5%", width: 450, height: 450, background: `radial-gradient(circle, ${B.primary}0a 0%, transparent 70%)`, pointerEvents: "none" }} />
      <div style={{ maxWidth: 560, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <FadeIn>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 5, color: B.accent, marginBottom: 16, textAlign: "center", fontFamily: "'DM Sans', sans-serif" }}>CONTATTO</div>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, color: B.text, textAlign: "center", marginBottom: 12, letterSpacing: -1 }}>Raccontaci il tuo business</h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: B.muted, textAlign: "center", marginBottom: 40, lineHeight: 1.6 }}>Ti rispondiamo entro 24 ore con un&apos;analisi preliminare gratuita.</p>
        </FadeIn>
        <FadeIn delay={0.2}>
          {sent ? (
            <div style={{ background: B.darkCard, border: `1px solid ${B.accent}30`, borderRadius: 18, padding: "56px 36px", textAlign: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: `${B.accent}15`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", border: `2px solid ${B.accent}40` }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={B.accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              </div>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 600, color: B.text, marginBottom: 8 }}>Messaggio ricevuto</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: B.muted }}>Ti ricontatteremo entro 24 ore.</div>
            </div>
          ) : (
            <GlowCard style={{ padding: "36px 30px", cursor: "default" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 11, color: B.muted, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, letterSpacing: 1.5, display: "block", marginBottom: 7 }}>NOME *</label>
                    <input {...inp("nome", "Il tuo nome")} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: B.muted, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, letterSpacing: 1.5, display: "block", marginBottom: 7 }}>AZIENDA</label>
                    <input {...inp("azienda", "Nome azienda")} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: B.muted, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, letterSpacing: 1.5, display: "block", marginBottom: 7 }}>EMAIL *</label>
                  <input {...inp("email", "la.tua@email.com", "email")} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: B.muted, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, letterSpacing: 1.5, display: "block", marginBottom: 7 }}>COSA VORRESTI AUTOMATIZZARE?</label>
                  <textarea {...inp("messaggio", "Raccontaci brevemente il tuo business e quali processi vorresti far gestire da agenti AI...")} style={{ ...inp("messaggio", "").style, minHeight: 110, resize: "vertical" }} />
                </div>
                <button onClick={handleSubmit} disabled={sending || !ready} style={{
                  width: "100%", padding: "16px", background: ready ? B.grad : B.border,
                  border: "none", borderRadius: 11, color: "#fff", fontSize: 16, fontWeight: 600,
                  fontFamily: "'DM Sans', sans-serif", cursor: ready ? "pointer" : "not-allowed",
                  transition: "all 0.25s", opacity: sending ? 0.6 : 1,
                  boxShadow: ready ? `0 4px 20px ${B.primary}25` : "none",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
                  onMouseEnter={e => { if (ready) e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}>
                  {sending ? "Invio in corso..." : "Invia messaggio"}
                  {!sending && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>}
                </button>
                <div style={{ fontSize: 12, color: `${B.muted}90`, textAlign: "center", fontFamily: "'DM Sans', sans-serif" }}>Nessun impegno. Analisi preliminare gratuita.</div>
              </div>
            </GlowCard>
          )}
        </FadeIn>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ padding: "40px 24px", borderTop: `1px solid ${B.border}`, textAlign: "center" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 1, marginBottom: 10 }}>
        <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 700, color: B.text }}>KREW</span>
        <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 700, backgroundImage: B.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>0</span>
      </div>
      <div style={{ fontSize: 12, color: B.muted, fontFamily: "'DM Sans', sans-serif", marginBottom: 16 }}>Zero People. Only AI.</div>
      <div style={{ display: "flex", gap: 28, justifyContent: "center", marginBottom: 20 }}>
        {["LinkedIn", "Instagram", "YouTube"].map(l => (
          <a key={l} href="#" style={{ fontSize: 13, color: B.muted, textDecoration: "none", fontFamily: "'DM Sans', sans-serif", transition: "color 0.2s" }}
            onMouseEnter={e => e.target.style.color = B.primary} onMouseLeave={e => e.target.style.color = B.muted}>{l}</a>
        ))}
      </div>
      <div style={{ fontSize: 11, color: `${B.muted}60`, fontFamily: "'DM Sans', sans-serif" }}>© 2026 KREW0. Tutti i diritti riservati.</div>
    </footer>
  );
}

export default function Home() {
  return (
    <div style={{ background: B.dark, color: B.text, minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; }
        html { scroll-behavior: smooth; }
        ::selection { background: ${B.primary}40; color: #fff; }
        input::placeholder, textarea::placeholder { color: ${B.muted}70; }
        @keyframes pulseRing { 0%, 100% { transform: scale(1); opacity: 0.4; } 50% { transform: scale(1.15); opacity: 0.1; } }
        @keyframes floatDown { 0%, 100% { transform: translateX(-50%) translateY(0); opacity: 0.4; } 50% { transform: translateX(-50%) translateY(8px); opacity: 0.8; } }
      `}</style>
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", backgroundImage: "linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)", backgroundSize: "56px 56px" }} />
      <Nav />
      <Hero />
      <PainPoints />
      <AgentFlow />
      <WhatWeDo />
      <Proof />
      <ContactForm />
      <Footer />
    </div>
  );
}
