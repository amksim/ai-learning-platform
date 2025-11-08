// 📧 Email отправка через Resend

export const sendWelcomeEmail = async (email: string, name: string) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Добро пожаловать в AI Learning Platform!</h1>
          </div>
          <div class="content">
            <h2>Привет, ${name}! 👋</h2>
            <p>Спасибо за регистрацию на нашей платформе!</p>
            <p><strong>У тебя теперь есть доступ к:</strong></p>
            <ul>
              <li>🎓 220 интерактивным урокам по программированию</li>
              <li>🤖 AI-помощнику для решения задач</li>
              <li>📊 Отслеживанию твоего прогресса</li>
              <li>🏆 Сертификатам по завершении курсов</li>
            </ul>
            <a href="https://ai-learning45.netlify.app/courses" class="button">Начать обучение →</a>
            <p style="margin-top: 30px;">Желаем успехов в обучении! 🚀</p>
          </div>
          <div class="footer">
            <p>© 2024 AI Learning Platform. Все права защищены.</p>
            <p>Если у тебя есть вопросы, ответь на это письмо.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: email,
      subject: '🎉 Добро пожаловать в AI Learning Platform!',
      html,
      type: 'welcome',
    }),
  });
};

export const sendPaymentSuccessEmail = async (email: string, name: string, subscriptionType: 'monthly' | 'yearly') => {
  const amount = subscriptionType === 'monthly' ? '$9.99' : '$99.99';
  const period = subscriptionType === 'monthly' ? 'месяц' : 'год';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .receipt { background: white; border: 2px solid #10b981; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Оплата прошла успешно!</h1>
          </div>
          <div class="content">
            <h2>Спасибо за подписку, ${name}! 🎉</h2>
            <p>Твой платёж успешно обработан.</p>
            
            <div class="receipt">
              <h3>📋 Детали подписки:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">Тип подписки:</td>
                  <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;"><strong>Premium (${period})</strong></td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">Сумма:</td>
                  <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;"><strong>${amount}</strong></td>
                </tr>
                <tr>
                  <td style="padding: 10px;">Дата:</td>
                  <td style="padding: 10px; text-align: right;">${new Date().toLocaleDateString('ru-RU')}</td>
                </tr>
              </table>
            </div>

            <p><strong>Теперь у тебя есть доступ к:</strong></p>
            <ul>
              <li>✨ Всем 220 урокам без ограничений</li>
              <li>🤖 Безлимитной помощи AI</li>
              <li>📁 Сохранению проектов</li>
              <li>🏆 Официальным сертификатам</li>
              <li>💬 Приоритетной поддержке</li>
            </ul>

            <a href="https://ai-learning45.netlify.app/courses" class="button">Продолжить обучение →</a>
          </div>
          <div class="footer">
            <p>© 2024 AI Learning Platform</p>
            <p>Вопросы? Ответь на это письмо!</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: email,
      subject: '✅ Оплата успешна - AI Learning Platform',
      html,
      type: 'payment_success',
    }),
  });
};

export const sendProgressEmail = async (email: string, name: string, completedLessons: number) => {
  const milestones = [10, 25, 50, 100, 150, 200, 220];
  const isMilestone = milestones.includes(completedLessons);

  if (!isMilestone) return; // Отправляем только на важных этапах

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .progress-bar { background: #e5e7eb; height: 30px; border-radius: 15px; overflow: hidden; margin: 20px 0; }
          .progress-fill { background: linear-gradient(90deg, #10b981 0%, #059669 100%); height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; }
          .button { display: inline-block; padding: 12px 30px; background: #f59e0b; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Поздравляем с достижением!</h1>
          </div>
          <div class="content">
            <h2>Отличная работа, ${name}! 🏆</h2>
            <p>Ты завершил уже <strong>${completedLessons} уроков</strong> из 220!</p>
            
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${(completedLessons / 220 * 100).toFixed(1)}%">
                ${(completedLessons / 220 * 100).toFixed(1)}%
              </div>
            </div>

            <p>Продолжай в том же духе! Каждый урок приближает тебя к мастерству в программировании. 💪</p>

            ${completedLessons === 220 ? `
              <div style="background: #10b981; color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>🎓 Ты прошёл весь курс!</h3>
                <p>Поздравляем! Ты завершил все 220 уроков. Получи свой сертификат!</p>
              </div>
            ` : ''}

            <a href="https://ai-learning45.netlify.app/courses" class="button">Продолжить обучение →</a>
          </div>
        </div>
      </body>
    </html>
  `;

  return fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: email,
      subject: `🎉 Milestone: ${completedLessons} уроков завершено!`,
      html,
      type: 'progress',
    }),
  });
};
