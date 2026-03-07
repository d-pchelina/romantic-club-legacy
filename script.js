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
let playerStats = { ambition: 0, shy: 0, maxRel: 0 ,peak:0};
let sceneHistory = [];

const CHARACTERS = {
    MAX: 'materials/max.png',
    MAX_CUP: 'materials/max_cup.png',
    MAX_BRUH: 'materials/max_bruh.png',
    MAX_SCARY: 'materials/max_scary.png',
    ALICE: 'materials/Alice_smile.png',
    ALICE_HORNI: 'materials/Alice_horni.png'
};

const BACKGROUNDS = {
    KITCHEN: 'materials/kitchen.jpg',
    STREET: 'materials/vuz.jpg',
    BEDROOM: 'materials/bedroom.png',
    ALICE_SLEEP_SMILE: 'materials/AliceSleepSmile.jpg',
    ALICE_SLEEP_SAD: 'materials/AliceSleepSad.jpg'
};

// Сценарий 
const scenario = [
    {
        speaker: "Алиса",
        text: "Привет! Меня зовут Алиса, мне 18, и завтра мой первый учебный день в университете мечты.",
        background: BACKGROUNDS.STREET,
        char: CHARACTERS.ALICE,
        
    },
    {
        speaker: "Алиса",
        text: "Волнуюсь ли я? Еще как, но, уверена, меня впереди меня ждут лучшие 4 года моей жизни. И может быть я даже найду здесь любовь.",
        background: BACKGROUNDS.STREET,
        char: CHARACTERS.ALICE,
        
    },
    {
        speaker: "Алиса",
        text: "А пока я пытаюсь прорваться сквозь толпу студентов в общежитии на кухню. Здесь на удивление пусто.",
        background: BACKGROUNDS.KITCHEN,
        char: null,
        
    },
    {
        speaker: "",
        text: "У окна стоит молодой человек с чашкой чая.",
        background: BACKGROUNDS.KITCHEN,
        char: CHARACTERS.MAX_CUP
    },
    {
        speaker: "Алиса",
        text: "Привет, радуешься дождю?",
        background: BACKGROUNDS.KITCHEN,
        char: CHARACTERS.ALICE,
        
    },
    {
        speaker: "",
        text: "Молодой человек дергается, задевая чашку на столе. Чай разливается.",
        background: BACKGROUNDS.KITCHEN,
        char: CHARACTERS.MAX_SCARY
    },
    {
        speaker: "???",
        text: "Ой, привет, не заметил тебя.",
        char: CHARACTERS.MAX
    },
    {
        speaker: "???",
        text: "Блин, чай теперь на столе...",
        char: CHARACTERS.MAX
    },
    {
        isChoice: true, 
        text: "Алиса:",
        char: CHARACTERS.ALICE,
        choices: [
            { text: "Жаль, что не ты.", nextIdx: 9, stats: { peak: 1 } },
            { text: "Промолчать.", nextIdx: 15, stats: { shy: 1 } },
        ]
    },
    {
        speaker: "???",
        text: "Что?",
        char: CHARACTERS.MAX_BRUH
    },
    {
        speaker: "Алиса",
        text: "Что? Я Алиса, говорю.",
        char: CHARACTERS.ALICE_HORNI
    },
    {
        speaker: "Максим",
        text: "Макс.",
        char: CHARACTERS.MAX
    },
    {
        speaker: "",
        text: "Макс протягивает руку в приветственном жесте.",
        char: CHARACTERS.MAX
    },
    {
        speaker: "Алиса",
        text: "*Его ладонь такая мужественная… Наверное, он много печатает на клавиатуре.*",
        char: CHARACTERS.ALICE_HORNI
    },
    {
        speaker: "Максим",
        text: "Ну что стоишь, Алиса, с тебя теперь новый чай.",
        char: CHARACTERS.MAX,
        nextIdx: 20
    },
    //17
    {
        speaker: "???",
        text: "Ну что стоишь. С тебя теперь новый чай.",
        char: CHARACTERS.MAX
    },
    {
        speaker: "Максим",
        text: "Меня, кстати, Макс зовут, а тебя?",
        char: CHARACTERS.MAX
    },
    {
        speaker: "Алиса",
        text: "Алиса.",
        char: CHARACTERS.ALICE
    },
    //20
    {
        speaker: "Максим",
        text: "Я с первого курса бизнес-информатики, а ты?",
        char: CHARACTERS.MAX
    },
    {
        speaker: "Алиса",
        text: "Я тоже. Получается, мы одногруппники",
        char: CHARACTERS.ALICE
    },
    {
        speaker: "Максим",
        text: "Чем по жизни занимаешься? Кроме бизнеса, так для души?",
        char: CHARACTERS.MAX
    },
    {
        speaker: "Алиса",
        text: "Танцую с детства. А ты?",
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
            { text: "Конечно, звучит круто!",         nextIdx: 24, stats: { ambition: 1 } },
            { text: "Не знаю, надо подумать...",       nextIdx: 27, stats: { shy: 1} },
            { text: "Только если ты будешь... Мяу!",  nextIdx: 30, stats: { maxRel: -1 ,peak:1} }
        ]},

    // Амбициозная ветка
    { speaker: "Максим", text: "— И я о том же, пойдем вместе! Через пару дней собрание клуба.", char: CHARACTERS.MAX },
    {
        speaker: "",
        text: "Макс допил чай и ушел вместе с кружкой в комнату.",
        char: null,
        background: BACKGROUNDS.KITCHEN
    },
    {
        background: BACKGROUNDS.ALICE_SLEEP_SMILE,
        speaker: "Алиса",
        text: "Ух, конкурс. А где конкурс, там и кубок, и внимание. Но и ребята в клубе сильные... Ничего, стану лучшей. Скорей бы.",
        char: null,
        endChapter: true   // ← ключевое поле
    },

    // Стеснительная ветка
    { speaker: "Максим", text: "— Ты подумай, но не слишком долго. Через пару дней собрание клуба.", char: CHARACTERS.MAX },
    {
        speaker: "",
        text: "Макс допил чай и ушел вместе с кружкой в комнату.",
        char: null,
        background: BACKGROUNDS.KITCHEN
    },
    {
        background: BACKGROUNDS.ALICE_SLEEP_SAD,
        speaker: "Алиса",
        text: "Команда танцоров сильная, значит, и пробы сложные. Пройду ли я?",
        char: null,
        endChapter: true
    },

    // Флиртовая / странная ветка
    { speaker: "Максим", text: "— Окей… я просто про танцы спросил. Ты… интересная. Наверное", char: CHARACTERS.MAX_BRUH },
    {
        speaker: "",
        text: "Макс допил чай и ушел вместе с кружкой в комнату.",
        char: null,
        background: BACKGROUNDS.KITCHEN
    },
    {
        background: BACKGROUNDS.ALICE_SLEEP_SMILE,
        speaker: "Алиса",
        text: "Какая я же я красотка! Ну, Алиса, ну львица-тигрица. А сколько красивых мальчиков в танцевальном клубе...",
        char: null,
        endChapter: true
    },

    // ← Вот сюда все ветки сходятся
    {
        speaker: "",
        text: "Конец главы 1",
        char: null
        // можно background: что-то нейтральное или оставить предыдущий
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
    sceneHistory = [];
    currentSceneIndex = 0;
    showScene(currentSceneIndex);
}

