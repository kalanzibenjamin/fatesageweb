import '../scss/fate-app.scss'

const telegram = window.Telegram?.WebApp
const THEME_DARK = 'dark'
const THEME_LIGHT = 'light'
const PROFILE_API_URL = (import.meta.env.VITE_FATE_API_URL || '').replace(/\/+$/, '')
const DEV_USER_ID = import.meta.env.VITE_FATE_DEV_USER_ID || ''
const systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)')
const DEMO_PROFILE = import.meta.env.DEV ? {
  user: { id: 0, first_name: 'Fate Player', username: null, language_code: 'en' },
  profile: { level: 1, games: 0, wins: 0, losses: 0, money: 50, diamonds: 105, vip_tier: null }
} : null
let usesSystemTheme = true
let currentProfile = null
let translations = {}
let leaderboardSort = 'wealth'

function translate(key) {
  return translations[key] || key
}

async function loadTranslations(languageCode = 'en') {
  const language = /^[a-z]{2}$/i.test(languageCode) ? languageCode.toLowerCase() : 'en'
  const baseUrl = import.meta.env.BASE_URL || './'
  try {
    const response = await fetch(`${baseUrl}locales/${language}.json`)
    if (!response.ok) throw new Error(`Locale request failed with ${response.status}`)
    translations = await response.json()
  } catch (error) {
    if (language !== 'en') {
      console.warn(`Unable to load Fate locale "${language}", using English.`, error)
      return loadTranslations('en')
    }
    console.error('Unable to load Fate English locale.', error)
    translations = {}
  }
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const value = translate(element.dataset.i18n)
    if (value !== element.dataset.i18n) element.textContent = value
  })
  document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
}

function getSystemTheme() {
  return systemThemeQuery.matches ? THEME_DARK : THEME_LIGHT
}

function updateThemeToggle(theme) {
  const toggle = document.querySelector('#themeToggle')
  const currentTheme = theme === THEME_LIGHT ? 'day' : 'night'
  const nextTheme = theme === THEME_LIGHT ? 'night' : 'day'
  if (toggle) {
    toggle.setAttribute('aria-label', `Switch to ${nextTheme} theme (Alt+T)`)
    toggle.title = `Current theme: ${currentTheme}${usesSystemTheme ? ' (system preference)' : ' (manual)'}. Alt+T changes theme; Alt+S returns to system preference.`
  }
  const themeColor = document.querySelector('meta[name="theme-color"]')
  if (themeColor) themeColor.content = theme === THEME_LIGHT ? '#f5f7ff' : '#0b0915'
}

function applyTheme(theme) {
  if (theme !== THEME_DARK && theme !== THEME_LIGHT) return
  document.documentElement.classList.toggle('light-mode', theme === THEME_LIGHT)
  document.body?.classList.toggle('light-mode', theme === THEME_LIGHT)
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
  updateThemeToggle(theme)
}

function toggleTheme() {
  usesSystemTheme = false
  applyTheme(document.documentElement.dataset.theme === THEME_DARK ? THEME_LIGHT : THEME_DARK)
}

function useSystemTheme() {
  usesSystemTheme = true
  applyTheme(getSystemTheme())
}

function handleThemeShortcut(event) {
  if (!event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.defaultPrevented) return
  if (event.target instanceof HTMLElement && (event.target.isContentEditable || event.target.closest('input, textarea, select'))) return
  const key = event.key.toLowerCase()
  if (key === 't') {
    event.preventDefault()
    toggleTheme()
  } else if (key === 's') {
    event.preventDefault()
    useSystemTheme()
  }
}

function initThemeToggle() {
  usesSystemTheme = true
  applyTheme(getSystemTheme())
  systemThemeQuery.addEventListener('change', () => {
    if (usesSystemTheme) applyTheme(getSystemTheme())
  })
  document.querySelector('#themeToggle')?.addEventListener('click', toggleTheme)
  document.addEventListener('keydown', handleThemeShortcut)
}

function initBotAvatar() {
  const avatar = document.querySelector('#bot-avatar')
  const fallback = document.querySelector('.brand-mark-fallback')
  avatar?.addEventListener('error', () => {
    avatar.hidden = true
    fallback?.removeAttribute('hidden')
  })
}

function navigate(view) {
  document.querySelectorAll('[data-view-panel]').forEach((panel) => {
    panel.hidden = panel.dataset.viewPanel !== view
    panel.classList.toggle('active', panel.dataset.viewPanel === view)
  })
  document.querySelectorAll('.nav-item').forEach((item) => item.classList.toggle('active', item.dataset.navigate === view))
  window.scrollTo({ top: 0, behavior: 'smooth' })
  if (view === 'leaderboard') loadLeaderboard()
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString()
}

