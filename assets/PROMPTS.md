# Промпты для артов

Готовые картинки клади в `assets/img/` под именами из таблиц. Формат JPG или WebP, до 400 КБ на файл (больше — игра будет долго грузиться).

## Как добиться единого стиля

1. Генерируй всё в одной нейросети.
2. В начало каждого промпта вставляй один и тот же блок стиля (ниже).
3. Если нейросеть умеет «стиль по образцу» (style reference), сделай сначала портрет Богдана, выбери лучший и дальше подавай его как образец стиля.
4. На картинках не должно быть текста, рамок и подписей.
5. Портреты можно делать по фото ребят (если они не против): загрузи фото как референс и оставь мой промпт как есть.

### Блок стиля (английский, для Midjourney и похожих)

```
expressionist oil painting, thick impasto brushstrokes, visible palette knife marks, loose unfinished edges, muted earthy base palette of umber, ochre and dusty teal with sudden acid accents of magenta, cyan and honey yellow, dramatic low golden light, slightly distorted proportions, melancholic and surreal mood, painterly, no text, no frame, no watermark
```

### Блок стиля (русский, для Шедеврума и Kandinsky)

```
экспрессионистская живопись маслом, густые пастозные мазки, следы мастихина, незаконченные края, приглушённая землистая палитра (умбра, охра, пыльный бирюзовый) с резкими кислотными акцентами маджента, циан и медово-жёлтый, низкий золотой свет, слегка искажённые пропорции, меланхоличное сюрреалистичное настроение, без текста, без рамки
```

Для русских нейросетей бери русский блок стиля и русское описание из колонки «Что на картинке».

---

## 1. Портреты (вертикальные, 3:4, от 768×1024)

Погрудный портрет, лицо в верхней половине кадра, взгляд на зрителя или чуть мимо. Фон — абстрактные мазки, без деталей.

| Файл | Что на картинке |
|---|---|
| `p_rusya.jpg` | Руслан: молодой мужчина в домашнем худи, на шее игровые наушники, усталые умные глаза, прямой тяжёлый взгляд, кривая усмешка; лицо освещено холодным светом монитора с одной стороны и тёплым медовым с другой |
| `p_bogdan.jpg` | Богдан: молодой мужчина стоит вполоборота, почти боком, смотрит через плечо; на плечах сидит красный краб как эполет; спокойное упрямое лицо, красно-оранжевые блики |
| `p_yarik.jpg` | Ярослав: молодой мужчина в очках с открытой весёлой улыбкой, под мышкой толстая книга, в пальцах шахматный конь; сине-зелёные тона, свет как из окна библиотеки |
| `p_ilya.jpg` | Илья: молодой мужчина в морском бушлате с поднятым воротником, в руке микрофон, за ухом карандаш; взгляд вдаль, фиолетово-розовые тона, ветер |
| `p_misha.jpg` | Михаил: крупный добродушный мужчина в рабочей куртке, руки в карманах, вокруг головы кружат несколько пчёл; лёгкий двоящийся контур, будто он был здесь час назад; тёплые коричнево-зелёные тона |
| `p_queen.jpg` | Матка: огромная пчелиная матка на золотой соте, величественная, как на парадном портрете монарха; вокруг неё склонились рабочие пчёлы; темнота улья, свет идёт от мёда в ячейках |
| `p_guard.jpg` | Стражница: пчела-стражница крупным планом у летка улья, поза часового, суровый фасеточный взгляд, жёлто-чёрные мазки |

Английские промпты (после блока стиля):