function showScene(index) {
    const scene = scenario[index];
    if (!scene) return;

    // ← ЛОГИКА ИСТОРИИ: добавляем только если это новый индекс
    if (sceneHistory.length === 0 || sceneHistory[sceneHistory.length - 1] !== index) {
        sceneHistory.push(index);
    }
    
    currentSceneIndex = index;  // Обновляем текущий индекс

    // Смена фона и персонажа
    if (scene.background) sceneBg.style.backgroundImage = `url(${scene.background})`;
    if (scene.char) {
        mainChar.src = scene.char;
        mainChar.style.opacity = "1";
        mainChar.style.display = "block";  // на всякий случай
    } else {
        mainChar.src = "";               // очищаем src, чтобы не грузил ничего
        mainChar.style.opacity = "0";
        mainChar.style.display = "none"; // полностью скрываем элемент
    }

    // Текст
    speakerName.innerText = scene.speaker || "";
    dialogueText.innerText = scene.text || "";

    // Логика выбора
    if (scene.isChoice) {
        nextBtn.style.display = 'none';
        choiceContainer.style.display = 'flex';
        renderChoices(scene.choices);
    } else {
        nextBtn.style.display = 'block';
        choiceContainer.style.display = 'none';
    }
    
    // ← НОВОЕ: обновляем видимость кнопок навигации
    updateNavButtons();
}

