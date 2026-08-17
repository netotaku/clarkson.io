<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue';

type QuoteResponse = {
  q: string;
  a: string;
};

type LetterCell = {
  id: number;
  char: string;
  code: string | null;
  punctuation: boolean;
  revealed: boolean;
  solved: boolean;
  incorrect: boolean;
  value: string;
};

interface Props {
  endpoint?: string;
  startingLives?: number;
  starterVowels?: number;
  starterConsonants?: number;
  instancesPerStarter?: number;
  autoNextDelay?: number;
}

const props = withDefaults(defineProps<Props>(), {
  endpoint: '/.netlify/functions/quote',
  startingLives: 4,
  starterVowels: 2,
  starterConsonants: 2,
  instancesPerStarter: 2,
  autoNextDelay: 500,
});

const loading = ref(true);
const error = ref('');

const quote = ref('');
const author = ref('');

const cells = ref<LetterCell[]>([]);

const lives = ref(props.startingLives);
const streak = ref(0);

const inputRefs = ref<HTMLInputElement[]>([]);

const isGameOver = computed(() => {
  return lives.value <= 0;
});

const letterCells = computed(() => {
  return cells.value.filter(
    (cell) => !cell.punctuation
  );
});

const solvedCount = computed(() => {
  return letterCells.value.filter(
    (cell) => cell.solved || cell.revealed
  ).length;
});

const totalLetters = computed(() => {
  return letterCells.value.length;
});

/*
 * Turn the quote into arrays of complete words.
 *
 * Each word becomes one flex item in the template,
 * which means the browser wraps complete words rather
 * than breaking the puzzle character-by-character.
 */
const words = computed(() => {
  const result: LetterCell[][] = [];

  let current: LetterCell[] = [];

  for (const cell of cells.value) {
    if (cell.char === ' ') {
      if (current.length) {
        result.push(current);
        current = [];
      }

      continue;
    }

    current.push(cell);
  }

  if (current.length) {
    result.push(current);
  }

  return result;
});

function isLetter(char: string) {
  return /^[A-Z]$/i.test(char);
}

function shuffle<T>(items: T[]) {
  const copy = [...items];

  for (let i = copy.length - 1; i > 0; i--) {
    const j =
      Math.floor(
        Math.random() * (i + 1)
      );

    [
      copy[i],
      copy[j],
    ] = [
      copy[j],
      copy[i],
    ];
  }

  return copy;
}

function sampleMany<T>(
  items: T[],
  count: number
) {
  return shuffle(items).slice(
    0,
    Math.min(
      count,
      items.length
    )
  );
}

function generateLetterMap(
  text: string
) {
  const uniqueLetters = [
    ...new Set(
      text
        .toUpperCase()
        .replace(/[^A-Z]/g, '')
        .split('')
    ),
  ];

  return Object.fromEntries(
    shuffle(uniqueLetters).map(
      (letter, index) => [
        letter,
        String(index + 1)
          .padStart(2, '0'),
      ]
    )
  ) as Record<string, string>;
}

function getStarterLetters(
  text: string
) {
  const unique = [
    ...new Set(
      text
        .toUpperCase()
        .replace(/[^A-Z]/g, '')
        .split('')
    ),
  ];

  const vowels = [
    'A',
    'E',
    'I',
    'O',
    'U',
  ];

  const availableVowels =
    unique.filter(
      (letter) =>
        vowels.includes(letter)
    );

  const availableConsonants =
    unique.filter(
      (letter) =>
        !vowels.includes(letter)
    );

  return [
    ...sampleMany(
      availableVowels,
      props.starterVowels
    ),

    ...sampleMany(
      availableConsonants,
      props.starterConsonants
    ),
  ];
}

function buildCells(
  text: string
) {
  const map =
    generateLetterMap(text);

  const starters =
    getStarterLetters(text);

  const revealCounts:
    Record<string, number> = {};

  cells.value =
    [...text].map(
      (char, id) => {
        const upper =
          char.toUpperCase();

        if (!isLetter(upper)) {
          return {
            id,
            char,
            code: null,
            punctuation: true,
            revealed: true,
            solved: true,
            incorrect: false,
            value: char,
          };
        }

        const alreadyRevealed =
          revealCounts[upper] ?? 0;

        const revealed =
          starters.includes(upper) &&
          alreadyRevealed <
            props.instancesPerStarter;

        if (revealed) {
          revealCounts[upper] =
            alreadyRevealed + 1;
        }

        return {
          id,
          char: upper,
          code: map[upper],
          punctuation: false,
          revealed,
          solved: revealed,
          incorrect: false,
          value:
            revealed
              ? upper
              : '',
        };
      }
    );
}

