// Free, offline "smart answers" for the chat: no AI service, no key, runs in the browser.
// It matches a question to the closest topic (tolerating typos and different wording) and
// answers only from src/content/site.ts, in English or Malayalam. If nothing matches, it says so honestly.
import { achievements, archive, education, featured, profile, skills } from "@/content/site";

export type Lang = "en" | "ml";

type Topic = {
  id: string;
  keys: string[]; // English words/phrases, and Malayalam words (matched inside the question)
  answer: () => string;
  ml: () => string; // the same answer in Malayalam
  project?: boolean; // project topics win ties and can be combined
  weight?: number;
};

const first = profile.first;
const ML_NAME = "രാഹുൽ";
const ML_OF = "രാഹുലിന്റെ"; // "Rahul's"
const ML_TO = "രാഹുലിനോട്"; // "to Rahul"
const award = (title: string) => achievements.find((a) => a.title === title);
const list = (items: string[]) => items.map((x) => `- ${x}`).join("\n");
const hasMalayalam = (s: string) => /[ഀ-ൿ]/.test(s);

/* ---------- Projects ---------- */

const projectAliases: Record<string, string[]> = {
  RxGuard: ["rxguard", "rx guard", "prescription", "pharmacist", "pharmacy", "drug", "drugs", "interaction", "langgraph", "faiss", "rag", "പ്രിസ്ക്രിപ്ഷൻ", "ഫാർമസി", "മരുന്ന്"],
  "IoT Anomaly Detection": ["iot", "anomaly", "autoencoder", "autoencoders", "shap", "federated", "flower", "intrusion", "security research", "ഐഒടി"],
  Shravya: ["shravya", "classroom", "inclucode", "edtech", "education app", "notes", "quiz", "ശ്രാവ്യ", "ക്ലാസ്റൂം"],
  JeevaFlow: ["jeevaflow", "jeeva", "health records", "medical records", "timeline", "whatsapp", "twilio", "open loop", "ജീവ"],
  "AroNexa Visit Capsule": ["visit capsule", "capsule", "readiness", "doctor ready", "ക്യാപ്സ്യൂൾ"],
  TATPAR: ["tatpar", "predictive maintenance", "rul", "c-mapss", "cmapss", "spares", "തത്പര"],
  JalPrahari: ["jalprahari", "jal prahari", "water", "water network", "ജലപ്രഹരി", "കുടിവെള്ള"],
  "Deepfake Image Detection": ["deepfake", "deep fake", "fake image", "manipulated", "cnn", "ഡീപ്ഫേക്ക്"],
  DevShowdown: ["devshowdown", "dev showdown", "event platform", "razorpay", "tech fest", "ടെക് ഫെസ്റ്റ്"],
  "Destroy The Decibel": ["destroy the decibel", "decibel", "dtd", "exhaust", "എക്സ്ഹോസ്റ്റ്"],
};

