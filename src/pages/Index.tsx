import { useState } from "react";
import Icon from "@/components/ui/icon";

type Tab = "chats" | "archive" | "saved" | "settings";
type SettingsSection = "main" | "language" | "privacy" | "notifications" | "appearance";
type AuthMode = "login" | "register";
type Lang = "ru" | "en" | "de" | "fr" | "es" | "zh";

const LANGUAGES: { code: Lang; label: string; native: string }[] = [
  { code: "ru", label: "Русский", native: "Russian" },
  { code: "en", label: "Английский", native: "English" },
  { code: "de", label: "Немецкий", native: "Deutsch" },
  { code: "fr", label: "Французский", native: "Français" },
  { code: "es", label: "Испанский", native: "Español" },
  { code: "zh", label: "Китайский", native: "中文" },
];

const CHATS = [
  { id: 1, name: "Алексей Петров", preview: "Привет! Как дела?", time: "14:32", unread: 3, online: true, avatar: "А" },
  { id: 2, name: "Oxiwis", preview: "Новое обновление уже готово 🚀", time: "13:15", unread: 0, online: true, avatar: "O" },
  { id: 3, name: "Мария Дизайнер", preview: "Посмотри макет, я отправила", time: "11:04", unread: 1, online: false, avatar: "М" },
  { id: 4, name: "Рабочий чат", preview: "Встреча в 15:00", time: "Вчера", unread: 0, online: false, avatar: "Р" },
  { id: 5, name: "Иван UX", preview: "Спасибо за фидбек!", time: "Вчера", unread: 0, online: true, avatar: "И" },
];

const ARCHIVED = [
  { id: 6, name: "Старый проект", preview: "Архивный чат", time: "2 нед.", unread: 0, online: false, avatar: "С" },
  { id: 7, name: "Команда 2023", preview: "Уже не актуально", time: "1 мес.", unread: 0, online: false, avatar: "К" },
];

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
  3: [
    { from: "them", text: "Посмотри макет, я отправила", time: "11:04" },
  ],
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
    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${checked ? "bg-[#2AABEE]" : "bg-[#3a3a3a]"}`}
  >
    <span
      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`}
    />
  </button>
);

