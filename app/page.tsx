export default function Home() {
  const s = {
    card: {
      background:"var(--surface)",border:"1px solid var(--border)",
      borderRadius:"var(--radius-xl)",padding:"var(--space-8)",
      transition:"border-color var(--transition)",cursor:"default" as const,
    },
    label: {
      fontSize:"var(--text-xs)",fontWeight:700,textTransform:"uppercase" as const,
      letterSpacing:"0.12em",color:"var(--primary-bright)",
      marginBottom:"var(--space-4)",display:"block",
    },
    h2: {
      fontSize:"var(--text-2xl)",fontWeight:800,letterSpacing:"-0.02em",
      marginBottom:"var(--space-4)",
    },
    sectionCenter: {
      textAlign:"center" as const,marginBottom:"var(--space-12)",
    },
    grid3: {
      display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(260px, 1fr))",
      gap:"var(--space-5)",
    },
  };

  return (
    <>
      {/* NAV */}
      <header style={{
        position:"sticky",top:0,zIndex:100,
        background:"color-mix(in srgb, var(--bg) 85%, transparent)",
        backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",
        borderBottom:"1px solid var(--border)",
      }}>
        <div style={{maxWidth:1100,margin:"0 auto",padding:"0 var(--space-6)",height:64,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:"var(--space-3)"}}>
            <span style={{fontSize:"var(--text-lg)",fontWeight:800,letterSpacing:"-0.02em"}}>
              Utility<span style={{color:"var(--primary-bright)"}}>Hub</span>
            </span>
          </div>
          <a href="https://wa.me/message/5GX3UQXT4OO6B1" target="_blank" rel="noopener noreferrer"
            style={{padding:"10px 20px",borderRadius:"var(--radius-full)",background:"var(--primary)",color:"#fff",fontWeight:600,fontSize:"var(--text-sm)",transition:"all var(--transition)"}}>
            Jetzt bewerben
          </a>
        </div>
      </header>

      {/* HERO */}
      <section style={{position:"relative",overflow:"hidden",paddingBlock:"clamp(5rem, 12vw, 8rem)",textAlign:"center"}}>
        <div aria-hidden="true" style={{position:"absolute",inset:0,pointerEvents:"none",backgroundImage:"linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",backgroundSize:"60px 60px",opacity:0.25,maskImage:"radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 80%)"}} />
        <div aria-hidden="true" style={{position:"absolute",top:"-20%",left:"50%",transform:"translateX(-50%)",width:800,height:800,borderRadius:"50%",background:"radial-gradient(circle, var(--primary-glow) 0%, transparent 65%)",filter:"blur(40px)"}} />
        <div style={{position:"relative",maxWidth:1100,margin:"0 auto",padding:"0 var(--space-6)"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:"var(--space-2)",padding:"6px 14px",background:"var(--gold-dim)",border:"1px solid color-mix(in srgb, var(--gold) 30%, transparent)",borderRadius:"var(--radius-full)",fontSize:"var(--text-xs)",fontWeight:600,color:"var(--gold)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"var(--space-6)"}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:"var(--gold)",animation:"pulse 2s infinite",display:"block"}} />
            Setter gesucht — Remote Freelancer
          </div>
          <h1 style={{fontSize:"var(--text-3xl)",fontWeight:800,letterSpacing:"-0.03em",lineHeight:1.05,marginBottom:"var(--space-5)",maxWidth:"18ch",marginInline:"auto"}}>
            B2B Telefon-Setter <span style={{color:"var(--primary-bright)"}}>im Energie-Vertrieb</span> gesucht
          </h1>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"var(--space-3)",flexWrap:"wrap",marginBottom:"var(--space-6)"}}>
            {["18–40 Jahre","Freelancer im Verkauf","Quereinsteiger willkommen","100 % Remote"].map(t=>(
              <span key={t} style={{padding:"4px 12px",borderRadius:"var(--radius-full)",border:"1px solid var(--border)",background:"var(--surface)",fontSize:"var(--text-xs)",fontWeight:600,color:"var(--text-muted)",letterSpacing:"0.03em"}}>{t}</span>
            ))}
          </div>
          <p style={{fontSize:"var(--text-lg)",color:"var(--text-muted)",maxWidth:"52ch",marginInline:"auto",marginBottom:"var(--space-10)",lineHeight:1.6}}>
            Wir suchen hungrige Vertriebspersönlichkeiten für B2B-Kaltakquise im Energie-Bereich — freie Zeiteinteilung, volles Onboarding, und echte Aufstiegschancen.
          </p>
          <a href="https://wa.me/message/5GX3UQXT4OO6B1" target="_blank" rel="noopener noreferrer"
            style={{display:"inline-flex",alignItems:"center",gap:"var(--space-2)",padding:"16px 40px",borderRadius:"var(--radius-full)",background:"var(--primary)",color:"#fff",fontWeight:700,fontSize:"var(--text-base)",transition:"all var(--transition)",boxShadow:"0 4px 24px var(--primary-glow)",marginBottom:"var(--space-10)"}}>
            💬 Jetzt Sprachnachricht senden
          </a>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"var(--space-6)",flexWrap:"wrap"}}>
            {["100 % Remote","Freie Zeiteinteilung","Volles Onboarding","Aufstieg möglich"].map(t=>(
              <span key={t} style={{display:"flex",alignItems:"center",gap:"var(--space-2)",fontSize:"var(--text-sm)",color:"var(--text-muted)"}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3fb950" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <div style={{borderTop:"1px solid var(--border)",borderBottom:"1px solid var(--border)",background:"var(--surface)",paddingBlock:"var(--space-8)"}}>
        <div style={{maxWidth:1100,margin:"0 auto",padding:"0 var(--space-6)",display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(140px, 1fr))",gap:"var(--space-8)"}}>
          {[{v:"Faire",s:"Provision",l:"Vergütung"},{v:"100%",s:"",l:"Remote & flexibel"},{v:"CRM",s:"",l:"wird gestellt"},{v:"24h",s:"",l:"Rückmeldung"}].map(i=>(
            <div key={i.l} style={{textAlign:"center"}}>
              <div style={{fontSize:"var(--text-2xl)",fontWeight:800,color:"var(--primary-bright)",letterSpacing:"-0.03em",lineHeight:1}}>{i.v}</div>
              {i.s && <div style={{fontSize:"var(--text-xs)",color:"var(--primary-bright)",fontWeight:600,marginTop:2,opacity:0.8}}>{i.s}</div>}
              <div style={{fontSize:"var(--text-xs)",color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.08em",fontWeight:500,marginTop:4}}>{i.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FÜR WEN */}
      <section style={{paddingBlock:"clamp(3rem, 8vw, 6rem)",background:"var(--bg)",borderBottom:"1px solid var(--border)"}}>
        <div style={{maxWidth:1100,margin:"0 auto",padding:"0 var(--space-6)"}}>
          <div style={s.sectionCenter}>
            <span style={s.label}>Für wen ist das?</span>
            <h2 style={s.h2}>Wir suchen dich, wenn…</h2>
          </div>
          <div style={s.grid3}>
            {[
              {i:"🎯",t:"Du Setter bist",d:"Du weißt wie man Termine setzt, Einwände behandelt und qualifizierte Gespräche führt — und willst das in einem wachsenden Team tun."},
              {i:"📞",t:"Du Telefon nicht scheust",d:"Kaltakquise macht dir nichts aus. Du bist redegewandt, hartnäckig und bleibst freundlich auch beim 10. Nein."},
              {i:"💡",t:"Du Quereinsteiger bist",d:"Keine Erfahrung? Kein Problem. Was zählt ist deine Einstellung. Wir schulen dich komplett ein."},
              {i:"🕐",t:"Du flexibel arbeiten willst",d:"Freelancer, Student, Nebenjob oder Vollzeit — du entscheidest wann du arbeitest."},
              {i:"📈",t:"Du hungrig auf Wachstum bist",d:"Du willst mehr als nur einen Job. Wir bieten dir echten Aufstieg bis hin zur Festanstellung."},
              {i:"🏠",t:"Du remote arbeiten willst",d:"Kein Büro, keine Pendelei. Nur ein Telefon, Internet und der Wille erfolgreich zu sein."},
            ].map(c=>(
              <div key={c.t} style={s.card}>
                <div style={{fontSize:28,marginBottom:"var(--space-4)",lineHeight:1}}>{c.i}</div>
                <h3 style={{fontSize:"var(--text-base)",fontWeight:700,marginBottom:"var(--space-2)"}}>{c.t}</h3>
                <p style={{fontSize:"var(--text-sm)",color:"var(--text-muted)",lineHeight:1.65}}>{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VORTEILE */}
      <section style={{paddingBlock:"clamp(3rem, 8vw, 6rem)",background:"var(--surface)",borderBottom:"1px solid var(--border)"}}>
        <div style={{maxWidth:1100,margin:"0 auto",padding:"0 var(--space-6)"}}>
          <div style={s.sectionCenter}>
            <span style={s.label}>Was du bekommst</span>
            <h2 style={s.h2}>Deine Vorteile</h2>
          </div>
          <div style={s.grid3}>
            {[
              {i:"💻",t:"Vollständiges Setup",d:"CRM, Leadlisten, Skripte und Onboarding werden gestellt. Du startest sofort ohne Vorarbeit."},
              {i:"🕐",t:"Freie Zeiteinteilung",d:"Du entscheidest wann und wie viel du arbeitest. Kein Stundenplan, keine Pflicht-Anwesenheit."},
              {i:"💶",t:"Attraktive Provision",d:"Show Up Bonus, Deal Bonus und monatliche Boni. Je mehr du leistest, desto mehr verdienst du."},
              {i:"✅",t:"Einstieg ohne Erfahrung",d:"Keine Angst vor dem Telefon reicht. Wir schulen dich ein — auch ohne Vorkenntnisse."},
              {i:"🏠",t:"100 % Remote",d:"Kein Büro, keine Pendelei. Alles was du brauchst: Telefon und Internet."},
              {i:"👥",t:"Team & Coaching",d:"Unser Team unterstützt dich aktiv, gibt Feedback und hilft dir besser zu werden."},
            ].map(c=>(
              <div key={c.t} style={{...s.card,background:"var(--bg)"}}>
                <div style={{fontSize:28,marginBottom:"var(--space-4)",lineHeight:1}}>{c.i}</div>
                <h3 style={{fontSize:"var(--text-base)",fontWeight:700,marginBottom:"var(--space-2)"}}>{c.t}</h3>
                <p style={{fontSize:"var(--text-sm)",color:"var(--text-muted)",lineHeight:1.65}}>{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BEWERBUNGSPROZESS */}
      <section style={{paddingBlock:"clamp(4rem, 10vw, 8rem)",background:"var(--bg)",position:"relative",overflow:"hidden",borderTop:"1px solid var(--border)"}}>
        <div aria-hidden="true" style={{position:"absolute",inset:0,pointerEvents:"none",background:"radial-gradient(ellipse 80% 60% at 50% 0%, var(--primary-glow), transparent 70%)"}} />
        <div style={{maxWidth:900,margin:"0 auto",padding:"0 var(--space-6)",position:"relative"}}>
          <div style={{...s.sectionCenter}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:"var(--space-2)",padding:"6px 16px",background:"color-mix(in srgb, var(--primary) 10%, transparent)",border:"1px solid color-mix(in srgb, var(--primary) 30%, transparent)",borderRadius:"var(--radius-full)",fontSize:"var(--text-xs)",fontWeight:700,color:"var(--primary-bright)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"var(--space-6)"}}>
              Bewerbungsprozess
            </div>
            <h2 style={{...s.h2,fontSize:"var(--text-3xl)",letterSpacing:"-0.03em"}}>
              So bewirbst du dich — <span style={{color:"var(--primary-bright)"}}>in 3 Schritten</span>
            </h2>
            <p style={{fontSize:"var(--text-lg)",color:"var(--text-muted)",maxWidth:"48ch",marginInline:"auto",lineHeight:1.6,marginBottom:"var(--space-12)"}}>Einfach, schnell, direkt — kein Lebenslauf, kein Aufwand.</p>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(240px, 1fr))",gap:"var(--space-6)",marginBottom:"var(--space-12)"}}>
            {[
              {n:1,t:"Seite besuchen",d:"Du bist bereits hier — perfekt. Alle Infos über Provision und Team auf einem Blick."},
              {n:2,t:"WhatsApp öffnen",d:"Klicke auf den Button unten und öffne unseren WhatsApp-Chat direkt — kein Extra-App nötig."},
              {n:3,t:"Sprachnachricht senden",d:"Schick uns ausschließlich eine kurze Bewerbungs-Sprachnachricht. Wir checken Tonalität, Stimme und Ausdrucksweise."},
            ].map(step=>(
              <div key={step.n} style={{...s.card,background:"var(--bg)",position:"relative",overflow:"hidden"}}>
                <div aria-hidden="true" style={{position:"absolute",top:-8,right:12,fontSize:72,fontWeight:900,color:"var(--primary-bright)",opacity:0.06,lineHeight:1,userSelect:"none"}}>{step.n}</div>
                <div style={{display:"flex",alignItems:"center",gap:"var(--space-3)",marginBottom:"var(--space-4)"}}>
                  <div style={{width:40,height:40,borderRadius:"50%",background:"color-mix(in srgb, var(--primary) 12%, transparent)",border:"2px solid var(--primary)",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--primary-bright)",flexShrink:0,fontSize:"var(--text-base)",fontWeight:800}}>
                    {step.n}
                  </div>
                  <span style={{fontSize:"var(--text-xs)",fontWeight:800,color:"var(--primary-bright)",letterSpacing:"0.04em"}}>Schritt {step.n}</span>
                </div>
                <h3 style={{fontSize:"var(--text-base)",fontWeight:700,marginBottom:"var(--space-2)"}}>{step.t}</h3>
                <p style={{fontSize:"var(--text-sm)",color:"var(--text-muted)",lineHeight:1.65}}>{step.d}</p>
              </div>
            ))}
          </div>

          {/* WhatsApp CTA Box */}
          <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:"var(--radius-xl)",overflow:"hidden",boxShadow:"var(--shadow-lg)",position:"relative"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"var(--space-4) var(--space-6)",borderBottom:"1px solid var(--border)",background:"var(--bg)"}}>
              <div style={{display:"flex",alignItems:"center",gap:"var(--space-3)"}}>
                <div style={{width:36,height:36,borderRadius:"50%",background:"color-mix(in srgb, #3fb950 12%, transparent)",border:"2px solid #3fb950",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{color:"#3fb950"}}>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <div>
                  <div style={{fontWeight:700,fontSize:"var(--text-sm)",lineHeight:1}}>Utility Hub</div>
                  <div style={{fontSize:"var(--text-xs)",color:"var(--text-muted)",marginTop:2}}>WhatsApp Bewerbung</div>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:"var(--space-2)",padding:"4px 12px",borderRadius:"var(--radius-full)",background:"color-mix(in srgb, #3fb950 10%, transparent)",border:"1px solid color-mix(in srgb, #3fb950 30%, transparent)"}}>
                <span style={{width:6,height:6,borderRadius:"50%",background:"#3fb950",display:"inline-block"}} />
                <span style={{fontSize:"var(--text-xs)",fontWeight:600,color:"#3fb950"}}>Verfügbar</span>
              </div>
            </div>
            <div style={{padding:"var(--space-12) var(--space-8)",textAlign:"center"}}>
              <p style={{fontSize:"var(--text-lg)",color:"var(--text-muted)",maxWidth:"48ch",marginInline:"auto",lineHeight:1.65,marginBottom:"var(--space-8)"}}>
                Schick uns <strong style={{color:"var(--text)"}}>ausschließlich eine Sprachnachricht</strong> über WhatsApp. Kein Text, kein Lebenslauf — nur deine Stimme. So können wir direkt einschätzen, ob du gut zu uns passt.
              </p>
              <a href="https://wa.me/message/5GX3UQXT4OO6B1" target="_blank" rel="noopener noreferrer"
                style={{display:"inline-flex",alignItems:"center",gap:"var(--space-3)",padding:"16px 40px",borderRadius:"var(--radius-full)",background:"#25d366",color:"#fff",fontWeight:700,fontSize:"var(--text-base)",transition:"all var(--transition)",boxShadow:"0 4px 24px rgba(37,211,102,.3)"}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Zur WhatsApp-Bewerbung
              </a>
              <p style={{textAlign:"center",fontSize:"var(--text-xs)",color:"var(--text-faint)",marginTop:"var(--space-6)"}}>Wir melden uns innerhalb von 24 Stunden zurück</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{borderTop:"1px solid var(--border)",paddingBlock:"var(--space-10)",background:"var(--surface)"}}>
        <div style={{maxWidth:1100,margin:"0 auto",padding:"0 var(--space-6)",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"var(--space-4)"}}>
          <div style={{display:"flex",gap:"var(--space-6)",flexWrap:"wrap"}}>
            <p style={{fontSize:"var(--text-xs)",color:"var(--text-faint)"}}>© 2026 Utility Hub</p>
            <a href="/impressum" style={{fontSize:"var(--text-xs)",color:"var(--text-faint)"}}>Impressum</a>
            <a href="/datenschutz" style={{fontSize:"var(--text-xs)",color:"var(--text-faint)"}}>Datenschutz</a>
          </div>
        </div>
      </footer>
    </>
  );
}
