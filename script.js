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

let currentChapter    = 1;
let currentSceneIndex = 0;
let playerStats = { ambition: 0, shy: 0, maxRel: 0, peak: 0 };
let sceneHistory = [];
let maxUnlockedChapter = 1;

// ────────────────────────────────────────────────
// Ресурсы (персонажи и фоны)
// ────────────────────────────────────────────────

const CHARACTERS = {
    MAX:        'materials/max.png',
    MAX_CUP:    'materials/max_cup.png',
    MAX_BRUH:   'materials/max_bruh.png',
    MAX_SCARY:  'materials/max_scary.png',
    ALICE:      'materials/Alice_smile.png',
    ALICE_HORNI:'materials/Alice_horni.png'
};

const BACKGROUNDS = {
    KITCHEN:           'materials/kitchen.jpg',
    STREET:            'materials/vuz.jpg',
    BEDROOM:           'materials/bedroom.png',
    ALICE_SLEEP_SMILE: 'materials/AliceSleepSmile.jpg',
    ALICE_SLEEP_SAD:   'materials/AliceSleepSad.jpg',
    // для главы 2
    HALL:        'materials/hall.jpg',
    ARMCH:  'materials/armchairs.jpg'
};

// ────────────────────────────────────────────────
// Сценарий — теперь объект с главами
// ────────────────────────────────────────────────

