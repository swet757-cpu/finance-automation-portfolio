const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.nav');

menuButton?.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});

nav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
document.querySelector('#year').textContent = new Date().getFullYear();

const cashApp = document.querySelector('[data-cash-app]');
const appScreen = cashApp?.querySelector('[data-app-screen]');
const appStep = cashApp?.querySelector('[data-app-step]');

const formatMoney = (value) => `${new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(value)} ₽`;

const optionGroup = (name, label, options = ['Да', 'Нет', 'Не уверен']) => `
  <fieldset class="cash-question">
    <legend>${label}</legend>
    <div class="cash-options">
      ${options.map((option) => {
        const value = option === 'Да' ? 'yes' : option === 'Нет' ? 'no' : option === '14 дней' ? '14' : option === '1 месяц' ? '30' : 'unknown';
        return `<label><input type="radio" name="${name}" value="${value}" required><span>${option}</span></label>`;
      }).join('')}
    </div>
  </fieldset>`;

function setStep(text) {
  if (appStep) appStep.textContent = text;
}

function renderStart() {
  setStep('Выбор задачи');
  appScreen.innerHTML = `
    <h3>Что хотите проверить?</h3>
    <p class="cash-app__intro">Выберите ситуацию. Помощник задаст только те вопросы, которые нужны для вывода.</p>
    <div class="cash-app__choices">
      <button class="cash-choice" type="button" data-flow="gap"><span>01</span><div><strong>Проверить кассовый разрыв</strong><small>Расчёт остатка на ближайшие 14 дней</small></div></button>
      <button class="cash-choice" type="button" data-flow="profit"><span>02</span><div><strong>Прибыль есть, а денег нет</strong><small>Проверка возможных причин</small></div></button>
      <button class="cash-choice" type="button" data-flow="calendar"><span>03</span><div><strong>Проверить платёжный календарь</strong><small>Каких данных не хватает для контроля</small></div></button>
    </div>`;
}

function renderGap() {
  setStep('Расчёт · 14 дней');
  appScreen.innerHTML = `
    <h3>Проверка кассового разрыва</h3>
    <p class="cash-app__intro">Укажите суммы на ближайшие 14 дней. Если статьи нет, поставьте 0.</p>
    <form class="cash-form" data-form="gap">
      <div class="cash-field"><label for="opening">Остаток денег сейчас, ₽</label><input id="opening" name="opening" type="number" min="0" step="1" inputmode="decimal" required><small>Деньги на счетах и в кассе на начало расчёта.</small></div>
      <div class="cash-field"><label for="inflows">Подтверждённые поступления, ₽</label><input id="inflows" name="inflows" type="number" min="0" step="1" inputmode="decimal" required><small>Только суммы с ожидаемой датой оплаты.</small></div>
      <div class="cash-field"><label for="mandatory">Обязательные платежи, ₽</label><input id="mandatory" name="mandatory" type="number" min="0" step="1" inputmode="decimal" required><small>Например, налоги, зарплата и ключевые поставщики.</small></div>
      <div class="cash-field"><label for="planned">Остальные плановые платежи, ₽</label><input id="planned" name="planned" type="number" min="0" step="1" inputmode="decimal" required></div>
      <p class="cash-error" data-error hidden>Заполните все четыре суммы. Используйте 0, если статьи нет.</p>
      <div class="cash-app__actions"><button class="button" type="submit">Рассчитать</button><button class="button-secondary" type="button" data-action="home">Назад</button></div>
    </form>`;
}

function renderProfit() {
  setStep('Диагностика причин');
  appScreen.innerHTML = `
    <h3>Почему прибыль не равна деньгам?</h3>
    <p class="cash-app__intro">Ответы не доказывают причину, но помогают сформировать проверяемые гипотезы.</p>
    <form class="cash-form" data-form="profit">
      ${optionGroup('receivables', 'Есть продажи, по которым клиенты ещё не заплатили?')}
      ${optionGroup('stock', 'Существенная сумма денег находится в запасах или авансах?')}
      ${optionGroup('assets', 'Были крупные выплаты по телу кредита или покупка оборудования?')}
      <p class="cash-error" data-error hidden>Ответьте на все три вопроса.</p>
      <div class="cash-app__actions"><button class="button" type="submit">Получить вывод</button><button class="button-secondary" type="button" data-action="home">Назад</button></div>
    </form>`;
}

