const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const startScreen = document.getElementById('start-screen');
const chaptersScreen = document.getElementById('chapters-screen');
const mainButton = document.getElementById('main-button');

// Переход от приветствия к главам
mainButton.addEventListener('click', () => {
    tg.HapticFeedback.impactOccurred('medium'); // Вибрация
    startScreen.style.display = 'none';
    chaptersScreen.style.display = 'flex';
});

// Функция запуска главы
function startChapter(number) {
    tg.HapticFeedback.notificationOccurred('success');
    tg.showAlert("Загрузка Главы " + number + "... 💞");
}