"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LANGS, QUESTION_COUNT, OPTION_COUNT, MAX_SCORE, checklist, bandIndex } from "./checklist";
import { STRINGS } from "./strings";

const PROGRESS_KEY = "bdc:progress";
const HISTORY_KEY = "bdc:history";
const LANG_KEY = "bdc:lang";
const ADVANCE_DELAY = 260;

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

const emptyAnswers = () => Array.from({ length: QUESTION_COUNT }, () => null);

export default function Home() {
  const [ready, setReady] = useState(false);
  const [lang, setLang] = useState("en");
  const [screen, setScreen] = useState("intro");
  const [answers, setAnswers] = useState(emptyAnswers);
  const [index, setIndex] = useState(0);
  const [startedAt, setStartedAt] = useState(null);
  const [editing, setEditing] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const savedLang = load(LANG_KEY, null);
    if (LANGS.includes(savedLang)) setLang(savedLang);
    else if (navigator.language?.toLowerCase().startsWith("es")) setLang("es");

    const progress = load(PROGRESS_KEY, null);
    if (progress?.answers?.length === QUESTION_COUNT) {
      setAnswers(progress.answers);
      setIndex(progress.index ?? 0);
      setStartedAt(progress.startedAt);
    }
    setHistory(load(HISTORY_KEY, []));
    setReady(true);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = STRINGS[lang].title;
  }, [lang]);

  useEffect(() => {
    if (!ready || !startedAt) return;
    save(PROGRESS_KEY, { startedAt, answers, index });
  }, [ready, startedAt, answers, index]);

  const changeLang = (next) => {
    setLang(next);
    save(LANG_KEY, next);
  };

  const finish = useCallback(
    (finalAnswers) => {
      const score = finalAnswers.reduce((sum, a) => sum + a, 0);
      setHistory((prev) => {
        const entry = { id: startedAt, date: Date.now(), score };
        const next = [...prev.filter((h) => h.id !== startedAt), entry].slice(-20);
        save(HISTORY_KEY, next);
        return next;
      });
      setEditing(false);
      setScreen("results");
      window.scrollTo(0, 0);
    },
    [startedAt]
  );

  const start = () => {
    setAnswers(emptyAnswers());
    setIndex(0);
    setStartedAt(Date.now());
    setEditing(false);
    setScreen("quiz");
  };

  const editQuestion = (i) => {
    setIndex(i);
    setEditing(true);
    setScreen("quiz");
  };

  if (!ready) return <main className="shell" />;

  const t = STRINGS[lang];
  const data = checklist(lang);
  const answered = startedAt ? answers.filter((a) => a !== null).length : 0;
  const goHome = () => {
    setEditing(false);
    setScreen("intro");
    window.scrollTo(0, 0);
  };

  return (
    <main className="shell">
      <header className="topbar">
        <div className="topbar-left">
          {screen !== "intro" && (
            <button className="chip" onClick={goHome}>
              ← {t.homeLink}
            </button>
          )}
          <Share t={t} />
        </div>
        <nav className="lang" aria-label="Language / Idioma">
          {LANGS.map((l) => (
            <button key={l} lang={l} aria-pressed={l === lang} className={l === lang ? "on" : ""} onClick={() => changeLang(l)}>
              <span className="long">{STRINGS[l].langName}</span>
              <span className="short" aria-hidden="true">{l.toUpperCase()}</span>
            </button>
          ))}
        </nav>
      </header>
      {screen === "intro" && (
        <Intro
          t={t}
          answered={answered}
          onStart={start}
          onResume={() => setScreen("quiz")}
          onViewResult={() => setScreen("results")}
        />
      )}
      {screen === "quiz" && (
        <Quiz
          t={t}
          data={data}
          answers={answers}
          setAnswers={setAnswers}
          index={index}
          setIndex={setIndex}
          editing={editing}
          onExit={() => (editing ? finish(answers) : setScreen("intro"))}
          onFinish={finish}
        />
      )}
      {screen === "results" && (
        <Results t={t} lang={lang} data={data} answers={answers} history={history} onEdit={editQuestion} onRestart={start} />
      )}
    </main>
  );
}