export default function Index() {
  const [authed, setAuthed] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [activeTab, setActiveTab] = useState<Tab>("chats");
  const [activeChat, setActiveChat] = useState<number | null>(null);
  const [inputMsg, setInputMsg] = useState("");

  // Settings state
  const [settingsSection, setSettingsSection] = useState<SettingsSection>("main");
  const [selectedLang, setSelectedLang] = useState<Lang>("ru");
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [onlineVisible, setOnlineVisible] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [autoDelete, setAutoDelete] = useState(false);
  const [syncContacts, setSyncContacts] = useState(true);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setAuthError("Заполните все поля"); return; }
    if (password.length < 6) { setAuthError("Пароль минимум 6 символов"); return; }
    setAuthed(true);
  };

  const currentChats = activeTab === "archive" ? ARCHIVED : CHATS;
  const chatInfo = [...CHATS, ...ARCHIVED].find(c => c.id === activeChat);

  // ---- AUTH SCREEN ----
  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-full overflow-hidden mb-4 shadow-lg shadow-[#2AABEE]/20">
              <img src="https://cdn.poehali.dev/projects/3e7339fe-3dc5-4e78-8fdc-c23b73af18a2/bucket/3e43fa75-d696-4709-9487-2495cbcc522f.jpg" alt="Oxiwis" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-2xl font-bold text-white">Oxiwis</h1>
            <p className="text-[#8e8e8e] text-sm mt-1">Мессенджер нового поколения</p>
          </div>

          <div className="bg-[#1c1c1c] rounded-2xl p-6 shadow-xl">
            <div className="flex mb-6 bg-[#141414] rounded-xl p-1">
              <button
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${authMode === "login" ? "bg-[#2AABEE] text-white shadow" : "text-[#8e8e8e]"}`}
                onClick={() => { setAuthMode("login"); setAuthError(""); }}
              >Войти</button>
              <button
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${authMode === "register" ? "bg-[#2AABEE] text-white shadow" : "text-[#8e8e8e]"}`}
                onClick={() => { setAuthMode("register"); setAuthError(""); }}
              >Регистрация</button>
            </div>

            <form onSubmit={handleAuth} className="space-y-3">
              <div>
                <label className="text-xs text-[#8e8e8e] mb-1 block">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-[#141414] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm placeholder-[#4a4a4a] focus:outline-none focus:border-[#2AABEE] transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-[#8e8e8e] mb-1 block">Пароль</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#141414] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm placeholder-[#4a4a4a] focus:outline-none focus:border-[#2AABEE] transition-colors"
                />
              </div>
              {authError && <p className="text-red-400 text-xs">{authError}</p>}
              <button
                type="submit"
                className="w-full bg-[#2AABEE] hover:bg-[#229ED9] text-white font-semibold py-3 rounded-xl mt-2 transition-colors duration-200"
              >
                {authMode === "login" ? "Войти" : "Создать аккаунт"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ---- SETTINGS SCREEN ----
  if (activeTab === "settings") {
    return (
      <div className="min-h-screen bg-[#0e0e0e] flex">
        {/* Левая панель настроек */}
        <div className="w-72 bg-[#161616] border-r border-[#232323] flex flex-col">
          <div className="p-4 border-b border-[#232323]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden">
                <img src="https://cdn.poehali.dev/projects/3e7339fe-3dc5-4e78-8fdc-c23b73af18a2/bucket/3e43fa75-d696-4709-9487-2495cbcc522f.jpg" alt="avatar" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="text-white font-semibold">Алексей</div>
                <div className="text-[#8e8e8e] text-xs">@alexey · В сети</div>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-2">
            {[
              { id: "main" as SettingsSection, icon: "User", label: "Мой аккаунт" },
              { id: "notifications" as SettingsSection, icon: "Bell", label: "Уведомления" },
              { id: "privacy" as SettingsSection, icon: "Shield", label: "Конфиденциальность" },
              { id: "appearance" as SettingsSection, icon: "Palette", label: "Оформление" },
              { id: "language" as SettingsSection, icon: "Globe", label: "Язык" },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setSettingsSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 mb-0.5 ${settingsSection === item.id ? "bg-[#2AABEE]/15 text-[#2AABEE]" : "text-[#aaaaaa] hover:bg-[#1e1e1e] hover:text-white"}`}
              >
                <Icon name={item.icon} size={18} />
                {item.label}
              </button>
            ))}

            <div className="mt-4 pt-4 border-t border-[#232323]">
              <button
                onClick={() => setAuthed(false)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-400/10 transition-all duration-150"
              >
                <Icon name="LogOut" size={18} />
                Выйти
              </button>
            </div>
          </nav>

          {/* Нижние вкладки */}
          <div className="p-2 border-t border-[#232323]">
            <div className="flex">
              {[
                { id: "chats" as Tab, icon: "MessageCircle", label: "Чаты" },
                { id: "archive" as Tab, icon: "Archive", label: "Архив" },
                { id: "saved" as Tab, icon: "Bookmark", label: "Избранное" },
                { id: "settings" as Tab, icon: "Settings", label: "Настройки" },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex flex-col items-center py-2 rounded-lg transition-all duration-150 ${activeTab === tab.id ? "text-[#2AABEE]" : "text-[#555]"}`}
                >
                  <Icon name={tab.icon} size={18} />
                  <span className="text-[10px] mt-0.5">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Правая панель — содержимое */}
        <div className="flex-1 p-8 overflow-y-auto">
          {settingsSection === "main" && (
            <div className="max-w-lg">
              <h2 className="text-xl font-bold text-white mb-6">Мой аккаунт</h2>
              <div className="bg-[#1c1c1c] rounded-2xl p-6 mb-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full overflow-hidden">
                <img src="https://cdn.poehali.dev/projects/3e7339fe-3dc5-4e78-8fdc-c23b73af18a2/bucket/3e43fa75-d696-4709-9487-2495cbcc522f.jpg" alt="avatar" className="w-full h-full object-cover" />
              </div>
                  <div>
                    <div className="text-white font-semibold text-lg">Алексей</div>
                    <div className="text-[#8e8e8e] text-sm">alexey@example.com</div>
                  </div>
                  <button className="ml-auto text-[#2AABEE] text-sm hover:underline">Изменить</button>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Имя пользователя", value: "@alexey" },
                    { label: "Телефон", value: "+7 (999) 123-45-67" },
                    { label: "Bio", value: "Разработчик · Москва" },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-2 border-b border-[#2a2a2a] last:border-0">
                      <span className="text-[#8e8e8e] text-sm">{item.label}</span>
                      <span className="text-white text-sm">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {settingsSection === "language" && (
            <div className="max-w-lg">
              <h2 className="text-xl font-bold text-white mb-2">Язык интерфейса</h2>
              <p className="text-[#8e8e8e] text-sm mb-6">Выберите язык приложения</p>
              <div className="bg-[#1c1c1c] rounded-2xl overflow-hidden">
                {LANGUAGES.map((lang, i) => (
                  <button
                    key={lang.code}
                    onClick={() => setSelectedLang(lang.code)}
                    className={`w-full flex items-center justify-between px-5 py-4 transition-colors duration-150 hover:bg-[#222] ${i < LANGUAGES.length - 1 ? "border-b border-[#2a2a2a]" : ""}`}
                  >
                    <div className="text-left">
                      <div className="text-white text-sm font-medium">{lang.label}</div>
                      <div className="text-[#8e8e8e] text-xs">{lang.native}</div>
                    </div>
                    {selectedLang === lang.code && (
                      <Icon name="Check" size={18} className="text-[#2AABEE]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {settingsSection === "privacy" && (
            <div className="max-w-lg">
              <h2 className="text-xl font-bold text-white mb-2">Конфиденциальность</h2>
              <p className="text-[#8e8e8e] text-sm mb-6">Управляйте своей приватностью</p>

              <div className="space-y-3">
                <div className="bg-[#1c1c1c] rounded-2xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-[#2a2a2a]">
                    <span className="text-[#8e8e8e] text-xs font-semibold uppercase tracking-wider">Видимость</span>
                  </div>
                  {[
                    { label: "Показывать «В сети»", desc: "Другие видят, когда вы онлайн", val: onlineVisible, set: setOnlineVisible },
                    { label: "Подтверждения прочтения", desc: "Галочки о прочтении сообщений", val: readReceipts, set: setReadReceipts },
                    { label: "Синхронизация контактов", desc: "Находить знакомых по номеру", val: syncContacts, set: setSyncContacts },
                  ].map((item, i, arr) => (
                    <div key={item.label} className={`flex items-center justify-between px-5 py-4 ${i < arr.length - 1 ? "border-b border-[#2a2a2a]" : ""}`}>
                      <div>
                        <div className="text-white text-sm">{item.label}</div>
                        <div className="text-[#8e8e8e] text-xs mt-0.5">{item.desc}</div>
                      </div>
                      <Toggle checked={item.val} onChange={() => item.set(!item.val)} />
                    </div>
                  ))}
                </div>

                <div className="bg-[#1c1c1c] rounded-2xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-[#2a2a2a]">
                    <span className="text-[#8e8e8e] text-xs font-semibold uppercase tracking-wider">Безопасность</span>
                  </div>
                  {[
                    { label: "Двухфакторная аутентификация", desc: "Дополнительная защита аккаунта", val: twoFactor, set: setTwoFactor },
                    { label: "Автоудаление сообщений", desc: "Сообщения удаляются через 7 дней", val: autoDelete, set: setAutoDelete },
                  ].map((item, i, arr) => (
                    <div key={item.label} className={`flex items-center justify-between px-5 py-4 ${i < arr.length - 1 ? "border-b border-[#2a2a2a]" : ""}`}>
                      <div>
                        <div className="text-white text-sm">{item.label}</div>
                        <div className="text-[#8e8e8e] text-xs mt-0.5">{item.desc}</div>
                      </div>
                      <Toggle checked={item.val} onChange={() => item.set(!item.val)} />
                    </div>
                  ))}
                </div>

                <div className="bg-[#1c1c1c] rounded-2xl overflow-hidden">
                  <button className="w-full flex items-center gap-3 px-5 py-4 text-red-400 hover:bg-red-400/10 transition-colors border-b border-[#2a2a2a]">
                    <Icon name="Trash2" size={16} />
                    <span className="text-sm">Удалить историю сообщений</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-5 py-4 text-red-500 hover:bg-red-500/10 transition-colors">
                    <Icon name="UserX" size={16} />
                    <span className="text-sm font-medium">Удалить аккаунт</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {settingsSection === "notifications" && (
            <div className="max-w-lg">
              <h2 className="text-xl font-bold text-white mb-2">Уведомления</h2>
              <p className="text-[#8e8e8e] text-sm mb-6">Настройте как получать уведомления</p>
              <div className="bg-[#1c1c1c] rounded-2xl overflow-hidden">
                {[
                  { label: "Push-уведомления", desc: "Уведомления на устройство", val: notifications, set: setNotifications },
                  { label: "Звук сообщений", desc: "Звуковой сигнал при новом сообщении", val: soundEnabled, set: setSoundEnabled },
                ].map((item, i, arr) => (
                  <div key={item.label} className={`flex items-center justify-between px-5 py-4 ${i < arr.length - 1 ? "border-b border-[#2a2a2a]" : ""}`}>
                    <div>
                      <div className="text-white text-sm">{item.label}</div>
                      <div className="text-[#8e8e8e] text-xs mt-0.5">{item.desc}</div>
                    </div>
                    <Toggle checked={item.val} onChange={() => item.set(!item.val)} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {settingsSection === "appearance" && (
            <div className="max-w-lg">
              <h2 className="text-xl font-bold text-white mb-2">Оформление</h2>
              <p className="text-[#8e8e8e] text-sm mb-6">Персонализируйте внешний вид</p>
              <div className="bg-[#1c1c1c] rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-[#2a2a2a]">
                  <div className="text-white text-sm mb-3">Цветовая схема</div>
                  <div className="flex gap-3">
                    {[
                      { color: "bg-[#2AABEE]", label: "Синий" },
                      { color: "bg-purple-500", label: "Фиолетовый" },
                      { color: "bg-green-500", label: "Зелёный" },
                      { color: "bg-orange-500", label: "Оранжевый" },
                    ].map(c => (
                      <button key={c.label} className={`w-8 h-8 rounded-full ${c.color} ring-2 ring-offset-2 ring-offset-[#1c1c1c] ring-transparent hover:ring-white/30 transition-all`} title={c.label} />
                    ))}
                  </div>
                </div>
                <div className="px-5 py-4">
                  <div className="text-white text-sm mb-3">Размер текста</div>
                  <input type="range" min="12" max="20" defaultValue="14" className="w-full accent-[#2AABEE]" />
                  <div className="flex justify-between text-[#8e8e8e] text-xs mt-1">
                    <span>Маленький</span><span>Большой</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---- MAIN CHAT SCREEN ----
  return (
    <div className="min-h-screen bg-[#0e0e0e] flex text-white overflow-hidden" style={{ height: "100vh" }}>
      {/* Боковая панель */}
      <div className="w-80 bg-[#161616] border-r border-[#232323] flex flex-col flex-shrink-0">
        {/* Заголовок */}
        <div className="px-4 py-3 border-b border-[#232323] flex items-center gap-2">
          <div className="relative flex-1">
            <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
            <input
              placeholder="Поиск"
              className="w-full bg-[#1e1e1e] rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:bg-[#222] transition-colors"
            />
          </div>
          <button className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-[#1e1e1e] transition-colors">
            <Icon name="PenSquare" size={16} className="text-[#8e8e8e]" />
          </button>
        </div>

        {/* Вкладки */}
        <div className="flex border-b border-[#232323]">
          {[
            { id: "chats" as Tab, icon: "MessageCircle", label: "Чаты" },
            { id: "archive" as Tab, icon: "Archive", label: "Архив" },
            { id: "saved" as Tab, icon: "Bookmark", label: "Избранное" },
            { id: "settings" as Tab, icon: "Settings", label: "Настройки" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setActiveChat(null); }}
              className={`flex-1 flex flex-col items-center py-2.5 text-[10px] font-medium transition-all duration-150 ${activeTab === tab.id ? "text-[#2AABEE] border-b-2 border-[#2AABEE]" : "text-[#555] hover:text-[#888]"}`}
            >
              <Icon name={tab.icon} size={17} />
              <span className="mt-0.5">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Список чатов */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "saved" ? (
            <div className="p-3">
              <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[#1e1e1e] cursor-pointer transition-colors" onClick={() => setActiveChat(99)}>
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#2AABEE] to-[#4b6bcd] flex items-center justify-center flex-shrink-0">
                  <Icon name="Bookmark" size={18} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-semibold">Избранное</div>
                  <div className="text-[#8e8e8e] text-xs truncate">Ваши заметки и ссылки</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-2">
              {currentChats.map(chat => (
                <button
                  key={chat.id}
                  onClick={() => setActiveChat(chat.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 ${activeChat === chat.id ? "bg-[#2AABEE]/15" : "hover:bg-[#1e1e1e]"}`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-11 h-11 rounded-full bg-[#2a2a2a] flex items-center justify-center text-white font-semibold text-sm">
                      {chat.avatar}
                    </div>
                    {chat.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#161616]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm font-medium truncate">{chat.name}</span>
                      <span className="text-[#555] text-xs flex-shrink-0 ml-2">{chat.time}</span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-[#8e8e8e] text-xs truncate">{chat.preview}</span>
                      {chat.unread > 0 && (
                        <span className="ml-2 bg-[#2AABEE] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0">
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
      </div>

      {/* Зона чата */}
      <div className="flex-1 flex flex-col bg-[#0e0e0e]">
        {activeChat === null ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 rounded-full bg-[#1c1c1c] flex items-center justify-center mb-4">
              <Icon name="MessageCircle" size={36} className="text-[#3a3a3a]" />
            </div>
            <h2 className="text-white text-lg font-semibold mb-2">Выберите чат</h2>
            <p className="text-[#555] text-sm">Откройте диалог слева, чтобы начать общение</p>
          </div>
        ) : activeChat === 99 ? (
          <>
            <div className="h-14 border-b border-[#232323] flex items-center px-5 gap-3 bg-[#161616]">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2AABEE] to-[#4b6bcd] flex items-center justify-center">
                <Icon name="Bookmark" size={16} className="text-white" />
              </div>
              <div>
                <div className="text-white text-sm font-semibold">Избранное</div>
                <div className="text-[#8e8e8e] text-xs">Ваши заметки</div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {SAVED_MESSAGES.map((msg, i) => (
                <div key={i} className="flex justify-end">
                  <div className="bg-[#2AABEE]/20 border border-[#2AABEE]/20 rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-xs">
                    <p className="text-white text-sm">{msg.text}</p>
                    <p className="text-[#8e8e8e] text-[10px] mt-1 text-right">{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-[#232323] bg-[#161616]">
              <div className="flex items-center gap-2 bg-[#1e1e1e] rounded-2xl px-4 py-2">
                <Icon name="Paperclip" size={18} className="text-[#555]" />
                <input placeholder="Заметка..." className="flex-1 bg-transparent text-sm text-white placeholder-[#555] focus:outline-none" />
                <button className="w-8 h-8 bg-[#2AABEE] rounded-full flex items-center justify-center hover:bg-[#229ED9] transition-colors">
                  <Icon name="Send" size={14} className="text-white" />
                </button>
              </div>
            </div>
          </>
        ) : chatInfo ? (
          <>
            {/* Шапка чата */}
            <div className="h-14 border-b border-[#232323] flex items-center px-5 gap-3 bg-[#161616]">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-[#2a2a2a] flex items-center justify-center text-white font-semibold text-sm">
                  {chatInfo.avatar}
                </div>
                {chatInfo.online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#161616]" />}
              </div>
              <div className="flex-1">
                <div className="text-white text-sm font-semibold">{chatInfo.name}</div>
                <div className={`text-xs ${chatInfo.online ? "text-green-400" : "text-[#8e8e8e]"}`}>
                  {chatInfo.online ? "В сети" : "Не в сети"}
                </div>
              </div>
              <div className="flex gap-1">
                <button className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-[#1e1e1e] transition-colors">
                  <Icon name="Phone" size={16} className="text-[#8e8e8e]" />
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-[#1e1e1e] transition-colors">
                  <Icon name="Search" size={16} className="text-[#8e8e8e]" />
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-[#1e1e1e] transition-colors">
                  <Icon name="MoreVertical" size={16} className="text-[#8e8e8e]" />
                </button>
              </div>
            </div>

            {/* Сообщения */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {(MESSAGES[activeChat] || []).map((msg, i) => (
                <div key={i} className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}>
                  <div className={`px-4 py-2.5 rounded-2xl max-w-xs ${msg.from === "me" ? "bg-[#2AABEE]/25 border border-[#2AABEE]/20 rounded-tr-sm" : "bg-[#1c1c1c] rounded-tl-sm"}`}>
                    <p className="text-white text-sm">{msg.text}</p>
                    <p className="text-[#8e8e8e] text-[10px] mt-1 text-right">{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Поле ввода */}
            <div className="p-3 border-t border-[#232323] bg-[#161616]">
              <div className="flex items-center gap-2 bg-[#1e1e1e] rounded-2xl px-4 py-2">
                <button><Icon name="Smile" size={18} className="text-[#555] hover:text-[#888] transition-colors" /></button>
                <input
                  value={inputMsg}
                  onChange={e => setInputMsg(e.target.value)}
                  placeholder="Сообщение..."
                  className="flex-1 bg-transparent text-sm text-white placeholder-[#555] focus:outline-none"
                  onKeyDown={e => e.key === "Enter" && setInputMsg("")}
                />
                <button><Icon name="Paperclip" size={18} className="text-[#555] hover:text-[#888] transition-colors" /></button>
                <button
                  onClick={() => setInputMsg("")}
                  className="w-8 h-8 bg-[#2AABEE] rounded-full flex items-center justify-center hover:bg-[#229ED9] transition-colors"
                >
                  <Icon name="Send" size={14} className="text-white" />
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}