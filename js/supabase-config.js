// ===== SUPABASE CONFIG =====
// 1. Зайди на supabase.com → твой проект → Settings → API
// 2. Скопируй Project URL и anon public key
// 3. Вставь ниже

const SUPABASE_URL  = 'https://ВАШ-ПРОЕКТ.supabase.co'   // ← вставь сюда
const SUPABASE_KEY  = 'ВАШ-ANON-KEY'                      // ← вставь сюда

// После заполнения — удали предупреждение в login.html (id="config-notice")

// Инициализация клиента
const _supabase = window.supabase
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
  : null

if (!_supabase) {
  console.warn('Supabase SDK не загружен')
}
