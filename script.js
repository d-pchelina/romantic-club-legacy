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
    const teaImg = document.getElementById('tea-in-hand');
    if (!scene) return;

    // Фон
    sceneBg.style.backgroundImage = `url(${scene.background})`;
    
    // Персонаж (Убираем Макса, если его не должно быть)
    if (scene.character) {
        sceneChar.src = scene.character;
        sceneChar.style.display = 'block';
    } else {
        sceneChar.style.display = 'none';
    }
    if (scene.showTea) {
        teaImg.style.display = 'block';
    } else {
        teaImg.style.display = 'none';
    }
    const dialogueBox = document.querySelector('.dialogue-box');
    const optionsContainer = document.getElementById('options-container'); // Нужно добавить в HTML
    dialogueBox.style.display = 'block';
    dialogueBox.style.opacity = '1';
    dialogueBox.style.minHeight = '140px'; 
    dialogueBox.style.padding = '16px 18px 58px 18px';

    // Устанавливаем имя: если его нет в массиве, будет пустая строка
    // Но благодаря CSS (height и content), место под него сохранится
    if (speakerName) {
        speakerName.innerText = scene.speaker ? scene.speaker.trim() : "";
    }

    dialogueText.innerText = scene.text || "";
    
    // Кнопки всегда видимы
    nextBtn.style.display = 'block';
    prevBtn.style.display = (index === 0) ? 'none' : 'block';
    // Логика отображения текста
    if (scene.isChoice) {
        // Если это выбор
        nextBtn.style.display = 'none'; // Прячем кнопку "Вперед"
        dialogueText.innerText = scene.text;
        renderChoices(scene.choices);
    } else {
        // Обычная сцена
        if (optionsContainer) optionsContainer.innerHTML = ''; 
        nextBtn.style.display = 'block';
        
        dialogueBox.style.opacity = scene.noText ? '0.3' : '1'; 
        dialogueText.innerText = scene.text || '';
        if (speakerName) speakerName.innerText = scene.speaker || '';
    }
    
    prevBtn.style.display = (index === 0) ? 'none' : 'block';
}

// Функция для отрисовки кнопок выбора
function renderChoices(choices) {
    const dialogueBox = document.querySelector('.dialogue-box');
    let container = document.getElementById('choices-wrapper');
    if (!container) {
        container = document.createElement('div');
        container.id = 'choices-wrapper';
        container.className = 'choice-container';
        dialogueBox.appendChild(container);
    }
    container.innerHTML = '';

    choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'choice-button';
        btn.innerText = choice.text;
        btn.onclick = () => {
            container.innerHTML = '';
            currentChapterScenes.push(...choice.nextScenes); // Добавляем последствия в конец
            goToNextScene();
        };
        container.appendChild(btn);
    });
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
        speaker: "Алиса",
        text: "А пока я пытаюсь прорваться сквозь толпу студентов в общежитии на кухню. Здесь на удивление пусто."
    },
    {
        background: "materials/kitchen.jpg",
        character:  "materials/max.png",
        showTea: true,
        text: "У окна стоит молодой человек с чашкой чая.",
        
    },
    {
        background: "materials/kitchen.jpg",
        character:  "materials/max.png",
        speaker: "Алиса",
        text: "Привет."
    }
    // ← сюда можно добавить ещё сцены
];