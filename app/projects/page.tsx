"use client";

import { Code, Smartphone, Gamepad2, Trophy, ExternalLink, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/Card";

interface Project {
  id: number;
  title: string;
  author: string;
  description: string;
  category: "websites" | "apps" | "games";
  image: string;
  score: number;
  link: string;
  gradient: string;
}

// ✨ 13 ПРЕМИУМ ПРОЕКТОВ - ЛУЧШИЕ ИЗ ЛУЧШИХ
const projects: Project[] = [
  {
    id: 1,
    title: "Тетрис HTML5",
    author: "Александр К.",
    description: "Классическая игра с рекордами, написана на чистом JavaScript",
    category: "games",
    image: "🟦",
    score: 95,
    link: "https://tetris.com/play-tetris",
  },
  {
    id: 2,
    title: "Погодное приложение",
    author: "Сергей К.",
    description: "Прогноз погоды с OpenWeather API и анимациями",
    category: "apps",
    image: "☁️",
    score: 88,
    link: "https://weather.com",
  },
  {
    id: 3,
    title: "Портфолио веб-дизайнера",
    author: "София Д.",
    description: "Минималистичное портфолио с плавными переходами",
    category: "websites",
    image: "💼",
    score: 92,
    link: "https://brittanychiang.com",
  },
  {
    id: 4,
    title: "Змейка в браузере",
    author: "Максим П.",
    description: "Ретро-игра с таблицей лидеров и разными уровнями",
    category: "games",
    image: "🐍",
    score: 85,
    link: "https://playsnake.org",
  },
  {
    id: 5,
    title: "Калькулятор Pro",
    author: "Ольга Р.",
    description: "Научный калькулятор с историей вычислений",
    category: "apps",
    image: "🔢",
    score: 90,
    link: "https://calculator-app.vercel.app",
  },
  {
    id: 6,
    title: "Сайт кафе-кондитерской",
    author: "Татьяна П.",
    description: "Яркий сайт с меню десертов и онлайн-заказом",
    category: "websites",
    image: "🧁",
    score: 88,
    link: "https://demo.wplook.com/food-restaurant",
  },
  {
    id: 7,
    title: "2048 головоломка",
    author: "Дмитрий В.",
    description: "Аддиктивная игра с числами, попробуй набрать 2048!",
    category: "games",
    image: "2️⃣",
    score: 85,
    link: "https://play2048.co",
  },
  {
    id: 8,
    title: "Todo List App",
    author: "Виктория З.",
    description: "Приложение для задач с категориями и дедлайнами",
    category: "apps",
    image: "✅",
    score: 82,
    link: "https://todomvc.com/examples/react",
  },
  {
    id: 9,
    title: "Интернет-магазин одежды",
    author: "Екатерина Н.",
    description: "Современный магазин с фильтрами и корзиной",
    category: "websites",
    image: "👕",
    score: 90,
    link: "https://react-shopping-cart-67954.firebaseapp.com",
  },
  {
    id: 10,
    title: "Pac-Man онлайн",
    author: "Анна М.",
    description: "Легендарная аркада с призраками и бонусами",
    category: "games",
    image: "👻",
    score: 92,
    link: "https://freepacman.org",
  },
  {
    id: 11,
    title: "Музыкальный плеер",
    author: "Павел Б.",
    description: "Красивый плеер с визуализацией и плейлистами",
    category: "apps",
    image: "🎵",
    score: 88,
    link: "https://music-player-demo.surge.sh",
  },
  {
    id: 12,
    title: "Лендинг стартапа",
    author: "Кирилл М.",
    description: "Стильная посадочная страница с формой подписки",
    category: "websites",
    image: "🚀",
    score: 85,
    link: "https://cruip.com/demos/solid",
  },
  {
    id: 13,
    title: "Flappy Bird",
    author: "Мария Л.",
    description: "Сложная игра про летающую птичку",
    category: "games",
    image: "🐦",
    score: 82,
    link: "https://flappybird.io",
  },
  {
    id: 14,
    title: "Таймер Pomodoro",
    author: "Андрей Г.",
    description: "Помощник для продуктивной работы 25/5",
    category: "apps",
    image: "⏰",
    score: 90,
    link: "https://pomofocus.io",
  },
  {
    id: 15,
    title: "Блог о путешествиях",
    author: "Алексей Ш.",
    description: "Личный блог с картой стран и фотогалереей",
    category: "websites",
    image: "🌍",
    score: 85,
    link: "https://nomadlist.com",
  },
  {
    id: 16,
    title: "Судоку онлайн",
    author: "Елена С.",
    description: "Классическая японская головоломка с подсказками",
    category: "games",
    image: "🔵",
    score: 85,
    link: "https://sudoku.com",
  },
  {
    id: 17,
    title: "Трекер финансов",
    author: "Николай Ф.",
    description: "Учёт расходов и доходов с графиками",
    category: "apps",
    image: "💸",
    score: 82,
    link: "https://expense-tracker-app.netlify.app",
  },
  {
    id: 18,
    title: "Портфолио фотографа",
    author: "Роман Ф.",
    description: "Галерея работ с лайтбоксом и категориями",
    category: "websites",
    image: "📷",
    score: 85,
    link: "https://www.awwwards.com/sites/photography-portfolio",
  },
  {
    id: 19,
    title: "Шахматы онлайн",
    author: "Игорь Н.",
    description: "Классические шахматы с ботом и мультиплеером",
    category: "games",
    image: "♟️",
    score: 92,
    link: "https://lichess.org",
  },
  {
    id: 20,
    title: "Конвертер валют",
    author: "Юлия Т.",
    description: "Актуальные курсы валют с историей",
    category: "apps",
    image: "💱",
    score: 90,
    link: "https://www.xe.com",
  },
  {
    id: 21,
    title: "Сайт путешествий",
    author: "Марина С.",
    description: "Туристический портал с поиском туров и отелей",
    category: "websites",
    image: "✈️",
    score: 88,
    link: "https://travel-site-demo.netlify.app",
  },
  {
    id: 22,
    title: "Игра Memory Cards",
    author: "Дарья Л.",
    description: "Тренировка памяти с красивыми карточками и таймером",
    category: "games",
    image: "",
    score: 85,
    link: "https://www.coolmathgames.com",
  },
  {
    id: 23,
    title: "Генератор паролей",
    author: "Владимир С.",
    description: "Создание надёжных паролей с настройками сложности",
    category: "apps",
    image: "",
    score: 82,
    link: "https://www.lastpass.com/password-generator",
  },
  {
    id: 24,
    title: "Сайт кофейни",
    author: "Ирина К.",
    description: "Уютный сайт с меню напитков и бронированием столиков",
    category: "websites",
    image: "",
    score: 90,
    link: "https://starbucks.com",
  },
  {
    id: 25,
    title: "Typing Speed Test",
    author: "Артём Ж.",
    description: "Проверка скорости печати с разными текстами",
    category: "games",
    image: "",
    score: 85,
    link: "https://typing-speed-test.com",
  },
  {
    id: 26,
    title: "BMI калькулятор",
    author: "Светлана Б.",
    description: "Расчёт индекса массы тела с рекомендациями",
    category: "apps",
    image: "",
    score: 88,
    link: "https://www.calculator.net/bmi-calculator.html",
  },
  {
    id: 27,
    title: "Портал новостей",
    author: "Михаил Р.",
    description: "Новостной сайт с категориями и поиском статей",
    category: "websites",
    image: "",
    score: 90,
    link: "https://www.google.com/maps",
  },
  {
    id: 28,
    title: "Викторина триvia",
    author: "Алина Т.",
    description: "Викторина с вопросами по разным темам и рейтингом",
    category: "games",
    image: "",
    score: 84,
    link: "https://www.spotify.com",
  },
  {
    id: 29,
    title: "Рисовалка онлайн",
    author: "Олег П.",
    description: "Графический редактор с кистями и слоями",
    category: "apps",
    image: "",
    score: 85,
    link: "https://excalidraw.com",
  },
  {
    id: 30,
    title: "Сайт спортзала",
    author: "Денис Х.",
    description: "Лендинг фитнес-центра с расписанием и ценами",
    category: "websites",
    image: "",
    score: 82,
    link: "https://gym-website-demo.netlify.app",
  },
  {
    id: 31,
    title: "Соку бан головоломка",
    author: "Вера Д.",
    description: "Японская игра-головоломка с ящиками",
    category: "games",
    image: "",
    score: 85,
    link: "https://sokoban.info",
  },
  {
    id: 32,
    title: "Заметки с Markdown",
    author: "Станислав Г.",
    description: "Приложение для заметок с форматированием",
    category: "apps",
    image: "",
    score: 90,
    link: "https://notes-app-markdown.vercel.app",
  },
  {
    id: 33,
    title: "Портфолио разработчика",
    author: "Егор Б.",
    description: "Личный сайт с проектами и контактами",
    category: "websites",
    image: "",
    score: 88,
    link: "https://developer-portfolio-theta.vercel.app",
  },
  {
    id: 34,
    title: "Игра Hangman",
    author: "Карина Ю.",
    description: "Угадывание слов с подсказками и уровнями",
    category: "games",
    image: "",
    score: 85,
    link: "https://hangmanwordgame.com",
  },
  {
    id: 35,
    title: "Конвертер единиц",
    author: "Борис З.",
    description: "Перевод метрических величин и валют",
    category: "apps",
    image: "",
    score: 82,
    link: "https://www.unitconverters.net",
  },
  {
    id: 36,
    title: "Сайт недвижимости",
    author: "Людмила А.",
    description: "Каталог квартир с фильтрами и картой",
    category: "websites",
    image: "",
    score: 90,
    link: "https://www.zillow.com",
  },
  {
    id: 37,
    title: "Пятнашки слайдер",
    author: "Антон Ч.",
    description: "Классическая головоломка 15 с таймером",
    category: "games",
    image: "",
    score: 85,
    link: "https://fifteen-puzzle-game.netlify.app",
  },
  {
    id: 38,
    title: "QR-код генератор",
    author: "Марианна В.",
    description: "Создание QR-кодов для ссылок и текста",
    category: "apps",
    image: "",
    score: 88,
    link: "https://www.qr-code-generator.com",
  },
  {
    id: 39,
    title: "Блог о технологиях",
    author: "Константин Л.",
    description: "Статьи о программировании и новостях IT",
    category: "websites",
    image: "",
    score: 90,
    link: "https://tech-blog-nextjs.vercel.app",
  },
  {
    id: 40,
    title: "Игра Wordle",
    author: "Полина Е.",
    description: "Популярная игра угадывания слов за 6 попыток",
    category: "games",
    image: "",
    score: 92,
    link: "https://wordlegame.org",
  },
  {
    id: 41,
    title: "Планировщик задач",
    author: "Руслан Н.",
    description: "Канбан-доска с drag-and-drop и приоритетами",
    category: "apps",
    image: "",
    score: 86,
    link: "https://trello.com",
  },
  {
    id: 42,
    title: "Сайт юридической фирмы",
    author: "Валентина И.",
    description: "Корпоративный сайт с услугами и консультациями",
    category: "websites",
    image: "",
    score: 82,
    link: "https://www.law.com",
  },
  {
    id: 43,
    title: "Кроссворд онлайн",
    author: "Георгий Ф.",
    description: "Интерактивный кроссворд с подсказками",
    category: "games",
    image: "",
    score: 82,
    link: "https://www.theguardian.com/crosswords",
  },
  {
    id: 44,
    title: "Трекер привычек",
    author: "Анастасия М.",
    description: "Формирование полезных привычек с графиками",
    category: "apps",
    image: "",
    score: 90,
    link: "https://www.habitica.com",
  },
  {
    id: 45,
    title: "Интернет-магазин книг",
    author: "Тимофей Я.",
    description: "Онлайн-книжный с обзорами и рецензиями",
    category: "websites",
    image: "📚",
    score: 93,
    link: "https://www.amazon.com/books",
  },
  {
    id: 46,
    title: "Найди пару картинок",
    author: "Яна О.",
    description: "Игра на внимание с разными уровнями сложности",
    category: "games",
    image: "🖼️",
    score: 84,
    link: "https://www.memozor.com/memory-game",
  },
  {
    id: 47,
    title: "Калькулятор чаевых",
    author: "Захар У.",
    description: "Расчёт чаевых и разделение счёта",
    category: "apps",
    image: "💵",
    score: 87,
    link: "https://www.calculator.net/tip-calculator.html",
  },
  {
    id: 48,
    title: "Игра Морской бой",
    author: "Сергей Т.",
    description: "Классическая морская битва с компьютером",
    category: "games",
    image: "⚓",
    score: 89,
    link: "https://www.battleshiponline.com",
  },
  {
    id: 49,
    title: "Трекер времени",
    author: "Оксана К.",
    description: "Учёт рабочего времени с категориями задач",
    category: "apps",
    image: "⏰",
    score: 86,
    link: "https://toggl.com",
  },
  {
    id: 50,
    title: "Сайт SPA-салона",
    author: "Наталья П.",
    description: "Элегантный сайт с услугами и онлайн-записью",
    category: "websites",
    image: "💆",
    score: 84,
    link: "https://www.massagenv.com",
  },
  {
    id: 51,
    title: "Игра Танчики 1990",
    author: "Дмитрий Л.",
    description: "Ретро-аркада с уровнями и бонусами",
    category: "games",
    image: "🎯",
    score: 85,
    link: "https://tanki-online.com",
  },
  {
    id: 52,
    title: "Генератор цитат",
    author: "Елена В.",
    description: "Вдохновляющие цитаты с категориями",
    category: "apps",
    image: "💭",
    score: 87,
    link: "https://www.brainyquote.com",
  },
  {
    id: 53,
    title: "Сайт автосервиса",
    author: "Виктор М.",
    description: "Сервис с прайсом и онлайн-записью",
    category: "websites",
    image: "🔧",
    score: 82,
    link: "https://auto-service-website.netlify.app",
  },
  {
    id: 54,
    title: "Игра Крестики-нолики",
    author: "Андрей С.",
    description: "Классика с разными размерами поля",
    category: "games",
    image: "⭕",
    score: 83,
    link: "https://tic-tac-toe-game-js.netlify.app",
  },
  {
    id: 55,
    title: "Калькулятор калорий",
    author: "Марина Н.",
    description: "Подсчёт БЖУ и калорийности продуктов",
    category: "apps",
    image: "🥗",
    score: 86,
    link: "https://calorie-calculator-app.vercel.app",
  },
  {
    id: 56,
    title: "Портфолио фотографа",
    author: "Павел Р.",
    description: "Галерея работ с фильтрами и слайдером",
    category: "websites",
    image: "📸",
    score: 84,
    link: "https://photographer-portfolio.netlify.app",
  },
  {
    id: 57,
    title: "Игра Пазлы",
    author: "Ирина Д.",
    description: "Сборка картинок с разными уровнями",
    category: "games",
    image: "🧩",
    score: 82,
    link: "https://puzzle-game-js.netlify.app",
  },
  {
    id: 58,
    title: "Список покупок",
    author: "Алексей Ж.",
    description: "Шопинг-лист с категориями и чеками",
    category: "apps",
    image: "🛍️",
    score: 85,
    link: "https://shopping-list-app.vercel.app",
  },
  {
    id: 59,
    title: "Сайт ресторана",
    author: "Светлана Б.",
    description: "Меню с ценами и системой бронирования",
    category: "websites",
    image: "🍴",
    score: 87,
    link: "https://restaurant-website-demo.netlify.app",
  },
  {
    id: 60,
    title: "Игра Бильярд",
    author: "Михаил К.",
    description: "Пул с физикой и разными режимами",
    category: "games",
    image: "🎱",
    score: 83,
    link: "https://pool-billiards-game.netlify.app",
  },
  {
    id: 61,
    title: "Трекер воды",
    author: "Татьяна Г.",
    description: "Контроль потребления воды в день",
    category: "apps",
    image: "💧",
    score: 84,
    link: "https://water-tracker-app.vercel.app",
  },
  {
    id: 62,
    title: "Сайт клиники",
    author: "Владимир Ф.",
    description: "Медицинский центр с врачами и услугами",
    category: "websites",
    image: "🏥",
    score: 86,
    link: "https://medical-clinic-website.netlify.app",
  },
  {
    id: 63,
    title: "Игра Дартс",
    author: "Олег Х.",
    description: "Метание дротиков с подсчётом очков",
    category: "games",
    image: "🎯",
    score: 81,
    link: "https://darts-game-js.netlify.app",
  },
  {
    id: 64,
    title: "Планировщик бюджета",
    author: "Юлия Ц.",
    description: "Финансовое планирование с категориями",
    category: "apps",
    image: "💼",
    score: 88,
    link: "https://budget-planner-app.vercel.app",
  },
  {
    id: 65,
    title: "Сайт отеля",
    author: "Николай Ш.",
    description: "Гостиница с номерами и системой бронирования",
    category: "websites",
    image: "🏨",
    score: 85,
    link: "https://hotel-website-demo.netlify.app",
  },
  {
    id: 66,
    title: "Игра Боулинг",
    author: "Елена Щ.",
    description: "Кегли с реалистичной физикой",
    category: "games",
    image: "🎳",
    score: 82,
    link: "https://bowling-game-js.netlify.app",
  },
  {
    id: 67,
    title: "Менеджер паролей",
    author: "Дмитрий Э.",
    description: "Хранение и управление паролями",
    category: "apps",
    image: "🔑",
    score: 89,
    link: "https://password-manager-app.vercel.app",
  },
  {
    id: 68,
    title: "Сайт агентства",
    author: "Анна Ю.",
    description: "Веб-студия с портфолио и услугами",
    category: "websites",
    image: "🎨",
    score: 86,
    link: "https://web-agency-website.netlify.app",
  },
  {
    id: 69,
    title: "Игра Гонки",
    author: "Сергей Я.",
    description: "Соревнования на скорость с трассами",
    category: "games",
    image: "🏎️",
    score: 84,
    link: "https://racing-game-js.netlify.app",
  },
  {
    id: 70,
    title: "Калькулятор любви",
    author: "Мария П.",
    description: "Совместимость имён с забавными результатами",
    category: "apps",
    image: "💕",
    score: 79,
    link: "https://love-calculator-app.vercel.app",
  },
  {
    id: 71,
    title: "Сайт школы",
    author: "Иван А.",
    description: "Образовательный центр с курсами и учителями",
    category: "websites",
    image: "🎓",
    score: 87,
    link: "https://school-website-demo.netlify.app",
  },
  {
    id: 72,
    title: "Игра Шашки",
    author: "Ольга Б.",
    description: "Классические шашки с ботом",
    category: "games",
    image: "⚫",
    score: 83,
    link: "https://checkers-game-js.netlify.app",
  },
  {
    id: 73,
    title: "Генератор мемов",
    author: "Антон В.",
    description: "Создание мемов с текстом и шаблонами",
    category: "apps",
    image: "😂",
    score: 80,
    link: "https://meme-generator-app.vercel.app",
  },
  {
    id: 74,
    title: "Сайт магазина",
    author: "Татьяна Г.",
    description: "Интернет-магазин с каталогом товаров",
    category: "websites",
    image: "🛒",
    score: 88,
    link: "https://online-store-website.netlify.app",
  },
  {
    id: 75,
    title: "Игра Пинг-понг",
    author: "Михаил Д.",
    description: "Теннис с управлением и уровнями",
    category: "games",
    image: "🏓",
    score: 82,
    link: "https://ping-pong-game-js.netlify.app",
  },
  {
    id: 76,
    title: "Трекер настроения",
    author: "Светлана Ж.",
    description: "Дневник эмоций с графиками",
    category: "apps",
    image: "😊",
    score: 81,
    link: "https://mood-tracker-app.vercel.app",
  },
  {
    id: 77,
    title: "Сайт банка",
    author: "Виктор З.",
    description: "Финансовая организация с услугами",
    category: "websites",
    image: "🏦",
    score: 90,
    link: "https://bank-website-demo.netlify.app",
  },
  {
    id: 78,
    title: "Игра Теннис",
    author: "Елена И.",
    description: "Большой теннис с турнирами",
    category: "games",
    image: "🎾",
    score: 83,
    link: "https://tennis-game-js.netlify.app",
  },
  {
    id: 79,
    title: "Конвертер текста",
    author: "Дмитрий К.",
    description: "Преобразование текста в разные форматы",
    category: "apps",
    image: "📄",
    score: 78,
    link: "https://text-converter-app.vercel.app",
  },
  {
    id: 80,
    title: "Сайт страховой",
    author: "Наталья Л.",
    description: "Страховая компания с полисами",
    category: "websites",
    image: "🛡️",
    score: 86,
    link: "https://insurance-website-demo.netlify.app",
  },
  {
    id: 81,
    title: "Игра Волейбол",
    author: "Андрей М.",
    description: "Пляжный волейбол с геймплеем",
    category: "games",
    image: "🏐",
    score: 82,
    link: "https://volleyball-game-js.netlify.app",
  },
  {
    id: 82,
    title: "Генератор QR-кодов",
    author: "Оксана Н.",
    description: "Создание QR для WiFi и контактов",
    category: "apps",
    image: "📱",
    score: 85,
    link: "https://qr-code-generator-pro.vercel.app",
  },
  {
    id: 83,
    title: "Сайт театра",
    author: "Павел О.",
    description: "Театральная афиша с билетами",
    category: "websites",
    image: "🎭",
    score: 84,
    link: "https://theater-website-demo.netlify.app",
  },
  {
    id: 84,
    title: "Игра Баскетбол",
    author: "Ирина П.",
    description: "Стрельба по кольцу с очками",
    category: "games",
    image: "🏀",
    score: 81,
    link: "https://basketball-game-js.netlify.app",
  },
  {
    id: 85,
    title: "Калькулятор возраста",
    author: "Сергей Р.",
    description: "Точный расчёт возраста в днях",
    category: "apps",
    image: "🎂",
    score: 77,
    link: "https://age-calculator-app.vercel.app",
  },
  {
    id: 86,
    title: "Сайт музея",
    author: "Елена С.",
    description: "Художественная галерея с экспонатами",
    category: "websites",
    image: "🖼️",
    score: 85,
    link: "https://museum-website-demo.netlify.app",
  },
  {
    id: 87,
    title: "Игра Футбол",
    author: "Михаил Т.",
    description: "Футбольные матчи с командами",
    category: "games",
    image: "⚽",
    score: 84,
    link: "https://football-game-js.netlify.app",
  },
];

export default function ProjectsPage() {
  const { t } = useLanguage();
  const [showMore, setShowMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadMore = () => {
    setIsLoading(true);
    // Показываем дополнительные проекты через 1 секунду
    setTimeout(() => {
      setShowMore(true);
      setIsLoading(false);
    }, 1000);
  };

  const allProjectsToShow = projects;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "websites":
        return Code;
      case "apps":
        return Smartphone;
      case "games":
        return Gamepad2;
      default:
        return Code;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "websites":
        return "Сайт";
      case "apps":
        return "Приложение";
      case "games":
        return "Игра";
      default:
        return category;
    }
  };

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            {t.home.projects_title}
          </h1>
          <p className="text-lg text-muted-foreground">
            Вдохновляйся работами других учеников и делись своими проектами
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:gap-8 md:grid-cols-3">
          {allProjectsToShow.map((project) => {
            const CategoryIcon = getCategoryIcon(project.category);
            // Устанавливаем эмодзи по умолчанию если нет
            const emoji = project.image || (
              project.category === "games" ? "🎮" :
              project.category === "apps" ? "📱" :
              "🌐"
            );
            
            return (
              <a 
                key={project.id}
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Card className="group h-full glass premium-shadow border-2 border-purple-100 hover:border-purple-300 transition-all duration-300 hover:scale-105 overflow-hidden cursor-pointer">
                  {/* Большой эмодзи с градиентным фоном */}
                  <div className="relative h-32 sm:h-40 md:h-48 flex items-center justify-center bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 group-hover:from-purple-200 group-hover:via-pink-200 group-hover:to-blue-200 transition-all">
                    <div className="text-5xl sm:text-6xl md:text-8xl transform group-hover:scale-110 transition-transform duration-300">
                      {emoji}
                    </div>
                    {/* Бейдж категории */}
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/80 backdrop-blur-sm text-xs font-semibold text-purple-600 shadow-lg flex items-center gap-1.5">
                      <CategoryIcon className="h-3 w-3" />
                      {getCategoryLabel(project.category)}
                    </div>
                  </div>
                  
                  <CardContent className="p-3 sm:p-4 md:p-6">
                    <h3 className="text-sm sm:text-base md:text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
                      {project.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 mb-2">от {project.author}</p>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                      {project.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-xs font-semibold">
                        <Trophy className="h-3 w-3" />
                        <span>{project.score}/100</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </a>
            );
          })}
        </div>

        {/* Load More Button - скрываем после загрузки */}
        {!showMore && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleLoadMore}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg font-bold transition-all premium-shadow hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Загрузка...</span>
                </>
              ) : (
                <>
                  <span>Ещё</span>
                  <span className="text-xl">↓</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* CTA */}
        <Card className="mt-12 glass border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-pink-500/5 premium-shadow">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Создай свой проект!
            </h2>
            <p className="max-w-xl text-gray-300 text-sm">
              Начни обучение сегодня и скоро твой проект тоже будет здесь
            </p>
            <a href="/courses">
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-lg font-bold transition-all premium-shadow">
                Начать обучение
              </button>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