// Malayalam descriptions of each project (names and tech terms stay in English)
const projectMl: Record<string, string> = {
  RxGuard:
    "ഫാർമസിസ്റ്റുകൾക്കുള്ള പ്രിസ്ക്രിപ്ഷൻ റിവ്യൂ ടൂൾ. ഡ്രഗ് ഇന്ററാക്ഷൻ പോലുള്ള വസ്തുതകൾ ടൂളുകൾ പരിശോധിക്കുന്നു, AI അത് വിശദീകരിക്കുക മാത്രം ചെയ്യുന്നു, അന്തിമ തീരുമാനം ഫാർമസിസ്റ്റിന്റേതാണ്. ഒരു രേഖ ഇല്ലെങ്കിൽ അത് സുരക്ഷിതമാണെന്ന് ഒരിക്കലും കണക്കാക്കില്ല.",
  "IoT Anomaly Detection":
    "IoT ഉപകരണങ്ങളിലെ അസാധാരണ പ്രവർത്തനങ്ങൾ തത്സമയം കണ്ടെത്തുന്ന സിസ്റ്റം. Autoencoder മോഡൽ ഉപയോഗിക്കുന്നു, ഓരോ പ്രവചനത്തിനും SHAP വിശദീകരണം നൽകുന്നു, മൂന്ന് ഫാക്ടറി ഡാറ്റാസെറ്റുകളിൽ Flower ഫെഡറേറ്റഡ് ലേണിംഗും ഉണ്ട്.",
  Shravya:
    "5 മുതൽ 10 വരെ ക്ലാസുകൾക്കുള്ള മലയാളം-ഫസ്റ്റ് AI ക്ലാസ്റൂം അസിസ്റ്റന്റ്. ക്ലാസുകളെ നോട്ടുകളും ക്വിസുകളും റിവിഷനുമാക്കി മാറ്റുന്നു. InclUCode ദേശീയ ഫൈനലിസ്റ്റ് പ്രോജക്ട് ആണ്.",
  JeevaFlow:
    "ചിതറിക്കിടക്കുന്ന മെഡിക്കൽ PDF-കൾ, ഫോട്ടോകൾ, WhatsApp സന്ദേശങ്ങൾ എന്നിവ ഒരൊറ്റ രോഗി ടൈംലൈനാക്കി മാറ്റുന്നു. ഡോക്ടറുടെ ഓരോ നിർദ്ദേശവും ആരെങ്കിലും ഉറപ്പാക്കുന്നതുവരെ ട്രാക്ക് ചെയ്യുന്നു.",
  "AroNexa Visit Capsule":
    "മെഡിക്കൽ രേഖകളെ OCR, ക്ലാസിഫിക്കേഷൻ, ഡ്യൂപ്ലിക്കേറ്റ് കണ്ടെത്തൽ എന്നിവയിലൂടെ ഡോക്ടർക്ക് തയ്യാറായ ഒരു ക്യാപ്സ്യൂൾ ആക്കി മാറ്റുന്നു, ഒരു റെഡിനസ് സ്കോറോടെ.",
  TATPAR:
    "Smart India Hackathon പ്രോജക്ട്. NASA C-MAPSS ഡാറ്റ ഉപയോഗിച്ച് മെഷീനുകളുടെ ബാക്കി ആയുസ്സ് പ്രവചിക്കുന്നു, സ്പെയർ പാർട്സ് ഒപ്റ്റിമൈസ് ചെയ്യുന്നു. സിമുലേഷനിൽ 97.6% ഫ്ലീറ്റ് ലഭ്യത.",
  JalPrahari:
    "Smart India Hackathon പ്രോജക്ട്. കുറഞ്ഞ സെൻസർ ഡാറ്റയിൽ നിന്ന് കുടിവെള്ള ശൃംഖലയിലെ പ്രശ്നം എന്ത്, എവിടെ, എത്ര ഉറപ്പോടെ എന്ന് കണ്ടെത്തുന്നു.",
  "Deepfake Image Detection": "കൃത്രിമമായി മാറ്റം വരുത്തിയതും AI നിർമ്മിച്ചതുമായ ചിത്രങ്ങൾ തിരിച്ചറിയുന്ന CNN മോഡൽ.",
  DevShowdown: "അഞ്ച് ഇവന്റുകൾ, രജിസ്ട്രേഷൻ, Razorpay പേയ്മെന്റ്, Three.js ഡിസൈൻ എന്നിവയുള്ള ടെക് ഫെസ്റ്റ് പ്ലാറ്റ്ഫോം.",
  "Destroy The Decibel": "CSE ഡിപ്പാർട്ട്മെന്റിന്റെ കാർ എക്സ്ഹോസ്റ്റ് ശബ്ദ മത്സരമായ The Battle of Exhausts-നുള്ള വെബ്സൈറ്റ്.",
};

const projectTopics: Topic[] = [
  ...featured.map((p) => ({
    id: p.title,
    project: true,
    keys: projectAliases[p.title] ?? [p.title.toLowerCase()],
    answer: () =>
      `${p.title} (${p.kind}, ${p.year}): ${p.summary}\n${list(p.points)}\nBuilt with ${p.tags.join(", ")}.${p.link ? `\nCode: ${p.link}` : ""}`,
    ml: () => `${p.title} (${p.year}): ${projectMl[p.title]}\nടെക്നോളജി: ${p.tags.join(", ")}.${p.link ? `\nകോഡ്: ${p.link}` : ""}`,
  })),
  ...archive.map((p) => ({
    id: p.title,
    project: true,
    keys: projectAliases[p.title] ?? [p.title.toLowerCase()],
    answer: () =>
      `${p.title} (${p.kind}, ${p.year}): ${p.desc} Built with ${p.tags.join(", ")}.${"link" in p && p.link ? `\nCode: ${p.link}` : ""}`,
    ml: () =>
      `${p.title} (${p.year}): ${projectMl[p.title] ?? p.desc}\nടെക്നോളജി: ${p.tags.join(", ")}.${"link" in p && p.link ? `\nകോഡ്: ${p.link}` : ""}`,
  })),
];

