/* Lamora interactive stories — short read-aloud tales with choices,
   gentle lessons and a memory quiz at the end. */
(function () {
  "use strict";

  const STORIES = [
    {
      id: "shell", emoji: "🐚", name: "The Sharing Shell", theme: "Sharing",
      pages: [
        { art: "🦀", text: "Coco the crab found a beautiful, shiny shell on the beach. It was the prettiest shell she had ever seen!" },
        { art: "🐠", text: "Her friend Finn the fish swam up. “Wow!” said Finn. “May I look at your shell?”" },
        {
          art: "🤔", text: "Coco held the shell tight. What should she do?",
          choice: {
            a: "Share the shell with Finn",
            b: "Hide the shell away",
            after: {
              a: "Coco showed Finn the shell. They took turns holding it and laughed as it sparkled in the sun!",
              b: "Coco hid the shell… but playing alone wasn't much fun. So she called Finn back — and sharing made the shell sparkle even more!"
            }
          }
        },
        { art: "🌅", text: "That evening, Coco smiled. Treasures are lovely — but sharing them with friends is the loveliest thing of all." }
      ],
      quiz: { q: "What did Coco find on the beach?", a: "A shiny shell", opts: ["A shiny shell", "A gold coin", "A hat"] },
      lesson: "Sharing makes good things even better!"
    },
    {
      id: "brave", emoji: "🦉", name: "Ollie's First Flight", theme: "Courage",
      pages: [
        { art: "🦉", text: "Ollie the little owl sat on a high branch. Tonight was his first flying night — and his tummy was full of butterflies." },
        { art: "🌙", text: "“What if I fall?” Ollie whispered. His mama hooted softly: “Being brave doesn't mean you're not scared. It means trying anyway.”" },
        {
          art: "💫", text: "Ollie looked at the moon. What should he do?",
          choice: {
            a: "Take a deep breath and jump",
            b: "Ask mama to fly beside him",
            after: {
              a: "Ollie took a deep breath and leapt! His wings caught the wind — he was flying!",
              b: "Mama flew right beside him. With her wing near his, Ollie jumped — and soared into the night sky!"
            }
          }
        },
        { art: "⭐", text: "Ollie whooshed past the stars, laughing. The thing he had feared became the thing he loved most." }
      ],
      quiz: { q: "How did Ollie feel before his first flight?", a: "Scared but brave", opts: ["Scared but brave", "Sleepy", "Angry"] },
      lesson: "Being brave means trying even when you feel scared."
    },
    {
      id: "garden", emoji: "🌱", name: "The Curious Seed", theme: "Curiosity",
      pages: [
        { art: "🌱", text: "Pip the seed lived in a cosy seed packet. One day she wondered: “What is out there, above the soil?”" },
        { art: "🌧️", text: "A kind gardener planted Pip in the earth. Rain fell — drip, drop! — and Pip felt herself stretch and grow." },
        {
          art: "🌤️", text: "Pip felt sunshine calling her upward. What should she do?",
          choice: {
            a: "Grow up towards the light",
            b: "Wait a little longer and grow strong roots",
            after: {
              a: "Pip pushed up, up, up — POP! She burst into the sunshine and saw the wide, wonderful world!",
              b: "Pip grew deep, strong roots first. Then she shot up taller than all the other flowers!"
            }
          }
        },
        { art: "🌻", text: "Pip became a glorious sunflower. And it all began with one small question: “What is out there?”" }
      ],
      quiz: { q: "What did Pip become?", a: "A sunflower", opts: ["A sunflower", "A tree", "A cactus"] },
      lesson: "Asking questions helps us grow!"
    },
    {
      id: "kind", emoji: "🐘", name: "Ella Lends a Trunk", theme: "Kindness",
      pages: [
        { art: "🐘", text: "Ella the elephant was on her way to the waterhole when she heard a tiny cry. “Help! My ball is stuck in the tree!”" },
        { art: "🐒", text: "It was little Momo the monkey. His red ball was caught high in the branches, and he was too small to reach it." },
        {
          art: "💭", text: "Ella was in a hurry. What should she do?",
          choice: {
            a: "Stop and help Momo",
            b: "Find more friends to help together",
            after: {
              a: "Ella reached up with her long trunk and — plop! — the ball came free. Momo cheered!",
              b: "Ella called the giraffes and together they rescued the ball in no time. Teamwork!"
            }
          }
        },
        { art: "💞", text: "At the waterhole, Momo shared his splashiest game with Ella. Kindness always finds its way back to you." }
      ],
      quiz: { q: "What was stuck in the tree?", a: "A red ball", opts: ["A red ball", "A kite", "A banana"] },
      lesson: "A little kindness makes a big difference."
    }
  ];

  function menu(ctx) {
    ctx.root.appendChild(ctx.backRow());
    ctx.root.appendChild(ctx.title("Stories 📖", "Pick a story — I can read it out loud to you!"));
    const grid = ctx.el("div", { class: "tile-grid" });
    STORIES.forEach(s => {
      grid.appendChild(ctx.el("button", {
        class: "tile", onclick: () => { ctx.Sound.tap(); read(ctx, s); }
      }, [
        ctx.el("span", { class: "tile-emoji", text: s.emoji }),
        ctx.el("span", { class: "tile-label", text: s.name }),
        ctx.el("span", { class: "tile-sub", text: s.theme })
      ]));
    });
    ctx.root.appendChild(grid);
  }

  function read(ctx, story, pageIdx, chosenPath) {
    pageIdx = pageIdx || 0;
    const page = story.pages[pageIdx];

    ctx.root.innerHTML = "";
    const wrap = ctx.el("div", { class: "story-page" });
    wrap.appendChild(ctx.backRow());
    wrap.appendChild(ctx.el("h1", { class: "screen-title", text: story.emoji + " " + story.name }));

    const art = ctx.el("div", { class: "story-illustration", text: page.art, role: "img", "aria-label": "Story picture" });
    const text = ctx.el("p", { class: "story-text", text: page.text });
    wrap.appendChild(ctx.el("div", { class: "card" }, [
      art, text,
      ctx.el("div", { class: "btn-row" }, [
        ctx.el("button", { class: "speak-btn", "aria-label": "Read this page aloud", onclick: () => ctx.speak(page.text) }, ["🔊 Read to me"])
      ])
    ]));

    const nav = ctx.el("div", { class: "btn-row" });
    if (page.choice && !chosenPath) {
      nav.appendChild(ctx.el("button", {
        class: "btn", onclick: () => {
          text.textContent = page.choice.after.a;
          art.textContent = "💛";
          ctx.speak(page.choice.after.a);
          read(ctx, story, pageIdx, "a");
        }
      }, ["💛 " + page.choice.a]));
      nav.appendChild(ctx.el("button", {
        class: "btn", onclick: () => {
          ctx.speak(page.choice.after.b);
          read(ctx, story, pageIdx, "b");
        }
      }, ["💙 " + page.choice.b]));
    } else if (page.choice && chosenPath) {
      /* Show the outcome of the chosen path, then continue */
      text.textContent = page.choice.after[chosenPath];
      art.textContent = "✨";
      nav.appendChild(ctx.el("button", {
        class: "btn", onclick: () => read(ctx, story, pageIdx + 1)
      }, ["Next ➡"]));
    } else if (pageIdx < story.pages.length - 1) {
      nav.appendChild(ctx.el("button", {
        class: "btn", onclick: () => read(ctx, story, pageIdx + 1)
      }, ["Next ➡"]));
    } else {
      nav.appendChild(ctx.el("button", {
        class: "btn btn-good", onclick: () => quiz(ctx, story)
      }, ["⭐ Story quiz"]));
    }
    if (pageIdx > 0 && !page.choice) {
      nav.appendChild(ctx.el("button", { class: "btn btn-ghost", onclick: () => read(ctx, story, pageIdx - 1) }, ["⬅ Previous"]));
    }
    wrap.appendChild(nav);

    /* Progress dots */
    const dots = ctx.el("div", { class: "progress-dots" });
    story.pages.forEach((_, i) => dots.appendChild(ctx.el("span", { class: "pdot" + (i < pageIdx ? " done" : i === pageIdx ? " now" : "") })));
    wrap.appendChild(dots);

    ctx.root.appendChild(wrap);
    if (!chosenPath) ctx.speak(page.text);
  }

  function quiz(ctx, story) {
    ctx.runQuiz({
      title: story.emoji + " Story quiz",
      category: "literacy",
      maxStars: 2,
      questions: [{
        prompt: story.quiz.q,
        promptEmoji: story.emoji,
        choices: story.quiz.opts.slice(),
        answer: story.quiz.a,
        hint: "Think back to the story…",
        explain: story.lesson
      }],
      again: () => read(ctx, story, 0),
      againLabel: "Read again"
    });
  }

  window.LamoraStories = { menu };
})();
