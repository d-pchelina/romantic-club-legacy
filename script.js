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
            { text: "Жаль, что не ты.", nextIdx: 9, stats: { ambition: 1 } },
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
            { text: "Конечно, звучит круто!", nextIdx: 24, stats: { ambition: 1 } },
            { text: "Не знаю, надо подумать...", nextIdx: 25, stats: { shy: 1 } },
            { text: "Только если ты будешь моим личным телохранителем от злых фанаток! Чур, я твоя главная фанатка! Мяу!", nextIdx: 26, stats: { maxRel: -1 } }
        ]
    },
    // Ветки ответов Макса
    { speaker: "Максим", text: "— И я о том же, пойдем вместе! Через пару дней собрание клуба. ", char: CHARACTERS.MAX, nextIdx: 27 },
    { speaker: "Максим", text: "— Ты подумай, но не слишком долго. Через пару дней собрание клуба. ", char: CHARACTERS.MAX, nextIdx: 27 },
    { speaker: "Максим", text: "— Окей… я просто про танцы спросил. Ты… интересная. Наверное", char: CHARACTERS.MAX_BRUH, nextIdx: 27 },
    // Финал главы
    {
        speaker: "",
        text: "Макс допил чай и ушел вместе с кружкой в комнату.",
        char: null,
        background: BACKGROUNDS.KITCHEN
    },
    /*{ background: BACKGROUNDS.BEDROOM,speaker: "Алиса", text: "Ух, конкурс. А где конкурс, там и кубок, и внимание. Но и ребята в клубе сильные... Ничего, стану лучшей. Скорей бы.", char: CHARACTERS.ALICE, nextIdx: 28 },
    { background: BACKGROUNDS.BEDROOM,speaker: "Алиса", text: "Команда танцоров сильная, значит, и пробы сложные. Пройду ли я?", char: CHARACTERS.ALICE, nextIdx: 28  },
    { background: BACKGROUNDS.BEDROOM,speaker: "Алиса", text: "Какая я же я красотка! Ну, Алиса, ну львица-тигрица. А сколько красивых мальчиков в танцевальном клубе...", char: CHARACTERS.ALICE, nextIdx: 28  },*/
    {   isChoice: true, 
        background: BACKGROUNDS.BEDROOM,
        text: "Алиса",
        char: CHARACTERS.ALICE,
        choices: [
            { text: "Ух, конкурс. А где конкурс, там и кубок, и внимание. Но и ребята в клубе сильные... Ничего, стану лучшей. Скорей бы.", nextIdx: 28, stats: { ambition: 1 } },
            { text: "Команда танцоров сильная, значит, и пробы сложные. Пройду ли я?", nextIdx: 29, stats: { shy: 1 } },
            { text: "Какая я же я красотка! Ну, Алиса, ну львица-тигрица. А сколько красивых мальчиков в танцевальном клубе...", nextIdx: 30}
        ]}
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
