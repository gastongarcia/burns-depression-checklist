"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SECTIONS, QUESTIONS, OPTIONS, MAX_SCORE, BANDS, bandFor } from "./checklist";

const PROGRESS_KEY = "bdc:progress";
const HISTORY_KEY = "bdc:history";
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

const emptyAnswers = () => QUESTIONS.map(() => null);

export default function Home() {
  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState("intro");
  const [answers, setAnswers] = useState(emptyAnswers);
  const [index, setIndex] = useState(0);
  const [startedAt, setStartedAt] = useState(null);
  const [editing, setEditing] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const progress = load(PROGRESS_KEY, null);
    if (progress?.answers?.length === QUESTIONS.length) {
      setAnswers(progress.answers);
      setIndex(progress.index ?? 0);
      setStartedAt(progress.startedAt);
      if (progress.done) setScreen("results");
    }
    setHistory(load(HISTORY_KEY, []));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || !startedAt) return;
    save(PROGRESS_KEY, { startedAt, answers, index, done: screen === "results" });
  }, [ready, startedAt, answers, index, screen]);

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

  const resume = () => setScreen("quiz");

  const editQuestion = (i) => {
    setIndex(i);
    setEditing(true);
    setScreen("quiz");
  };

  if (!ready) return <main className="shell" />;

  const inProgress = startedAt && answers.some((a) => a !== null) && screen === "intro";

  return (
    <main className="shell">
      {screen === "intro" && <Intro onStart={start} onResume={inProgress ? resume : null} answered={answers.filter((a) => a !== null).length} />}
      {screen === "quiz" && (
        <Quiz
          answers={answers}
          setAnswers={setAnswers}
          index={index}
          setIndex={setIndex}
          editing={editing}
          onExit={() => (editing ? finish(answers) : setScreen("intro"))}
          onFinish={finish}
        />
      )}
      {screen === "results" && <Results answers={answers} history={history} onEdit={editQuestion} onRestart={start} />}
    </main>
  );
}

function Intro({ onStart, onResume, answered }) {
  return (
    <section className="intro fade">
      <p className="eyebrow">From David D. Burns, <em>Feeling Good</em></p>
      <h1>How are you feeling, really?</h1>
      <p className="lede">
        The Burns Depression Checklist is a short self-check for the symptoms of depression. Rate how much each one has
        bothered you <strong>over the past week, including today</strong>.
      </p>
      <ul className="facts">
        <li><span>25</span> questions</li>
        <li><span>3</span> minutes</li>
        <li><span>0</span> data sent anywhere</li>
      </ul>
      <div className="actions">
        {onResume ? (
          <>
            <button className="btn primary" onClick={onResume}>Continue ({answered} of {QUESTIONS.length})</button>
            <button className="btn ghost" onClick={onStart}>Start over</button>
          </>
        ) : (
          <button className="btn primary" onClick={onStart}>Begin the checklist</button>
        )}
      </div>
      <p className="fine">
        Your answers stay in this browser. This is a self-assessment, not a diagnosis. Your score appears once you've
        answered every question.
      </p>
    </section>
  );
}

