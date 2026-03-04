// ===== DASHBOARD HELPERS =====

// --- Auth Guard ---
async function requireAuth() {
  if (typeof _supabase === 'undefined' || !_supabase) return null
  const { data: { session } } = await _supabase.auth.getSession()
  if (!session) {
    window.location.href = 'login.html'
    return null
  }
  return session
}

// --- Load restaurant data ---
async function loadRestaurant(userId) {
  const { data } = await _supabase
    .from('restaurants')
    .select('*')
    .eq('owner_id', userId)
    .single()
  return data
}

// --- Toast notifications ---
function toast(message, type = 'info') {
  let container = document.querySelector('.toast-container')
  if (!container) {
    container = document.createElement('div')
    container.className = 'toast-container'
    document.body.appendChild(container)
  }

  const el = document.createElement('div')
  el.className = `toast ${type}`
  const icons = { success: '✅', error: '❌', info: '💡' }
  el.innerHTML = `<span>${icons[type] || '💡'}</span><span>${message}</span>`
  container.appendChild(el)

  setTimeout(() => {
    el.style.opacity = '0'
    el.style.transform = 'translateX(24px)'
    el.style.transition = '0.3s'
    setTimeout(() => el.remove(), 300)
  }, 3500)
}

// --- Format price ---
function formatPrice(price, currency = 'AMD') {
  if (currency === 'AMD') return price.toLocaleString('ru') + ' ֏'
  return '$' + price.toFixed(2)
}

// --- Time ago ---
function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000
  if (diff < 60)  return 'только что'
  if (diff < 3600) return Math.floor(diff/60) + ' мин назад'
  if (diff < 86400) return Math.floor(diff/3600) + ' ч назад'
  return new Date(dateStr).toLocaleDateString('ru')
}

// --- Generate slug ---
function toSlug(str) {
  return str
    .toLowerCase()
    .replace(/[ёйцукенгшщзхъфывапролджэячсмитьбюaeiouáéíóú]/g, c => {
      const map = {ё:'yo',й:'y',ц:'ts',у:'u',к:'k',е:'e',н:'n',г:'g',ш:'sh',
        щ:'sch',з:'z',х:'h',ъ:'',ф:'f',ы:'y',в:'v',а:'a',п:'p',р:'r',о:'o',
        л:'l',д:'d',ж:'zh',э:'e',я:'ya',ч:'ch',с:'s',м:'m',и:'i',т:'t',
        ь:'',б:'b',ю:'yu'}
      return map[c] || c
    })
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// --- Modal helpers ---
function openModal(id) {
  document.getElementById(id).classList.add('open')
  document.body.style.overflow = 'hidden'
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open')
  document.body.style.overflow = ''
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    closeModal(e.target.id)
  }
})

// Close modal on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => closeModal(m.id))
  }
})

// --- Sidebar mobile toggle ---
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.sidebar-toggle')
  const sidebar = document.querySelector('.sidebar')
  if (toggle && sidebar) {
    toggle.addEventListener('click', () => sidebar.classList.toggle('open'))
    document.addEventListener('click', (e) => {
      if (sidebar.classList.contains('open') &&
          !sidebar.contains(e.target) &&
          !toggle.contains(e.target)) {
        sidebar.classList.remove('open')
      }
    })
  }
})

// --- Confirm dialog ---
function confirmAction(message) {
  return new Promise(resolve => {
    // Простой confirm (можно заменить на кастомный modal)
    resolve(window.confirm(message))
  })
}