function updateNavButtons() {
    const canGoBack = sceneHistory.length > 1;
    prevBtn.classList.toggle('hidden', !canGoBack);
}

function renderChoices(choices) {
    choiceContainer.innerHTML = '';
    choiceContainer.style.display = 'flex';

    choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'choice-button';
        btn.innerText = choice.text;
        
        btn.onclick = () => {
            // --- 1. ЛОГИКА СТАТОВ И УВЕДОМЛЕНИЙ ---
            if (choice.stats) {
                let message = "";
                for (let s in choice.stats) {
                    let value = choice.stats[s];
                    playerStats[s] += value; // Начисляем стат в память

                    // Переводим названия для игрока
                    let statName = "";
                    if (s === 'ambition') statName = "Амбиции";
                    if (s === 'shy')      statName = "Стеснительность";
                    if (s === 'maxRel')   statName = "Отношения с Максом";
                    if (s=== 'peak') statName = "Пикми";   
                    // Формируем строчку, например: "+1 Амбиции"
                    let sign = value > 0 ? "+" : "";
                    message += `${sign}${value} ${statName}\n`;
                }

                // Вызываем всплывашку, если статы изменились
                if (message !== "") {
                    showStatNotification(message.trim());
                }
            }
            
            // --- 2. ПЕРЕХОД К СЛЕДУЮЩЕЙ СЦЕНЕ ---
            currentSceneIndex = choice.nextIdx; 
            choiceContainer.style.display = 'none';
            showScene(currentSceneIndex);
        };
        choiceContainer.appendChild(btn);
    });
}

nextBtn.addEventListener('click', () => {
    const currentScene = scenario[currentSceneIndex];
    
    if (currentScene.isChoice) return;

    // Если текущая сцена — это уже конец главы → завершаем
    if (currentScene.endChapter) {
        finishChapter();
        return;
    }

    // Обычный переход вперёд
    let nextIndex;
    if (currentScene.nextIdx !== undefined) {
        nextIndex = currentScene.nextIdx;
    } else {
        nextIndex = currentSceneIndex + 1;
    }
    
    if (nextIndex >= scenario.length) {
        finishChapter();
        return;
    }

    showScene(nextIndex);
});

function finishChapter() {
    if (tg.version && tg.isVersionAtLeast && tg.isVersionAtLeast('6.2')) {
        tg.showAlert("Глава 1 окончена!", () => {
            sceneScreen.style.display = 'none';
            chaptersScreen.style.display = 'flex';
            sceneHistory = [];
        });
    } else {
        alert("Глава 1 окончена!");
        sceneScreen.style.display = 'none';
        chaptersScreen.style.display = 'flex';
        sceneHistory = [];
    }
}

prevBtn.addEventListener('click', () => {
    if (sceneHistory.length > 1) {
        sceneHistory.pop();  // Удаляем текущий из истории
        currentSceneIndex = sceneHistory[sceneHistory.length - 1];  // Берём предыдущий
        showScene(currentSceneIndex);  // Показываем и обновляем кнопки
    }
});
function showStatNotification(text) {
    const toast = document.getElementById('stat-toast');
    toast.innerText = text;
    toast.classList.add('show');

    // Вибрация телефона при получении стата
    if (window.Telegram && window.Telegram.WebApp) {
        tg.HapticFeedback.notificationOccurred('success');
    }

    // Скрыть через 2 секунды
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}