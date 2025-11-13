/**
 * МГНОВЕННАЯ ИНДЕКСАЦИЯ В GOOGLE
 * 
 * Использование:
 * 1. Положи файл service-account-key.json в папку scripts/
 * 2. Запусти: node scripts/instant-index.js
 * 3. Готово! Индексация началась!
 */

const { google } = require('googleapis');
const key = require('./service-account-key.json');

// Твои страницы для индексации
const URLS = [
  'https://ai-learning45.netlify.app/',
  'https://ai-learning45.netlify.app/courses',
  'https://ai-learning45.netlify.app/courses/level/1',
  'https://ai-learning45.netlify.app/courses/level/2',
  'https://ai-learning45.netlify.app/courses/level/3',
  'https://ai-learning45.netlify.app/payment',
  'https://ai-learning45.netlify.app/login',
  'https://ai-learning45.netlify.app/profile',
  'https://ai-learning45.netlify.app/projects',
];

const jwtClient = new google.auth.JWT(
  key.client_email,
  null,
  key.private_key,
  ['https://www.googleapis.com/auth/indexing'],
  null
);

async function indexURL(url) {
  try {
    const response = await google.indexing('v3').urlNotifications.publish({
      auth: jwtClient,
      requestBody: {
        url: url,
        type: 'URL_UPDATED',
      },
    });
    
    console.log(`✅ ${url}`);
    console.log(`   Статус: ${response.status}`);
    return response;
  } catch (error) {
    console.error(`❌ ${url}`);
    console.error(`   Ошибка: ${error.message}`);
    return null;
  }
}

async function indexAllPages() {
  console.log('🚀 НАЧИНАЕМ МГНОВЕННУЮ ИНДЕКСАЦИЮ...\n');
  
  for (const url of URLS) {
    await indexURL(url);
    // Пауза между запросами (200ms)
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log('\n✅ ГОТОВО! Все страницы отправлены на индексацию!');
  console.log('⏰ Google проверит их в течение 1-6 часов.');
  console.log('📊 Проверь результат в Search Console → "Страницы"');
}

// Запуск
indexAllPages().catch(console.error);
