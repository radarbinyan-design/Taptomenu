import { Resend } from 'resend'

let _resend: Resend | null = null

function getResend(): Resend {
  if (!_resend) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.warn('[email] RESEND_API_KEY not set, emails will not be sent')
      // Return a mock that won't throw
      return {
        emails: {
          send: async () => ({ data: null, error: { message: 'No API key configured' } }),
        },
      } as any
    }
    _resend = new Resend(apiKey)
  }
  return _resend
}

const FROM_EMAIL = 'TapMenu <noreply@tapmenu.am>'
const BRAND_COLOR = '#F5A623'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.tapmenu.am'

// ─── Email Layout Template ──────────────────────────────────────────────────

function emailLayout(body: string): string {
  return `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${BRAND_COLOR}, #e08e10); border-radius: 16px 16px 0 0; padding: 32px 40px; text-align: center;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td style="background-color: rgba(255,255,255,0.25); width: 44px; height: 44px; border-radius: 12px; text-align: center; vertical-align: middle;">
                    <span style="color: #ffffff; font-size: 18px; font-weight: bold;">TM</span>
                  </td>
                  <td style="padding-left: 12px;">
                    <span style="color: #ffffff; font-size: 22px; font-weight: bold; letter-spacing: -0.5px;">TapMenu</span>
                    <br>
                    <span style="color: rgba(255,255,255,0.8); font-size: 12px;">Armenia</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background-color: #ffffff; padding: 40px; border-radius: 0 0 16px 16px;">
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; text-align: center;">
              <p style="margin: 0 0 8px; color: #999; font-size: 12px;">
                &copy; 2026 TapMenu Armenia. Все права защищены.
              </p>
              <p style="margin: 0; color: #bbb; font-size: 11px;">
                Ереван, Армения &middot; hello@tapmenu.am
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ─── Welcome Email ──────────────────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, name: string, restaurantName: string) {
  const body = `
    <h1 style="margin: 0 0 16px; font-size: 24px; color: #1a1a1a; font-weight: 700;">
      Добро пожаловать в TapMenu! 🎉
    </h1>
    <p style="margin: 0 0 8px; font-size: 16px; color: #333; line-height: 1.6;">
      Здравствуйте, <strong>${name}</strong>!
    </p>
    <p style="margin: 0 0 24px; font-size: 16px; color: #555; line-height: 1.6;">
      Ресторан <strong>«${restaurantName}»</strong> успешно зарегистрирован.
      Ваш <strong>14-дневный пробный период</strong> начался.
    </p>
    <div style="background-color: #FFF8EB; border: 1px solid #FFE4A8; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <p style="margin: 0 0 12px; font-size: 14px; color: #8B6914; font-weight: 600;">
        ✨ Что сделать первым:
      </p>
      <ul style="margin: 0; padding-left: 20px; color: #8B6914; font-size: 14px; line-height: 1.8;">
        <li>Добавить первые блюда в меню</li>
        <li>Настроить QR-код для столиков</li>
        <li>Добавить переводы на нужные языки</li>
        <li>Указать Wi-Fi пароль для гостей</li>
      </ul>
    </div>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
      <tr>
        <td style="border-radius: 12px; background-color: ${BRAND_COLOR};">
          <a href="${APP_URL}/dashboard" target="_blank"
             style="display: inline-block; padding: 14px 32px; font-size: 16px; font-weight: 700; color: #ffffff; text-decoration: none;">
            Открыть дашборд →
          </a>
        </td>
      </tr>
    </table>
    <p style="margin: 24px 0 0; font-size: 13px; color: #999; text-align: center;">
      14 дней бесплатно &middot; Без привязки карты
    </p>
  `

  try {
    const { data, error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Добро пожаловать в TapMenu, ${name}! 🎉`,
      html: emailLayout(body),
    })

    if (error) {
      console.error('[email] Welcome email error:', error)
      return { success: false, error }
    }
    return { success: true, data }
  } catch (err) {
    console.error('[email] Welcome email exception:', err)
    return { success: false, error: err }
  }
}

// ─── Password Reset Email ───────────────────────────────────────────────────

