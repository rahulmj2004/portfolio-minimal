// All site content lives here. Edit this file to update the portfolio.

export const profile = {
  name: "Rahul M J",
  first: "Rahul",
  last: "M J",
  role: "Software Engineer",
  location: "Thrissur, Kerala — IN",
  email: "rahulmjr2004@gmail.com",
  github: "https://github.com/rahulmj2004",
  githubUser: "rahulmj2004",
  linkedin: "https://www.linkedin.com/in/rahulmj2004",
  resume: "/Rahul_MJ_Resume.pdf",
  status: "Open to SDE internships · 2026",
  now: "Building RxGuard — evidence-backed prescription review",
  tagline: "I build AI systems that are honest about what they know.",
  manifesto:
    "AI reads. Rules validate. Humans decide. I let models handle language, and keep facts, maths and final calls in deterministic code — so the software can say “I’m not sure” when it isn’t.",
  about: [
    "Computer Science undergraduate at Vidya Academy of Science and Technology, shipping since my first year. Most of my work sits where AI meets healthcare — pharmacists, patients, doctors — places where a confident wrong answer costs more than an honest “uncertain”.",
    "Outside projects, I contribute to CARE, an open-source hospital management system used in real deployments, grind DSA on LeetCode, and read papers to steal good ideas from.",
  ],
};

export const stats = [
  { value: 10, suffix: "+", label: "Products built end to end" },
  { value: 1, suffix: "st", label: "Prize — Aronexa AyuSetu Healthcare Innovation" },
  { value: 2, suffix: "", label: "Open PRs to a Digital Public Good" },
  { value: 2, suffix: "", label: "Smart India Hackathon problem statements tackled" },
];

export type Project = {
  slug: string;
  title: string;
  kind: string;
  year: string;
  summary: string;
  points: string[];
  tags: string[];
  link?: string;
  accent: string;
};

// The four featured case studies in the horizontal reel
export const featured: Project[] = [
  {
    slug: "rxguard",
    title: "RxGuard",
    kind: "Healthcare AI",
    year: "2026",
    summary:
      "Prescription review for pharmacists on a deterministic-first design: tools verify the facts, the LLM only explains, the pharmacist makes the call.",
    points: [
      "Django REST + MySQL backend with an order-independent drug-interaction lookup",
      "Never treats a missing record as “safe”",
      "FAISS evidence retrieval + LangGraph agent with pharmacist-in-the-loop review",
    ],
    tags: ["Django", "MySQL", "FAISS", "LangGraph", "Docker"],
    link: "https://github.com/rahulmj2004/RxGuard",
    accent: "#ff5a1f",
  },
  {
    slug: "iot",
    title: "IoT Anomaly Detection",
    kind: "Security Research",
    year: "2025",
    summary:
      "Real-time anomaly detection for IoT devices using autoencoders, with explanations a plant engineer can actually read.",
    points: [
      "Autoencoder pipeline tuned to cut false positives",
      "SHAP explanation for every prediction",
      "Flower federated learning across three factory datasets, AES-256 transport",
    ],
    tags: ["Python", "TensorFlow", "SHAP", "Flower", "Streamlit"],
    link: "https://github.com/rahulmj2004/intelligent-iot-anomaly-detection-v2",
    accent: "#d8ff3a",
  },
  {
    slug: "shravya",
    title: "Shravya",
    kind: "Inclusive EdTech · Finalist",
    year: "2025",
    summary:
      "Malayalam-first AI classroom assistant for Classes 5–10. Turns lectures into structured notes, quizzes and revision — built as an InclUCode finalist team.",
    points: [
      "Lecture processing → auto-generated structured notes",
      "Intelligent quiz generation and revision flows",
      "Local speech recognition for accessibility",
    ],
    tags: ["React", "Python", "Speech", "Playwright"],
    link: "https://github.com/gp16v/shravya-inclucode",
    accent: "#7cc7ff",
  },
  {
    slug: "jeevaflow",
    title: "JeevaFlow",
    kind: "Health Records",
    year: "2026",
    summary:
      "Turns scattered medical PDFs, photos and WhatsApp forwards into one patient timeline — and tracks every doctor instruction as an “Open Loop” until someone confirms it.",
    points: [
      "OCR ingestion from PDFs, photos and chats",
      "Rules engine for follow-up tracking",
      "Twilio / WhatsApp intake",
    ],
    tags: ["Python", "OCR", "Twilio", "Rules engine"],
    link: "https://github.com/rahulmj2004/jeevaflow-ai",
    accent: "#ffb547",
  },
];

