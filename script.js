const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const startScreen    = document.getElementById('start-screen');
const chaptersScreen = document.getElementById('chapters-screen');
const sceneScreen    = document.getElementById('scene-screen');
const mainButton     = document.getElementById('main-button');
const dialogueText   = document.getElementById('dialogue-text');
const speakerName    = document.getElementById('speaker-name');     // если используешь
const nextBtn        = document.getElementById('next-btn');
const prevBtn        = document.getElementById('prev-btn');         // должна быть в HTML
const sceneBg        = document.getElementById('scene-bg');
const sceneChar      = document.getElementById('scene-character');

let currentSceneIndex = 0;
let currentChapterScenes = [];  // будем заполнять при запуске главы

// Переход от стартового экрана к выбору глав
mainButton.addEventListener('click', () => {
    tg.HapticFeedback.impactOccurred('medium');
    startScreen.style.display = 'none';
    chaptersScreen.style.display = 'flex';
});

// Функция запуска главы
function startChapter(number) {
    if (number !== 1) {
        tg.showAlert("Пока только первая глава готова 😘");
        return;
    }

    tg.HapticFeedback.notificationOccurred('success');

    // Прячем меню глав, показываем сцену
    chaptersScreen.style.display = 'none';
    sceneScreen.style.display = 'flex';

    // Устанавливаем массив сцен для текущей главы
    currentChapterScenes = chapter1Scenes;
    currentSceneIndex = 0;

    showScene(currentSceneIndex);
}

// Главная функция отображения сцены
function showScene(index) {
    const scene = currentChapterScenes[index];

    if (!scene) {
        tg.showAlert("Конец первой главы… пока что 💋");
        sceneScreen.style.display = 'none';
        chaptersScreen.style.display = 'flex';
        currentSceneIndex = 0;
        return;
    }

    // Фон
    sceneBg.style.backgroundImage = `url(${scene.background})`;

    // Персонаж
    if (scene.character) {
        sceneChar.src = scene.character;
        sceneChar.style.display = 'block';
    } else {
        sceneChar.style.display = 'none';
    }

    const dialogueBox = document.querySelector('.dialogue-box');

    // Текст / без текста
    if (scene.noText || !scene.text || scene.text.trim() === '') {
        dialogueBox.style.display = 'none';
        if (speakerName) speakerName.innerText = '';
        
        // Если хочешь авто-переход — оставь, если нет — удали этот if
        if (scene.duration) {
            setTimeout(() => {
                tg.HapticFeedback.impactOccurred('light');
                goToNextScene();
            }, scene.duration);
        }
    } else {
        dialogueBox.style.display = 'block';

        if (speakerName) {
            speakerName.innerText = scene.speaker?.trim() || '';
        }

        dialogueText.innerText = scene.text;
        dialogueText.style.opacity = 0;
        setTimeout(() => {
            dialogueText.style.opacity = 1;
        }, 150);
    }

    // Кнопки ВСЕГДА видны (кроме "назад" на первой сцене)
    nextBtn.style.display = 'block';
    prevBtn.style.display = (index === 0) ? 'none' : 'block';

    // Опционально: на последней сцене меняем кнопку "вперёд" на "Завершить"
    // if (index === currentChapterScenes.length - 1) {
    //     nextBtn.innerHTML = 'Завершить';
    // } else {
    //     nextBtn.innerHTML = '→';
    // }
}
// ─── Навигация ───
function goToNextScene() {
    currentSceneIndex++;
    showScene(currentSceneIndex);
}

function goToPreviousScene() {
    if (currentSceneIndex > 0) {
        currentSceneIndex--;
        showScene(currentSceneIndex);
    } else {
        // опционально: лёгкая вибрация, что дальше нельзя
        tg.HapticFeedback.notificationOccurred('warning');
    }
}

// Привязываем кнопки
nextBtn.addEventListener('click', () => {
    tg.HapticFeedback.impactOccurred('light');
    goToNextScene();
});

if (prevBtn) {
    prevBtn.addEventListener('click', () => {
        tg.HapticFeedback.impactOccurred('light');
        goToPreviousScene();
    });
}

// Массив сцен (оставил твой, только убрал лишние повторы)
const chapter1Scenes = [
    {
        background: "materials/vuz.jpg",
        character:  "materials/Alice_smile.png",
        speaker: "Алиса",
        text: "Привет! Меня зовут Алиса, мне 18, и завтра мой первый учебный день в университете."
    },
    {
        background: "materials/vuz.jpg",
        character:  "materials/Alice_smile.png",
        speaker: "Алиса",
        text: "Волнуюсь ли я? Еще как, но, уверена, меня ждет веселье и, может даже, романтика!"
    },
    {
        background: "materials/kitchen.jpg",
        character:  "materials/max.png",
        speaker: "Алиса",
        text: "А пока я пытаюсь прорваться сквозь толпу студентов в общежитии на кухню. Здесь на удивление пусто."
    },
    {
        background: "materials/kitchen.jpg",
        character:  "materials/max.png",
        noText: true,
        
    },
    {
        background: "materials/kitchen.jpg",
        character:  "materials/max.png",
        speaker: "Алиса",
        text: "Привет."
    }
    // ← сюда можно добавить ещё сцены
];