```
p_rusya: bust portrait of a young man in a home hoodie with gaming headphones around his neck, tired intelligent eyes, heavy direct stare, crooked smirk, face lit cold blue from a monitor on one side and warm honey gold on the other, abstract brushstroke background
p_bogdan: bust portrait of a young man standing almost sideways, looking over his shoulder, a red crab sitting on his shoulder like an epaulette, calm stubborn face, red and orange highlights, abstract brushstroke background
p_yarik: bust portrait of a cheerful young man in glasses with an open smile, a thick book under his arm, a chess knight held between his fingers, blue and green tones, library window light, abstract brushstroke background
p_ilya: bust portrait of a young man in a navy pea coat with the collar up, holding a microphone, a pencil behind his ear, gazing into the distance, purple and pink tones, wind in the air, abstract brushstroke background
p_misha: bust portrait of a big good-natured man in a work jacket, hands in pockets, several bees circling his head, a faint doubled ghost outline as if he was here an hour ago, warm brown and green tones, abstract brushstroke background
p_queen: a giant queen bee on a golden honeycomb, majestic like a royal state portrait, worker bees bowing around her, darkness of the hive, light glowing from honey in the cells
p_guard: close-up of a guard bee at a hive entrance, sentry pose, stern compound-eye stare, yellow and black brushstrokes
```

---

## 2. Фоны локаций (горизонтальные, 16:9, от 1920×1080)

Главный объект — в центре кадра. Нижняя треть спокойная и тёмная (там заголовок), левый верхний угол без важных деталей (там счётчики). Людей на фонах нет.

| Файл | Что на картинке |
|---|---|
| `bg_clover.jpg` | Вид от земли: клевер крупным планом, за ним вдали цветные ульи, небо цвета гречишного мёда |
| `bg_hub.jpg` | Пасека на закате: пять тропинок расходятся от большого жёлтого улья, вокруг маленькие ульи (розовый, голубой, красный, зелёный), в небе вместо солнца огромный глаз с шестиугольной радужкой |
| `bg_kitchen.jpg` | Летняя кухня под навесом: круглый стол, самовар, трёхлитровая банка тёмного мёда, картонная табличка, тёплый оранжевый свет |
| `bg_pump.jpg` | Старая водяная колонка, корыто-поилка с камушками, деревянная бочка на тележке без колеса, свёрнутый шланг, сине-бирюзовые тени |
| `bg_shed.jpg` | Сарай пасечника изнутри: полки с книгами, рамки для сот, дымари, медогонка под чехлом, шахматная доска на перевёрнутом улье, пыль в луче света |
| `bg_gazebo.jpg` | Беседка, увитая хмелем: стол, тетрадь, огрызок карандаша, дымящий дымарь, фиолетовые сумерки |
| `bg_far.jpg` | Дальние ульи на опушке тёмного леса, примятая трава, кольцо пчёл в воздухе, тревожный зелёный свет |
| `bg_gate.jpg` | Леток большого улья крупным планом: деревянная стенка, тёмная щель входа, прилётная доска, золотой свет изнутри |
| `bg_queen.jpg` | Внутри улья: бесконечные стены из сот, в ячейках светятся мёд и пыльца, собор из воска, калейдоскопическая симметрия, тёплая темнота |

Английские промпты (после блока стиля):

```
bg_clover: ground-level view, clover flowers in extreme close-up, distant colorful beehives behind them, sky the color of dark buckwheat honey, wide landscape
bg_hub: an apiary at sunset, five paths radiating from a large yellow beehive, small pink, blue, red and green hives around it, instead of the sun a giant eye with a hexagonal iris hangs in the sky, wide landscape, no people
bg_kitchen: a rustic summer kitchen under a canopy, round table, samovar, large jar of dark honey, a small blank cardboard sign, warm orange light, no people
bg_pump: an old water pump, a drinking trough with pebbles in the water, a wooden barrel on a cart missing one wheel, a coiled garden hose, blue and teal shadows, no people
bg_shed: interior of a beekeeper's shed, shelves of old books, honeycomb frames, bee smokers, a covered honey extractor, a chessboard on an overturned hive box, dust in a beam of light, no people
bg_gazebo: a garden gazebo overgrown with hop vines, a table with a notebook and a pencil stub, a smoking bee smoker, purple dusk, no people
bg_far: distant beehives at the edge of a dark forest, trampled grass, a ring of bees hovering in the air, uneasy green light, no people
bg_gate: extreme close-up of a large beehive entrance, weathered wooden wall, dark entrance slit, landing board, golden light glowing from inside
bg_queen: inside a beehive, endless walls of honeycomb, cells glowing with honey and pollen, a cathedral made of wax, kaleidoscopic symmetry, warm darkness
```

