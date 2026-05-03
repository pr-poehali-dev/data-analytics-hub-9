import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

type Tab = "chats" | "archive" | "saved" | "settings";
type SettingsSection = "main" | "language" | "privacy" | "notifications" | "appearance";
type AuthMode = "login" | "register";
type Lang = "ru" | "en" | "de" | "fr" | "es" | "zh";

const AVATAR = "https://cdn.poehali.dev/projects/3e7339fe-3dc5-4e78-8fdc-c23b73af18a2/bucket/3e43fa75-d696-4709-9487-2495cbcc522f.jpg";

const LANGUAGES: { code: Lang; label: string; native: string }[] = [
  { code: "ru", label: "Русский", native: "Russian" },
  { code: "en", label: "Английский", native: "English" },
  { code: "de", label: "Немецкий", native: "Deutsch" },
  { code: "fr", label: "Французский", native: "Français" },
  { code: "es", label: "Испанский", native: "Español" },
  { code: "zh", label: "Китайский", native: "中文" },
];

const CHATS = [
  { id: 1, name: "Алексей Петров", preview: "Привет! Как дела?", time: "14:32", unread: 3, online: true, color: "#5B8CFF" },
  { id: 2, name: "Oxiwis", preview: "Новое обновление уже готово 🚀", time: "13:15", unread: 0, online: true, avatar: AVATAR },
  { id: 3, name: "Мария Дизайнер", preview: "Посмотри макет, я отправила", time: "11:04", unread: 1, online: false, color: "#FF6B9D" },
  { id: 4, name: "Рабочий чат", preview: "Встреча в 15:00", time: "Вчера", unread: 0, online: false, color: "#FFB347" },
  { id: 5, name: "Иван UX", preview: "Спасибо за фидбек!", time: "Вчера", unread: 0, online: true, color: "#4CAF82" },
];

const ARCHIVED = [
  { id: 6, name: "Старый проект", preview: "Архивный чат", time: "2 нед.", unread: 0, online: false, color: "#888" },
  { id: 7, name: "Команда 2023", preview: "Уже не актуально", time: "1 мес.", unread: 0, online: false, color: "#888" },
];

const ALL_CHATS = [...CHATS, ...ARCHIVED];

const MESSAGES: Record<number, { from: "me" | "them"; text: string; time: string }[]> = {
  1: [
    { from: "them", text: "Привет! Как дела?", time: "14:30" },
    { from: "me", text: "Всё отлично, работаем 💪", time: "14:31" },
    { from: "them", text: "Слушай, ты уже пробовал Oxiwis?", time: "14:32" },
  ],
  2: [
    { from: "them", text: "Новое обновление уже готово 🚀", time: "13:15" },
    { from: "me", text: "Круто, смотрю!", time: "13:16" },
  ],
  3: [{ from: "them", text: "Посмотри макет, я отправила", time: "11:04" }],
  4: [{ from: "them", text: "Встреча в 15:00", time: "Вчера" }],
  5: [{ from: "them", text: "Спасибо за фидбек!", time: "Вчера" }],
};

const SAVED_MESSAGES = [
  { text: "Идея: добавить тёмную тему во все экраны", time: "Сегодня, 10:12" },
  { text: "Ссылка на референс: figma.com/...", time: "Вчера, 18:44" },
  { text: "TODO: переделать онбординг", time: "2 дня назад" },
];

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button
    onClick={onChange}
    className="relative flex-shrink-0"
    style={{
      width: 44, height: 24, borderRadius: 12,
      background: checked ? "#2AABEE" : "#3a3a3a",
      transition: "background 0.25s cubic-bezier(.4,0,.2,1)",
    }}
  >
    <span style={{
      position: "absolute", top: 2, left: 2,
      width: 20, height: 20, borderRadius: "50%",
      background: "white", boxShadow: "0 1px 4px rgba(0,0,0,.3)",
      transform: checked ? "translateX(20px)" : "translateX(0)",
      transition: "transform 0.25s cubic-bezier(.4,0,.2,1)",
      display: "block",
    }} />
  </button>
);

