#!/bin/bash

# 🚀 AI Learning Platform - Git Setup & Deployment

echo "🔧 Настройка Git..."

# 1. Инициализация Git (если ещё не сделано)
git init

# 2. Добавь все файлы
git add .

# 3. Первый коммит
git commit -m "🎉 AI Learning Platform - Ready for production

Features:
- 220 AI programming lessons
- Stripe payment integration
- Multi-language support (25 languages)
- Admin panel
- Mobile responsive design
- Real-time payment verification"

# 4. Переименуй ветку в main
git branch -M main

# 5. ЗАМЕНИ ЭТОТ URL НА ТВОЙ!
# Получи URL после создания репозитория на github.com/new
# Формат: https://github.com/твой-username/ai-learning-platform.git
echo ""
echo "⚠️  ВАЖНО: Замени URL в следующей команде на свой!"
echo "Твой URL будет выглядеть так: https://github.com/USERNAME/ai-learning-platform.git"
echo ""
read -p "Введи URL твоего репозитория: " REPO_URL

# 6. Добавь remote
git remote add origin "$REPO_URL"

# 7. Запушь код
git push -u origin main

echo ""
echo "✅ Код успешно загружен на GitHub!"
echo ""
echo "🚀 Теперь переходи к деплою на Vercel:"
echo "1. Зайди на https://vercel.com"
echo "2. Нажми 'New Project'"
echo "3. Выбери свой репозиторий 'ai-learning-platform'"
echo "4. Нажми 'Deploy'"
echo ""
echo "Готово! 🎉"