---

## 3. Иконки голосов (квадратные, 1:1, от 512×512) — по желанию

Абстрактные «портреты» внутренних голосов. Без них игра обойдётся, с ними панель «Голова» будет выглядеть дорого.

| Файл | Что на картинке |
|---|---|
| `s_log.jpg` | Жужжалогика: голова из шестиугольников и чертёжных линий, холодный голубой |
| `s_enc.jpg` | Энциклопчёлия: пчела в очках на стопке книг, синий |
| `s_heart.jpg` | Медовое сердце: сердце, из которого капает мёд, сиреневый |
| `s_hive.jpg` | Внутренний улей: человеческий силуэт, внутри головы улей с пчёлами, розовый |
| `s_chit.jpg` | Хитин: панцирь жука как рыцарский доспех, красный |
| `s_sweet.jpg` | Сладкая тяга: ложка с тянущимся мёдом и жадный язык, оранжевый |
| `s_wag.jpg` | Ваггл: танцующая пчела, оставляющая в воздухе восьмёрку, жёлтый |
| `s_auth.jpg` | Авторитет чата: телефон в короне, от экрана идёт сияние, кислотно-зелёный |

```
s_log: abstract head made of hexagons and drafting lines, cold light blue
s_enc: a bee wearing glasses sitting on a stack of books, blue
s_heart: a heart dripping honey, lilac and purple
s_hive: a human silhouette with a beehive full of bees inside the head, pink
s_chit: a beetle shell shaped like knight armor, red
s_sweet: a spoon with stretching honey and a greedy tongue, orange
s_wag: a dancing bee leaving a figure-eight trail in the air, yellow
s_auth: a smartphone wearing a crown, radiant glow from the screen, acid green
```

---

## Порядок

Если хочется начать с малого: сначала 5 портретов и `bg_hub.jpg`. По ним уже будет видно, попадает ли стиль, и я смогу встроить их в игру.

---

## 4. Чего ещё не хватает

### Портреты пятерых (самое нужное)

В папке пока нет `p_rusya.jpg`, `p_bogdan.jpg`, `p_yarik.jpg`, `p_ilya.jpg`, `p_misha.jpg`. Промпты — в разделе 1. Без них ребята нарисованы кодом и выбиваются из живописи.

### Музыка (по желанию)

Сейчас музыку играет встроенный синтезатор. Если хочешь настоящие треки, сгенерируй их в Suno, Udio или похожем сервисе и положи в `assets/audio/` под этими именами (mp3, 1–2 минуты, без слов, чтобы зацикливалось). Игра подхватит сама.

| Файл | Где играет | Промпт |
|---|---|---|
| `hub.mp3` | меню, пасека | `dreamy psychedelic ambient, warm analog synth pads, slow kalimba melody, distant bee hum, 70 bpm, D minor, instrumental, seamless loop` |
| `kitchen.mp3` | летняя кухня (Руслан) | `cozy lo-fi chiptune, 8-bit arpeggios over soft boom-bap drums, warm and a bit ironic, 100 bpm, C major, instrumental, seamless loop` |
| `pump.mp3` | колонка (Богдан) | `watery marimba and soft mallets, gentle ambient, dripping water texture, slightly comic sideways groove, 76 bpm, E minor, instrumental, seamless loop` |
| `shed.mp3` | сарай (Ярослав) | `playful baroque harpsichord and pizzicato strings, light and witty, chess-game mood, 104 bpm, A minor, instrumental, seamless loop` |
| `gazebo.mp3` | беседка (Илья) | `melancholic boom-bap hip-hop beat, dusty rhodes piano, vinyl crackle, sea wind atmosphere, 86 bpm, F minor, instrumental, seamless loop` |
| `far.mp3` | дальние ульи, леток | `tense dark ambient, low drone, slow heartbeat drum, forest at dusk, uneasy but not horror, 58 bpm, D minor, instrumental, seamless loop` |
| `queen.mp3` | зал Матки, лучший финал | `majestic cathedral organ and glass bells, golden and sacred, slow and vast, honey-like warmth, 52 bpm, D major, instrumental, seamless loop` |