function formatVipTier(value) {
  if (typeof value !== 'string') return ''
  const tier = value.trim()
  return tier && tier.toLowerCase() !== 'none' ? tier : ''
}

function setProfileStatus(message, canRetry = false) {
  const status = document.querySelector('#profile-status')
  const retry = document.querySelector('#profile-retry')
  if (status) status.textContent = message
  if (retry) retry.hidden = !canRetry
}

function updateProfileAvatar(user) {
  const image = document.querySelector('#profile-avatar-image')
  const fallback = document.querySelector('#profile-avatar-fallback')
  const avatar = document.querySelector('#profile-avatar')
  if (!image || !fallback || !avatar) return

  fallback.textContent = (user.first_name || 'F').trim().charAt(0).toUpperCase() || 'F'
  image.hidden = true
  fallback.hidden = false
  avatar.classList.remove('has-image')

  if (typeof user.photo_url !== 'string' || !user.photo_url) return
  image.onload = () => {
    image.hidden = false
    fallback.hidden = true
    avatar.classList.add('has-image')
  }
  image.onerror = () => {
    image.hidden = true
    fallback.hidden = false
    avatar.classList.remove('has-image')
  }
  image.src = user.photo_url
}

function renderInventory(profile) {
  const empty = document.querySelector('#inventory-empty')
  const list = document.querySelector('#inventory-list')
  if (!empty || !list) return
  const entries = [
    ...(profile.purchased_items || []).map((name) => ({ type: translate('items'), name, icon: 'fa-box-open' })),
    ...(profile.purchased_roles || []).map((name) => ({ type: translate('roles'), name, icon: 'fa-user' })),
    ...(profile.active_buffs || []).map((name) => ({ type: translate('buffs'), name: String(name), icon: 'fa-bolt' })),
  ]
  if (!entries.length) {
    empty.hidden = false
    list.hidden = true
    list.replaceChildren()
    return
  }
  empty.hidden = true
  list.hidden = false
  list.replaceChildren(...entries.map((entry) => {
    const item = document.createElement('article')
    item.className = 'inventory-item'
    const icon = document.createElement('span')
    icon.className = `inventory-item-icon fa-icon ${entry.icon}`
    icon.setAttribute('aria-hidden', 'true')
    const content = document.createElement('span')
    const name = document.createElement('strong')
    name.textContent = entry.name
    const type = document.createElement('small')
    type.textContent = entry.type
    content.append(name, type)
    item.append(icon, content)
    return item
  }))
}

function renderLeaderboard(data) {
  const empty = document.querySelector('#leaderboard-empty')
  const list = document.querySelector('#leaderboard-list')
  if (!empty || !list) return
  const entries = Array.isArray(data?.entries) ? data.entries : []
  empty.hidden = entries.length > 0
  list.hidden = entries.length === 0
  list.replaceChildren(...entries.map((entry) => {
    const item = document.createElement('article')
    item.className = 'leaderboard-item'
    item.innerHTML = `<span class="leaderboard-rank">${entry.rank}</span><span class="leaderboard-person"><strong></strong><small></small></span><b>${formatNumber(entry.value)}</b>`
    item.querySelector('strong').textContent = entry.name
    item.querySelector('small').textContent = entry.username ? `@${entry.username}` : `ID ${entry.user_id}`
    return item
  }))
}

async function loadLeaderboard(sort = leaderboardSort) {
  leaderboardSort = sort
  const initData = telegram?.initData
  if (!PROFILE_API_URL) return
  try {
    const endpoint = initData ? '/api/miniapp/leaderboard' : '/api/miniapp/dev/leaderboard'
    const headers = initData ? { 'X-Telegram-Init-Data': initData } : {}
    if (!initData && !DEV_USER_ID) return
    const response = await fetch(`${PROFILE_API_URL}${endpoint}?sort=${sort}`, { headers })
    if (!response.ok) throw new Error(`Leaderboard request failed with ${response.status}`)
    renderLeaderboard(await response.json())
  } catch (error) {
    console.error('Fate leaderboard request failed.', error)
  }
}

function applyProfileLanguage(user) {
  if (typeof user.language_code !== 'string' || !user.language_code) return
  const language = user.language_code.replace('_', '-').toLowerCase()
  document.documentElement.lang = language
  document.documentElement.dataset.language = language
}

