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
let playerStats = { ambition: 0, shy: 0, maxRel: 0, peak: 0 ,kirRel:0, victRel:0};
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
    ALICE_HORNI:'materials/Alice_horni.png',
    DIANA: 'materials/Diana.png',
    KIRILL: 'materials/Kirill_Nagliy.png',
    SVETA: 'materials/Sveta.png',
    VICTOR: 'materials/Victor.png',
    KATYA:'materials/KATYA.png'
};

const BACKGROUNDS = {
    KITCHEN:           'materials/kitchen.jpg',
    STREET:            'materials/vuz.jpg',
    BEDROOM:           'materials/bedroom.png',
    ALICE_SLEEP_SMILE: 'materials/AliceSleepSmile.jpg',
    ALICE_SLEEP_SAD:   'materials/AliceSleepSad.jpg',
    // для главы 2
    HALL:        'materials/hall.jpg',
    ARMCH:  'materials/armchairs.jpg',
    CLASSROOM: 'materials/office1.jpg',
    CABINET:'materials/office2.jpg',
    CORRIDOR:'materials/CORIDOR.jpg'
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
        { speaker: "???", text: "Блин, теперь весь чай на столе...", char: CHARACTERS.MAX },

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
        { speaker: "Света", text: "Да уж. Ты уже решила, в какой клуб хочешь?", background: BACKGROUNDS.ARMCH, char: CHARACTERS.ALICE },
        { isChoice: true, text: "Алиса:", char: CHARACTERS.ALICE, choices: [
            { text: "Не знаю пока, но думаю о танцевальном клубе...",           nextIdx: 3, stats: { shy: 1 } },
            { text: "Хочу в танцевальный клуб.",          nextIdx: 3, stats: { ambition: 1 } }
        ]},
        { speaker: "Света", text: "Это здорово. Я вот хочу в КВН.", char: CHARACTERS.SVETA},
        { speaker: "Алиса", text: "Умеешь шутить?", char: CHARACTERS.ALICE},
        { speaker: "Света", text: "Как-то раз еврея хотели казнить. Дали ему последнее желание.", char: CHARACTERS.SVETA},
        { speaker: "Света", text: "Он и говорит: хочу черешню. Ему отвечают: сейчас же зима...", char: CHARACTERS.SVETA},
        { speaker: "", text: "На сцену выходит клуб танцоров", char: null},
        { speaker: "Алиса", text: "Тшш! Потом расскажешь.", background: BACKGROUNDS.ARMCH, char: CHARACTERS.ALICE},
        { speaker: "", text: "Клубы представлялись один за другим, рассказывая о своих достижениях, мероприятиях и участниках. Но все они не то чтобы заинтересовали Алису, так что с каждой минутой ей становилось все скучнее. А вскоре и вовсе потянуло в сон.", background: BACKGROUNDS.HALL },
    
    // --- Выход танцоров ---
        { speaker: "", text: "К ее счастью, именно в этот момент на сцене появился танцевальный клуб. Его представляли девушка и парень.", background: BACKGROUNDS.HALL, char: null },
        { speaker: "Диана", text: "Всем добрый вечер, я Диана, заместитель руководителя танцевального клуба, - представилась невысокая темноволосая девушка и помахала рукой в знак приветствия. - А это наш командир, руководитель и просто прекрасный танцор Кирилл.", char: CHARACTERS.DIANA },
        { speaker: "", text: "Она повернулась в его сторону, протянув обе руки к нему, представляя. Он коротко поклонился, широко улыбаясь.", background: BACKGROUNDS.HALL, char: null },
        { speaker: "Кирилл", text: "Рад видеть вас на этой встрече. В этом году мы набираем много новичков, так что шанс есть у каждого. Что ж, давайте начнем нашу презентацию. Наш университет участвует в «Танцы-Шманцы» уже на протяжении 10 лет. И 8 из 10 раз мы выходили победителями. В этом году тоже планируем, - Кирилл весело улыбнулся, повернувшись к залу. - Так что у вас тоже есть шанс стать победителями. Но учтите, что придется постараться, в команду на конкурс будет отдельный отбор среди всех участников клуба.", char: CHARACTERS.KIRILL },
        { speaker: "Кирилл", text: "Но не переживайте, для тех, кто не сможет попасть в конкурсную команду, тоже найдется занятие. Мы проводим тренировки 3 раза в неделю, а также мастер-классы и участвуем в мероприятиях, помимо конкурсов. Например, наши показательные выступления. Кстати, номер, который вы видели на приветственном дне, был организован нашим клубом.", char: CHARACTERS.KIRILL },
        { speaker: "Кирилл", text: "Есть ли уже желающие пойти к нам? - хитро прищурившись, спросил Кирилл, наблюдая за залом.", char: CHARACTERS.KIRILL },

    // --- Выбор: Активность ---
    { isChoice: true, text: "Алиса:", char: CHARACTERS.ALICE, choices: [
        { text: "Да, я бы хотела присоединиться, - подняла руку Алиса.", nextIdx: 17, stats: { ambition: 1 } },
        { text: "*Промолчать*", nextIdx: 18 }
    ]},

    // Ветка 1: Подняла руку
    { speaker: "Кирилл", text: "Замечательно, красавица! Подойди ко мне сразу после мероприятия.", char: CHARACTERS.KIRILL, nextIdx: 19},
    
    // Ветка 2: Промолчала
    { speaker: "Кирилл", text: "Ну, если стесняетесь сейчас — подходите после, обсудим просмотр.", char: CHARACTERS.KIRILL,nextIdx: 23},

    // --- После мероприятия ---
    { speaker: "", text: "Сон как рукой сняло, но каждое следующее выступление длилось мучительно долго. Поэтому, когда объявили о завершении последнего, Алиса чуть ли не подпрыгнула и направилась к танцорам. Следом за ней подошел Максим.", background: BACKGROUNDS.HALL, char: null },
    { speaker: "Кирилл", text: "О, это ты, красавица. Приятно видеть таких смельчаков. Мы уже знакомы заочно, но хотелось бы лично. Я Кирилл, - он протянул руку.", char: CHARACTERS.KIRILL },
    { speaker: "Алиса", text: "Алиса. Очень приятно.", char: CHARACTERS.ALICE },
    { speaker: "Кирилл", text: "Взаимно, - он повернулся ко всем и объявил. - Сейчас Диана раздаст вам анкеты, заполните их и сдайте, а мы напишем вам позже.", char: CHARACTERS.KIRILL,nextIdx:25},
    
    { speaker: "", text: "Следующие выступления пролетели для Алисы незаметно. Она задумалась о том, как подойти и что лучше сказать, едва не пропустив окончание мероприятия. Когда все начали вставать, Алиса с трудом отыскала взглядом танцоров и поспешила к ним. Следом за ней подошел Максим.", background: BACKGROUNDS.HALL, char: null },
    { speaker: "Кирилл", text: "Сейчас Диана раздаст вам анкеты, заполните их и сдайте, а мы напишем вам позже.", char: CHARACTERS.KIRILL },

    
    
    
    { speaker: "", text: "Алиса быстро заполнила анкету и вернула ее девушке.", background: BACKGROUNDS.HALL, char: null },
    

    // --- Финальный выбор главы ---
    { isChoice: true, text: "Алиса:", char: CHARACTERS.ALICE, choices: [
        { text: "*Попрощаться*", stats: { peak: 1 },nextIdx:27},
        { text: "*Уйти незаметно*", nextIdx:32}
    ]},
    { speaker: "Максим", text: "А как скоро придет ответ?", char: CHARACTERS.MAX },
    { speaker: "Диана", text: "Послезавтра.", char: CHARACTERS.DIANA },
    { speaker: "Кирилл", text: "Завтра у нас выступление, будем заняты. Но если захотите — приходите посмотреть.", char: CHARACTERS.KIRILL },
    { speaker: "", text: "Кирилл заговорщицки подмигнул Алисе.", char: CHARACTERS.KIRILL },

    // Результаты выбора
    { isChoice: true, text: "Алиса:", char: CHARACTERS.ALICE, choices: [
        { text: "Спасибо за предложение, звучит заманчиво.", nextIdx: 33, stats: { peak: 1 } },
        { text: "Спасибо за предложение, мы подумаем.", nextIdx: 33 },
        { text: "*Уйти*", nextIdx: 33, stats: { kirRel:-1 } }
    ]},
    { speaker: "Алиса", text: "Фух, кажется, я справилась. Пора домой.", endChapter: true },

    { speaker: "Алиса", text: "Завтра будет важный день.", endChapter: true }],
    3: [
    // --- Сцена 0: Опоздание ---
    { speaker: "Света", text: "Опаздываем. Неловко получается, — бегом поднимаясь по лестнице, замечает Света. — Говорят, Виктор Андреевич тот еще душнила.", background: BACKGROUNDS.CORRIDOR, char: CHARACTERS.SVETA },
    { speaker: "Алиса", text: "Может, не всё так плохо? Ну с кем не бывает...", char: CHARACTERS.ALICE,background: BACKGROUNDS.CORRIDOR },
    { speaker: "", text: "Они быстрым шагом заходят в кабинет и замирают, заметив строгий взгляд молодого человека.", char: CHARACTERS.VICTOR,background:BACKGROUNDS.CABINET },
    { speaker: "Виктор Андреевич", text: "Вот он, лучший пример неподобающего поведения. Дамы, вы не считаете, что это как минимум неуважительно и как максимум неприлично — опаздывать на первое же занятие?", char: CHARACTERS.VICTOR ,background:BACKGROUNDS.CABINET},
    { speaker: "Виктор Андреевич", text: "Проходите же, незачем в дверях стоять. Но впредь я прошу не опаздывать на мои занятия. Или вовсе не приходить на них.", char: CHARACTERS.VICTOR,background:BACKGROUNDS.CABINET },

    // --- Сцена 5: Первый выбор (Опоздание) ---
    { isChoice: true, text: "Алиса:", char: CHARACTERS.ALICE,background:BACKGROUNDS.CLASSROOM, choices: [
        { text: "Тихо сесть.", nextIdx: 14 },
        { text: "Извините нас, пожалуйста. Больше не повторится.", nextIdx: 14, stats: { victRel: 1 } },
        { text: "Ну вы тоже давайте не это самое... Мозг с утра не делайте.", nextIdx: 6 }
    ]},

    // --- Ветка ГЕЙМОВЕР (Дерзость) ---
    { speaker: "Виктор Андреевич", text: "Прошу прощения, девушка? Вы вообще понимаете, где находитесь?", char: CHARACTERS.VICTOR,background:BACKGROUNDS.CABINET }, // 6
    { speaker: "Алиса", text: "На паре по бизнес-аналитике.",background:BACKGROUNDS.CLASSROOM, char: CHARACTERS.ALICE }, // 7
    { speaker: "Виктор Андреевич", text: "О да, вы были на ней минуту назад, а сейчас я прошу вас выйти и подумать над своим поведением.", char: CHARACTERS.VICTOR ,background:BACKGROUNDS.CABINET}, // 8
    { speaker: "Алиса",background:BACKGROUNDS.CLASSROOM, text: "Сама решу.", char: CHARACTERS.ALICE }, // 9
    { speaker: "Виктор Андреевич", text: "Что-о-о?", char: CHARACTERS.VICTOR,background:BACKGROUNDS.CABINET }, // 10
    { speaker: "Алиса",background:BACKGROUNDS.CLASSROOM, text: "Самаааа решуууу, — Алиса пожимает плечами, садится за парту. — Продолжайте там свою тему.", char: CHARACTERS.ALICE }, // 11
    { speaker: "Виктор Андреевич", text: "Ну знаете...", char: CHARACTERS.VICTOR,background:BACKGROUNDS.CABINET }, // 12
    { speaker: "СИСТЕМА", text: "Алису отчислили. Вы проиграли.", endChapter: true,isGameOver: true }, // 13 (GAME OVER)

    // --- Сцена 14: Продолжение лекции ---
    { speaker: "",background:BACKGROUNDS.CLASSROOM, text: "Девушки быстро садятся и переглядываются, нервно хихикнув.", char: null },
    { speaker: "Виктор Андреевич",background:BACKGROUNDS.CABINET, text: "Что ж, на чем это мы остановились? Ах да, в течение семестра вам необходимо будет написать несколько исследовательских работ.", char: CHARACTERS.VICTOR },
    { speaker: "Виктор Андреевич",background:BACKGROUNDS.CABINET, text: "Темы сами выбирайте, однако предупреждаю: каждая работа должна быть не менее 20 страниц. Можете забыть про студклубы на время нашего семестра.", char: CHARACTERS.VICTOR },
    { speaker: "Виктор Андреевич",background:BACKGROUNDS.CABINET, text: "Не успеете сдать работу вовремя — она автоматически не засчитывается. Для зачета нужно сдать 5 работ. Есть вопросы?", char: CHARACTERS.VICTOR },

    // --- Сцена 18: Выбор про методичку ---
    { isChoice: true,background:BACKGROUNDS.CLASSROOM, text: "Алиса:", char: CHARACTERS.ALICE, choices: [
        { text: "Промолчать.", nextIdx: 19 },
        { text: "Извините, но у нас не только ваш предмет. Вам не кажется, что это слишком?", nextIdx: 21, stats: { ambition: 1, victRel: 1 } }
    ]},

    // Ветка "Промолчать"
    { speaker: "Студент",background:BACKGROUNDS.CLASSROOM, text: "Извините, а есть какая-то методичка? Примеры?", char: null }, // 19
    { speaker: "Виктор Андреевич",background:BACKGROUNDS.CABINET, text: "Да, всё на университетском портале.", char: CHARACTERS.VICTOR, nextIdx: 22 }, // 20

    // Ветка "Возмутиться"
    { speaker: "Виктор Андреевич", text: "А вам не кажется, что в бизнесе вас никто жалеть не будет? Ещё вопросы есть? Нет? В таком случае приступим.", char: CHARACTERS.VICTOR }, // 21

    // --- Сцена 22: Задание ---
    { speaker: "",background:BACKGROUNDS.CABINET, text: "Виктор Андреевич взял со стола бумаги и пустил по рядам.", char: null },
    { speaker: "Виктор Андреевич",background:BACKGROUNDS.CABINET, text: "Возьмите себе один на троих. Перед вами продажи одной маленькой компании. Почему они упали? У вас 15 минут.", char: CHARACTERS.VICTOR },
    { speaker: "",background:BACKGROUNDS.CLASSROOM, text: "Алиса задумчиво смотрит на листок. Света лишь пожимает плечами. Сзади сидят Максим и еще одна одногруппница.", char: null },

    // --- Сцена 25: Выбор группы ---
    { isChoice: true,background:BACKGROUNDS.CLASSROOM, text: "Алиса:", char: CHARACTERS.ALICE, choices: [
        { text: "Позвать Макса", nextIdx: 26, stats: { maxRel: 1 } },
        { text: "Позвать девушку", nextIdx: 29 },
        { text: "Разобраться самим", nextIdx: 33 }
    ]},

    // 1. Макс
    { speaker: "Алиса",background:BACKGROUNDS.CLASSROOM, text: "Макс, не хочешь с нами?", char: CHARACTERS.ALICE_HORNI}, // 26
    { speaker: "Максим",background:BACKGROUNDS.CLASSROOM, text: "Конечно, давайте. Я слышал, они недавно сменили рекламу на агрессивную. Возможно, причина в этом...", char: CHARACTERS.MAX }, // 27
    { speaker: "Света",background:BACKGROUNDS.CLASSROOM, text: "Либо директор проиграл компанию в казик.", char: null, nextIdx: 35 }, // 28

    // 2. Катя
    { speaker: "Алиса",background:BACKGROUNDS.CLASSROOM, text: "Эй, хочешь с нами делать?", char: CHARACTERS.ALICE }, // 29
    { speaker: "Катя",background:BACKGROUNDS.CLASSROOM, text: "Да, спасибо, что позвали. Я Катя. Спросим у чата гпт?", char: CHARACTERS.KATYA }, // 30
    { speaker: "Алиса",background:BACKGROUNDS.CLASSROOM, text: "Может хоть попытаемся подумать?", char: CHARACTERS.ALICE }, // 31
    { speaker: "Катя",background:BACKGROUNDS.CLASSROOM, text: "Можно, а зачем?", char: CHARACTERS.KATYA, nextIdx: 35 }, // 32

    // 3. Сами
    { speaker: "Света",background:BACKGROUNDS.CLASSROOM, text: "Ничего не понимаю. Ну что такого поменялось у текстильной фирмы за месяц?", char: null }, // 33
    { speaker: "Алиса",background:BACKGROUNDS.CLASSROOM, text: "Хлопок некому собирать?", char: CHARACTERS.ALICE }, // 34

    // --- Сцена 35: Конец пары ---
    { speaker: "",background:BACKGROUNDS.CABINET, text: "Звонок прозвенел неожиданно. Виктор Андреевич вышел из кабинета.", char: null },
    { speaker: "Света",background:BACKGROUNDS.CLASSROOM, text: "Собираешься сегодня готовиться или пойдешь на выступление?", char: null },

    // --- Сцена 37: Выбор (Идти или нет) ---
    { isChoice: true,background:BACKGROUNDS.CLASSROOM, text: "Алиса:", char: CHARACTERS.ALICE, choices: [
        { text: "Точно, выступление. Наверное, нет. Надо доделать это задание.", nextIdx: 41 },
        { text: "Да, уже собралась. Забегу только тетради скину.", nextIdx: 38 }
    ]},

    // Ветка: Иду на выступление
    { speaker: "Света", text: "А домашка?", char: CHARACTERS.SVETA,background:BACKGROUNDS.CLASSROOM }, // 38
    { speaker: "Алиса", text: "Потом сделаю. По ситуации.", char: CHARACTERS.ALICE,background:BACKGROUNDS.CLASSROOM }, // 39
    { isChoice: true,background:BACKGROUNDS.CLASSROOM, text: "Макса позовешь?", char: CHARACTERS.ALICE, choices: [ // 40
        { text: "Да, сейчас подойду.", nextIdx: 41, stats: { maxRel: 1 } },
        { text: "Думаю, сама доберусь.", nextIdx: 41 }
    ]},

    // Финал главы
    { speaker: "",background:BACKGROUNDS.CLASSROOM, text: "Глава 3 завершена.", endChapter: true} // 41
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
        const chapterExists = !!CHAPTERS[chapterNum]; // Проверяем, есть ли такая глава в сценарии
        const isUnlocked = chapterNum <= maxUnlockedChapter;

        // Сначала убираем старые классы, чтобы не дублировались
        card.classList.remove('locked');
        const statusElement = card.querySelector('.chapter-status');

        if (!chapterExists) {
            // Если главы еще нет в коде
            card.classList.add('locked');
            statusElement.textContent = 'В разработке';
        } 
        else if (isUnlocked) {
            // Если глава разблокирована и существует
            statusElement.textContent = 'Доступно';
        } 
        else {
            // Если глава существует, но еще закрыта
            card.classList.add('locked');
            // Динамически подсказываем, что нужно пройти предыдущую главу
            statusElement.textContent = `Пройдите главу ${chapterNum - 1}`;
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
                    if (s === 'kirRel')   statName = "Отношения с Кириллом";
                    if (s === 'victRel')   statName = "Отношения с Виктором";
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
    const chapter = CHAPTERS[currentChapter];
    const currentScene = chapter[currentSceneIndex];
    
    // 1. Проверяем, проигрыш это или победа
    const isGameOver = currentScene.isGameOver === true;
    const msg = isGameOver 
        ? "Алису отчислили! Игра окончена. Попробуйте еще раз." 
        : `Глава ${currentChapter} успешно окончена!`;

    // 2. Разблокируем следующую главу ТОЛЬКО если это НЕ проигрыш
    if (!isGameOver && currentChapter === maxUnlockedChapter) {
        maxUnlockedChapter = currentChapter + 1;
        
    }

    // 3. Логика закрытия экрана сцены (общая для всех)
    const onClose = () => {
        sceneScreen.style.display = 'none';
        chaptersScreen.style.display = 'flex';
        sceneHistory = [];
        updateChapterCards(); // Обновляем замочки на карточках
    };

    // 4. Вывод сообщения (Telegram или обычный alert)
    if (tg.version && tg.isVersionAtLeast && tg.isVersionAtLeast('6.2')) {
        tg.showAlert(msg, onClose);
    } else {
        alert(msg);
        onClose();
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