/* ---------- Awards in Malayalam ---------- */

const awardMl: Record<string, string> = {
  "First Prize": "Aronexa AyuSetu ഹെൽത്ത്കെയർ ഇന്നൊവേഷൻ മത്സരത്തിൽ ഒന്നാം സമ്മാനം (2026)",
  "Second Prize": "IBM Quantum ഹാക്കത്തോണിൽ രണ്ടാം സമ്മാനം (2026)",
  "National Finalist": "InclUCode ദേശീയ ഫൈനലിസ്റ്റ്, Shravya പ്രോജക്ടിന് (2025)",
  "Open Source Contributor": "Open Healthcare Network-ന്റെ CARE-ലേക്ക് ഓപ്പൺ സോഴ്സ് സംഭാവനകൾ (2026)",
  "Smart India Hackathon": "Smart India Hackathon-ൽ രണ്ട് പ്രോബ്ലം സ്റ്റേറ്റ്മെന്റുകൾ: TATPAR, JalPrahari (2026)",
};

const skillGroup = (g: string) => skills.find((s) => s.group === g)?.items.join(", ") ?? "";
const skillMlName: Record<string, string> = { Languages: "ഭാഷകൾ", Web: "വെബ്", "AI / ML": "AI / ML", "Data & Tools": "ഡാറ്റ & ടൂളുകൾ" };
const location = profile.location.replace(" — IN", ", India");

/* ---------- Topics ---------- */