function showProfile(profileData) {
  currentProfile = profileData
  const { user, profile } = profileData
  const games = Number(profile.games || 0)
  const wins = Number(profile.wins || 0)
  const losses = Number(profile.losses || 0)
  const winRate = games ? `${Math.round((wins / games) * 100)}%` : '0%'
  document.querySelector('#header-name').textContent = 'Fate Sage'
  document.querySelector('#header-handle').textContent = '@FateSage'
  document.querySelector('#profile-title').textContent = user.first_name
  document.querySelector('#profile-handle').textContent = user.username ? `@${user.username}` : `Player ${user.id}`
  updateProfileAvatar(user)
  applyProfileLanguage(user)
  document.querySelector('#profile-level').textContent = profile.level
  const vipTier = formatVipTier(profile.vip_tier)
  const vipBadge = document.querySelector('#profile-vip')
  if (vipBadge) {
    vipBadge.hidden = !vipTier
    vipBadge.title = vipTier ? `${vipTier} VIP` : ''
    vipBadge.setAttribute('aria-label', vipTier ? `${vipTier} VIP member` : 'VIP member')
  }
  document.querySelector('#profile-id').textContent = user.id
  document.querySelector('#profile-role').textContent = translate('novice')
  document.querySelector('#profile-money').textContent = formatNumber(profile.money)
  document.querySelector('#profile-diamonds').textContent = formatNumber(profile.diamonds)
  document.querySelector('#profile-games').textContent = formatNumber(games)
  document.querySelector('#profile-wins').textContent = formatNumber(wins)
  document.querySelector('#profile-losses').textContent = formatNumber(losses)
  document.querySelector('#profile-win-rate').textContent = winRate
  document.querySelector('#stats-win-rate').textContent = winRate
  document.querySelector('#stats-games').textContent = formatNumber(games)
  document.querySelector('#stats-wins').textContent = formatNumber(wins)
  document.querySelector('#stats-losses').textContent = formatNumber(losses)
  document.querySelector('#stats-games-card').textContent = formatNumber(games)
  document.querySelector('#stats-wins-card').textContent = formatNumber(wins)
  document.querySelector('#stats-level').textContent = profile.level
  renderInventory(profile)
  setProfileStatus('Profile synced with Fate Sage.')
}

async function loadProfile() {
  const initData = telegram?.initData
  if (!initData) {
    if (PROFILE_API_URL && DEV_USER_ID) {
      try {
        const response = await fetch(`${PROFILE_API_URL}/api/miniapp/dev/profile`)
        if (!response.ok) throw new Error(`Development profile request failed with ${response.status}`)
        const profileData = await response.json()
        await loadTranslations(profileData.user.language_code || 'en')
        showProfile(profileData)
        return
      } catch (error) {
        console.warn('Fate development profile unavailable; using demo data.', error)
      }
    }
    if (DEMO_PROFILE) {
      await loadTranslations(DEMO_PROFILE.user.language_code || 'en')
      showProfile(DEMO_PROFILE)
      return
    }
    setProfileStatus('Open this Mini App from Telegram to load your profile.')
    return
  }
  if (!PROFILE_API_URL) {
    setProfileStatus('Profile service is not connected yet.')
    return
  }
  setProfileStatus('Loading your profile...')
  try {
    const response = await fetch(`${PROFILE_API_URL}/api/miniapp/profile`, { headers: { 'X-Telegram-Init-Data': initData } })
    if (response.status === 401) return setProfileStatus('Telegram could not verify this session. Reopen the Mini App.', true)
    if (response.status === 404) return setProfileStatus('No Fate profile found. Start the bot first.', true)
    if (!response.ok) return setProfileStatus('Could not load your profile right now.', true)
    const profileData = await response.json()
    await loadTranslations(profileData.user.language_code || 'en')
    showProfile(profileData)
  } catch (error) {
    console.error('Fate profile request failed.', error)
    setProfileStatus('Could not reach Fate Sage. Check your connection.', true)
  }
}

function connectLinks() {
  document.querySelectorAll('.bot-command').forEach((link) => link.addEventListener('click', (event) => {
    if (!telegram?.openTelegramLink) return
    event.preventDefault()
    telegram.openTelegramLink(link.href)
  }))
  document.querySelectorAll('[data-navigate]').forEach((item) => item.addEventListener('click', () => navigate(item.dataset.navigate)))
  document.querySelector('#profile-retry')?.addEventListener('click', loadProfile)
  document.querySelectorAll('[data-leaderboard-sort]').forEach((tab) => tab.addEventListener('click', () => {
    document.querySelectorAll('[data-leaderboard-sort]').forEach((item) => item.classList.toggle('active', item === tab))
    loadLeaderboard(tab.dataset.leaderboardSort)
  }))
}

if (telegram) {
  telegram.ready()
  telegram.expand()
}

initThemeToggle()
initBotAvatar()
connectLinks()
loadProfile()
