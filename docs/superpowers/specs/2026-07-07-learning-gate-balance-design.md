# Learning Gate And Balance Design

## Goal

Add an educational level-up gate to "육삼이 키우기" and simplify the game into a classroom-friendly idle RPG with four menus: Character, Equipment, Skills, and Settings.

## Learning Flow

- Add 200 elementary grade 6 to middle school grade 1 level English vocabulary entries.
- When EXP reaches the next level, pause battle and show a 3-question multiple choice quiz.
- Each question shows one English word and four Korean meaning choices.
- Choices are shuffled every time a quiz is generated, including repeated words.
- Passing requires at least 2 correct answers out of 3.
- On pass, apply the pending level-up and restore player HP to max.
- On fail, cancel the level-up and set EXP to half of the current level's required EXP.
- While the quiz is open, player attacks, monster attacks, skill cooldown behavior, monster respawn, and revive countdown pause.

## Game Simplification

- Keep only Character, Equipment, Skills, and Settings tabs.
- Remove Shop and Quest screens and their actions.
- Rename export/import buttons to "내 캐릭터 저장하기" and "내 캐릭터 불러오기".
- Equipment slots become weapon, armor, gloves, and ring.
- Remove shoes and necklace.
- Gloves only increase critical chance by 0.01 percentage points per level.
- Ring increases critical damage by 0.5 percentage points per level.
- Base critical damage starts at 110%.
- Skills become Power Slash, Spin Cut, and Heal only.
- Remove Basic Attack from the skill upgrade panel. The player still has an unupgradable normal attack between skills.
- Each skill must show a visible CSS effect when used.

## Combat And Monster Changes

- Player death leaves the character knocked down for 10 seconds before reviving.
- While dead, the player cannot attack.
- Monster damage scales upward by 1% per monster level to make defense meaningful.
- Monster family changes at levels 50, 100, 150, 200, 250, and 300.
- Monster color variant changes every 10 levels between family changes.

## Testing

Add tests for:

- Quiz generation creates 3 questions with 4 choices each and shuffled option order support.
- Passing a pending level-up applies the level and HP restore.
- Failing a pending level-up reduces EXP to half of required EXP.
- Equipment slot and skill set changes are reflected in default state and storage normalization.
- Monster level scaling changes attack and monster visual metadata.

