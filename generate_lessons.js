// Генератор всех 211 уроков для вставки в Supabase

const lessons = [];
let id = 1;

// БЕСПЛАТНЫЕ УРОКИ (4)
lessons.push({
  id: id++,
  title: 'Урок 1: Что такое AI и почему это изменит твою жизнь',
  description: 'Узнай что может AI: создавать сайты, приложения, игры БЕЗ знания кода. Реальные примеры людей которые зарабатывают $500-5000/мес с AI.',
  difficulty: 'beginner',
  topics: ['AI basics', 'Introduction', 'Career'],
  category: 'Introduction',
  icon: '🚀',
  block_name: 'Бесплатная часть',
  practice: false,
  is_free: true
});

lessons.push({
  id: id++,
  title: 'Урок 2: Windsurf (Cascade) - твой AI-разработчик',
  description: 'ПОЛНЫЙ РАЗБОР Windsurf: установка, настройки, Credits, интерфейс (Explorer, Search, Git, Terminal), горячие клавиши, Maps, @ для контекста. Что делать если тупит: очистка кэша, перезагрузка, проверка интернета. Как правильно задавать вопросы AI.',
  difficulty: 'beginner',
  topics: ['Windsurf', 'Cascade', 'IDE', 'Setup', 'Settings'],
  category: 'Introduction',
  icon: '💻',
  block_name: 'Бесплатная часть',
  practice: true,
  practice_description: 'Установи Windsurf, настрой тему и шрифт, попробуй все панели, открой терминал (Ctrl+`), задай первый вопрос AI',
  is_free: true
});

lessons.push({
  id: id++,
  title: 'Урок 3: Первые команды - AI пишет код',
  description: 'Практика с Windsurf AI. Как давать команды, контекст @, исправление ошибок. ПРАКТИКА: команда "создай HTML с кнопкой", AI напишет код за 5 сек',
  difficulty: 'beginner',
  topics: ['AI coding', 'Prompts', 'Commands'],
  category: 'Introduction',
  icon: '⚡',
  block_name: 'Бесплатная часть',
  practice: true,
  practice_description: 'Ctrl+L, напиши "Создай index.html с синей кнопкой Hello World", открой в браузере, попроси AI сделать кнопку красной',
  is_free: true
});

lessons.push({
  id: id++,
  title: 'Урок 4: Первый проект - калькулятор за 10 минут',
  description: 'AI создаст полноценный калькулятор. HTML, CSS, JS. Опубликуй на Netlify. Покажи друзьям!',
  difficulty: 'beginner',
  topics: ['Project', 'Calculator', 'Deploy'],
  category: 'Introduction',
  icon: '🎉',
  block_name: 'Бесплатная часть',
  practice: true,
  practice_description: 'Команда: "Создай калькулятор с кнопками 0-9, +,-,*,/, =. Красивый дизайн". Открой в браузере, протестируй, опубликуй на Netlify',
  is_free: true
});

