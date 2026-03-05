const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Элементы экрана
const startScreen     = document.getElementById('start-screen');
const chaptersScreen  = document.getElementById('chapters-screen');
const sceneScreen     = document.getElementById('scene-screen');

// Элементы сцены
const mainButton      = document.getElementById('main-button');
const dialogueText    = document.getElementById('dialogue-text');
const speakerName     = document.getElementById('speaker-name');
const nextBtn         = document.getElementById('next-btn');
const prevBtn         = document.getElementById('prev-btn');
const sceneBg         = document.getElementById('scene-bg');
const mainChar        = document.getElementById('main-character');
const choiceContainer = document.getElementById('choice-container');

let currentSceneIndex = 0;
let playerStats = { ambition: 0, shy: 0, maxRel: 0 };

const CHARACTERS = {
    MAX: 'materials/max.png',
    ALICE: 'materials/Alice_smile.png'
};

const BACKGROUNDS = {
    KITCHEN: 'materials/kitchen.jpg',
    STREET: 'materials/vuz.jpg',
    BEDROOM: 'materials/bedroom.jpg' 
};

// Сценарий 
const scenario = [
    {
        speaker: "Алиса",
        text: "Привет! Меня зовут Алиса, мне 18, и завтра мой первый учебный день в университете. Волнуюсь ли я? Еще как, но, уверена, меня ждет веселье и, может даже, романтика!",
        background: BACKGROUNDS.STREET,
        char: CHARACTERS.ALICE,
        
    },
    {
        speaker: "Алиса",
        text: "А пока я пытаюсь прорваться сквозь толпу студентов в общежитии на кухню. Здесь на удивление пусто.",
        background: BACKGROUNDS.KITCHEN,
        char: CHARACTERS.ALICE,
        
    },
    {
        speaker: "",
        text: "У окна стоит молодой человек с чашкой чая.",
        background: BACKGROUNDS.KITCHEN,
        char: CHARACTERS.MAX
    },
    
    {
        speaker: "Алиса",
        text: "Привет, — тихо поздоровалась Алиса.",
        background: BACKGROUNDS.KITCHEN,
        char: CHARACTERS.ALICE,
        
    },
    {
        speaker: "Максим",
        text: "Привет. Меня зовут Максим. Я с первого курса бизнес-чего-нибудь. А ты?",
        char: CHARACTERS.MAX
    },
    {
        speaker: "Алиса",
        text: "Я тоже с бизнес-чего-нибудь. Получается, мы в одной группе. ",
        char: CHARACTERS.ALICE
    },
    
    {
        speaker: "",
        text: "Алиса наливает себе чай, садится за стол рядом.",
        char: null
    },
    
    {
        speaker: "Максим",
        text: "Чем занимаешься вообще? Помимо учебы. — спрашивает Максим.",
        char: CHARACTERS.MAX
    },
    {
        speaker: "Алиса",
        text: "Танцую с детства. А ты? ",
        char: CHARACTERS.ALICE
    },
    
    {
        speaker: "Максим",
        text: "О, я тоже люблю танцевать. Специально сюда поступил, слышал, у них крутая команда и серьезные конкурсы. Ближайшие — в ноябре. Пойдешь?",
        char: CHARACTERS.MAX
    },
    {
        isChoice: true, 
        text: "Алиса:",
        char: CHARACTERS.ALICE,
        choices: [
            { text: "Конечно, звучит круто!", nextIdx: 11, stats: { ambition: 1 } },
            { text: "Не знаю, надо подумать...", nextIdx: 12, stats: { shy: 1 } },
            { text: "Только если ты пойдешь со мной", nextIdx: 13, stats: { maxRel: -1 } }
        ]
    },
    // Ветки ответов Макса
    { speaker: "Максим", text: "— И я о том же, пойдем вместе! Через пару дней собрание клуба. ", char: CHARACTERS.MAX, nextIdx: 14 },
    { speaker: "Максим", text: "— Ты подумай, но не слишком долго. Через пару дней собрание клуба. ", char: CHARACTERS.MAX, nextIdx: 14 },
    { speaker: "Максим", text: "— Хах, ну да, я и так собирался.", char: CHARACTERS.MAX, nextIdx: 14 },
    // Финал главы
    {
        speaker: "",
        text: "Макс допил чай и ушел вместе с кружкой в комнату.",
        char: null,
        background: BACKGROUNDS.KITCHEN
    }
];

// Управление экранами
mainButton.addEventListener('click', () => {
    tg.HapticFeedback.impactOccurred('medium');
    startScreen.style.display = 'none';
    chaptersScreen.style.display = 'flex';
});

function startChapter(number) {
    if (number !== 1) {
        tg.showAlert("Эта глава еще в пути 😘");
        return;
    }
    chaptersScreen.style.display = 'none';
    sceneScreen.style.display = 'flex';
    currentSceneIndex = 0;
    showScene(currentSceneIndex);
}

function showScene(index) {
    const scene = scenario[index];
    if (!scene) return;

    // Смена фона и персонажа
    if (scene.background) sceneBg.style.backgroundImage = `url(${scene.background})`;
    mainChar.src = scene.char || "";
    mainChar.style.opacity = scene.char ? "1" : "0";

    // Текст
    speakerName.innerText = scene.speaker || "";
    dialogueText.innerText = scene.text || "";

    // Логика выбора
    if (scene.isChoice) {
        // Прячем стрелку "вперед" и показываем кнопки выбора
        nextBtn.style.display = 'none';
        choiceContainer.style.display = 'flex'; // ВКЛЮЧАЕМ КОНТЕЙНЕР
        renderChoices(scene.choices);
    } else {
        // Показываем стрелку "вперед" и прячем кнопки выбора
        nextBtn.style.display = 'block';
        choiceContainer.style.display = 'none'; // ВЫКЛЮЧАЕМ КОНТЕЙНЕР
    }
}

function renderChoices(choices) {
    choiceContainer.innerHTML = '';
    choiceContainer.style.display = 'flex';

    choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'choice-button';
        btn.innerText = choice.text;
        
        btn.onclick = () => {
            // 1. Начисляем статы
            if (choice.stats) {
                for (let s in choice.stats) playerStats[s] += choice.stats[s];
            }
            
            // 2. ВАЖНО: Обновляем глобальный индекс на тот, что указан в выборе
            currentSceneIndex = choice.nextIdx; 
            
            // 3. Скрываем контейнер выбора сразу после нажатия
            choiceContainer.style.display = 'none';
            
            // 4. Запускаем следующую сцену
            showScene(currentSceneIndex);
        };
        choiceContainer.appendChild(btn);
    });
}

nextBtn.addEventListener('click', () => {
    const currentScene = scenario[currentSceneIndex];
    
    // Если текущая сцена — выбор, кнопка вообще не должна ничего делать
    if (currentScene.isChoice) return; 

    if (currentScene.nextIdx !== undefined) {
        currentSceneIndex = currentScene.nextIdx;
    } else {
        currentSceneIndex++;
    }
    
    if (currentSceneIndex < scenario.length) {
        showScene(currentSceneIndex);
    } else {
        tg.showAlert("Глава окончена!");
        sceneScreen.style.display = 'none';
        chaptersScreen.style.display = 'flex';
    }
});

prevBtn.addEventListener('click', () => {
    if (currentSceneIndex > 0) {
        currentSceneIndex--;
        showScene(currentSceneIndex);
    }
});
