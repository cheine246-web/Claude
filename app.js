// ============================================================
//  Quiz App Logic
// ============================================================

(function () {
  "use strict";

  // ── State ────────────────────────────────────────────────
  let questions = [];
  let current   = 0;
  let score     = 0;
  let answers   = []; // { questionId, chosen, correct }
  let answered  = false;

  // ── DOM Refs ─────────────────────────────────────────────
  const $ = id => document.getElementById(id);

  const screens = {
    start:  $("screen-start"),
    quiz:   $("screen-quiz"),
    result: $("screen-result"),
    review: $("screen-review"),
  };

  // ── Helpers ──────────────────────────────────────────────
  function showScreen(name) {
    Object.values(screens).forEach(s => s.classList.remove("active"));
    screens[name].classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ── Start ─────────────────────────────────────────────────
  function startQuiz() {
    questions = shuffle(QUESTIONS);
    current   = 0;
    score     = 0;
    answers   = [];
    answered  = false;
    showScreen("quiz");
    renderQuestion();
  }

  // ── Render Question ──────────────────────────────────────
  function renderQuestion() {
    answered = false;
    const q  = questions[current];
    const cat = CATEGORIES[q.category];

    // Progress
    const pct = ((current) / questions.length) * 100;
    $("progress-bar").style.width = pct + "%";
    $("question-counter").textContent = `Frage ${current + 1} / ${questions.length}`;
    $("score-display").textContent    = `Punkte: ${score}`;

    // Category badge
    $("category-badge").textContent = `${cat.emoji} ${cat.label}`;

    // Question text
    $("question-text").textContent = q.question;

    // Code block
    const codeWrap = $("code-block-wrap");
    if (q.codeBlock) {
      $("code-block").textContent = q.codeBlock.trim();
      codeWrap.classList.remove("hidden");
    } else {
      codeWrap.classList.add("hidden");
    }

    // Options
    const letters = ["A", "B", "C", "D"];
    const list = $("options-list");
    list.innerHTML = "";
    q.options.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.className = "option-btn";
      btn.innerHTML = `<span class="opt-letter">${letters[i]}</span><span class="opt-text">${opt}</span>`;
      btn.addEventListener("click", () => handleAnswer(i));
      list.appendChild(btn);
    });

    // Hide feedback
    const fb = $("feedback-box");
    fb.classList.add("hidden");
    fb.classList.remove("correct-fb", "wrong-fb");
  }

  // ── Handle Answer ────────────────────────────────────────
  function handleAnswer(chosen) {
    if (answered) return;
    answered = true;

    const q        = questions[current];
    const isCorrect = chosen === q.correct;
    if (isCorrect) score++;

    answers.push({ questionId: q.id, chosen, correct: q.correct, isCorrect });

    // Highlight buttons
    const btns = $("options-list").querySelectorAll(".option-btn");
    btns.forEach((btn, i) => {
      btn.disabled = true;
      if (i === q.correct && !isCorrect) btn.classList.add("reveal");
      if (i === chosen && isCorrect)     btn.classList.add("correct");
      if (i === chosen && !isCorrect)    btn.classList.add("wrong");
    });

    // Feedback box
    const fb = $("feedback-box");
    fb.classList.remove("hidden", "correct-fb", "wrong-fb");
    fb.classList.add(isCorrect ? "correct-fb" : "wrong-fb");

    $("feedback-icon").textContent = isCorrect ? "✅" : "❌";
    $("feedback-text").textContent = isCorrect
      ? "Richtig! Gut gemacht."
      : `Falsch. Richtig wäre: ${String.fromCharCode(65 + q.correct)}) ${q.options[q.correct]}`;

    // Render explanation with inline code support
    $("explanation-text").innerHTML = q.explanation || "";

    $("score-display").textContent = `Punkte: ${score}`;
  }

  // ── Next Question ────────────────────────────────────────
  function nextQuestion() {
    current++;
    if (current >= questions.length) {
      showResult();
    } else {
      renderQuestion();
    }
  }

  // ── Show Result ───────────────────────────────────────────
  function showResult() {
    showScreen("result");

    const total = questions.length;
    const pct   = Math.round((score / total) * 100);

    // Emoji & title
    let emoji, title, subtitle;
    if (pct >= 87) {
      emoji    = "🏆";
      title    = "Hervorragend!";
      subtitle = "Du bist ein KI-Coding-Profi. Bereit für echte Projekte mit Claude Code!";
    } else if (pct >= 67) {
      emoji    = "🎉";
      title    = "Sehr gut!";
      subtitle = "Solides Wissen! Ein paar Themen kannst du noch vertiefen.";
    } else if (pct >= 47) {
      emoji    = "📚";
      title    = "Auf dem richtigen Weg!";
      subtitle = "Guter Start! Lies die Erklärungen durch – du wirst schnell besser.";
    } else {
      emoji    = "💡";
      title    = "Weiter so!";
      subtitle = "KI-Coding ist ein neues Thema – lies die Antworten und versuche es nochmal.";
    }

    $("result-emoji").textContent    = emoji;
    $("result-title").textContent    = title;
    $("result-subtitle").textContent = subtitle;
    $("result-percent").textContent  = pct + "%";

    // Ring animation
    const circumference = 2 * Math.PI * 50; // r=50 → 314.16
    const offset = circumference - (pct / 100) * circumference;
    const ring = $("ring-fill");
    ring.style.strokeDasharray  = circumference;
    ring.style.strokeDashoffset = circumference;
    setTimeout(() => { ring.style.strokeDashoffset = offset; }, 100);

    // Color ring by score
    const color = pct >= 87 ? "#22c55e" : pct >= 67 ? "#7c6af7" : pct >= 47 ? "#f59e0b" : "#ef4444";
    ring.style.stroke = color;
    $("result-percent").style.color = color;

    // Breakdown by category
    const catScores = {};
    questions.forEach((q, i) => {
      const cat = q.category;
      if (!catScores[cat]) catScores[cat] = { correct: 0, total: 0 };
      catScores[cat].total++;
      if (answers[i] && answers[i].isCorrect) catScores[cat].correct++;
    });

    const breakdown = $("result-breakdown");
    breakdown.innerHTML = "";
    Object.entries(catScores).forEach(([key, val]) => {
      const cat = CATEGORIES[key];
      const catPct = Math.round((val.correct / val.total) * 100);
      const dotColor = catPct >= 67 ? "#22c55e" : catPct >= 40 ? "#f59e0b" : "#ef4444";
      const row = document.createElement("div");
      row.className = "breakdown-row";
      row.innerHTML = `
        <span class="breakdown-dot" style="background:${dotColor}"></span>
        <span class="breakdown-label">${cat.emoji} ${cat.label}</span>
        <span class="breakdown-score">${val.correct}/${val.total}</span>`;
      breakdown.appendChild(row);
    });
  }

  // ── Review ────────────────────────────────────────────────
  function showReview() {
    showScreen("review");
    const list = $("review-list");
    list.innerHTML = "";
    const letters = ["A", "B", "C", "D"];

    questions.forEach((q, i) => {
      const ans = answers[i];
      const cat = CATEGORIES[q.category];
      const item = document.createElement("div");
      item.className = `review-item ${ans.isCorrect ? "ri-correct" : "ri-wrong"}`;

      let codeHtml = "";
      if (q.codeBlock) {
        codeHtml = `<pre style="background:#0d0f18;border:1px solid #2e3250;border-radius:8px;padding:12px;overflow-x:auto;font-size:0.83rem;color:#c9d1d9;margin:4px 0;"><code>${escapeHtml(q.codeBlock.trim())}</code></pre>`;
      }

      item.innerHTML = `
        <div class="ri-meta">
          <span class="ri-num">Frage ${i + 1}</span>
          <span class="ri-cat">${cat.emoji} ${cat.label}</span>
          <span class="ri-status">${ans.isCorrect ? "✅ Richtig" : "❌ Falsch"}</span>
        </div>
        <div class="ri-question">${q.question}</div>
        ${codeHtml}
        <div class="ri-answer">
          Deine Antwort: <strong>${letters[ans.chosen]}) ${q.options[ans.chosen]}</strong>
          ${!ans.isCorrect ? `<br>Richtige Antwort: <strong>${letters[q.correct]}) ${q.options[q.correct]}</strong>` : ""}
        </div>
        <div class="ri-explanation">${q.explanation}</div>`;

      list.appendChild(item);
    });
  }

  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // ── Event Listeners ──────────────────────────────────────
  $("btn-start").addEventListener("click", startQuiz);
  $("btn-next").addEventListener("click", nextQuestion);
  $("btn-restart").addEventListener("click", startQuiz);
  $("btn-review").addEventListener("click", showReview);
  $("btn-back-result").addEventListener("click", () => showScreen("result"));

  // Progress bar init
  $("progress-bar").style.width = "0%";

})();