const topics: Topic[] = [
  {
    id: "personal",
    weight: 3,
    keys: ["salary", "pay", "ctc", "age", "old", "married", "girlfriend", "wife", "relationship", "religion", "caste", "phone", "number", "address", "birthday", "dob", "family", "parents", "ശമ്പളം", "വയസ്സ്", "പ്രായം", "വിവാഹ", "ഫോൺ", "നമ്പർ", "വീട്", "കുടുംബ", "മതം", "ജാതി"],
    answer: () => `I don't have that information, and I won't guess. You can ask ${first} directly at ${profile.email}.`,
    ml: () => `ആ വിവരം എന്റെ പക്കലില്ല, ഊഹിച്ച് പറയാനും ഞാൻ ആഗ്രഹിക്കുന്നില്ല. ${ML_TO} നേരിട്ട് ചോദിക്കാം: ${profile.email}`,
  },
  {
    id: "greeting",
    keys: ["hi", "hello", "hey", "hii", "yo", "good morning", "good evening", "namaste", "ഹായ്", "ഹലോ", "നമസ്കാരം"],
    answer: () => `Hi! 👋 I can tell you about ${first}'s projects, skills, awards, education or how to reach him. What would you like to know?`,
    ml: () => `നമസ്കാരം! 👋 ${ML_OF} പ്രോജക്ടുകൾ, സ്കില്ലുകൾ, അവാർഡുകൾ, പഠനം, ബന്ധപ്പെടാനുള്ള വഴി എന്നിവയെക്കുറിച്ച് ഞാൻ പറഞ്ഞുതരാം. എന്താണ് അറിയേണ്ടത്?`,
  },
  {
    id: "thanks",
    keys: ["thanks", "thank", "thx", "great", "awesome", "cool", "nice", "നന്ദി", "കൊള്ളാം", "സൂപ്പർ"],
    answer: () => `Happy to help! If you'd like to talk to ${first} himself, email ${profile.email}.`,
    ml: () => `സന്തോഷം! ${ML_TO} നേരിട്ട് സംസാരിക്കാൻ ഇമെയിൽ ചെയ്യൂ: ${profile.email}`,
  },
  {
    id: "about",
    weight: 0.8,
    keys: ["who", "about", "introduce", "yourself", "himself", "summary", "background", "rahul", "tell me about", "ആരാണ്", "പരിചയപ്പെടുത്ത", "കുറിച്ച്"],
    answer: () => `${profile.name} is a ${profile.role.toLowerCase()} from ${location}. ${profile.about[0].replace(/\bmy\b/g, "his")}`,
    ml: () =>
      `${ML_NAME} എം ജെ തൃശ്ശൂരിൽ നിന്നുള്ള ഒരു സോഫ്റ്റ്‌വെയർ എഞ്ചിനീയറാണ്. ${education.school}-ൽ കമ്പ്യൂട്ടർ സയൻസ് പഠിക്കുന്നു. AI-യും ഹെൽത്ത്കെയറും ചേരുന്നിടത്താണ് കൂടുതലും ജോലി ചെയ്യുന്നത്, ഫാർമസിസ്റ്റുകൾക്കും രോഗികൾക്കും ഡോക്ടർമാർക്കും വേണ്ടി. തെറ്റായ ഉറപ്പിനേക്കാൾ സത്യസന്ധമായ "ഉറപ്പില്ല" ആണ് നല്ലത് എന്നാണ് ${ML_OF} വിശ്വാസം.`,
  },
  {
    id: "now",
    keys: ["currently", "now", "working on", "latest", "current project", "these days", "ഇപ്പോൾ"],
    answer: () => `Right now: ${profile.now}.`,
    ml: () => `ഇപ്പോൾ ${ML_NAME} RxGuard നിർമ്മിക്കുന്ന തിരക്കിലാണ്, തെളിവുകളുടെ അടിസ്ഥാനത്തിലുള്ള പ്രിസ്ക്രിപ്ഷൻ റിവ്യൂ ടൂൾ.`,
  },
  {
    id: "hire",
    weight: 1.5,
    keys: ["internship", "internships", "intern", "hire", "hiring", "available", "availability", "open to", "job", "jobs", "opportunity", "opportunities", "recruit", "work with", "freelance", "role", "ഇന്റേൺഷിപ്പ്", "ജോലി", "ലഭ്യമാണോ", "അവസര"],
    answer: () => `Yes. ${first} is ${profile.status.replace("Open", "open").replace(" · ", ", ")}. The best way to reach him is ${profile.email}, or LinkedIn: ${profile.linkedin}`,
    ml: () => `അതെ. 2026-ലെ SDE ഇന്റേൺഷിപ്പുകൾക്ക് ${ML_NAME} ലഭ്യമാണ്. ബന്ധപ്പെടാൻ ഇമെയിൽ: ${profile.email}, അല്ലെങ്കിൽ LinkedIn: ${profile.linkedin}`,
  },
  {
    id: "experience",
    keys: ["experience", "worked", "pacelab", "company", "companies", "professional", "അനുഭവ", "പരിചയം"],
    answer: () => {
      const intern = award("AI Intern");
      const oss = award("Open Source Contributor");
      return `Experience so far:\n- ${intern?.title}, ${intern?.org} (${intern?.year}): ${intern?.text}\n- ${oss?.title}, ${oss?.org} (${oss?.year}): ${oss?.text}\nPlus ${featured.length + archive.length}+ projects built end to end.`;
    },
    ml: () =>
      `ഇതുവരെയുള്ള പരിചയം:\n- AI ഇന്റേൺ, Pacelab, കൊച്ചി (2025): Python-ലും മെഷീൻ ലേണിംഗ് അടിസ്ഥാനങ്ങളിലും പരിശീലനം.\n- ആശുപത്രികളിൽ ഉപയോഗിക്കുന്ന CARE എന്ന ഓപ്പൺ സോഴ്സ് സിസ്റ്റത്തിലേക്ക് React, TypeScript സംഭാവനകൾ (2026).\nകൂടാതെ ${featured.length + archive.length}-ലധികം പ്രോജക്ടുകൾ തുടക്കം മുതൽ ഒടുക്കം വരെ നിർമ്മിച്ചു.`,
  },
  {
    id: "skills",
    weight: 0.9,
    keys: ["skill", "skills", "stack", "tech", "technologies", "technology", "tools", "languages", "language", "know", "good at", "framework", "frameworks", "സ്കിൽ", "കഴിവ്", "ടെക്നോളജി", "ടൂൾ", "അറിയാം"],
    answer: () => skills.map((s) => `- ${s.group}: ${s.items.join(", ")}`).join("\n"),
    ml: () => skills.map((s) => `- ${skillMlName[s.group] ?? s.group}: ${s.items.join(", ")}`).join("\n"),
  },
  {
    id: "ai",
    weight: 1.3,
    keys: ["ai tools", "ai", "ml", "machine learning", "deep learning", "llm", "tensorflow", "keras", "model", "models", "artificial intelligence", "data science", "agents", "എഐ", "മെഷീൻ ലേണിംഗ്"],
    answer: () =>
      `On the AI/ML side ${first} works with ${skillGroup("AI / ML")}. In his words: "${profile.manifesto}" You can see it in RxGuard and IoT Anomaly Detection.`,
    ml: () =>
      `AI / ML-ൽ ${ML_NAME} ഉപയോഗിക്കുന്നത്: ${skillGroup("AI / ML")}. ${ML_OF} സമീപനം: AI വായിക്കുന്നു, നിയമങ്ങൾ ഉറപ്പാക്കുന്നു, മനുഷ്യർ തീരുമാനിക്കുന്നു. RxGuard-ലും IoT Anomaly Detection-ലും ഇത് കാണാം.`,
  },
  {
    id: "web",
    keys: ["web", "frontend", "front end", "backend", "back end", "react", "next", "nextjs", "django", "fastapi", "full stack", "fullstack", "api", "വെബ്"],
    answer: () => `For web development ${first} uses ${skillGroup("Web")}, and for data and tooling ${skillGroup("Data & Tools")}.`,
    ml: () => `വെബ് ഡെവലപ്മെന്റിന് ${ML_NAME} ഉപയോഗിക്കുന്നത് ${skillGroup("Web")}. ഡാറ്റയ്ക്കും ടൂളുകൾക്കും ${skillGroup("Data & Tools")}.`,
  },
  {
    id: "programming",
    keys: ["python", "java", "typescript", "javascript", "c++", "cpp", "coding", "programming", "dsa", "leetcode", "കോഡിംഗ്", "പ്രോഗ്രാമിംഗ്"],
    answer: () => `${first} codes in ${skillGroup("Languages")}. Python is his main language for AI work, and he practises DSA on LeetCode.`,
    ml: () => `${ML_NAME} കോഡ് ചെയ്യുന്നത് ${skillGroup("Languages")} എന്നിവയിലാണ്. AI ജോലികൾക്ക് പ്രധാനമായും Python. LeetCode-ൽ DSA പരിശീലിക്കുന്നു.`,
  },
  {
    id: "projects",
    keys: ["projects", "project", "built", "build", "portfolio", "work", "made", "apps", "show me", "പ്രോജക്ട്", "പ്രോജക്റ്റ്", "നിർമ്മിച്ച", "ഉണ്ടാക്കിയ"],
    answer: () =>
      `Featured projects:\n${list(featured.map((p) => `${p.title}: ${p.summary.split(":")[0].split("—")[0].trim()}`))}\nOthers include ${archive.map((p) => p.title).join(", ")}. Ask about any one by name.`,
    ml: () =>
      `പ്രധാന പ്രോജക്ടുകൾ:\n${list(featured.map((p) => `${p.title}: ${projectMl[p.title].split(".")[0]}.`))}\nമറ്റുള്ളവ: ${archive.map((p) => p.title).join(", ")}. ഏതിനെക്കുറിച്ചും പേര് പറഞ്ഞ് ചോദിക്കൂ.`,
  },
  {
    id: "best",
    keys: ["best", "favourite", "favorite", "proudest", "biggest", "most impressive", "flagship", "മികച്ച", "ഏറ്റവും നല്ല"],
    answer: () => `His flagship is RxGuard: ${featured[0].summary} Code: ${featured[0].link}`,
    ml: () => `${ML_OF} ഏറ്റവും പ്രധാന പ്രോജക്ട് RxGuard ആണ്. ${projectMl.RxGuard} കോഡ്: ${featured[0].link}`,
  },
  {
    id: "awards",
    weight: 1.2,
    keys: ["award", "awards", "won", "win", "wins", "prize", "prizes", "achievement", "achievements", "hackathon", "hackathons", "competition", "recognition", "first prize", "finalist", "അവാർഡ്", "സമ്മാന", "നേടി", "നേട്ട", "ജയിച്ച", "മത്സര", "ഹാക്കത്തോൺ"],
    answer: () => list(achievements.filter((a) => awardMl[a.title]).map((a) => `${a.title}, ${a.org} (${a.year})`)),
    ml: () => `${ML_OF} നേട്ടങ്ങൾ:\n${list(achievements.filter((a) => awardMl[a.title]).map((a) => awardMl[a.title]))}`,
  },
  {
    id: "ibm",
    weight: 2,
    keys: ["ibm", "quantum", "qiskit", "second prize", "ക്വാണ്ടം", "രണ്ടാം സമ്മാനം"],
    answer: () => `Yes! ${first} won Second Prize at the IBM Quantum Hackathon in 2026, with a Qiskit-based quantum computing build.`,
    ml: () => `അതെ! 2026-ൽ IBM Quantum ഹാക്കത്തോണിൽ ${ML_NAME} രണ്ടാം സമ്മാനം നേടി, Qiskit അടിസ്ഥാനമാക്കിയ ക്വാണ്ടം കമ്പ്യൂട്ടിംഗ് പ്രോജക്ടിന്.`,
  },
  {
    id: "aronexa-award",
    weight: 1.5,
    keys: ["aronexa", "ayusetu", "ladakh", "ആയുസേതു", "ലഡാക്ക്", "ഒന്നാം സമ്മാനം"],
    answer: () => `${first} won First Prize at the ${award("First Prize")?.org} in 2026 with a healthcare AI build. The prize was a trip to Ladakh.`,
    ml: () => `2026-ൽ Aronexa AyuSetu ഹെൽത്ത്കെയർ ഇന്നൊവേഷൻ മത്സരത്തിൽ ഒരു ഹെൽത്ത്കെയർ AI പ്രോജക്ടിന് ${ML_NAME} ഒന്നാം സമ്മാനം നേടി. സമ്മാനം ലഡാക്കിലേക്കുള്ള ഒരു യാത്രയായിരുന്നു.`,
  },
  {
    id: "sih",
    weight: 1.5,
    keys: ["sih", "smart india", "smart india hackathon", "സ്മാർട്ട് ഇന്ത്യ"],
    answer: () => `For Smart India Hackathon ${first} tackled two problem statements: TATPAR (predictive maintenance) and JalPrahari (water-network diagnosis). Ask about either for details.`,
    ml: () => `Smart India Hackathon-ൽ ${ML_NAME} രണ്ട് പ്രോബ്ലം സ്റ്റേറ്റ്മെന്റുകൾ ചെയ്തു: TATPAR (മെഷീൻ മെയിന്റനൻസ് പ്രവചനം), JalPrahari (കുടിവെള്ള ശൃംഖല). കൂടുതൽ അറിയാൻ പേര് പറഞ്ഞ് ചോദിക്കൂ.`,
  },
  {
    id: "opensource",
    keys: ["open source", "opensource", "care", "ohc", "contribution", "contributions", "contribute", "pr", "prs", "pull request", "ഓപ്പൺ സോഴ്സ്"],
    answer: () => `${award("Open Source Contributor")?.text} (${award("Open Source Contributor")?.org}). GitHub: ${profile.github}`,
    ml: () => `യഥാർത്ഥ ആശുപത്രികളിൽ ഉപയോഗിക്കുന്ന CARE എന്ന ഓപ്പൺ സോഴ്സ് സിസ്റ്റത്തിലേക്ക് ${ML_NAME} React, TypeScript സംഭാവനകൾ നൽകിയിട്ടുണ്ട് (Open Healthcare Network). GitHub: ${profile.github}`,
  },
  {
    id: "healthcare",
    keys: ["healthcare", "health", "medical", "hospital", "patients", "doctors", "ആരോഗ്യ", "ആശുപത്രി", "ഡോക്ടർ", "രോഗി", "ഹെൽത്ത്"],
    answer: () => `Most of ${first}'s work sits where AI meets healthcare: RxGuard (prescription review), JeevaFlow (patient health timelines), AroNexa Visit Capsule (doctor-ready records), and open-source work on CARE, a hospital system.`,
    ml: () => `${ML_OF} കൂടുതൽ ജോലിയും AI-യും ഹെൽത്ത്കെയറും ചേരുന്നിടത്താണ്: RxGuard (പ്രിസ്ക്രിപ്ഷൻ റിവ്യൂ), JeevaFlow (രോഗിയുടെ ആരോഗ്യ ടൈംലൈൻ), AroNexa Visit Capsule (ഡോക്ടർക്കുള്ള രേഖകൾ), CARE ആശുപത്രി സിസ്റ്റത്തിലെ ഓപ്പൺ സോഴ്സ് ജോലി.`,
  },
  {
    id: "education",
    keys: ["education", "college", "university", "degree", "btech", "b.tech", "study", "studying", "student", "graduate", "graduation", "school", "vidya", "cse", "year", "certification", "certifications", "certificate", "പഠന", "പഠിക്കുന്ന", "പഠിച്ച", "കോളേജ്", "ഡിഗ്രി", "വിദ്യാഭ്യാസ"],
    answer: () => `${first} is doing a ${education.degree} at ${education.school} (${education.years}).\nCertifications:\n${list(education.certs)}`,
    ml: () => `${ML_NAME} ${education.school}-ൽ കമ്പ്യൂട്ടർ സയൻസ് & എഞ്ചിനീയറിംഗിൽ B.Tech ചെയ്യുന്നു (2023 – 2027).\nസർട്ടിഫിക്കേഷനുകൾ:\n${list(education.certs)}`,
  },
  {
    id: "philosophy",
    keys: ["philosophy", "approach", "honest", "values", "believe", "mindset", "why", "principle", "സമീപനം", "വിശ്വാസം"],
    answer: () => `In ${first}'s words: "${profile.manifesto}"`,
    ml: () => `${ML_OF} സമീപനം: AI വായിക്കുന്നു, നിയമങ്ങൾ ഉറപ്പാക്കുന്നു, മനുഷ്യർ തീരുമാനിക്കുന്നു. ഭാഷ മോഡലുകൾ കൈകാര്യം ചെയ്യുന്നു; വസ്തുതകളും കണക്കുകളും അന്തിമ തീരുമാനങ്ങളും ഉറപ്പുള്ള കോഡിൽ. അതുകൊണ്ട് സോഫ്റ്റ്‌വെയറിന് ഉറപ്പില്ലാത്തപ്പോൾ "ഉറപ്പില്ല" എന്ന് പറയാനാകും.`,
  },
  {
    id: "contact",
    weight: 1.2,
    keys: ["contact", "email", "mail", "reach", "connect", "message", "talk", "linkedin", "github", "socials", "ബന്ധപ്പെട", "ഇമെയിൽ", "മെയിൽ"],
    answer: () => `Email: ${profile.email}\nLinkedIn: ${profile.linkedin}\nGitHub: ${profile.github}`,
    ml: () => `ഇമെയിൽ: ${profile.email}\nLinkedIn: ${profile.linkedin}\nGitHub: ${profile.github}`,
  },
  {
    id: "resume",
    weight: 1.5,
    keys: ["resume", "résumé", "cv", "download", "റെസ്യൂമെ", "ബയോഡാറ്റ"],
    answer: () => `${first}'s résumé is here: https://portfolio-minimal-seven-pied.vercel.app${profile.resume}`,
    ml: () => `${ML_OF} റെസ്യൂമെ ഇവിടെ: https://portfolio-minimal-seven-pied.vercel.app${profile.resume}`,
  },
  {
    id: "location",
    keys: ["where", "location", "based", "live", "city", "kerala", "india", "thrissur", "relocate", "remote", "എവിടെ", "സ്ഥലം", "തൃശ്ശൂർ", "കേരള"],
    answer: () => `${first} is based in ${location}. For questions about relocating or remote work, it's best to ask him at ${profile.email}.`,
    ml: () => `${ML_NAME} കേരളത്തിലെ തൃശ്ശൂരിലാണ്. മറ്റൊരിടത്തേക്ക് മാറുന്നതിനെക്കുറിച്ചോ റിമോട്ട് ജോലിയെക്കുറിച്ചോ ${ML_TO} നേരിട്ട് ചോദിക്കാം: ${profile.email}`,
  },
  ...projectTopics,
];