function renderCalendar() {
  setStep('Проверка данных');
  appScreen.innerHTML = `
    <h3>Готов ли платёжный календарь?</h3>
    <p class="cash-app__intro">Проверим, есть ли минимальные данные для расчёта будущего остатка.</p>
    <form class="cash-form" data-form="calendar">
      ${optionGroup('openingKnown', 'Известен остаток денег на начало периода?')}
      ${optionGroup('datedInflows', 'Поступления внесены по ожидаемым датам?')}
      ${optionGroup('datedPayments', 'Обязательные и плановые платежи внесены по датам?')}
      ${optionGroup('horizon', 'Какой горизонт планирования выбран?', ['14 дней', '1 месяц', 'Не уверен'])}
      <p class="cash-error" data-error hidden>Ответьте на все четыре вопроса.</p>
      <div class="cash-app__actions"><button class="button" type="submit">Проверить</button><button class="button-secondary" type="button" data-action="home">Назад</button></div>
    </form>`;
}

function showResult({ title, summary, number = '', warning = false, heading, items, formula = '', basis }) {
  setStep('Готовый вывод');
  appScreen.innerHTML = `
    <div class="cash-result">
      <div class="cash-result__status ${warning ? 'warning' : ''}">
        <h4>${title}</h4>
        <p>${summary}</p>
        ${number ? `<strong class="cash-result__number">${number}</strong>` : ''}
      </div>
      ${formula ? `<p class="cash-result__formula">${formula}</p>` : ''}
      <div><h5>${heading}</h5><ol>${items.map((item) => `<li>${item}</li>`).join('')}</ol></div>
      <p class="cash-result__basis">${basis}</p>
      <div class="cash-app__actions"><button class="button" type="button" data-action="copy">Скопировать вывод</button><button class="button-secondary" type="button" data-action="home">Другая проверка</button></div>
    </div>`;
}

function handleGap(form) {
  const data = new FormData(form);
  const names = ['opening', 'inflows', 'mandatory', 'planned'];
  if (names.some((name) => data.get(name) === '')) {
    form.querySelector('[data-error]').hidden = false;
    return;
  }
  const [opening, inflows, mandatory, planned] = names.map((name) => Number(data.get(name)));
  const closing = opening + inflows - mandatory - planned;
  if (closing < 0) {
    showResult({
      title: 'По введённым данным возникает кассовый разрыв',
      summary: 'Не хватает денег для всех указанных платежей в выбранном горизонте.',
      number: formatMoney(Math.abs(closing)),
      warning: true,
      formula: `Расчёт: ${formatMoney(opening)} + ${formatMoney(inflows)} − ${formatMoney(mandatory)} − ${formatMoney(planned)} = ${formatMoney(closing)}.`,
      heading: 'Что проверить в первую очередь',
      items: [
        'Разделить платежи на критические, важные и необязательные; приостановить необязательные.',
        'Проверить дебиторскую задолженность и сроки ближайших оплат клиентов.',
        'До даты платежа обсудить отсрочку с поставщиками или арендодателем.'
      ],
      basis: 'Основание: только суммы, введённые пользователем, и горизонт 14 дней.'
    });
  } else {
    showResult({
      title: 'Отрицательного остатка не видно',
      summary: 'По введённым данным денег хватает на указанные платежи в ближайшие 14 дней.',
      number: `Остаток: ${formatMoney(closing)}`,
      formula: `Расчёт: ${formatMoney(opening)} + ${formatMoney(inflows)} − ${formatMoney(mandatory)} − ${formatMoney(planned)} = ${formatMoney(closing)}.`,
      heading: 'Чтобы вывод оставался актуальным',
      items: [
        'Вносить поступления и платежи по датам, а не только общей суммой.',
        'Отдельно отмечать неподтверждённые поступления.',
        'Пересчитывать остаток при каждом изменении сроков оплаты.'
      ],
      basis: 'Основание: только суммы, введённые пользователем. Неподтверждённые операции в расчёт не добавлялись.'
    });
  }
}