const CHAPTERS = {
    1: [
        { speaker: "Алиса", text: "Привет! Меня зовут Алиса, мне 18, и завтра мой первый учебный день в университете мечты.", background: BACKGROUNDS.STREET, char: CHARACTERS.ALICE },
        { speaker: "Алиса", text: "Волнуюсь ли я? Еще как, но уверена — впереди лучшие 4 года жизни. И может быть… любовь.", background: BACKGROUNDS.STREET, char: CHARACTERS.ALICE },
        { speaker: "Алиса", text: "А пока я пытаюсь прорваться сквозь толпу в общаге на кухню. Здесь неожиданно пусто.", background: BACKGROUNDS.KITCHEN, char: null },
        { speaker: "", text: "У окна стоит парень с чашкой чая.", background: BACKGROUNDS.KITCHEN, char: CHARACTERS.MAX_CUP },
        { speaker: "Алиса", text: "Привет, радуешься дождю?", background: BACKGROUNDS.KITCHEN, char: CHARACTERS.ALICE },
        { speaker: "", text: "Парень вздрагивает, задевает чашку. Чай растекается.", background: BACKGROUNDS.KITCHEN, char: CHARACTERS.MAX_SCARY },
        { speaker: "???", text: "Ой, привет… не заметил тебя.", char: CHARACTERS.MAX },
        { speaker: "???", text: "Блин, теперь весь стол в чае…", char: CHARACTERS.MAX },

        { isChoice: true, text: "Алиса:", char: CHARACTERS.ALICE, choices: [
            { text: "Жаль, что не ты.",     nextIdx: 9, stats: { peak: 1 } },
            { text: "Промолчать.",          nextIdx: 15, stats: { shy: 1 } }
        ]},

        { speaker: "???", text: "Что?", char: CHARACTERS.MAX_BRUH },
        { speaker: "Алиса", text: "Что? Я Алиса.", char: CHARACTERS.ALICE_HORNI },
        { speaker: "Максим", text: "Макс.", char: CHARACTERS.MAX },
        { speaker: "", text: "Макс протягивает руку.", char: CHARACTERS.MAX },
        { speaker: "Алиса", text: "*Его ладонь такая мужественная… Наверное, он много печатает.*", char: CHARACTERS.ALICE_HORNI },
        { speaker: "Максим", text: "Ну что стоишь, Алиса? С тебя теперь новый чай.", char: CHARACTERS.MAX, nextIdx: 20 },

        // стеснительная ветка
        { speaker: "Максим", text: "Ну что стоишь. С тебя теперь новый чай.", char: CHARACTERS.MAX },
        { speaker: "Максим", text: "Меня, кстати, Макс зовут. А тебя?", char: CHARACTERS.MAX },
        { speaker: "Алиса", text: "Алиса.", char: CHARACTERS.ALICE },

        // общая часть
        { speaker: "Максим", text: "Я с первого курса бизнес-информатики. А ты?", char: CHARACTERS.MAX },
        { speaker: "Алиса", text: "Я тоже. Получается, одногруппники.", char: CHARACTERS.ALICE },
        { speaker: "Максим", text: "Чем по жизни занимаешься? Кроме учёбы.", char: CHARACTERS.MAX },
        { speaker: "Алиса", text: "Танцую с детства. А ты?", char: CHARACTERS.ALICE },
        { speaker: "Максим", text: "О, я тоже. Специально сюда поступил — у них сильная команда и крутые конкурсы. Ближайший в ноябре. Пойдёшь?", char: CHARACTERS.MAX },

        { isChoice: true, text: "Алиса:", char: CHARACTERS.ALICE, choices: [
            { text: "Конечно, звучит круто!",           nextIdx: 24, stats: { ambition: 1 } },
            { text: "Не знаю… надо подумать.",          nextIdx: 27, stats: { shy: 1 } },
            { text: "Только если ты будешь… Мяу~",     nextIdx: 30, stats: { maxRel: -1, peak: 1 } }
        ]},

        // амбициозная
        { speaker: "Максим", text: "И я о том же! Пойдём вместе. Через пару дней собрание клуба.", char: CHARACTERS.MAX },
        { speaker: "", text: "Макс допивает чай и уходит.", background: BACKGROUNDS.KITCHEN, char: null },
        { background: BACKGROUNDS.ALICE_SLEEP_SMILE, speaker: "Алиса", text: "Конкурс… кубок… внимание. Буду лучшей. Скорее бы.", char: null, endChapter: true },

        // стеснительная
        { speaker: "Максим", text: "Подумай, но не затягивай. Через пару дней собрание.", char: CHARACTERS.MAX },
        { speaker: "", text: "Макс уходит.", background: BACKGROUNDS.KITCHEN, char: null },
        { background: BACKGROUNDS.ALICE_SLEEP_SAD, speaker: "Алиса", text: "Сильная команда… смогу ли я пройти отбор?", char: null, endChapter: true },

        // пикми
        { speaker: "Максим", text: "…окей. Ты… довольно интересная. Наверное.", char: CHARACTERS.MAX_BRUH },
        { speaker: "", text: "Макс быстро уходит.", background: BACKGROUNDS.KITCHEN, char: null },
        { background: BACKGROUNDS.ALICE_SLEEP_SMILE, speaker: "Алиса", text: "Какая же я красотка! В танцевальном клубе будет море симпатичных парней…", char: null, endChapter: true },

        { speaker: "", text: "Конец главы 1", char: null }
    ],

    // ───────────────────────────────
    // Глава 2 (короткая, но с выбором)
    // ───────────────────────────────
    2: [
        { speaker: "Алиса", text: "Наконец-то презентации клубов начались!", background: BACKGROUNDS.HALL, char: null },
        { speaker: "Света", text: "Да уж. Ты уже решила, в какой клуб хочешь?", background: BACKGROUNDS.ARMCH, char: null },
        { isChoice: true, text: "Алиса:", char: CHARACTERS.ALICE, choices: [
            { text: "Не знаю пока, но думаю о танцевальном клубе...",           nextIdx: 3, stats: { shy: 1 } },
            { text: "Хочу в танцевальный клуб.",          nextIdx: 3, stats: { ambition: 1 } }
        ]},
        { speaker: "Света", text: "Это здорово. Я вот хочу в КВН.", char: null},
        { speaker: "Алиса", text: "Умеешь шутить?", char: CHARACTERS.ALICE},
        { speaker: "Света", text: "Как-то раз еврея хотели казнить. Дали ему последнее желание.", char: null},
        { speaker: "Света", text: "Он и говорит: хочу черешню. Ему отвечают: сейчас же зима...", char: null},
        { speaker: "", text: "На сцену выходит клуб танцоров", char: null},
        { speaker: "Алиса", text: "Тшш! Потом расскажешь.", background: BACKGROUNDS.ARMCH, char: null}
    ]
};

// ────────────────────────────────────────────────
// Функции
// ────────────────────────────────────────────────

mainButton.addEventListener('click', () => {
    tg.HapticFeedback.impactOccurred('medium');
    startScreen.style.display = 'none';
    chaptersScreen.style.display = 'flex';
});