// МОДУЛЬ 1: САЙТЫ (60 уроков, 5-64)
const websiteTopics = [
  // Основы (15)
  {title: 'HTML за 15 минут', desc: 'AI объясняет HTML. Теги, структура', topics: ['HTML', 'Basics'], icon: '📝', practice: 'Создай страницу с заголовком, текстом, картинкой, ссылкой'},
  {title: 'CSS - AI делает красиво', desc: 'Цвета, шрифты, градиенты, тени', topics: ['CSS', 'Design'], icon: '🎨', practice: 'Попроси AI добавить градиент, современный шрифт, тени'},
  {title: 'JavaScript - оживляем сайт', desc: 'Кнопки, события, интерактив', topics: ['JavaScript', 'Events'], icon: '⚡', practice: 'Кнопка меняет цвет фона, счётчик кликов'},
  {title: 'Flexbox - AI расставит элементы', desc: 'Меню, карточки, layout', topics: ['Flexbox', 'Layout'], icon: '📐', practice: 'Шапка с логотипом слева, меню по центру, кнопка справа'},
  {title: 'Grid - сложные сетки', desc: 'Галереи, дашборды', topics: ['Grid', 'Layout'], icon: '🔲', practice: 'Галерея 3x3, адаптивная'},
  {title: 'Адаптивность - все устройства', desc: 'Mobile-first, media queries', topics: ['Responsive', 'Mobile'], icon: '📱', practice: 'Проверь на телефоне (F12), попроси AI исправить'},
  {title: 'Анимации CSS', desc: 'Transitions, keyframes', topics: ['Animations'], icon: '✨', practice: 'Кнопка увеличивается при hover, карточки появляются снизу'},
  {title: 'Формы - сбор данных', desc: 'Input, validation, submit', topics: ['Forms', 'Validation'], icon: '📋', practice: 'Форма регистрации с валидацией email и пароля'},
  {title: 'Иконки и шрифты', desc: 'Google Fonts, Font Awesome', topics: ['Fonts', 'Icons'], icon: '🎨', practice: 'Подключи шрифт Inter, добавь иконки в меню'},
  {title: 'Цветовые схемы', desc: 'AI дизайнер подберёт', topics: ['Colors', 'Design'], icon: '🌈', practice: 'Попроси 3 варианта схем, выбери лучшую'},
  {title: 'Landing Page - полный проект', desc: 'Hero, features, pricing, form', topics: ['Landing', 'Project'], icon: '🚀', practice: 'Лендинг для AI курса: все секции, анимации'},
  {title: 'Оптимизация скорости', desc: 'PageSpeed, minify, lazy load', topics: ['Performance'], icon: '⚡', practice: 'PageSpeed Insights, попроси AI исправить проблемы'},
  {title: 'SEO основы', desc: 'Meta tags, H1-H6, alt', topics: ['SEO', 'Google'], icon: '🔍', practice: 'AI добавит все meta теги и правильную структуру'},
  {title: 'Деплой на Netlify', desc: 'Сайт в интернете за 2 мин', topics: ['Deploy', 'Netlify'], icon: '🌐', practice: 'GitHub + Netlify = онлайн сайт'},
  {title: 'Домен и HTTPS', desc: 'Свой домен mysite.com', topics: ['Domain', 'SSL'], icon: '🔒', practice: 'Подключи домен к Netlify'},
  
  // Многостраничный сайт (15)
  {title: 'Многостраничный сайт - структура', desc: '5 HTML файлов, общие стили', topics: ['Multi-page'], icon: '📁', practice: 'home, about, services, blog, contact'},
  {title: 'Шапка и навигация', desc: 'Логотип, меню, мобильный гамбургер', topics: ['Header', 'Menu'], icon: '📌', practice: 'Адаптивное меню с гамбургером на телефоне'},
  {title: 'Страница About', desc: 'Команда, миссия, достижения', topics: ['About', 'Content'], icon: '👥', practice: 'О компании: история, команда, цифры'},
  {title: 'Страница Services', desc: 'Карточки услуг с ценами', topics: ['Services', 'Cards'], icon: '💼', practice: '6 карточек, hover эффекты, модальные окна'},
  {title: 'Галерея изображений', desc: 'Lightbox, фильтры', topics: ['Gallery', 'Lightbox'], icon: '🖼️', practice: '12 картинок, фильтры по категориям'},
  {title: 'Слайдер/Карусель', desc: 'Swiper.js или AI создаст', topics: ['Slider', 'Carousel'], icon: '🎠', practice: 'Слайдер отзывов с автосменой'},
  {title: 'Аккордеон FAQ', desc: 'Вопросы сворачиваются/разворачиваются', topics: ['Accordion', 'FAQ'], icon: '❓', practice: '10 FAQ с плавной анимацией'},
  {title: 'Таймер обратного отсчёта', desc: 'До конца акции', topics: ['Timer', 'Countdown'], icon: '⏰', practice: 'Таймер дни:часы:минуты:секунды'},
  {title: 'Модальные окна', desc: 'Popup для важной информации', topics: ['Modal', 'Popup'], icon: '🪟', practice: 'Модалка при загрузке сайта, закрытие по ESC'},
  {title: 'Табы/Вкладки', desc: 'Переключение контента', topics: ['Tabs', 'Toggle'], icon: '📑', practice: 'Табы с описанием, ценами, отзывами'},
  {title: 'Прогресс бар', desc: 'Навыки, загрузка', topics: ['Progress', 'Bar'], icon: '📊', practice: 'Анимированные progress bars для навыков'},
  {title: 'Счётчики с анимацией', desc: 'Цифры увеличиваются', topics: ['Counter', 'Animation'], icon: '🔢', practice: 'Клиенты: от 0 до 1000 при скролле'},
  {title: 'Параллакс эффект', desc: 'Фон двигается медленнее', topics: ['Parallax', 'Scroll'], icon: '🎭', practice: 'Параллакс фон на hero секции'},
  {title: 'Smooth scroll', desc: 'Плавный скролл к якорям', topics: ['Scroll', 'Navigation'], icon: '🎯', practice: 'Клик на меню = плавный скролл к секции'},
  {title: 'Кастомные Scrollbars', desc: 'Красивый скроллбар', topics: ['Scrollbar', 'Style'], icon: '📜', practice: 'AI стилизует scrollbar под дизайн сайта'},
  
  // Блог (15)
  {title: 'Блог - структура', desc: 'Список статей + страница статьи', topics: ['Blog', 'Structure'], icon: '📝', practice: 'blog.html (список) + article.html (статья)'},
  {title: 'Карточки статей', desc: 'Превью, дата, автор', topics: ['Blog', 'Cards'], icon: '📰', practice: '6 карточек статей в сетке'},
  {title: 'Страница статьи', desc: 'Заголовок, текст, картинки', topics: ['Article', 'Content'], icon: '📄', practice: 'Полная статья с форматированием текста'},
  {title: 'Пагинация', desc: 'Страницы 1, 2, 3...', topics: ['Pagination'], icon: '📄', practice: 'Пагинация под статьями'},
  {title: 'Категории и теги', desc: 'Организация контента', topics: ['Categories', 'Tags'], icon: '🏷️', practice: 'Фильтр статей по категориям'},
  {title: 'Поиск по блогу', desc: 'Найди статью по ключевым словам', topics: ['Search', 'Filter'], icon: '🔎', practice: 'Поиск работает по заголовкам и тексту'},
  {title: 'Sidebar с виджетами', desc: 'Популярные статьи, категории', topics: ['Sidebar', 'Widgets'], icon: '📌', practice: 'Sidebar справа с 3 виджетами'},
  {title: 'Комментарии', desc: 'Система комментариев', topics: ['Comments', 'Users'], icon: '💬', practice: 'Форма комментариев + список комментариев'},
  {title: 'Социальный шаринг', desc: 'Поделиться в соцсетях', topics: ['Social', 'Sharing'], icon: '📱', practice: 'Кнопки Facebook, Twitter, LinkedIn'},
  {title: 'Похожие статьи', desc: 'Рекомендации внизу статьи', topics: ['Related', 'Content'], icon: '🔗', practice: '3 похожие статьи под текущей'},
  {title: 'Время чтения', desc: 'Сколько минут займёт статья', topics: ['Reading time'], icon: '⏱️', practice: 'AI посчитает время чтения'},
  {title: 'Table of Contents', desc: 'Оглавление статьи', topics: ['TOC', 'Navigation'], icon: '📑', practice: 'Автоматическое оглавление из H2-H4'},
  {title: 'Dark/Light mode', desc: 'Переключатель темы', topics: ['Theme', 'Toggle'], icon: '🌓', practice: 'Кнопка переключения, сохранение в localStorage'},
  {title: 'Подписка на newsletter', desc: 'Форма email подписки', topics: ['Newsletter', 'Email'], icon: '📧', practice: 'Форма подписки в футере'},
  {title: 'Breadcrumbs навигация', desc: 'Home > Blog > Article', topics: ['Breadcrumbs'], icon: '🍞', practice: 'Хлебные крошки для навигации'},
  
  // Интернет-магазин (15)
  {title: 'Магазин - структура', desc: 'Каталог, карточка товара, корзина', topics: ['E-commerce', 'Shop'], icon: '🛒', practice: 'catalog.html, product.html, cart.html'},
  {title: 'Каталог товаров', desc: 'Сетка товаров с ценами', topics: ['Products', 'Catalog'], icon: '🏪', practice: '12 товаров в каталоге'},
  {title: 'Карточка товара', desc: 'Фото, описание, характеристики', topics: ['Product', 'Details'], icon: '📦', practice: 'Детальная страница товара с галереей'},
  {title: 'Фильтры товаров', desc: 'По цене, категории, бренду', topics: ['Filters', 'Search'], icon: '🔍', practice: 'Sidebar с фильтрами'},
  {title: 'Сортировка', desc: 'По цене, популярности, новизне', topics: ['Sort', 'Order'], icon: '⬆️', practice: 'Dropdown сортировки'},
  {title: 'Корзина покупок', desc: 'Добавление/удаление товаров', topics: ['Cart', 'Shopping'], icon: '🛒', practice: 'Корзина с расчётом суммы'},
  {title: 'Счётчик количества', desc: 'Изменение количества товара', topics: ['Quantity', 'Counter'], icon: '🔢', practice: 'Кнопки + и - для количества'},
  {title: 'Расчёт суммы', desc: 'Автоматический подсчёт', topics: ['Total', 'Price'], icon: '💰', practice: 'Сумма обновляется при изменении'},
  {title: 'Форма оформления', desc: 'Данные покупателя', topics: ['Checkout', 'Form'], icon: '📋', practice: 'Форма с валидацией'},
  {title: 'Выбор доставки', desc: 'Варианты доставки с ценами', topics: ['Delivery', 'Shipping'], icon: '🚚', practice: 'Радиокнопки для выбора доставки'},
  {title: 'Интеграция Stripe', desc: 'Реальная оплата картой', topics: ['Stripe', 'Payment'], icon: '💳', practice: 'Подключи Stripe для платежей'},
  {title: 'Тестовые платежи', desc: 'Проверка в test mode', topics: ['Testing', 'Stripe'], icon: '🧪', practice: 'Тестовая карта 4242 4242 4242 4242'},
  {title: 'Уведомления о заказе', desc: 'Email после оплаты', topics: ['Email', 'Notifications'], icon: '📧', practice: 'Письмо с деталями заказа'},
  {title: 'Wishlist - избранное', desc: 'Сохранение понравившихся товаров', topics: ['Wishlist', 'Favorites'], icon: '❤️', practice: 'Иконка сердечка, сохранение в localStorage'},
  {title: 'Магазин - финальный проект', desc: 'Полноценный работающий магазин', topics: ['Project', 'E-commerce'], icon: '🎯', practice: 'Полный магазин с оплатой Stripe'}
];

