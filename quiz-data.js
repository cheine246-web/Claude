// ============================================================
//  Quiz-Daten: Coden mit KI & Claude Code
//  15 Fragen in 5 Kategorien
// ============================================================

const CATEGORIES = {
  GRUNDLAGEN:  { label: "KI-Grundlagen",        emoji: "🧠" },
  CLAUDE_CODE: { label: "Claude Code",           emoji: "🤖" },
  PROMPTING:   { label: "Prompt-Engineering",   emoji: "✍️" },
  WORKFLOW:    { label: "KI-Workflow",           emoji: "⚙️" },
  PRAXIS:      { label: "Praxis & Beispiele",   emoji: "💻" },
};

const QUESTIONS = [
  // ── GRUNDLAGEN ──────────────────────────────────────────
  {
    id: 1,
    category: "GRUNDLAGEN",
    question: "Was versteht man unter einem 'Large Language Model' (LLM) im Kontext des Programmierens?",
    options: [
      "Ein Kompilerprogramm, das großen Quellcode verarbeiten kann",
      "Ein KI-Modell, das auf riesigen Textmengen trainiert wurde und Code verstehen & generieren kann",
      "Eine Datenbank mit allen bekannten Open-Source-Projekten",
      "Ein Debugger, der automatisch Fehler im Code findet",
    ],
    correct: 1,
    explanation: "LLMs wie Claude, GPT-4 oder Gemini wurden auf Milliarden von Texten – darunter gigantische Mengen Code von GitHub – trainiert. Dadurch können sie Code lesen, schreiben, erklären und debuggen. Claude wurde z.B. auf über 100 Mrd. Token trainiert und versteht Dutzende Programmiersprachen.",
  },
  {
    id: 2,
    category: "GRUNDLAGEN",
    question: "Was ist der Hauptunterschied zwischen einem Chat-LLM (z.B. Claude.ai) und einem KI-Coding-Tool (z.B. Claude Code)?",
    options: [
      "Chat-LLMs sind kostenlos, Coding-Tools immer kostenpflichtig",
      "Coding-Tools können direkt auf dein Dateisystem, Terminal und Git-Repository zugreifen",
      "Chat-LLMs nutzen GPT, Coding-Tools nutzen immer Claude",
      "Es gibt keinen Unterschied – beide haben Zugriff auf den PC",
    ],
    correct: 1,
    explanation: "Claude.ai ist ein reiner Chat-Interface: Du kopierst Code rein und raus. Claude Code läuft als CLI in deinem Terminal und hat direkten Zugriff auf Dateien (<code>Read</code>/<code>Write</code>/<code>Edit</code>), kann Bash-Befehle ausführen, Tests starten und Git-Commits erstellen – alles ohne Copy-Paste.",
  },
  {
    id: 3,
    category: "GRUNDLAGEN",
    question: "Welches Konzept beschreibt, wie viel Text ein LLM in einer Anfrage gleichzeitig verarbeiten kann?",
    options: [
      "RAM-Budget",
      "Token-Fenster (Context Window)",
      "Batch-Size",
      "Inference-Limit",
    ],
    correct: 1,
    explanation: "Das 'Context Window' ist die maximale Anzahl Tokens (grob: Wörter/Codezeilen), die das Modell in einem Request sieht. Claude Sonnet 4.5 hat z.B. ein 200k-Token-Fenster – das entspricht ~150 000 Wörtern oder einer ganzen Codebasis. Je größer das Fenster, desto mehr Kontext kann die KI gleichzeitig berücksichtigen.",
  },

  // ── CLAUDE CODE ─────────────────────────────────────────
  {
    id: 4,
    category: "CLAUDE_CODE",
    question: "Wie startet man Claude Code in einem Projektordner?",
    options: [
      "claude-code --init",
      "npm start claude",
      "claude (im Terminal, im Projektverzeichnis)",
      "python claude_code.py",
    ],
    correct: 2,
    codeBlock: `# Im Terminal:
cd mein-projekt/
claude

# Claude Code öffnet sich und zeigt:
# ✓ Loaded 42 files from ./
# > What would you like to do?`,
    explanation: "Nach der Installation via <code>npm install -g @anthropic-ai/claude-code</code> reicht ein einfaches <code>claude</code> im Projektordner. Claude Code indiziert automatisch alle Dateien und ist sofort einsatzbereit.",
  },
  {
    id: 5,
    category: "CLAUDE_CODE",
    question: "Welcher Claude Code Slash-Command zeigt dir alle verfügbaren Befehle an?",
    options: [
      "/list",
      "/commands",
      "/help",
      "/menu",
    ],
    correct: 2,
    explanation: "<code>/help</code> listet alle eingebauten Slash-Commands auf. Wichtige Befehle sind z.B. <code>/compact</code> (Kontext komprimieren), <code>/clear</code> (Kontext leeren), <code>/review</code> (Code-Review starten) und <code>/commit</code> (Änderungen committen).",
  },
  {
    id: 6,
    category: "CLAUDE_CODE",
    question: "Was macht Claude Code, wenn du ihm sagst: 'Schreib Tests für alle Funktionen in utils.js'?",
    options: [
      "Es öffnet einen Browser und sucht auf Stack Overflow nach Tests",
      "Es liest utils.js, versteht die Funktionen und erstellt eine Testdatei – direkt auf der Festplatte",
      "Es gibt nur Codebeispiele zurück, die du selbst einfügen musst",
      "Es startet automatisch einen CI/CD-Pipeline-Run",
    ],
    correct: 1,
    codeBlock: `> Schreib Tests für alle Funktionen in utils.js

● Read(utils.js)            ← liest die Datei
● Write(utils.test.js)      ← erstellt Testdatei
● Bash(npm test)            ← führt Tests aus
  ✓ 8 tests passed`,
    explanation: "Claude Code arbeitet autonom: Es benutzt das <code>Read</code>-Tool zum Einlesen, <code>Write</code> zum Erstellen der Testdatei und kann mit <code>Bash</code> sofort <code>npm test</code> ausführen, um zu prüfen ob die Tests laufen – alles in einer Antwort.",
  },

  // ── PROMPT-ENGINEERING ──────────────────────────────────
  {
    id: 7,
    category: "PROMPTING",
    question: "Welcher Prompt wird wahrscheinlich bessere Ergebnisse liefern?",
    options: [
      "'Mach meinen Code besser'",
      "'Refaktoriere die fetchUserData()-Funktion in api/user.js: Ersetze den Callback-Stil durch async/await und füge try-catch-Fehlerbehandlung hinzu'",
      "'Schreib guten Code'",
      "'Verbessere alles'",
    ],
    correct: 1,
    explanation: "Gute Prompts sind SPEZIFISCH: Sie nennen die genaue Datei (<code>api/user.js</code>), die betroffene Funktion (<code>fetchUserData()</code>), die gewünschte Technik (<code>async/await</code>) und das Ziel (Fehlerbehandlung mit <code>try-catch</code>). Vage Prompts führen zu vagen Ergebnissen.",
  },
  {
    id: 8,
    category: "PROMPTING",
    question: "Was ist 'Few-Shot Prompting' im Coding-Kontext?",
    options: [
      "Die KI nur wenige Male pro Tag nutzen, um Kosten zu sparen",
      "Dem Modell 1-3 Beispiele im Prompt mitgeben, um das gewünschte Output-Format zu zeigen",
      "Code in kleinen Dateien aufteilen für bessere KI-Ergebnisse",
      "Einen kurzen Prompt unter 10 Wörtern verwenden",
    ],
    correct: 1,
    codeBlock: `# Few-Shot Prompt Beispiel:
"""
Konvertiere diese Funktionen zu Arrow-Functions:

// Beispiel input:
function add(a, b) { return a + b; }
// Beispiel output:
const add = (a, b) => a + b;

Jetzt konvertiere:
function multiply(x, y) { return x * y; }
function greet(name) { return 'Hello ' + name; }
"""`,
    explanation: "Durch 1-2 Beispiele im Prompt 'zeigt' man dem Modell das gewünschte Format. Das ist viel effektiver als nur zu beschreiben, was man will. Claude erkennt das Muster und wendet es auf die neuen Fälle an.",
  },
  {
    id: 9,
    category: "PROMPTING",
    question: "Was solltest du tun, wenn Claude Code einen Bug falsch behebt und neue Fehler einführt?",
    options: [
      "Den kompletten Code wegwerfen und neu anfangen",
      "Den Fehler akzeptieren – KI ist eben nicht perfekt",
      "Den spezifischen neuen Fehler beschreiben und sagen: 'Das hat das Problem nicht gelöst, stattdessen ist X passiert'",
      "Immer einen neuen Chat starten",
    ],
    correct: 2,
    explanation: "Iteratives Feedback ist der Schlüssel! Beschreibe präzise was schiefgelaufen ist: <code>'Nach deiner Änderung schlägt Test #3 fehl: TypeError: Cannot read property id of undefined in Zeile 42'</code>. Je konkreter der Fehlerbericht, desto besser die Korrektur.",
  },

  // ── WORKFLOW ────────────────────────────────────────────
  {
    id: 10,
    category: "WORKFLOW",
    question: "Was ist eine CLAUDE.md-Datei und wofür wird sie verwendet?",
    options: [
      "Eine automatisch erstellte Dokumentation des gesamten Projekts",
      "Eine Konfigurationsdatei, die Claude Code Anweisungen und Projektkontext für jede Session gibt",
      "Ein Backup aller Claude-Gespräche",
      "Eine Liste aller installierten KI-Tools im Projekt",
    ],
    correct: 1,
    codeBlock: `# Beispiel CLAUDE.md
## Projektkontext
Dies ist eine Next.js 14 App mit TypeScript.

## Code-Standards
- Verwende immer async/await statt .then()
- Alle Komponenten als funktionale React-Komponenten
- Tests mit Vitest schreiben, nicht Jest

## Wichtige Befehle
- npm run dev    → Entwicklungsserver
- npm test       → Tests ausführen
- npm run build  → Production Build`,
    explanation: "Die <code>CLAUDE.md</code> wird bei jedem Start automatisch geladen. Sie enthält Projektregeln, Coding-Standards und wichtige Konventionen. So musst du nicht jedes Mal erklären, welches Framework, welche Testing-Library oder welchen Code-Stil du verwendest.",
  },
  {
    id: 11,
    category: "WORKFLOW",
    question: "Welche Strategie hilft, wenn eine Aufgabe zu groß für einen einzelnen Prompt ist?",
    options: [
      "Alles in einen sehr langen Prompt packen",
      "Die Aufgabe in kleinere Teilschritte aufteilen und nacheinander abarbeiten",
      "Mehrere KI-Tools gleichzeitig öffnen",
      "Nur die erste Hälfte des Codes generieren lassen",
    ],
    correct: 1,
    explanation: "Große Aufgaben in Teilschritte aufteilen: <br>1️⃣ <code>'Erstelle die Datenbankmodelle'</code><br>2️⃣ <code>'Schreib die API-Endpoints für die Modelle'</code><br>3️⃣ <code>'Erstelle Tests für die Endpoints'</code><br>So bleibt jeder Schritt fokussiert, überprüfbar und die KI macht weniger Fehler.",
  },
  {
    id: 12,
    category: "WORKFLOW",
    question: "Was bedeutet 'Halluzinierung' bei KI-Coding-Tools und wie geht man damit um?",
    options: [
      "Die KI wird langsam – Lösung: Browser neu starten",
      "Die KI erfindet APIs, Funktionen oder Bibliotheken, die nicht existieren – immer Code prüfen und testen",
      "Die KI zeigt bunte Farben im Code-Editor",
      "Der Code läuft zu schnell und überhitzt den Computer",
    ],
    correct: 1,
    codeBlock: `# Beispiel Halluzinierung:
# Claude schlägt vor:
import pandas as pd
df.smart_filter(column='age', ai_mode=True)  # ← existiert nicht!

# Praxis-Tipp: Immer testen!
# Führe generierten Code direkt aus und
# überprüfe unbekannte Funktionen in der Doku.`,
    explanation: "KI-Modelle können selbstsicher falsche Dinge behaupten – z.B. Funktionen erfinden, die nicht existieren. Gegenmittel: <code>npm test</code> nach jedem generierten Code ausführen, unbekannte Methoden in der offiziellen Dokumentation nachschlagen und Claude Code immer Tests schreiben lassen.",
  },

  // ── PRAXIS ──────────────────────────────────────────────
  {
    id: 13,
    category: "PRAXIS",
    question: "Du hast einen Bug: 'TypeError: Cannot read properties of undefined (reading map)'. Wie formulierst du den besten Prompt?",
    options: [
      "'Fix den Bug'",
      "'Warum funktioniert mein Code nicht?'",
      "'In components/UserList.jsx Zeile 23 tritt TypeError: Cannot read properties of undefined (reading map) auf. Die Variable users kommt aus dem useUsers()-Hook. Hier ist der relevante Code: [Code einfügen]'",
      "'Kannst du meinen Code analysieren?'",
    ],
    correct: 2,
    explanation: "Der beste Bug-Report enthält: 📍 Datei & Zeile, 🔴 genaue Fehlermeldung, 🔗 Datenfluss (woher kommt die Variable), 📋 relevanter Code-Ausschnitt. Claude Code kann dann zielgenau helfen, statt den gesamten Codebase zu durchsuchen.",
  },
  {
    id: 14,
    category: "PRAXIS",
    question: "Was ist der Vorteil von 'Plan Mode' in Claude Code (Befehl: /plan)?",
    options: [
      "Der Code wird automatisch deployed",
      "Claude erstellt zuerst nur einen Plan, macht keine Dateiänderungen – du kannst die Strategie prüfen bevor etwas geändert wird",
      "Es öffnet einen Projektmanagement-Kalender",
      "Alle Änderungen werden in einer neuen Branch gespeichert",
    ],
    correct: 1,
    codeBlock: `> /plan Refaktoriere das gesamte Auth-System auf JWT

📋 PLAN (keine Änderungen gemacht):
1. auth/session.js → auth/jwt.js (neu)
2. middleware/auth.js → JWT-Validierung hinzufügen
3. 3 API-Routen anpassen
4. 12 Tests aktualisieren

Soll ich loslegen? [y/n]`,
    explanation: "Plan Mode ist essenziell bei größeren Refactorings. Claude beschreibt zuerst NUR was es tun würde, ohne eine einzige Datei anzufassen. So kannst du die Strategie prüfen, korrigieren oder ablehnen – bevor ungewollte Änderungen entstehen.",
  },
  {
    id: 15,
    category: "PRAXIS",
    question: "Welche dieser Aufgaben ist am BESTEN für Claude Code geeignet?",
    options: [
      "Das strategische Produkt-Roadmap-Planning für das nächste Jahr",
      "Das Schreiben von Boilerplate-Code, Unit-Tests, Dokumentation und das Refaktorieren von vorhandenem Code",
      "Das Treffen von Architekturentscheidungen ohne menschliche Überprüfung",
      "Das direkte Deployen in die Produktionsumgebung ohne Code-Review",
    ],
    correct: 1,
    explanation: "KI-Coding-Tools glänzen bei repetitiven, gut definierten Aufgaben: <br>✅ Boilerplate generieren (CRUD-Endpoints, Komponenten-Gerüste)<br>✅ Tests schreiben für bestehende Funktionen<br>✅ Docstrings & README-Abschnitte<br>✅ Code-Stil vereinheitlichen<br>❌ Strategische Entscheidungen oder Produktions-Deployments ohne Review bleiben beim Menschen.",
  },
];