/* ---------- Matching ---------- */

function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9+.\sഀ-ൿ-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// very small edit distance, for typos like "rxgaurd" or "acheivements"
function closeEnough(a: string, b: string) {
  if (Math.abs(a.length - b.length) > 2) return false;
  const limit = b.length >= 8 ? 2 : 1;
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      // swapped letters ("rxgaurd") count as one typo
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) dp[i][j] = Math.min(dp[i][j], dp[i - 2][j - 2] + 1);
    }
  return dp[a.length][b.length] <= limit;
}

function score(text: string, words: string[], topic: Topic) {
  let s = 0;
  for (const key of topic.keys) {
    // Malayalam words take endings (അവാർഡുകൾ, നേടിയത്), so match them inside the text
    if (hasMalayalam(key)) {
      if (text.includes(key)) s += 2;
      continue;
    }
    if (key.includes(" ")) {
      if (text.includes(key)) s += 3;
      continue;
    }
    if (words.includes(key)) s += 2;
    else if (key.length >= 5 && words.some((w) => w.length >= 5 && (w.startsWith(key) || key.startsWith(w) || closeEnough(w, key)))) s += 1.5;
  }
  return s * (topic.weight ?? 1) + (topic.project && s > 0 ? 0.5 : 0);
}

function rank(question: string) {
  const text = ` ${normalize(question)} `;
  const words = text.trim().split(" ");
  return topics
    .map((t) => ({ t, s: score(text, words, t) }))
    .filter((x) => x.s >= 2)
    .sort((a, b) => b.s - a.s);
}