function ChatAvatar({ chat, size = 44 }: { chat: typeof CHATS[0]; size?: number }) {
  if ("avatar" in chat && chat.avatar) {
    return (
      <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
        <img src={chat.avatar as string} alt={chat.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    );
  }
  const initials = chat.name.split(" ").map(w => w[0]).slice(0, 2).join("");
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: (chat as any).color || "#2AABEE",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "white", fontWeight: 600, fontSize: size * 0.33,
    }}>{initials}</div>
  );
}

export default function Index() {
  const [authed, setAuthed] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authVisible, setAuthVisible] = useState(false);

  const [activeTab, setActiveTab] = useState<Tab>("chats");
  const [activeChat, setActiveChat] = useState<number | null>(null);
  const [inputMsg, setInputMsg] = useState("");
  const [chatVisible, setChatVisible] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [settingsSection, setSettingsSection] = useState<SettingsSection | null>(null);
  const [selectedLang, setSelectedLang] = useState<Lang>("ru");
  const [notifs, setNotifs] = useState(true);
  const [sound, setSound] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [onlineVisible, setOnlineVisible] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [autoDelete, setAutoDelete] = useState(false);
  const [syncContacts, setSyncContacts] = useState(true);

  useEffect(() => { setTimeout(() => setAuthVisible(true), 60); }, []);
  useEffect(() => {
    if (activeChat !== null) {
      setTimeout(() => setChatVisible(true), 30);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } else {
      setChatVisible(false);
    }
  }, [activeChat]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setAuthError("Заполните все поля"); return; }
    if (password.length < 6) { setAuthError("Пароль минимум 6 символов"); return; }
    setAuthed(true);
  };

  const openChat = (id: number) => { setChatVisible(false); setActiveChat(id); };
  const closeChat = () => { setChatVisible(false); setTimeout(() => setActiveChat(null), 220); };

  const currentChats = activeTab === "archive" ? ARCHIVED : CHATS;
  const chatInfo = ALL_CHATS.find(c => c.id === activeChat);

  // ─── AUTH ────────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center p-5">
        <div
          className="w-full max-w-sm"
          style={{
            opacity: authVisible ? 1 : 0,
            transform: authVisible ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.45s cubic-bezier(.4,0,.2,1), transform 0.45s cubic-bezier(.4,0,.2,1)",
          }}
        >
          <div className="flex flex-col items-center mb-8">
            <div style={{
              width: 72, height: 72, borderRadius: "50%", overflow: "hidden", marginBottom: 16,
              boxShadow: "0 0 32px rgba(42,171,238,0.35)",
            }}>
              <img src={AVATAR} alt="Oxiwis" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">OxiChat</h1>
            <p className="text-[#666] text-sm mt-1">от Oxiwis</p>
          </div>

          <div className="rounded-2xl p-5 shadow-2xl" style={{ background: "#161616" }}>
            <div className="flex mb-5 rounded-xl p-1" style={{ background: "#111" }}>
              {(["login", "register"] as AuthMode[]).map(mode => (
                <button key={mode}
                  className="flex-1 py-2 rounded-lg text-sm font-medium"
                  style={{
                    background: authMode === mode ? "#2AABEE" : "transparent",
                    color: authMode === mode ? "white" : "#666",
                    transition: "background 0.2s, color 0.2s",
                  }}
                  onClick={() => { setAuthMode(mode); setAuthError(""); }}
                >{mode === "login" ? "Войти" : "Регистрация"}</button>
              ))}
            </div>

            <form onSubmit={handleAuth} className="space-y-3">
              {["email", "password"].map(field => (
                <div key={field}>
                  <label className="text-xs text-[#666] mb-1.5 block">{field === "email" ? "Email" : "Пароль"}</label>
                  <input
                    type={field === "password" ? "password" : "email"}
                    value={field === "email" ? email : password}
                    onChange={e => field === "email" ? setEmail(e.target.value) : setPassword(e.target.value)}
                    placeholder={field === "email" ? "you@example.com" : "••••••••"}
                    className="w-full rounded-xl px-4 py-3 text-white text-sm placeholder-[#3a3a3a] focus:outline-none"
                    style={{
                      background: "#111",
                      border: "1px solid #232323",
                      transition: "border-color 0.2s",
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = "#2AABEE"}
                    onBlur={e => e.currentTarget.style.borderColor = "#232323"}
                  />
                </div>
              ))}
              {authError && (
                <p className="text-red-400 text-xs" style={{ animation: "shake 0.3s ease" }}>{authError}</p>
              )}
              <button
                type="submit"
                className="w-full text-white font-semibold py-3 rounded-xl mt-1 text-sm"
                style={{
                  background: "#2AABEE",
                  transition: "background 0.2s, transform 0.1s",
                  marginTop: 8,
                }}
                onMouseDown={e => (e.currentTarget.style.transform = "scale(0.98)")}
                onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
              >
                {authMode === "login" ? "Войти" : "Создать аккаунт"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ─── SETTINGS DETAIL ─────────────────────────────────────────────────────
  if (activeTab === "settings" && settingsSection) {
    const titles: Record<SettingsSection, string> = {
      main: "Мой аккаунт", language: "Язык", privacy: "Конфиденциальность",
      notifications: "Уведомления", appearance: "Оформление",
    };
    return (
      <div className="min-h-screen flex flex-col" style={{ background: "#0e0e0e", maxWidth: 480, margin: "0 auto" }}>
        {/* Шапка */}
        <div className="flex items-center gap-3 px-4 pt-12 pb-4" style={{ background: "#0e0e0e" }}>
          <button
            onClick={() => setSettingsSection(null)}
            className="w-9 h-9 flex items-center justify-center rounded-full"
            style={{ background: "#1c1c1c", transition: "background 0.15s" }}
          >
            <Icon name="ChevronLeft" size={20} className="text-white" />
          </button>
          <h1 className="text-white text-lg font-semibold">{titles[settingsSection]}</h1>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-3">
          {settingsSection === "main" && (
            <>
              <div className="rounded-2xl p-5 flex flex-col items-center text-center" style={{ background: "#161616" }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", overflow: "hidden", marginBottom: 12 }}>
                  <img src={AVATAR} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div className="text-white font-semibold text-lg">Алексей</div>
                <div className="text-[#666] text-sm">@alexey</div>
              </div>
              <div className="rounded-2xl overflow-hidden" style={{ background: "#161616" }}>
                {[
                  { label: "Имя", value: "Алексей" },
                  { label: "Username", value: "@alexey" },
                  { label: "Email", value: "alexey@example.com" },
                  { label: "Телефон", value: "+7 (999) 123-45-67" },
                ].map((item, i, arr) => (
                  <div key={item.label} className="flex items-center justify-between px-5 py-4"
                    style={{ borderBottom: i < arr.length - 1 ? "1px solid #232323" : "none" }}>
                    <span className="text-[#666] text-sm">{item.label}</span>
                    <span className="text-white text-sm">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {settingsSection === "language" && (
            <div className="rounded-2xl overflow-hidden" style={{ background: "#161616" }}>
              {LANGUAGES.map((lang, i) => (
                <button key={lang.code} onClick={() => setSelectedLang(lang.code)}
                  className="w-full flex items-center justify-between px-5 py-4"
                  style={{
                    borderBottom: i < LANGUAGES.length - 1 ? "1px solid #232323" : "none",
                    transition: "background 0.15s",
                  }}
                  onTouchStart={e => (e.currentTarget.style.background = "#1e1e1e")}
                  onTouchEnd={e => (e.currentTarget.style.background = "transparent")}
                >
                  <div className="text-left">
                    <div className="text-white text-sm font-medium">{lang.label}</div>
                    <div className="text-[#666] text-xs mt-0.5">{lang.native}</div>
                  </div>
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%",
                    background: selectedLang === lang.code ? "#2AABEE" : "#2a2a2a",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background 0.2s",
                  }}>
                    {selectedLang === lang.code && <Icon name="Check" size={13} className="text-white" />}
                  </div>
                </button>
              ))}
            </div>
          )}

          {settingsSection === "privacy" && (
            <>
              <p className="text-[#555] text-xs px-1">ВИДИМОСТЬ</p>
              <div className="rounded-2xl overflow-hidden" style={{ background: "#161616" }}>
                {[
                  { label: "Показывать «В сети»", desc: "Другие видят, когда вы онлайн", val: onlineVisible, set: setOnlineVisible },
                  { label: "Галочки прочтения", desc: "Подтверждения о прочтении", val: readReceipts, set: setReadReceipts },
                  { label: "Синхронизация контактов", desc: "Находить знакомых по номеру", val: syncContacts, set: setSyncContacts },
                ].map((item, i, arr) => (
                  <div key={item.label} className="flex items-center gap-4 px-5 py-4"
                    style={{ borderBottom: i < arr.length - 1 ? "1px solid #232323" : "none" }}>
                    <div className="flex-1">
                      <div className="text-white text-sm">{item.label}</div>
                      <div className="text-[#555] text-xs mt-0.5">{item.desc}</div>
                    </div>
                    <Toggle checked={item.val} onChange={() => item.set(!item.val)} />
                  </div>
                ))}
              </div>
              <p className="text-[#555] text-xs px-1 mt-2">БЕЗОПАСНОСТЬ</p>
              <div className="rounded-2xl overflow-hidden" style={{ background: "#161616" }}>
                {[
                  { label: "Двухфакторная аутентификация", desc: "Доп. защита аккаунта", val: twoFactor, set: setTwoFactor },
                  { label: "Автоудаление сообщений", desc: "Через 7 дней", val: autoDelete, set: setAutoDelete },
                ].map((item, i, arr) => (
                  <div key={item.label} className="flex items-center gap-4 px-5 py-4"
                    style={{ borderBottom: i < arr.length - 1 ? "1px solid #232323" : "none" }}>
                    <div className="flex-1">
                      <div className="text-white text-sm">{item.label}</div>
                      <div className="text-[#555] text-xs mt-0.5">{item.desc}</div>
                    </div>
                    <Toggle checked={item.val} onChange={() => item.set(!item.val)} />
                  </div>
                ))}
              </div>
              <div className="rounded-2xl overflow-hidden" style={{ background: "#161616" }}>
                <button className="w-full flex items-center gap-3 px-5 py-4 text-red-400"
                  style={{ borderBottom: "1px solid #232323" }}>
                  <Icon name="Trash2" size={16} />
                  <span className="text-sm">Удалить историю</span>
                </button>
                <button className="w-full flex items-center gap-3 px-5 py-4 text-red-500">
                  <Icon name="UserX" size={16} />
                  <span className="text-sm font-medium">Удалить аккаунт</span>
                </button>
              </div>
            </>
          )}

          {settingsSection === "notifications" && (
            <div className="rounded-2xl overflow-hidden" style={{ background: "#161616" }}>
              {[
                { label: "Push-уведомления", desc: "Уведомления на устройство", val: notifs, set: setNotifs },
                { label: "Звук сообщений", desc: "Сигнал при новом сообщении", val: sound, set: setSound },
              ].map((item, i, arr) => (
                <div key={item.label} className="flex items-center gap-4 px-5 py-4"
                  style={{ borderBottom: i < arr.length - 1 ? "1px solid #232323" : "none" }}>
                  <div className="flex-1">
                    <div className="text-white text-sm">{item.label}</div>
                    <div className="text-[#555] text-xs mt-0.5">{item.desc}</div>
                  </div>
                  <Toggle checked={item.val} onChange={() => item.set(!item.val)} />
                </div>
              ))}
            </div>
          )}

          {settingsSection === "appearance" && (
            <div className="rounded-2xl overflow-hidden" style={{ background: "#161616" }}>
              <div className="px-5 py-4" style={{ borderBottom: "1px solid #232323" }}>
                <div className="text-white text-sm mb-3">Цвет акцента</div>
                <div className="flex gap-3">
                  {["#2AABEE", "#7B61FF", "#4CAF82", "#FF6B9D", "#FFB347"].map(color => (
                    <button key={color} style={{
                      width: 32, height: 32, borderRadius: "50%", background: color,
                      transition: "transform 0.15s",
                    }}
                      onMouseDown={e => (e.currentTarget.style.transform = "scale(0.88)")}
                      onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
                    />
                  ))}
                </div>
              </div>
              <div className="px-5 py-4">
                <div className="text-white text-sm mb-3">Размер текста</div>
                <input type="range" min="12" max="20" defaultValue="14" className="w-full accent-[#2AABEE]" />
                <div className="flex justify-between text-[#555] text-xs mt-1">
                  <span>Маленький</span><span>Большой</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── CHAT OPEN ────────────────────────────────────────────────────────────
  if (activeChat !== null && chatInfo) {
    const msgs = activeChat === 99 ? [] : (MESSAGES[activeChat] || []);
    return (
      <div
        className="flex flex-col"
        style={{
          height: "100dvh", background: "#0e0e0e", maxWidth: 480, margin: "0 auto",
          opacity: chatVisible ? 1 : 0,
          transform: chatVisible ? "translateX(0)" : "translateX(32px)",
          transition: "opacity 0.22s cubic-bezier(.4,0,.2,1), transform 0.22s cubic-bezier(.4,0,.2,1)",
        }}
      >
        {/* Шапка */}
        <div className="flex items-center gap-3 px-4 pt-12 pb-3 flex-shrink-0"
          style={{ background: "#161616", borderBottom: "1px solid #1e1e1e" }}>
          <button onClick={closeChat}
            className="w-9 h-9 flex items-center justify-center rounded-full flex-shrink-0"
            style={{ background: "#1e1e1e" }}>
            <Icon name="ChevronLeft" size={20} className="text-white" />
          </button>
          {activeChat === 99 ? (
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#2AABEE,#4b6bcd)" }}>
              <Icon name="Bookmark" size={16} className="text-white" />
            </div>
          ) : (
            <div className="relative flex-shrink-0">
              <ChatAvatar chat={chatInfo as any} size={36} />
              {chatInfo.online && (
                <span style={{
                  position: "absolute", bottom: 0, right: 0,
                  width: 10, height: 10, borderRadius: "50%",
                  background: "#4CAF82", border: "2px solid #161616",
                }} />
              )}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-semibold truncate">
              {activeChat === 99 ? "Избранное" : chatInfo.name}
            </div>
            <div className="text-xs" style={{ color: chatInfo?.online ? "#4CAF82" : "#555" }}>
              {activeChat === 99 ? "Ваши заметки" : chatInfo?.online ? "В сети" : "Не в сети"}
            </div>
          </div>
          <div className="flex gap-1">
            <button className="w-9 h-9 flex items-center justify-center rounded-full" style={{ background: "#1e1e1e" }}>
              <Icon name="Phone" size={16} className="text-[#888]" />
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-full" style={{ background: "#1e1e1e" }}>
              <Icon name="MoreVertical" size={16} className="text-[#888]" />
            </button>
          </div>
        </div>

        {/* Сообщения */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
          {activeChat === 99 ? SAVED_MESSAGES.map((msg, i) => (
            <div key={i} className="flex justify-end">
              <div className="px-4 py-2.5 rounded-2xl rounded-tr-sm max-w-xs"
                style={{ background: "rgba(42,171,238,0.18)", border: "1px solid rgba(42,171,238,0.15)" }}>
                <p className="text-white text-sm leading-relaxed">{msg.text}</p>
                <p className="text-xs mt-1 text-right" style={{ color: "#555" }}>{msg.time}</p>
              </div>
            </div>
          )) : msgs.map((msg, i) => (
            <div key={i} className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}
              style={{
                opacity: 0, animation: `fadeUp 0.2s ease forwards ${i * 40}ms`,
              }}>
              <div className="px-4 py-2.5 rounded-2xl max-w-xs"
                style={{
                  background: msg.from === "me" ? "rgba(42,171,238,0.22)" : "#1c1c1c",
                  borderRadius: msg.from === "me" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                }}>
                <p className="text-white text-sm leading-relaxed">{msg.text}</p>
                <p className="text-xs mt-1 text-right" style={{ color: "#555" }}>{msg.time}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Ввод */}
        <div className="px-3 py-3 flex-shrink-0" style={{ background: "#161616", borderTop: "1px solid #1e1e1e" }}>
          <div className="flex items-center gap-2 rounded-2xl px-4 py-2" style={{ background: "#1e1e1e" }}>
            <button><Icon name="Smile" size={20} className="text-[#555]" /></button>
            <input value={inputMsg} onChange={e => setInputMsg(e.target.value)}
              placeholder="Сообщение..." onKeyDown={e => e.key === "Enter" && setInputMsg("")}
              className="flex-1 bg-transparent text-sm text-white placeholder-[#3a3a3a] focus:outline-none py-1" />
            <button><Icon name="Paperclip" size={18} className="text-[#555]" /></button>
            <button onClick={() => setInputMsg("")}
              className="w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0"
              style={{ background: "#2AABEE", transition: "transform 0.1s" }}
              onMouseDown={e => (e.currentTarget.style.transform = "scale(0.9)")}
              onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}>
              <Icon name="Send" size={14} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── MAIN (LIST + TABS) ───────────────────────────────────────────────────
  return (
    <div className="flex flex-col" style={{ height: "100dvh", background: "#0e0e0e", maxWidth: 480, margin: "0 auto" }}>
      {/* Шапка */}
      <div className="px-5 pt-12 pb-3 flex-shrink-0" style={{ background: "#0e0e0e" }}>
        {activeTab === "settings" ? (
          <div className="flex items-center gap-3 mb-3">
            <div style={{ width: 42, height: 42, borderRadius: "50%", overflow: "hidden" }}>
              <img src={AVATAR} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div>
              <div className="text-white font-semibold">Алексей</div>
              <div className="text-xs" style={{ color: "#4CAF82" }}>В сети</div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-white text-xl font-bold">
              {activeTab === "chats" ? "Чаты" : activeTab === "archive" ? "Архив" : "Избранное"}
            </h1>
            <button className="w-9 h-9 flex items-center justify-center rounded-full" style={{ background: "#1c1c1c" }}>
              <Icon name="PenSquare" size={17} className="text-[#888]" />
            </button>
          </div>
        )}
        {activeTab !== "settings" && (
          <div className="relative">
            <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444]" />
            <input placeholder="Поиск"
              className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-[#444] focus:outline-none"
              style={{ background: "#1c1c1c", transition: "background 0.15s" }} />
          </div>
        )}
      </div>

      {/* Контент */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "settings" ? (
          <div className="px-4 py-2 space-y-1">
            {[
              { id: "main" as SettingsSection, icon: "User", label: "Мой аккаунт", desc: "Имя, фото, контакты" },
              { id: "notifications" as SettingsSection, icon: "Bell", label: "Уведомления", desc: "Push, звук, вибрация" },
              { id: "privacy" as SettingsSection, icon: "Shield", label: "Конфиденциальность", desc: "Безопасность и видимость" },
              { id: "appearance" as SettingsSection, icon: "Palette", label: "Оформление", desc: "Тема, шрифт, цвет" },
              { id: "language" as SettingsSection, icon: "Globe", label: "Язык", desc: LANGUAGES.find(l => l.code === selectedLang)?.label },
            ].map(item => (
              <button key={item.id} onClick={() => setSettingsSection(item.id)}
                className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl"
                style={{ background: "#161616", transition: "background 0.15s" }}
                onTouchStart={e => (e.currentTarget.style.background = "#1e1e1e")}
                onTouchEnd={e => (e.currentTarget.style.background = "#161616")}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "#1e1e1e" }}>
                  <Icon name={item.icon} size={18} className="text-[#2AABEE]" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-white text-sm font-medium">{item.label}</div>
                  {item.desc && <div className="text-[#555] text-xs mt-0.5">{item.desc}</div>}
                </div>
                <Icon name="ChevronRight" size={16} className="text-[#3a3a3a]" />
              </button>
            ))}
            <button onClick={() => setAuthed(false)}
              className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl mt-4"
              style={{ background: "#161616" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(239,68,68,0.1)" }}>
                <Icon name="LogOut" size={18} className="text-red-400" />
              </div>
              <span className="text-red-400 text-sm font-medium">Выйти</span>
            </button>
          </div>
        ) : activeTab === "saved" ? (
          <div className="px-4 py-2">
            <button onClick={() => setActiveChat(99)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={{ background: "#161616" }}>
              <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg,#2AABEE,#4b6bcd)" }}>
                <Icon name="Bookmark" size={18} className="text-white" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-white text-sm font-semibold">Избранное</div>
                <div className="text-[#555] text-xs mt-0.5">Ваши заметки и ссылки</div>
              </div>
            </button>
          </div>
        ) : (
          <div className="px-3 py-2">
            {currentChats.map((chat, i) => (
              <button key={chat.id} onClick={() => openChat(chat.id)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl"
                style={{
                  transition: "background 0.15s",
                  animation: `fadeUp 0.2s ease forwards ${i * 35}ms`,
                  opacity: 0,
                }}
                onTouchStart={e => (e.currentTarget.style.background = "#1a1a1a")}
                onTouchEnd={e => (e.currentTarget.style.background = "transparent")}
              >
                <div className="relative flex-shrink-0">
                  <ChatAvatar chat={chat as any} size={48} />
                  {chat.online && (
                    <span style={{
                      position: "absolute", bottom: 1, right: 1,
                      width: 11, height: 11, borderRadius: "50%",
                      background: "#4CAF82", border: "2px solid #0e0e0e",
                    }} />
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm font-semibold truncate">{chat.name}</span>
                    <span className="text-[#444] text-xs flex-shrink-0 ml-2">{chat.time}</span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[#666] text-xs truncate">{chat.preview}</span>
                    {chat.unread > 0 && (
                      <span className="ml-2 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: "#2AABEE" }}>
                        {chat.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Нижняя навигация */}
      <div className="flex-shrink-0 pb-safe" style={{
        background: "#111", borderTop: "1px solid #1a1a1a",
        paddingBottom: "env(safe-area-inset-bottom, 8px)",
      }}>
        <div className="flex">
          {[
            { id: "chats" as Tab, icon: "MessageCircle", label: "Чаты" },
            { id: "archive" as Tab, icon: "Archive", label: "Архив" },
            { id: "saved" as Tab, icon: "Bookmark", label: "Избранное" },
            { id: "settings" as Tab, icon: "Settings", label: "Настройки" },
          ].map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setActiveChat(null); }}
              className="flex-1 flex flex-col items-center py-3 gap-0.5"
              style={{ transition: "opacity 0.15s" }}>
              <Icon name={tab.icon} size={22}
                style={{ color: activeTab === tab.id ? "#2AABEE" : "#444", transition: "color 0.2s" }} />
              <span className="text-[10px] font-medium"
                style={{ color: activeTab === tab.id ? "#2AABEE" : "#444", transition: "color 0.2s" }}>
                {tab.label}
              </span>
              {activeTab === tab.id && (
                <span style={{
                  width: 4, height: 4, borderRadius: "50%", background: "#2AABEE",
                  marginTop: 1,
                }} />
              )}
            </button>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}