websiteTopics.forEach((topic, idx) => {
  lessons.push({
    id: id++,
    title: `Урок ${id - 1}: ${topic.title}`,
    description: topic.desc,
    difficulty: idx < 15 ? 'beginner' : idx < 30 ? 'intermediate' : 'advanced',
    topics: topic.topics,
    category: 'Websites',
    icon: topic.icon,
    block_name: 'Модуль 1: Сайты с AI',
    practice: true,
    practice_description: topic.practice,
    is_free: false
  });
});

// МОДУЛЬ 2: МОБИЛЬНЫЕ ПРИЛОЖЕНИЯ (50 уроков, 65-114)
const mobileTopics = [
  {title: 'React Native - что это', desc: 'Одно приложение для iOS и Android', icon: '📱'},
  {title: 'Установка и настройка', desc: 'Node.js, Expo, первый запуск', icon: '⚙️'},
  {title: 'Первый экран', desc: 'View, Text, Button', icon: '📄'},
  {title: 'Навигация между экранами', desc: 'React Navigation', icon: '🧭'},
  {title: 'Списки - FlatList', desc: 'Отображение массива данных', icon: '📋'},
  {title: 'Формы ввода', desc: 'TextInput, валидация', icon: '✍️'},
  {title: 'Стилизация - StyleSheet', desc: 'Flexbox в React Native', icon: '🎨'},
  {title: 'Иконки и изображения', desc: 'Expo Icons, Image', icon: '🖼️'},
  {title: 'AsyncStorage', desc: 'Сохранение данных локально', icon: '💾'},
  {title: 'TODO приложение', desc: 'Проект: список дел', icon: '✅'},
  // ... продолжение мобильных уроков (всего 50)
];

