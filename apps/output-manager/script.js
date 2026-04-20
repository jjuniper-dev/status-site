const form = document.getElementById('outputForm');
const drafting = document.getElementById('drafting');
const ready = document.getElementById('ready');
const published = document.getElementById('published');
const template = document.getElementById('cardTemplate');

let state = JSON.parse(localStorage.getItem('outputs') || '[]');

function save() {
  localStorage.setItem('outputs', JSON.stringify(state));
}

function render() {
  drafting.innerHTML = '';
  ready.innerHTML = '';
  published.innerHTML = '';

  state.forEach((item, idx) => {
    const node = template.content.cloneNode(true);
    const card = node.querySelector('.card');

    node.querySelector('.badge').textContent = item.type;
    node.querySelector('.card-title').textContent = item.title;
    node.querySelector('.card-audience').textContent = item.audience;
    node.querySelector('.card-context').textContent = item.context;
    node.querySelector('.card-points').textContent = item.points;
    node.querySelector('.card-sources').textContent = item.sources;
    node.querySelector('.card-instructions').textContent = item.instructions;

    node.querySelector('.move-next').onclick = () => moveNext(idx);
    node.querySelector('.delete').onclick = () => remove(idx);

    if (item.stage === 'drafting') drafting.appendChild(node);
    else if (item.stage === 'ready') ready.appendChild(node);
    else published.appendChild(node);
  });
}

function moveNext(index) {
  const stages = ['drafting', 'ready', 'published'];
  let current = stages.indexOf(state[index].stage);
  if (current < stages.length - 1) {
    state[index].stage = stages[current + 1];
  }
  save();
  render();
}

function remove(index) {
  state.splice(index, 1);
  save();
  render();
}

form.onsubmit = (e) => {
  e.preventDefault();
  const data = new FormData(form);

  state.push({
    type: data.get('outputType'),
    title: data.get('title'),
    audience: data.get('audience'),
    context: data.get('context'),
    points: data.get('points'),
    sources: data.get('sources'),
    instructions: data.get('instructions'),
    stage: 'drafting'
  });

  form.reset();
  save();
  render();
};

render();
