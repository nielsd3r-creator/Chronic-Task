import { useState, useEffect, useRef } from "react";

const ALL_MEMBERS = [
  { id: "tiphaine", name: "Tiphaine", color: "#FF6B6B", initials: "TI" },
  { id: "yohan",    name: "Yohan",    color: "#FFB347", initials: "YO" },
  { id: "janek",    name: "Janek",    color: "#47D4FF", initials: "JA" },
  { id: "maia",     name: "Maïa",     color: "#B47FFF", initials: "MA" },
  { id: "louis",    name: "Louis",    color: "#47FFB4", initials: "LO" },
  { id: "ismael",   name: "Ismaël",   color: "#FF47A0", initials: "IS" },
  { id: "niels",    name: "Niels",    color: "#FFD700", initials: "NI" },
];

const ADMIN_PASSWORD = "niels2024";
const PRESET_COLORS = ["#FF6B6B","#FFB347","#47D4FF","#B47FFF","#47FFB4","#FF47A0","#FFD700","#FF8C42","#6BFFB8","#FF6BB5","#6BB5FF","#C8FF6B","#FF6BC8","#6BFFD4","#FFE66B","#6B8FFF"];
const DEFAULT_DATA = { tasks: Object.fromEntries(ALL_MEMBERS.map(m => [m.id, []])), colors: Object.fromEntries(ALL_MEMBERS.map(m => [m.id, m.color])), banner: "" };
const STORAGE_KEY = "chronic-task-data";

function loadLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return { tasks: { ...DEFAULT_DATA.tasks, ...data.tasks }, colors: { ...DEFAULT_DATA.colors, ...data.colors }, banner: data.banner ?? "" };
  } catch { return null; }
}

function saveLocal(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

function Grain() {
  return (
    <svg style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", opacity: 0.03, pointerEvents: "none", zIndex: 0 }}>
      <filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
      <rect width="100%" height="100%" filter="url(#noise)"/>
    </svg>
  );
}

function Avatar({ initials, color, size = 44 }) {
  return <div style={{ width: size, height: size, borderRadius: size * 0.28, background: color + "18", border: `1.5px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue', cursive", fontSize: size * 0.36, color, letterSpacing: "0.05em", flexShrink: 0 }}>{initials}</div>;
}

function ProgressBar({ value, color, height = 3 }) {
  return <div style={{ height, background: "#1C1C1C", borderRadius: 999, overflow: "hidden" }}><div style={{ height: "100%", width: `${value}%`, background: value === 100 ? `linear-gradient(90deg, ${color}, #47FFB4)` : color, borderRadius: 999, transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)", boxShadow: value > 0 ? `0 0 8px ${color}60` : "none" }}/></div>;
}

export default function ChronicTask() {
  const [appData, setAppData] = useState(() => loadLocal() || DEFAULT_DATA);
  const [selected, setSelected] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [view, setView] = useState("board");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");
  const [animIn, setAnimIn] = useState(false);
  const [editingBanner, setEditingBanner] = useState(false);
  const [bannerDraft, setBannerDraft] = useState("");
  const [colorPickerFor, setColorPickerFor] = useState(null);
  const saveTimeout = useRef(null);

  useEffect(() => { setTimeout(() => setAnimIn(true), 50); }, []);

  const persistData = (newData) => { setAppData(newData); saveLocal(newData); };
  const getMemberColor = (id) => appData.colors[id] || ALL_MEMBERS.find(m => m.id === id)?.color || "#FFD700";

  const toggleTask = (memberId, taskId) => persistData({ ...appData, tasks: { ...appData.tasks, [memberId]: appData.tasks[memberId].map(t => t.id === taskId ? { ...t, done: !t.done } : t) } });
  const addTask = (memberId) => { if (!newTaskText.trim()) return; persistData({ ...appData, tasks: { ...appData.tasks, [memberId]: [...(appData.tasks[memberId] || []), { id: `${memberId}-${Date.now()}`, text: newTaskText.trim(), done: false, createdAt: Date.now() }] } }); setNewTaskText(""); };
  const removeTask = (memberId, taskId) => persistData({ ...appData, tasks: { ...appData.tasks, [memberId]: appData.tasks[memberId].filter(t => t.id !== taskId) } });
  const saveBanner = () => { persistData({ ...appData, banner: bannerDraft }); setEditingBanner(false); };
  const changeColor = (memberId, color) => { persistData({ ...appData, colors: { ...appData.colors, [memberId]: color } }); setColorPickerFor(null); };
  const getProgress = (memberId) => { const t = appData.tasks[memberId] || []; if (!t.length) return 0; return Math.round((t.filter(x => x.done).length / t.length) * 100); };

  const allTasks = Object.values(appData.tasks).flat();
  const totalTasks = allTasks.length;
  const doneTasks = allTasks.filter(t => t.done).length;
  const globalProg = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const tryLogin = () => { if (loginPass === ADMIN_PASSWORD) { setIsAdmin(true); setLoginError(false); setLoginPass("");​​​​​​​​​​​​​​​​
