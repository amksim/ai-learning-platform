# 🔄 СБРОС ДЛЯ ТЕСТИРОВАНИЯ

## Открой консоль браузера и вставь эту команду:

```javascript
// Полный сброс для тестирования
localStorage.clear();
location.reload();
```

## Или только сброс оплаты:

```javascript
// Получаем пользователя
let user = JSON.parse(localStorage.getItem('user') || '{}');

// Сбрасываем оплату
user.hasPaid = false;
user.progress = 0; // Сброс прогресса

// Сохраняем
localStorage.setItem('user', JSON.stringify(user));

// Удаляем покупку
localStorage.removeItem('purchase');

// Перезагружаем
location.reload();
```

## Или только сброс прогресса (сохранив оплату):

```javascript
// Получаем пользователя
let user = JSON.parse(localStorage.getItem('user') || '{}');

// Сбрасываем только прогресс
user.progress = 0;

// Сохраняем
localStorage.setItem('user', JSON.stringify(user));

// Перезагружаем
location.reload();
```

---

## ✅ ПРОВЕРКА ТЕКУЩЕГО СОСТОЯНИЯ:

```javascript
// Проверить текущие данные
console.log('User:', JSON.parse(localStorage.getItem('user') || '{}'));
console.log('Purchase:', JSON.parse(localStorage.getItem('purchase') || '{}'));
console.log('Levels:', JSON.parse(localStorage.getItem('courseLevels') || '[]').slice(0, 5));
```

---

## 🧪 ДЛЯ ПРОВЕРКИ ТАБЛИЧКИ С ОПЛАТОЙ:

1. Открой консоль (Cmd+Option+J)
2. Вставь:
```javascript
localStorage.clear();
location.href = '/login';
```
3. Зарегистрируйся с Kmak4551@gmail.com
4. Пройди первые 3 урока
5. Вернись на /courses
6. Табличка должна появиться после 3-го урока!