export async function sendPasswordResetEmail(to: string, resetLink: string) {
  const body = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; width: 64px; height: 64px; background-color: #FFF3E0; border-radius: 50%; line-height: 64px; text-align: center;">
        <span style="font-size: 28px;">🔐</span>
      </div>
    </div>
    <h1 style="margin: 0 0 16px; font-size: 24px; color: #1a1a1a; font-weight: 700; text-align: center;">
      Сброс пароля
    </h1>
    <p style="margin: 0 0 24px; font-size: 16px; color: #555; line-height: 1.6; text-align: center;">
      Вы запросили сброс пароля для вашего аккаунта TapMenu.
      Ссылка действительна <strong>1 час</strong>.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto 24px;">
      <tr>
        <td style="border-radius: 12px; background-color: ${BRAND_COLOR};">
          <a href="${resetLink}" target="_blank"
             style="display: inline-block; padding: 14px 32px; font-size: 16px; font-weight: 700; color: #ffffff; text-decoration: none;">
            Сбросить пароль →
          </a>
        </td>
      </tr>
    </table>
    <div style="background-color: #f9f9f9; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
      <p style="margin: 0; font-size: 12px; color: #999; line-height: 1.6;">
        Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.
        Ваш пароль останется без изменений.
      </p>
    </div>
    <p style="margin: 0; font-size: 12px; color: #ccc; text-align: center;">
      Ссылка для сброса: <a href="${resetLink}" style="color: #999; word-break: break-all;">${resetLink}</a>
    </p>
  `

  try {
    const { data, error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Сброс пароля TapMenu',
      html: emailLayout(body),
    })

    if (error) {
      console.error('[email] Password reset email error:', error)
      return { success: false, error }
    }
    return { success: true, data }
  } catch (err) {
    console.error('[email] Password reset email exception:', err)
    return { success: false, error: err }
  }
}

// ─── Trial Expiring Email ───────────────────────────────────────────────────

export async function sendTrialExpiringEmail(to: string, name: string, daysLeft: number) {
  const urgencyColor = daysLeft <= 1 ? '#EF4444' : daysLeft <= 3 ? '#F59E0B' : '#3B82F6'

  const body = `
    <h1 style="margin: 0 0 16px; font-size: 24px; color: #1a1a1a; font-weight: 700;">
      ${daysLeft <= 1 ? '⚠️' : '⏰'} Ваш пробный период заканчивается
    </h1>
    <p style="margin: 0 0 16px; font-size: 16px; color: #333; line-height: 1.6;">
      Здравствуйте, <strong>${name}</strong>!
    </p>
    <div style="background-color: #f9f9f9; border-left: 4px solid ${urgencyColor}; border-radius: 0 8px 8px 0; padding: 16px 20px; margin-bottom: 24px;">
      <p style="margin: 0; font-size: 18px; color: ${urgencyColor}; font-weight: 700;">
        ${daysLeft === 1 ? 'Остался 1 день' : daysLeft === 0 ? 'Последний день!' : `Осталось ${daysLeft} дней`}
      </p>
      <p style="margin: 4px 0 0; font-size: 14px; color: #666;">
        до окончания пробного периода TapMenu
      </p>
    </div>
    <p style="margin: 0 0 24px; font-size: 16px; color: #555; line-height: 1.6;">
      Чтобы продолжить использовать все возможности TapMenu без перерывов,
      выберите подходящий тариф.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
      <tr>
        <td style="border-radius: 12px; background-color: ${BRAND_COLOR};">
          <a href="${APP_URL}/dashboard/settings#subscription" target="_blank"
             style="display: inline-block; padding: 14px 32px; font-size: 16px; font-weight: 700; color: #ffffff; text-decoration: none;">
            Выбрать тариф →
          </a>
        </td>
      </tr>
    </table>
  `

  try {
    const { data, error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject: `${daysLeft <= 1 ? '⚠️ ' : ''}Ваш пробный период TapMenu заканчивается через ${daysLeft} ${daysLeft === 1 ? 'день' : 'дней'}`,
      html: emailLayout(body),
    })

    if (error) {
      console.error('[email] Trial expiring email error:', error)
      return { success: false, error }
    }
    return { success: true, data }
  } catch (err) {
    console.error('[email] Trial expiring email exception:', err)
    return { success: false, error: err }
  }
}