async function fetchQuote() {
  loading.value = true;
  error.value = '';

  inputRefs.value = [];

  try {
    const response =
      await fetch(
        props.endpoint
      );

    if (!response.ok) {
      throw new Error(
        `Quote request failed (${response.status})`
      );
    }

    const payload =
      await response.json();

    const data:
      QuoteResponse | undefined =
      Array.isArray(payload)
        ? payload[0]
        : payload;

    if (!data?.q) {
      throw new Error(
        'Quote response was empty'
      );
    }

    quote.value = data.q;
    author.value = data.a ?? '';

    buildCells(data.q);

    await nextTick();

    focusFirstEditable();
  } catch (err) {
    error.value =
      err instanceof Error
        ? err.message
        : 'Failed to fetch quote';
  } finally {
    loading.value = false;
  }
}

function setInputRef(
  el: Element | null
) {
  if (
    !(el instanceof HTMLInputElement)
  ) {
    return;
  }

  if (
    !inputRefs.value.includes(el)
  ) {
    inputRefs.value.push(el);
  }
}

function focusFirstEditable() {
  inputRefs.value
    .find(
      (input) =>
        !input.disabled
    )
    ?.focus();
}

function focusNext(
  current: HTMLInputElement
) {
  const active =
    inputRefs.value.filter(
      (input) =>
        !input.disabled
    );

  const index =
    active.indexOf(current);

  const next =
    active[index + 1] ??
    active[0];

  next?.focus();
}

async function checkCell(
  cell: LetterCell,
  event: Event
) {
  if (
    cell.revealed ||
    cell.solved ||
    isGameOver.value
  ) {
    return;
  }

  const input = event.currentTarget as HTMLInputElement;

  const entered = input.value.slice(-1).toUpperCase();

  cell.incorrect = false;

  if (!entered) {
    cell.value = '';

    return;
  }

  if (
    entered === cell.char
  ) {
    cell.value = cell.char;
    cell.solved = true;

    if (
      solvedCount.value >=
      totalLetters.value
    ) {
      streak.value++;

      window.setTimeout(
        fetchQuote,
        props.autoNextDelay
      );

      return;
    }

    await nextTick();

    focusNext(input);

    return;
  }

  cell.value = '';
  cell.incorrect = true;

  lives.value--;

  if (
    lives.value > 0
  ) {
    await nextTick();

    input.focus();
  }
}

function nextQuote() {
  lives.value--;

  streak.value = 0;

  if (
    lives.value > 0
  ) {
    fetchQuote();
  }
}

function newGame() {
  lives.value =
    props.startingLives;

  streak.value = 0;

  fetchQuote();
}

onMounted(fetchQuote);
</script>