for(let i = 0; i < 50; i++) {
  const topic = mobileTopics[i] || {title: `Мобильный урок ${i+1}`, desc: 'Практика React Native', icon: '📱'};
  lessons.push({
    id: id++,
    title: `Урок ${id - 1}: ${topic.title}`,
    description: topic.desc,
    difficulty: i < 15 ? 'beginner' : i < 35 ? 'intermediate' : 'advanced',
    topics: ['React Native', 'Mobile'],
    category: 'Mobile Apps',
    icon: topic.icon,
    block_name: 'Модуль 2: Мобильные приложения',
    practice: true,
    practice_description: 'Практическое задание с AI',
    is_free: false
  });
}

// МОДУЛЬ 3: ИГРЫ (50 уроков, 115-164)
for(let i = 0; i < 50; i++) {
  lessons.push({
    id: id++,
    title: `Урок ${id - 1}: Игра урок ${i + 1}`,
    description: i < 25 ? '2D игры с AI' : '3D игры с Three.js',
    difficulty: i < 20 ? 'intermediate' : 'advanced',
    topics: ['Games', i < 25 ? '2D' : '3D'],
    category: 'Games',
    icon: '🎮',
    block_name: 'Модуль 3: Создание игр',
    practice: true,
    practice_description: 'Создай игру с помощью AI',
    is_free: false
  });
}

