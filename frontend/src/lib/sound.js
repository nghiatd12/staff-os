/**
 * sound.js — Âm thanh thông báo cho StaffOS
 * Dùng Web Audio API (beep) + Web Speech API (đọc tên bàn)
 * Không cần thư viện ngoài.
 */

// ─── AudioContext singleton ───────────────────────────────────────────────────
let _ctx = null

function getAudioContext() {
  if (!_ctx) {
    _ctx = new (window.AudioContext || window.webkitAudioContext)()
  }
  // Resume nếu bị suspended (browser policy)
  if (_ctx.state === 'suspended') {
    _ctx.resume()
  }
  return _ctx
}

/**
 * Phát 1 nốt beep
 * @param {number} frequency - Hz (440 = La, 880 = La cao)
 * @param {number} duration  - ms
 * @param {number} volume    - 0..1
 * @param {string} type      - 'sine' | 'square' | 'triangle' | 'sawtooth'
 * @param {number} startDelay - giây (delay trước khi phát)
 */
function beep(frequency = 880, duration = 150, volume = 0.4, type = 'sine', startDelay = 0) {
  try {
    const ctx = getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + startDelay)

    // Fade in/out để tránh click noise
    gainNode.gain.setValueAtTime(0, ctx.currentTime + startDelay)
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + startDelay + 0.01)
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + startDelay + duration / 1000)

    oscillator.start(ctx.currentTime + startDelay)
    oscillator.stop(ctx.currentTime + startDelay + duration / 1000 + 0.05)
  } catch (e) {
    console.warn('[Sound] beep error:', e)
  }
}

// ─── Preset âm thanh ─────────────────────────────────────────────────────────

/**
 * 🔔 Beep 3 nốt — order mới từ khách (KDS)
 * Nốt tăng dần: Do-Mi-Sol
 */
export function playNewOrder() {
  beep(523, 120, 0.5, 'sine', 0.0)   // Do
  beep(659, 120, 0.5, 'sine', 0.15)  // Mi
  beep(784, 180, 0.6, 'sine', 0.30)  // Sol
}

/**
 * ✅ Beep 2 nốt — order hoàn thành (bếp xong)
 */
export function playOrderReady() {
  beep(784, 100, 0.4, 'sine', 0.0)   // Sol
  beep(1047, 200, 0.5, 'sine', 0.12) // Do cao
}

/**
 * ⚠️ Beep cảnh báo — order quá lâu (> 20 phút)
 */
export function playUrgent() {
  beep(440, 200, 0.5, 'square', 0.0)
  beep(440, 200, 0.5, 'square', 0.25)
}

// ─── Web Speech API — đọc tên bàn ────────────────────────────────────────────

/**
 * Đọc tên bàn bằng giọng nói tiếng Việt
 * @param {string} tableName - VD: "Bàn 5"
 * @param {string} message   - VD: "có order mới"
 */
export function speakTable(tableName, message = 'có order mới') {
  if (!window.speechSynthesis) return

  // Hủy speech đang chạy
  window.speechSynthesis.cancel()

  const text = `${tableName} ${message}`
  const utterance = new SpeechSynthesisUtterance(text)

  // Ưu tiên giọng tiếng Việt nếu có
  const voices = window.speechSynthesis.getVoices()
  const viVoice = voices.find((v) => v.lang.startsWith('vi'))
  if (viVoice) utterance.voice = viVoice

  utterance.lang = 'vi-VN'
  utterance.rate = 0.9
  utterance.pitch = 1.1
  utterance.volume = 1.0

  // Delay nhỏ để beep phát trước
  setTimeout(() => {
    window.speechSynthesis.speak(utterance)
  }, 500)
}

/**
 * Kết hợp: beep + đọc tên bàn
 * Dùng cho KDS khi nhận order mới
 */
export function notifyNewOrder(tableName) {
  playNewOrder()
  speakTable(tableName, 'có order mới')
}

/**
 * Kết hợp: beep + đọc khi bếp xong
 * Dùng cho phục vụ khi nhận thông báo order ready
 */
export function notifyOrderReady(tableName) {
  playOrderReady()
  speakTable(tableName, 'món đã sẵn sàng')
}

// ─── Unlock audio (cần user interaction đầu tiên) ────────────────────────────

/**
 * Gọi hàm này khi user click/touch lần đầu để unlock AudioContext
 * Browser yêu cầu user gesture trước khi phát âm thanh
 */
export function unlockAudio() {
  try {
    const ctx = getAudioContext()
    // Phát 1 nốt im lặng để unlock
    const buf = ctx.createBuffer(1, 1, 22050)
    const src = ctx.createBufferSource()
    src.buffer = buf
    src.connect(ctx.destination)
    src.start(0)
  } catch (e) {
    // ignore
  }
}