<template>
  <section
    class="codeword"
    :class="{
      'codeword--game-over':
        isGameOver,
    }"
  >
    <div
      v-if="loading"
      class="
        flash
        codeword__flash
        codeword__flash--loading
      "
    >
      Fetching wisdom…
    </div>

    <div
      v-else-if="error"
      class="
        flash
        flash--error
        codeword__flash
        codeword__flash--error
      "
    >
      <p>
        {{ error }}
      </p>

      <button
        type="button"
        class="
          button
          codeword__action
        "
        @click="fetchQuote"
      >
        Try again
      </button>
    </div>

    <template
      v-else-if="!isGameOver"
    >
      <blockquote
        class="codeword__quote"
      >
        <div
          class="codeword__words"
        >
          <span
            v-for="
              (word, wordIndex)
              in words
            "
            :key="wordIndex"
            class="codeword__word"
          >
            <template
              v-for="cell in word"
              :key="cell.id"
            >
              <span
                v-if="
                  cell.punctuation
                "
                class="
                  codeword__punctuation
                "
              >
                {{ cell.char }}
              </span>

              <label
                v-else
                class="
                  codeword__letter
                "
                :class="{
                  'codeword__letter--incorrect':
                    cell.incorrect,

                  'codeword__letter--solved':
                    cell.solved,

                  'codeword__letter--revealed':
                    cell.revealed,
                }"
              >
                <input
                  :ref="setInputRef"

                  class="
                    codeword__input
                  "

                  type="text"

                  maxlength="1"

                  inputmode="text"

                  autocapitalize="
                    characters
                  "

                  autocomplete="off"

                  autocorrect="off"

                  spellcheck="false"

                  :disabled="
                    cell.revealed ||
                    cell.solved
                  "

                  :value="
                    cell.value
                  "

                  :aria-label="
                    `Letter ${cell.code}`
                  "

                  @focus="
                    cell.incorrect =
                      false
                  "

                  @input="
                    checkCell(
                      cell,
                      $event
                    )
                  "
                />

                <span
                  class="
                    codeword__code
                  "
                >
                  {{ cell.code }}
                </span>
              </label>
            </template>
          </span>
        </div>

        <cite
          class="
            codeword__author
          "
        >
          — {{ author }}
        </cite>
      </blockquote>

      <footer
        class="
          codeword__footer
        "
      >
        <div
          class="
            codeword__score
          "
        >
          <span
            class="
              codeword__lives
            "
          >
            ♡ {{ lives }}
          </span>

          <span
            class="
              codeword__streak
            "
          >
            Streak
            {{ streak }}
          </span>
        </div>

        <button
          type="button"

          class="
            button
            codeword__action
          "

          @click="
            nextQuote
          "
        >
          Next quote
        </button>
      </footer>
    </template>

    <div
      v-else

      class="
        flash
        flash--error
        codeword__flash
        codeword__game-over
      "
    >
      <strong>
        Game over
      </strong>

      <p>
        Streak:
        {{ streak }}
      </p>

      <button
        type="button"

        class="
          button
          codeword__action
        "

        @click="newGame"
      >
        Play again
      </button>
    </div>
  </section>
</template>

<style scoped lang="scss">
/*
 * STRUCTURE / GAMEPLAY ONLY
 *
 * Your global site styles own:
 *
 * - typography
 * - font sizes
 * - colours
 * - buttons
 * - flashes
 * - borders
 * - decorative states
 */

.codeword {
  width: 100%;

  &__quote {
    margin: 0;
  }

  /*
   * This is the important responsive bit.
   *
   * Complete words wrap.
   * Letters within words do not.
   */
  &__words {
    display: flex;
    flex-wrap: wrap;

    column-gap: 0.55em;
    row-gap: 0.45em;

    align-items:
      flex-start;
  }

  &__word {
    display: inline-flex;

    flex: 0 0 auto;

    white-space: nowrap;
  }

  &__letter,
  &__punctuation {
    display:
      inline-flex;

    flex-direction:
      column;

    align-items:
      center;

    flex: 0 0 auto;
  }

  /*
   * These dimensions are relative to whatever
   * font-size your site gives the puzzle.
   */
  &__input,
  &__punctuation {
    box-sizing:
      border-box;

    width: 0.78em;
    height: 1.15em;

    padding: 0;
    margin: 0;

    border: 0;

    appearance: none;

    background:
      transparent;

    color: inherit;

    font: inherit;
    line-height:
      inherit;

    text-align:
      center;

    text-transform:
      uppercase;
  }

  /*
   * Kept because an empty character needs
   * some visible interactive affordance.
   *
   * Feel free to override this globally.
   */
  &__input {
    border-bottom:
      0.04em
      solid
      currentColor;

    &:focus {
      outline:
        2px
        solid
        currentColor;

      outline-offset:
        2px;
    }

    &:disabled {
      opacity: 1;

      color: inherit;

      -webkit-text-fill-color:
        currentColor;

      cursor: default;
    }
  }

  &__code {
    display: block;

    margin-top:
      0.2em;

    font-size:
      var(--font-size-wurd-code);

    line-height: 1;

    text-align:
      center;
  }

  &__author {
    display: block;

    margin-top: 1em;

    font-style:
      normal;
  }

  /*
   * No key/divider line here anymore.
   */
  &__footer {
    display: flex;
    flex-wrap: wrap;

    align-items:
      center;

    justify-content:
      space-between;

    gap: 1rem;

    margin-top:
      1.5rem;
  }

  &__score {
    display: flex;
    flex-wrap: wrap;

    gap: 0.75em;
  }
}
</style>