// "tell me more about it", or a very short "link?" / "stack?" right after a project answer
const FOLLOW_UP = /\b(it|its|that|this|them|more|elaborate|explain)\b|കൂടുതൽ|അതിനെ|ഇതിനെ|അതിന്റെ|വിശദമാ/;
const SHORT_FOLLOW_UP = /\b(link|code|repo|github|stack|details|demo)\b|ലിങ്ക്|കോഡ്/;

/** Which language to answer in: Malayalam if the question is written in Malayalam, otherwise the chosen one. */
export function answerLang(question: string, chosen: Lang): Lang {
  if (hasMalayalam(question)) return "ml";
  return chosen;
}

/**
 * Answers a question from the portfolio content.
 * `previous` is the visitor's earlier questions, used for follow-ups like "tell me more about it".
 */
export function localAnswer(question: string, previous: string[] = [], lang: Lang = "en") {
  const say = (t: Topic) => (lang === "ml" ? t.ml() : t.answer());
  const ranked = rank(question);

  // follow-up about the last project mentioned ("what's the stack?", "link?")
  const q = normalize(question);
  const isFollowUp = FOLLOW_UP.test(q) || (q.split(" ").length <= 4 && SHORT_FOLLOW_UP.test(q));
  if (isFollowUp && !ranked.some((r) => r.t.project)) {
    for (const prev of [...previous].reverse()) {
      const proj = rank(prev).find((r) => r.t.project);
      if (proj) return say(proj.t);
    }
  }

  if (ranked.length === 0) {
    return lang === "ml"
      ? `അതിനെക്കുറിച്ച് എനിക്ക് ഉറപ്പില്ല, ഊഹിച്ച് പറയാനും ഞാൻ ആഗ്രഹിക്കുന്നില്ല. ${ML_OF} പ്രോജക്ടുകൾ, സ്കില്ലുകൾ, അവാർഡുകൾ, പഠനം, ബന്ധപ്പെടാനുള്ള വഴി എന്നിവയെക്കുറിച്ച് ചോദിക്കാം. മറ്റെന്തിനും ഇമെയിൽ ചെയ്യൂ: ${profile.email}`
      : `I'm not sure about that one, and I'd rather not guess. I can answer questions about ${first}'s projects, skills, awards, education or how to contact him. For anything else, email ${profile.email}.`;
  }

  // several projects named at once → answer each
  const projects = ranked.filter((r) => r.t.project && r.s >= 2.5);
  if (projects.length > 1) return projects.slice(0, 3).map((r) => say(r.t)).join("\n\n");

  return say(ranked[0].t);
}