function Share({ t }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [manual, setManual] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (e.type === "keydown" ? e.key === "Escape" : !ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  const url = typeof window === "undefined" ? "" : window.location.origin + window.location.pathname;
  const text = encodeURIComponent(`${t.title} ${url}`);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Older browsers and embedded webviews may block the Clipboard API.
      const field = document.createElement("textarea");
      field.value = url;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      const ok = document.execCommand("copy");
      field.remove();
      if (!ok) {
        setManual(true);
        return;
      }
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="share" ref={ref}>
      <button className="chip" aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen((v) => !v)}>
        {t.share}
      </button>
      {open && (
        <div className="share-menu" role="menu">
          <a role="menuitem" href={`https://wa.me/?text=${text}`} target="_blank" rel="noreferrer" onClick={() => setOpen(false)}>
            WhatsApp
          </a>
          <a
            role="menuitem"
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
            target="_blank"
            rel="noreferrer"
            onClick={() => setOpen(false)}
          >
            Facebook
          </a>
          {manual ? (
            <input className="share-url" readOnly value={url} aria-label={t.copyLink} autoFocus onFocus={(e) => e.target.select()} />
          ) : (
            <button role="menuitem" onClick={copy}>
              {copied ? t.copied : t.copyLink}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Intro({ t, answered, onStart, onResume, onViewResult }) {
  const complete = answered === QUESTION_COUNT;
  return (
    <section className="intro fade">
      <p className="eyebrow">{t.author}</p>
      <h1>{t.title}</h1>
      <p className="lede">{t.instructions}</p>
      <ul className="facts">
        {t.facts.map(([value, label]) => (
          <li key={label}>
            <span>{value}</span> {label}
          </li>
        ))}
      </ul>
      <div className="actions">
        {complete ? (
          <>
            <button className="btn primary" onClick={onStart}>{t.begin}</button>
            <button className="btn ghost" onClick={onViewResult}>{t.viewLast}</button>
          </>
        ) : answered > 0 ? (
          <>
            <button className="btn primary" onClick={onResume}>{t.resume(answered, QUESTION_COUNT)}</button>
            <button className="btn ghost" onClick={onStart}>{t.startOver}</button>
          </>
        ) : (
          <button className="btn primary" onClick={onStart}>{t.begin}</button>
        )}
      </div>
      <p className="fine">{t.introFine}</p>
    </section>
  );
}

function Quiz({ t, data, answers, setAnswers, index, setIndex, editing, onExit, onFinish }) {
  const question = data.questions[index];
  const section = data.sections.find((s) => s.id === question.section);
  const headingRef = useRef(null);
  const timer = useRef(null);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [index]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const choose = useCallback(
    (value) => {
      clearTimeout(timer.current);
      const next = answers.map((a, i) => (i === index ? value : a));
      setAnswers(next);
      timer.current = setTimeout(() => {
        if (editing) {
          onFinish(next);
          return;
        }
        const firstUnanswered = next.findIndex((a, i) => a === null && i > index);
        const fallback = next.findIndex((a) => a === null);
        const target = firstUnanswered !== -1 ? firstUnanswered : fallback;
        if (target === -1) onFinish(next);
        else setIndex(target);
      }, ADVANCE_DELAY);
    },
    [answers, index, editing, setAnswers, setIndex, onFinish]
  );

  const back = useCallback(() => {
    clearTimeout(timer.current);
    if (index === 0 || editing) onExit();
    else setIndex(index - 1);
  }, [index, editing, onExit, setIndex]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const n = Number(e.key);
      if (n >= 1 && n <= OPTION_COUNT) choose(n - 1);
      else if (e.key === "ArrowLeft" || e.key === "Backspace") back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [choose, back]);

  let offset = 0;

  return (
    <section className="quiz">
      <header className="quiz-top">
        <button className="link" onClick={back}>
          ← {editing ? t.backToResults : index === 0 ? t.home : t.back}
        </button>
        <span className="count">
          {index + 1} <span className="muted">/ {QUESTION_COUNT}</span>
        </span>
      </header>

      <div className="progress" aria-hidden="true">
        {data.sections.map((s) => {
          const start = offset;
          offset += s.items.length;
          const done = answers.slice(start, offset).filter((a) => a !== null).length;
          return (
            <div key={s.id} className="progress-seg" style={{ flexGrow: s.items.length }}>
              <div className="progress-fill" style={{ width: `${(done / s.items.length) * 100}%` }} />
            </div>
          );
        })}
      </div>

      <div className="card fade" key={index}>
        <p className="eyebrow">{section.title}</p>
        <h2 ref={headingRef} tabIndex={-1} id="question">
          <span className="qnum">{index + 1}.</span> {question.text}
        </h2>
        <div className="options" role="radiogroup" aria-labelledby="question">
          {data.options.map((label, value) => {
            const selected = answers[index] === value;
            return (
              <button
                key={value}
                role="radio"
                aria-checked={selected}
                className={`option${selected ? " selected" : ""}`}
                onClick={() => choose(value)}
              >
                <span className="dots" aria-hidden="true">
                  {data.options.slice(1).map((_, d) => (
                    <i key={d} className={d < value ? "on" : ""} />
                  ))}
                </span>
                <span className="option-label">
                  <span className="muted">{value} =</span> {label}
                </span>
                <kbd aria-hidden="true">{value + 1}</kbd>
              </button>
            );
          })}
        </div>
      </div>
      <p className="hint">{t.hint}</p>
    </section>
  );
}

function Results({ t, lang, data, answers, history, onEdit, onRestart }) {
  const [showAnswers, setShowAnswers] = useState(false);
  const score = answers.reduce((sum, a) => sum + (a ?? 0), 0);
  const bi = bandIndex(score);
  const suicidalStart = data.questions.findIndex((q) => q.section === "suicidal");
  const atRisk = answers.slice(suicidalStart).some((a) => a > 0);
  const dateFmt = new Intl.DateTimeFormat(lang, { month: "short", day: "numeric", year: "numeric" });

  let offset = 0;
  const sections = data.sections.map((s) => {
    const start = offset;
    offset += s.items.length;
    const value = answers.slice(start, offset).reduce((sum, a) => sum + (a ?? 0), 0);
    return { ...s, start, value, max: s.items.length * (OPTION_COUNT - 1) };
  });

  return (
    <section className="results fade">
      <p className="eyebrow">{t.yourResult}</p>
      <div className="score-row">
        <div className="score">
          {score}
          <span>/{MAX_SCORE}</span>
        </div>
        <h1 className="band">{data.bands[bi].label}</h1>
      </div>

      {atRisk && (
        <aside className="alert" role="alert">
          <h2>{t.alertTitle}</h2>
          <p>{t.alertBody}</p>
          <p>
            {t.alertUS} <a href="tel:988">988</a> {t.alertUSName} {t.alertElsewhere}{" "}
            <a href="https://findahelpline.com" target="_blank" rel="noreferrer">findahelpline.com</a>.
          </p>
        </aside>
      )}

      <div className="panel">
        <h3>{t.whereFalls}</h3>
        <div className="scale" aria-hidden="true">
          {data.bands.map((b, i) => (
            <div key={b.max} className={`scale-seg${i === bi ? " active" : ""}`} style={{ flexGrow: b.max - b.min + 1 }} />
          ))}
          <div className="marker" style={{ left: `${(score / MAX_SCORE) * 100}%` }} />
        </div>
        <ol className="legend">
          {data.bands.map((b, i) => (
            <li key={b.max} className={i === bi ? "active" : ""}>
              <span className="range">
                {b.min}–{b.max}
              </span>
              {b.label}
            </li>
          ))}
        </ol>
      </div>

      <div className="panel">
        <h3>{t.byArea}</h3>
        <ul className="breakdown">
          {sections.map((s) => (
            <li key={s.id}>
              <div className="breakdown-head">
                <span>{s.title}</span>
                <span className="muted">
                  {s.value} / {s.max}
                </span>
              </div>
              <div className="bar">
                <div className={`bar-fill${s.id === "suicidal" && s.value > 0 ? " warn" : ""}`} style={{ width: `${(s.value / s.max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </div>

      {history.length > 1 && (
        <div className="panel">
          <h3>{t.recent}</h3>
          <ul className="history">
            {[...history].reverse().slice(0, 8).map((h, i) => (
              <li key={h.id}>
                <span className="muted">{i === 0 ? t.today : dateFmt.format(h.date)}</span>
                <div className="bar small">
                  <div className="bar-fill" style={{ width: `${(h.score / MAX_SCORE) * 100}%` }} />
                </div>
                <span className="history-score">{h.score}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="panel note">
        <h3>{t.aboutTitle}</h3>
        <p>{t.about}</p>
      </div>

      <div className="actions">
        <button className="btn ghost" onClick={() => setShowAnswers((v) => !v)} aria-expanded={showAnswers}>
          {showAnswers ? t.hideReview : t.review}
        </button>
        <button className="btn primary" onClick={onRestart}>{t.retake}</button>
      </div>

      {showAnswers && (
        <div className="panel fade">
          {sections.map((s) => (
            <div key={s.id} className="review-group">
              <h3>{s.title}</h3>
              <ul className="review">
                {s.items.map((text, i) => {
                  const qi = s.start + i;
                  return (
                    <li key={qi}>
                      <button onClick={() => onEdit(qi)}>
                        <span>
                          {qi + 1}. {text}
                        </span>
                        <span className="review-answer">{data.options[answers[qi]]}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          <p className="fine">{t.tapToChange}</p>
        </div>
      )}
    </section>
  );
}
