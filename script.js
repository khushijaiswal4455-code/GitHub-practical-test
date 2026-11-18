document.documentElement.classList.add("js");

// ---------- Greeting ----------
const hour = new Date().getHours();
const part = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
document.getElementById("greeting").textContent = "Good " + part + ", and welcome.";

// ---------- Typing effect ----------
const roles = ["web developer", "computer science student", "problem solver"];
const typed = document.getElementById("typed");
let roleIndex = 0, charIndex = 0, deleting = false;

function type() {
  const word = roles[roleIndex];
  typed.textContent = word.slice(0, charIndex);
  if (!deleting && charIndex < word.length) { charIndex++; setTimeout(type, 90); }
  else if (!deleting) { deleting = true; setTimeout(type, 1400); }
  else if (charIndex > 0) { charIndex--; setTimeout(type, 45); }
  else { deleting = false; roleIndex = (roleIndex + 1) % roles.length; setTimeout(type, 300); }
}
type();

// ---------- Theme (remembered) ----------
const themeBtn = document.getElementById("theme-toggle");
function setTheme(dark) {
  document.body.classList.toggle("dark", dark);
  themeBtn.textContent = dark ? "Light mode" : "Dark mode";
  themeBtn.setAttribute("aria-pressed", dark);
  try { localStorage.setItem("theme", dark ? "dark" : "light"); } catch (e) {}
}
let saved = null;
try { saved = localStorage.getItem("theme"); } catch (e) {}
setTheme(saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches);
themeBtn.addEventListener("click", () => setTheme(!document.body.classList.contains("dark")));

// ---------- Interactive terminal ----------
const termOutput = document.getElementById("term-output");
const termForm = document.getElementById("term-form");
const termInput = document.getElementById("term-cmd");
const history = [];
let historyPos = 0;

const commands = {
  help: () => [
    "Available commands:",
    "  about     who I am",
    "  skills    what I work with",
    "  projects  things I have built",
    "  contact   how to reach me",
    "  theme     switch dark / light",
    "  clear     empty the screen",
  ],
  about: () => [
    "Name: Your Name",
    "Studying: Computer Science, Pune, India",
    "Interests: web development, clean design, version control",
  ],
  skills: () => ["HTML, CSS, JavaScript, Git and GitHub"],
  projects: () => {
    const names = Array.from(document.querySelectorAll(".project h3")).map((h) => "  - " + h.textContent);
    return ["Projects:"].concat(names, ["Scroll to the Projects section for details."]);
  },
  contact: () => ["Email: yourname@example.com", "GitHub: github.com/your-username"],
  theme: () => {
    setTheme(!document.body.classList.contains("dark"));
    return ["Theme switched."];
  },
};

function printLine(text, className) {
  const p = document.createElement("p");
  p.className = "line" + (className ? " " + className : "");
  p.textContent = text;
  termOutput.appendChild(p);
}

function runCommand(raw) {
  const cmd = raw.trim().toLowerCase();
  if (!cmd) return;
  history.push(cmd);
  historyPos = history.length;
  printLine("$ " + cmd, "cmd");
  if (cmd === "clear") { termOutput.textContent = ""; return; }
  if (commands[cmd]) commands[cmd]().forEach((line) => printLine(line));
  else printLine("Command not found: " + cmd + ". Type help to see what works.");
  termOutput.scrollTop = termOutput.scrollHeight;
}

termForm.addEventListener("submit", (e) => {
  e.preventDefault();
  runCommand(termInput.value);
  termInput.value = "";
});
termInput.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp" && historyPos > 0) { historyPos--; termInput.value = history[historyPos]; e.preventDefault(); }
  if (e.key === "ArrowDown") {
    historyPos = Math.min(historyPos + 1, history.length);
    termInput.value = history[historyPos] || "";
    e.preventDefault();
  }
});
document.querySelectorAll(".term-chips button").forEach((b) => {
  b.addEventListener("click", () => runCommand(b.dataset.cmd));
});
printLine("Welcome! Type a command or tap one below.");
printLine("Try: help", "cmd");

// ---------- Scroll reveal, skill bars, counters ----------
function countUp(el) {
  const target = Number(el.dataset.count);
  const start = performance.now();
  const duration = 1200;
  function step(now) {
    const t = Math.min((now - start) / duration, 1);
    el.textContent = Math.round(target * t);
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("visible");
    entry.target.querySelectorAll(".bar span").forEach((bar) => { bar.style.width = bar.dataset.level + "%"; });
    entry.target.querySelectorAll("[data-count]").forEach(countUp);
    observer.unobserve(entry.target);
  });
}, { threshold: 0.15 });
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

// ---------- Project filter ----------
const chips = document.querySelectorAll(".chip");
const projects = document.querySelectorAll(".project");
chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    chips.forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    const filter = chip.dataset.filter;
    projects.forEach((p) => { p.hidden = filter !== "all" && p.dataset.category !== filter; });
  });
});

// ---------- Project details modal ----------
const modal = document.getElementById("modal");
projects.forEach((card) => {
  card.querySelector(".more").addEventListener("click", () => {
    document.getElementById("modal-title").textContent = card.dataset.title;
    document.getElementById("modal-desc").textContent = card.dataset.desc;
    document.getElementById("modal-tech").textContent = card.dataset.tech;
    document.getElementById("modal-link").href = card.dataset.link;
    modal.showModal();
  });
});
document.getElementById("modal-close").addEventListener("click", () => modal.close());
modal.addEventListener("click", (e) => { if (e.target === modal) modal.close(); });

// ---------- Contact form ----------
const form = document.getElementById("contact-form");
const status = document.getElementById("form-status");

function check(id, test, msg) {
  const field = document.getElementById(id);
  const ok = test(field.value.trim());
  field.classList.toggle("invalid", !ok);
  document.getElementById(id + "-error").textContent = ok ? "" : msg;
  return ok;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const results = [
    check("name", (v) => v.length >= 2, "Please enter your name."),
    check("email", (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Please enter a valid email address."),
    check("message", (v) => v.length >= 10, "Your message should be at least 10 characters."),
  ];
  if (results.every(Boolean)) {
    status.textContent = "Thanks! Your message is ready to send (demo only, no server connected).";
    form.reset();
  } else {
    status.textContent = "";
  }
});

// Copy email button
const copyBtn = document.getElementById("copy-email");
copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(copyBtn.dataset.email);
    copyBtn.textContent = "Copied!";
  } catch (e) {
    copyBtn.textContent = copyBtn.dataset.email;
  }
  setTimeout(() => { copyBtn.textContent = "Copy email address"; }, 2000);
});

// ---------- Progress bar + back to top ----------
const progress = document.getElementById("progress");
const toTop = document.getElementById("to-top");
window.addEventListener("scroll", () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
  toTop.classList.toggle("show", window.scrollY > 400);
});
toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
