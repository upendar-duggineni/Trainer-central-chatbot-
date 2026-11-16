
import './style.css';

const API = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

const app = document.querySelector('#app');

app.innerHTML = `
<main class="shell">

  <header>
    <div class="logo">✦</div>

    <div>
      <h1>Trainer Central Assistant</h1>
      <p>Ask about assignment submissions and learners</p>
    </div>

    <span class="status">● Ready</span>
  </header>

  <section class="welcome">
    <h2>How can I help you today?</h2>

    <p>
      I retrieve the latest information from your
      Trainer Central dashboard.
    </p>

    <div class="suggestions">
      <button>How many submissions are there?</button>
      <button>Show the latest submissions</button>
      <button>Find a learner's submissions</button>
    </div>
  </section>

  <section id="messages" class="messages">
    <article class="bubble bot">
      <small>TRAINER CENTRAL ASSISTANT</small>
      <div>
        Hello! 👋 Ask me about assignment submissions,
        learners, or dashboard records.
      </div>
    </article>
  </section>

  <div id="typing" class="typing" hidden>
    Checking dashboard and preparing a reply…
  </div>

  <form id="form">

    <textarea
      id="question"
      rows="1"
      maxlength="2000"
      placeholder="Ask something about Trainer Central..."
      required
    ></textarea>

    <button id="send">Send ↗</button>

  </form>

  <footer>
    Answers are generated from retrieved dashboard data.
    Read-only assistant.
  </footer>

</main>
`;

const form = document.querySelector('#form');
const input = document.querySelector('#question');
const msgs = document.querySelector('#messages');
const send = document.querySelector('#send');
const typing = document.querySelector('#typing');

const history = [];

function addMessage(text, role) {

  const article = document.createElement('article');

  article.className = `bubble ${role}`;

  const label = document.createElement('small');

  label.textContent =
    role === 'user'
      ? 'YOU'
      : 'TRAINER CENTRAL ASSISTANT';

  const body = document.createElement('div');

  body.textContent = text;

  article.append(label, body);

  msgs.append(article);

  msgs.scrollTop = msgs.scrollHeight;
}

async function ask(question) {

  addMessage(question, 'user');

  history.push({
    role: 'user',
    content: question
  });

  send.disabled = true;
  typing.hidden = false;

  try {

    if (!API) {
      throw Error(
        'VITE_API_BASE_URL is missing in Vercel settings.'
      );
    }

    const response = await fetch(
      `${API}/api/chat`,
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          message: question,
          history: history.slice(-8, -1)
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw Error(
        data.detail || `Request failed (${response.status})`
      );
    }

    addMessage(data.reply, 'bot');

    history.push({
      role: 'assistant',
      content: data.reply
    });

  } catch (error) {

    addMessage(
      `Sorry, I couldn't complete that request. ${error.message}`,
      'bot'
    );

    history.pop();

  } finally {

    send.disabled = false;
    typing.hidden = true;
    input.focus();

  }
}

form.addEventListener('submit', event => {

  event.preventDefault();

  const question = input.value.trim();

  if (question && !send.disabled) {

    input.value = '';

    ask(question);

  }

});

input.addEventListener('keydown', event => {

  if (event.key === 'Enter' && !event.shiftKey) {

    event.preventDefault();

    form.requestSubmit();

  }

});

document
  .querySelectorAll('.suggestions button')
  .forEach(button => {

    button.addEventListener('click', () => {

      input.value = button.textContent;

      form.requestSubmit();

    });

  });