function updateChapterCards() {
    const cards = document.querySelectorAll('.chapter-card');
    
    cards.forEach((card, index) => {
        const chapterNum = index + 1;
        
        const chapterExists = !!CHAPTERS[chapterNum];

        if (chapterNum <= maxUnlockedChapter && chapterExists) {
            card.classList.remove('locked');
            card.querySelector('.chapter-status').textContent = 'Доступно';
        } else {
            card.classList.add('locked');
            
            if (!chapterExists) {
                card.querySelector('.chapter-status').textContent = 'В разработке';
            } else {
                card.querySelector('.chapter-status').textContent = 
                    chapterNum === 2 ? 'После главы 1' : 'Закрыто';
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    updateChapterCards();

    document.querySelectorAll('.chapter-card').forEach(card => {
        card.addEventListener('click', () => {
            const chapter = parseInt(card.dataset.chapter);
            if (!isNaN(chapter)) {
                startChapter(chapter);
            }
        });
    });
});

function startChapter(number) {
    if (!CHAPTERS[number]) {
        tg.showAlert("Эта глава ещё не готова...");
        return;
    }

    if (number > maxUnlockedChapter) {
        tg.showAlert(`Сначала заверши главу ${maxUnlockedChapter} 😘`);
        return;
    }

    currentChapter = number;
    chaptersScreen.style.display = 'none';
    sceneScreen.style.display = 'flex';
    sceneHistory = [];
    currentSceneIndex = 0;
    showScene(currentSceneIndex);
}

function showScene(index) {
    const chapter = CHAPTERS[currentChapter];
    const scene = chapter[index];
    if (!scene) return;

    if (sceneHistory.length === 0 || sceneHistory[sceneHistory.length - 1] !== index) {
        sceneHistory.push(index);
    }
    
    currentSceneIndex = index;

    if (scene.background) sceneBg.style.backgroundImage = `url(${scene.background})`;
    if (scene.char) {
        mainChar.src = scene.char;
        mainChar.style.opacity = "1";
        mainChar.style.display = "block";
    } else {
        mainChar.src = "";
        mainChar.style.opacity = "0";
        mainChar.style.display = "none";
    }

    speakerName.innerText = scene.speaker || "";
    dialogueText.innerText = scene.text || "";

    if (scene.isChoice) {
        nextBtn.style.display = 'none';
        choiceContainer.style.display = 'flex';
        renderChoices(scene.choices);
    } else {
        nextBtn.style.display = 'block';
        choiceContainer.style.display = 'none';
    }
    
    updateNavButtons();
}

function updateNavButtons() {
    prevBtn.classList.toggle('hidden', sceneHistory.length <= 1);
}

function renderChoices(choices) {
    choiceContainer.innerHTML = '';
    choiceContainer.style.display = 'flex';

    choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'choice-button';
        btn.innerText = choice.text;
        
        btn.onclick = () => {
            if (choice.stats) {
                let message = "";
                for (let s in choice.stats) {
                    let value = choice.stats[s];
                    playerStats[s] += value;
                    let statName = "";
                    if (s === 'ambition') statName = "Амбиции";
                    if (s === 'shy')      statName = "Стеснительность";
                    if (s === 'maxRel')   statName = "Отношения с Максом";
                    if (s === 'peak')     statName = "Пикми";
                    let sign = value > 0 ? "+" : "";
                    message += `${sign}${value} ${statName}\n`;
                }
                if (message) showStatNotification(message.trim());
            }
            
            currentSceneIndex = choice.nextIdx;
            choiceContainer.style.display = 'none';
            showScene(currentSceneIndex);
        };
        choiceContainer.appendChild(btn);
    });
}

nextBtn.addEventListener('click', () => {
    const chapter = CHAPTERS[currentChapter];
    const currentScene = chapter[currentSceneIndex];
    
    if (currentScene.isChoice) return;

    if (currentScene.endChapter) {
        finishChapter();
        return;
    }

    let nextIndex = currentScene.nextIdx !== undefined 
        ? currentScene.nextIdx 
        : currentSceneIndex + 1;
    
    if (nextIndex >= chapter.length) {
        finishChapter();
        return;
    }

    showScene(nextIndex);
});

function finishChapter() {
    const msg = `Глава ${currentChapter} окончена!`;
    
    // Разблокируем следующую главу
    if (currentChapter === maxUnlockedChapter) {
        maxUnlockedChapter = currentChapter + 1;
    }

    if (tg.version && tg.isVersionAtLeast && tg.isVersionAtLeast('6.2')) {
        tg.showAlert(msg, () => {
            sceneScreen.style.display = 'none';
            chaptersScreen.style.display = 'flex';
            sceneHistory = [];
            updateChapterCards();          // ← вот здесь обновляем карточки
        });
    } else {
        alert(msg);
        sceneScreen.style.display = 'none';
        chaptersScreen.style.display = 'flex';
        sceneHistory = [];
        updateChapterCards();              // ← и здесь
    }
}

prevBtn.addEventListener('click', () => {
    if (sceneHistory.length > 1) {
        sceneHistory.pop();
        currentSceneIndex = sceneHistory[sceneHistory.length - 1];
        showScene(currentSceneIndex);
    }
});

function showStatNotification(text) {
    const toast = document.getElementById('stat-toast');
    if (!toast) return;
    toast.innerText = text;
    toast.classList.add('show');
    tg.HapticFeedback?.notificationOccurred('success');
    setTimeout(() => toast.classList.remove('show'), 2000);
}