// The archive list under the reel
export const archive = [
  {
    title: "AroNexa Visit Capsule",
    kind: "Medical document readiness",
    year: "2026",
    tags: ["FastAPI", "OCR", "SQLite"],
    desc: "OCR, classification, duplicate detection and provenance packed into a doctor-ready capsule with a readiness score.",
  },
  {
    title: "TATPAR",
    kind: "SIH · Predictive maintenance",
    year: "2026",
    tags: ["Gradient Boosting", "Optimisation"],
    desc: "RUL prediction on NASA C-MAPSS (RMSE 17.2 vs 20.2 baseline) feeding a spares optimiser — 97.6% fleet availability in simulation.",
  },
  {
    title: "JalPrahari",
    kind: "SIH · Water networks",
    year: "2026",
    tags: ["Diagnosis", "Simulation"],
    desc: "Network-aware water-service diagnosis under sparse, unreliable sensing — says what failed, where, and how sure it is.",
  },
  {
    title: "Deepfake Image Detection",
    kind: "Computer vision",
    year: "2025",
    tags: ["CNN", "Image processing"],
    desc: "CNN classifier for manipulated and AI-generated images, validated across manipulation techniques.",
  },
  {
    title: "DevShowdown",
    kind: "Event platform",
    year: "2026",
    tags: ["Next.js", "Three.js", "Supabase", "Razorpay"],
    desc: "Five events, multi-step registration, Razorpay payments and a Three.js hero.",
    link: "https://github.com/rahulmj2004/devshowdown",
  },
  {
    title: "Destroy The Decibel",
    kind: "Event website",
    year: "2026",
    tags: ["Next.js", "GSAP", "Tailwind"],
    desc: "Scroll-driven site for “The Battle of Exhausts”, a CSE department car exhaust sound competition.",
    link: "https://github.com/RAHULMJ2004/DTD",
  },
];

export const achievements = [
  {
    year: "2026",
    title: "First Prize",
    org: "Aronexa AyuSetu Healthcare Innovation Contest",
    text: "Won first place with a healthcare AI build — prize: a trip to Ladakh.",
    highlight: true,
  },
  {
    year: "2026",
    title: "Second Prize",
    org: "IBM Quantum Hackathon",
    text: "Placed second at the IBM Quantum Hackathon with a Qiskit-based build.",
  },
  {
    year: "2025",
    title: "National Finalist",
    org: "InclUCode, powered by CODEX",
    text: "Engineered Shravya, an AI accessibility platform for inclusive education, from concept to finalist submission.",
  },
  {
    year: "2026",
    title: "Open Source Contributor",
    org: "Open Healthcare Network — CARE",
    text: "Frontend PRs (React, TypeScript) to a Digital Public Good used in real hospitals: permission checks on patient notes, schedule-exception tooltips.",
  },
  {
    year: "2026",
    title: "Smart India Hackathon",
    org: "Two problem statements",
    text: "Built TATPAR (predictive maintenance) and JalPrahari (water-network diagnosis).",
  },
  {
    year: "2025",
    title: "AI Intern",
    org: "Pacelab, Kochi",
    text: "Hands-on internship in Python and core machine-learning fundamentals — model building and data handling.",
  },
  {
    year: "2026",
    title: "Tech Fest Coordinator",
    org: "DevShowdown",
    text: "Planned and ran a college-level technical fest end to end, leading registrations and on-ground operations.",
  },
];

export const process = [
  {
    title: "Understand",
    text: "Start from the real problem and the people who live with it — pharmacists, patients, students, field engineers.",
  },
  {
    title: "Ground the facts",
    text: "Facts, maths and decisions go in deterministic tools. Models handle language, never the final call.",
  },
  {
    title: "Build & measure",
    text: "Ship a working pipeline early, then benchmark honestly against baselines — and label simulated results as simulated.",
  },
  {
    title: "Iterate",
    text: "Tighten the edges: tests, failure modes, and an explicit “uncertain” when the evidence is weak.",
  },
];

export const skills = [
  { group: "Languages", items: ["Python", "Java", "TypeScript", "JavaScript", "C", "C++"] },
  { group: "Web", items: ["React", "Next.js", "Django REST", "FastAPI", "HTML5 / CSS3", "Tailwind"] },
  {
    group: "AI / ML",
    items: ["TensorFlow / Keras", "Scikit-learn", "CNNs", "Autoencoders", "SHAP", "Federated (Flower)", "RAG / FAISS", "LangGraph"],
  },
  { group: "Data & Tools", items: ["MySQL", "SQLite", "Docker", "Git", "Postman", "Jupyter", "Streamlit"] },
];

export const marquee = [
  "Python", "TypeScript", "React", "Django", "FastAPI", "TensorFlow", "LangGraph", "FAISS", "Docker", "Three.js", "Next.js", "MySQL", "SHAP", "Flower",
];

export const education = {
  school: "Vidya Academy of Science and Technology",
  degree: "B.Tech, Computer Science & Engineering",
  years: "2023 — 2027",
  certs: [
    "Python Foundation — Infosys, 2025",
    "PHP & MySQL — Spoken Tutorial, IIT Bombay",
    "HTML and C Basics — Spoken Tutorial, IIT Bombay",
  ],
};