// МОДУЛЬ 4: АВТОМАТИЗАЦИЯ И БОТЫ (30 уроков, 165-194)
for(let i = 0; i < 30; i++) {
  lessons.push({
    id: id++,
    title: `Урок ${id - 1}: ${i < 15 ? 'Telegram бот' : 'Автоматизация'} урок ${(i % 15) + 1}`,
    description: i < 15 ? 'Создание Telegram ботов с AI' : 'Автоматизация рутинных задач',
    difficulty: 'intermediate',
    topics: [i < 15 ? 'Telegram' : 'Automation', 'Bots'],
    category: 'Automation',
    icon: '🤖',
    block_name: 'Модуль 4: Боты и автоматизация',
    practice: true,
    practice_description: 'Создай бота или автоматизацию',
    is_free: false
  });
}

// МОДУЛЬ 5: РЕАЛЬНЫЕ ПРОЕКТЫ (17 уроков, 195-211)
for(let i = 0; i < 17; i++) {
  lessons.push({
    id: id++,
    title: `Урок ${id - 1}: ${i < 10 ? 'SaaS проект' : 'Запуск бизнеса'} урок ${(i % 10) + 1}`,
    description: i < 10 ? 'Создание SaaS платформы' : 'От идеи до запуска и монетизации',
    difficulty: 'advanced',
    topics: [i < 10 ? 'SaaS' : 'Business', 'Project'],
    category: 'Real Projects',
    icon: '🚀',
    block_name: 'Модуль 5: Реальные проекты',
    practice: true,
    practice_description: 'Полноценный проект от начала до конца',
    is_free: false
  });
}

// Генерация SQL
console.log(`-- GENERATED SQL: ${lessons.length} LESSONS\n`);
console.log('INSERT INTO public.courses (title, description, difficulty, topics, category, icon, block_name, practice, practice_description, is_free, display_order) VALUES');

lessons.forEach((lesson, idx) => {
  const practiceDesc = lesson.practice_description ? `'${lesson.practice_description.replace(/'/g, "''")}'` : 'NULL';
  const sql = `('${lesson.title.replace(/'/g, "''")}', '${lesson.description.replace(/'/g, "''")}', '${lesson.difficulty}', ARRAY[${lesson.topics.map(t => `'${t}'`).join(', ')}], '${lesson.category}', '${lesson.icon}', '${lesson.block_name}', ${lesson.practice}, ${practiceDesc}, ${lesson.is_free}, ${lesson.id})`;
  
  if (idx === lessons.length - 1) {
    console.log(sql + ';');
  } else {
    console.log(sql + ',');
  }
});

console.log(`\n-- Total lessons: ${lessons.length}`);