function Quiz({ answers, setAnswers, index, setIndex, editing, onExit, onFinish }) {
  const question = QUESTIONS[index];
  const section = SECTIONS.find((s) => s.id === question.section);
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
      if (n >= 1 && n <= OPTIONS.length) choose(n - 1);
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
          ← {editing ? "Back to results" : index === 0 ? "Home" : "Back"}
        </button>
        <span className="count">
          {index + 1} <span className="muted">/ {QUESTIONS.length}</span>
        </span>
      </header>

      <div className="progress" aria-hidden="true">
        {SECTIONS.map((s) => {
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
          {question.text}
        </h2>
        <div className="options" role="radiogroup" aria-labelledby="question">
          {OPTIONS.map((label, value) => {
            const selected = answers[index] === value;
            return (
              <button
                key={label}
                role="radio"
                aria-checked={selected}
                className={`option${selected ? " selected" : ""}`}
                onClick={() => choose(value)}
              >
                <span className="dots" aria-hidden="true">
                  {OPTIONS.slice(1).map((_, d) => (
                    <i key={d} className={d < value ? "on" : ""} />
                  ))}
                </span>
                <span className="option-label">{label}</span>
                <kbd aria-hidden="true">{value + 1}</kbd>
              </button>
            );
          })}
        </div>
      </div>
      <p className="hint">Tip: press 1–5 to answer, ← to go back.</p>
    </section>
  );
}

function Results({ answers, history, onEdit, onRestart }) {
  const [showAnswers, setShowAnswers] = useState(false);
  const score = answers.reduce((sum, a) => sum + (a ?? 0), 0);
  const band = bandFor(score);
  const suicidalStart = QUESTIONS.findIndex((q) => q.section === "suicidal");
  const atRisk = answers.slice(suicidalStart).some((a) => a > 0);
  const dateFmt = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" });

  let offset = 0;
  const sections = SECTIONS.map((s) => {
    const start = offset;
    offset += s.items.length;
    const value = answers.slice(start, offset).reduce((sum, a) => sum + (a ?? 0), 0);
    return { ...s, start, value, max: s.items.length * (OPTIONS.length - 1) };
  });

  let low = 0;

  return (
    <section className="results fade">
      <p className="eyebrow">Your result</p>
      <div className="score-row">
        <div className="score">
          {score}
          <span>/{MAX_SCORE}</span>
        </div>
        <div>
          <h1 className="band">{band.label}</h1>
          <p className="lede">{band.tone}</p>
        </div>
      </div>

      {atRisk && (
        <aside className="alert" role="alert">
          <h2>Please reach out to someone today</h2>
          <p>
            You said you've had thoughts of ending your life or harming yourself. You don't have to handle that alone.
            If you're in danger right now, call your local emergency number.
          </p>
          <p>
            In the US, call or text <a href="tel:988">988</a> (Suicide &amp; Crisis Lifeline). Elsewhere, find a free,
            confidential line at <a href="https://findahelpline.com" target="_blank" rel="noreferrer">findahelpline.com</a>.
          </p>
        </aside>
      )}

      <div className="panel">
        <h3>Where your score falls</h3>
        <div className="scale" aria-hidden="true">
          {BANDS.map((b) => {
            const width = b.max - low + 1;
            low = b.max + 1;
            return <div key={b.label} className={`scale-seg${b === band ? " active" : ""}`} style={{ flexGrow: width }} />;
          })}
          <div className="marker" style={{ left: `${(score / MAX_SCORE) * 100}%` }} />
        </div>
        <ol className="legend">
          {BANDS.map((b, i) => (
            <li key={b.label} className={b === band ? "active" : ""}>
              <span className="range">
                {i === 0 ? 0 : BANDS[i - 1].max + 1}–{b.max}
              </span>
              {b.label}
            </li>
          ))}
        </ol>
      </div>

      <div className="panel">
        <h3>By area</h3>
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
          <h3>Your recent checks</h3>
          <ul className="history">
            {[...history].reverse().slice(0, 8).map((h, i) => (
              <li key={h.id}>
                <span className="muted">{i === 0 ? "Today's check" : dateFmt.format(h.date)}</span>
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
        <h3>What to do with this</h3>
        <p>
          This checklist measures how you've felt recently. It isn't a diagnosis. Burns suggests retaking it every week or
          so to see how things change over time.
        </p>
        {score > 10 && (
          <p>
            If your score stays in the mild range or higher for more than a couple of weeks, or feels like it's getting in
            the way of your life, talking with a doctor or therapist is a good next step.
          </p>
        )}
      </div>

      <div className="actions">
        <button className="btn ghost" onClick={() => setShowAnswers((v) => !v)} aria-expanded={showAnswers}>
          {showAnswers ? "Hide my answers" : "Review my answers"}
        </button>
        <button className="btn primary" onClick={onRestart}>Take it again</button>
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
                    <li key={text}>
                      <button onClick={() => onEdit(qi)}>
                        <span>{text}</span>
                        <span className="review-answer">{OPTIONS[answers[qi]]}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          <p className="fine">Tap any answer to change it.</p>
        </div>
      )}
    </section>
  );
}