function handleProfit(form) {
  const data = new FormData(form);
  const names = ['receivables', 'stock', 'assets'];
  if (names.some((name) => !data.get(name))) {
    form.querySelector('[data-error]').hidden = false;
    return;
  }
  const hypotheses = [];
  if (data.get('receivables') === 'yes') hypotheses.push('Гипотеза: часть прибыли ещё не превратилась в деньги из-за дебиторской задолженности.');
  if (data.get('stock') === 'yes') hypotheses.push('Гипотеза: часть денег заморожена в запасах или выданных авансах.');
  if (data.get('assets') === 'yes') hypotheses.push('Гипотеза: деньги ушли на выплаты, которые не уменьшают прибыль в той же сумме — тело кредита или оборудование.');
  const unknown = names.some((name) => data.get(name) === 'unknown');
  const items = hypotheses.length ? hypotheses : [
    'Указанные три причины ответами не подтверждены.',
    'Сопоставьте ОПиУ и ДДС за один период и проверьте даты признания доходов и фактических оплат.',
    unknown ? 'По вопросам с ответом «Не уверен» данных недостаточно — нужна проверка документов.' : 'Если расхождение остаётся, данных для более точного вывода пока недостаточно.'
  ];
  showResult({
    title: hypotheses.length ? 'Есть гипотезы для проверки' : 'Причина пока не подтверждена',
    summary: hypotheses.length ? 'Это не окончательный диагноз. Каждую гипотезу нужно подтвердить отчётами и документами.' : 'По ответам нельзя уверенно назвать источник расхождения.',
    warning: hypotheses.length === 0,
    heading: hypotheses.length ? 'Возможные причины' : 'Следующий шаг',
    items,
    basis: 'Основание: только ответы пользователя. Формулировки выше являются гипотезами, а не подтверждёнными фактами.'
  });
}

function handleCalendar(form) {
  const data = new FormData(form);
  const names = ['openingKnown', 'datedInflows', 'datedPayments', 'horizon'];
  if (names.some((name) => !data.get(name))) {
    form.querySelector('[data-error]').hidden = false;
    return;
  }
  const missing = [];
  if (data.get('openingKnown') !== 'yes') missing.push('остаток денег на начало периода');
  if (data.get('datedInflows') !== 'yes') missing.push('поступления с ожидаемыми датами');
  if (data.get('datedPayments') !== 'yes') missing.push('обязательные и плановые платежи по датам');
  if (data.get('horizon') === 'unknown') missing.push('горизонт планирования');
  const ready = missing.length === 0;
  const horizon = data.get('horizon') === '14' ? '14 дней' : data.get('horizon') === '30' ? '1 месяц' : 'не выбран';
  showResult({
    title: ready ? 'Базовые данные собраны' : 'Календарь пока неполный',
    summary: ready ? `Можно рассчитывать остаток по дням. Горизонт: ${horizon}.` : 'Для надёжного вывода не хватает обязательных данных.',
    warning: !ready,
    formula: 'Остаток на конец дня = остаток на начало + поступления − платежи.',
    heading: ready ? 'Как вести контроль' : 'Что нужно добавить',
    items: ready ? [
      'Рассчитать остаток после каждой операции по дате.',
      'Отрицательное значение отметить как будущий кассовый разрыв.',
      'Обновлять календарь при переносе поступления или платежа.'
    ] : missing.map((item) => `Добавить: ${item}.`),
    basis: 'Основание: ответы пользователя и минимальная структура платёжного календаря — дата, приход, расход и остаток.'
  });
}

cashApp?.addEventListener('click', async (event) => {
  const flowButton = event.target.closest('[data-flow]');
  const actionButton = event.target.closest('[data-action]');
  if (flowButton?.dataset.flow === 'gap') renderGap();
  if (flowButton?.dataset.flow === 'profit') renderProfit();
  if (flowButton?.dataset.flow === 'calendar') renderCalendar();
  if (actionButton?.dataset.action === 'home') renderStart();
  if (actionButton?.dataset.action === 'copy') {
    const text = appScreen.querySelector('.cash-result')?.innerText || '';
    try {
      await navigator.clipboard.writeText(text.replace('Скопировать вывод\nДругая проверка', '').trim());
      actionButton.textContent = 'Вывод скопирован';
    } catch {
      actionButton.textContent = 'Не удалось скопировать';
    }
  }
});

cashApp?.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.target;
  if (form.dataset.form === 'gap') handleGap(form);
  if (form.dataset.form === 'profit') handleProfit(form);
  if (form.dataset.form === 'calendar') handleCalendar(form);
});

renderStart();
