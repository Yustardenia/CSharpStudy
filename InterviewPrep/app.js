(function () {
  var STORAGE_KEY = "unity-csharp-interview-state.v1";
  var DEFAULT_CATEGORY_ORDER = [
    "运行机制与生命周期",
    "组件通信 / 场景 / Prefab / UI / 物理",
    "性能 / 资源 / ObjectPool / Addressables / 调试",
    "项目场景与追问",
    "基础 / OOP / 集合 / 异常",
    "进阶 / 泛型 / 委托事件 / async-await / 内存"
  ];
  var MODE_META = [
    { id: "browse", label: "分类浏览", desc: "按专题系统过一遍" },
    { id: "random", label: "随机抽题", desc: "更适合模拟临场问答" },
    { id: "favorites", label: "收藏复习", desc: "回看重点和常问题" },
    { id: "wrong", label: "错题复习", desc: "集中补没答稳的点" }
  ];
  var SECTION_OPTIONS = [
    { value: "all", label: "全部方向" },
    { value: "Unity", label: "Unity" },
    { value: "CSharp", label: "CSharp" }
  ];
  var DIFFICULTY_OPTIONS = [
    { value: "all", label: "全部难度" },
    { value: "基础", label: "基础" },
    { value: "进阶", label: "进阶" }
  ];

  var bank = Array.isArray(window.INTERVIEW_BANK) ? window.INTERVIEW_BANK.slice() : [];
  var bankById = new Map(bank.map(function (question) { return [question.id, question]; }));
  var bankMeta = summarizeBank(bank);
  var categoryOrder = buildCategoryOrder(bank);
  var runtime = {
    showIntent: false,
    showFollowUps: false,
    renderedQuestionId: null,
    toastTimer: null
  };

  var state = loadState();

  var ui = {
    modeButtons: document.getElementById("modeButtons"),
    sectionFilter: document.getElementById("sectionFilter"),
    categoryFilter: document.getElementById("categoryFilter"),
    difficultyFilter: document.getElementById("difficultyFilter"),
    keywordInput: document.getElementById("keywordInput"),
    clearFiltersBtn: document.getElementById("clearFiltersBtn"),
    randomWithinFilterBtn: document.getElementById("randomWithinFilterBtn"),
    categoryStats: document.getElementById("categoryStats"),
    questionIndex: document.getElementById("questionIndex"),
    questionSection: document.getElementById("questionSection"),
    questionCategory: document.getElementById("questionCategory"),
    questionDifficulty: document.getElementById("questionDifficulty"),
    questionStatus: document.getElementById("questionStatus"),
    questionPrompt: document.getElementById("questionPrompt"),
    questionTags: document.getElementById("questionTags"),
    toggleIntentBtn: document.getElementById("toggleIntentBtn"),
    toggleFollowUpsBtn: document.getElementById("toggleFollowUpsBtn"),
    copyQuestionBtn: document.getElementById("copyQuestionBtn"),
    intentPanel: document.getElementById("intentPanel"),
    followUpsPanel: document.getElementById("followUpsPanel"),
    intentList: document.getElementById("intentList"),
    followUpList: document.getElementById("followUpList"),
    draftInput: document.getElementById("draftInput"),
    saveDraftBtn: document.getElementById("saveDraftBtn"),
    favoriteBtn: document.getElementById("favoriteBtn"),
    wrongBtn: document.getElementById("wrongBtn"),
    masteredBtn: document.getElementById("masteredBtn"),
    prevBtn: document.getElementById("prevBtn"),
    nextBtn: document.getElementById("nextBtn"),
    randomBtn: document.getElementById("randomBtn"),
    emptyState: document.getElementById("emptyState"),
    emptyClearFiltersBtn: document.getElementById("emptyClearFiltersBtn"),
    switchBrowseBtn: document.getElementById("switchBrowseBtn"),
    poolCount: document.getElementById("poolCount"),
    favoriteCount: document.getElementById("favoriteCount"),
    wrongCount: document.getElementById("wrongCount"),
    masteredCount: document.getElementById("masteredCount"),
    favoritesList: document.getElementById("favoritesList"),
    wrongList: document.getElementById("wrongList"),
    historyList: document.getElementById("historyList"),
    toast: document.getElementById("toast"),
    heroIntroCount: document.getElementById("heroIntroCount"),
    heroUnityCount: document.getElementById("heroUnityCount"),
    heroCSharpCount: document.getElementById("heroCSharpCount"),
    heroTotalCount: document.getElementById("heroTotalCount")
  };

  var validationErrors = validateBank(bank);
  if (validationErrors.length) {
    renderFatal(validationErrors);
    return;
  }

  initialize();

  function initialize() {
    populateStaticSelect(ui.sectionFilter, SECTION_OPTIONS);
    populateStaticSelect(ui.difficultyFilter, DIFFICULTY_OPTIONS);
    bindEvents();
    normalizeCategoryFilter();
    ensureCurrentQuestion({ preferRandom: state.mode === "random", recordHistory: false });
    renderAll();
  }

  function createDefaultState() {
    return {
      favorites: [],
      wrong: [],
      mastered: [],
      drafts: {},
      history: [],
      filters: {
        section: "all",
        category: "all",
        difficulty: "all",
        keyword: ""
      },
      mode: "browse",
      currentId: null
    };
  }

  function loadState() {
    var fallback = createDefaultState();
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return fallback;
      }
      return normalizeState(JSON.parse(raw));
    } catch (error) {
      console.warn("Failed to load state", error);
      return fallback;
    }
  }

  function normalizeState(raw) {
    var next = createDefaultState();
    if (!raw || typeof raw !== "object") {
      return next;
    }

    next.favorites = normalizeIdList(raw.favorites);
    next.wrong = normalizeIdList(raw.wrong);
    next.mastered = normalizeIdList(raw.mastered).filter(function (id) {
      return next.wrong.indexOf(id) === -1;
    });

    if (raw.drafts && typeof raw.drafts === "object") {
      Object.keys(raw.drafts).forEach(function (id) {
        if (bankById.has(id) && typeof raw.drafts[id] === "string") {
          next.drafts[id] = raw.drafts[id];
        }
      });
    }

    next.history = normalizeIdList(raw.history).slice(0, 12);

    if (raw.filters && typeof raw.filters === "object") {
      if (SECTION_OPTIONS.some(function (item) { return item.value === raw.filters.section; })) {
        next.filters.section = raw.filters.section;
      }
      if (typeof raw.filters.category === "string") {
        next.filters.category = raw.filters.category;
      }
      if (DIFFICULTY_OPTIONS.some(function (item) { return item.value === raw.filters.difficulty; })) {
        next.filters.difficulty = raw.filters.difficulty;
      }
      if (typeof raw.filters.keyword === "string") {
        next.filters.keyword = raw.filters.keyword;
      }
    }

    if (MODE_META.some(function (mode) { return mode.id === raw.mode; })) {
      next.mode = raw.mode;
    }

    if (typeof raw.currentId === "string" && bankById.has(raw.currentId)) {
      next.currentId = raw.currentId;
    }

    return next;
  }

  function normalizeIdList(list) {
    if (!Array.isArray(list)) {
      return [];
    }
    var seen = new Set();
    return list.filter(function (id) {
      if (typeof id !== "string" || !bankById.has(id) || seen.has(id)) {
        return false;
      }
      seen.add(id);
      return true;
    });
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn("Failed to save state", error);
      showToast("本地存储写入失败，请检查浏览器权限。");
    }
  }

  function validateBank(items) {
    var errors = [];
    var allowedSections = new Set(["Unity", "CSharp"]);
    var allowedDifficulties = new Set(["基础", "进阶"]);

    if (!items.length) {
      errors.push("题库至少需要 1 道题。");
    }

    var ids = new Set();
    var unityIds = 0;
    var csharpIds = 0;

    items.forEach(function (question, index) {
      var label = "第 " + (index + 1) + " 题";
      ["id", "section", "category", "difficulty", "tags", "prompt", "intent", "followUps"].forEach(function (key) {
        if (!(key in question)) {
          errors.push(label + " 缺少字段 " + key + "。");
        }
      });

      if (typeof question.id !== "string" || !/^[UC]-\d{3,}$/.test(question.id)) {
        errors.push(label + " 的 id 格式非法。");
      } else if (ids.has(question.id)) {
        errors.push("发现重复题号：" + question.id + "。");
      } else {
        ids.add(question.id);
        if (question.id.indexOf("U-") === 0) {
          unityIds += 1;
        }
        if (question.id.indexOf("C-") === 0) {
          csharpIds += 1;
        }
      }

      if (!allowedSections.has(question.section)) {
        errors.push(question.id + " 的 section 非法。");
      }
      if (typeof question.category !== "string" || !question.category.trim()) {
        errors.push(question.id + " 的 category 不能为空。");
      }
      if (!allowedDifficulties.has(question.difficulty)) {
        errors.push(question.id + " 的 difficulty 非法。");
      }
      if (!Array.isArray(question.tags) || question.tags.length === 0) {
        errors.push(question.id + " 的 tags 不能为空。");
      }
      if (!Array.isArray(question.intent) || question.intent.length === 0) {
        errors.push(question.id + " 的 intent 不能为空。");
      }
      if (!Array.isArray(question.followUps) || question.followUps.length === 0) {
        errors.push(question.id + " 的 followUps 不能为空。");
      }
      if (typeof question.prompt !== "string" || !question.prompt.trim()) {
        errors.push(question.id + " 的 prompt 不能为空。");
      }
      if (question.section === "Unity" && question.id.indexOf("U-") !== 0) {
        errors.push(question.id + " 的题号前缀与 Unity section 不一致。");
      }
      if (question.section === "CSharp" && question.id.indexOf("C-") !== 0) {
        errors.push(question.id + " 的题号前缀与 CSharp section 不一致。");
      }
    });

    if (!unityIds) {
      errors.push("题库里至少需要保留 1 道 Unity 题。");
    }
    if (!csharpIds) {
      errors.push("题库里至少需要保留 1 道 CSharp 题。");
    }

    return errors;
  }

  function summarizeBank(items) {
    return items.reduce(function (summary, question) {
      summary.total += 1;
      summary.bySection[question.section] = (summary.bySection[question.section] || 0) + 1;
      return summary;
    }, {
      total: 0,
      bySection: {}
    });
  }

  function buildCategoryOrder(items) {
    var known = DEFAULT_CATEGORY_ORDER.filter(function (category) {
      return items.some(function (question) {
        return question.category === category;
      });
    });
    var extras = [];
    var seen = new Set(known);

    items.forEach(function (question) {
      if (!seen.has(question.category)) {
        seen.add(question.category);
        extras.push(question.category);
      }
    });

    return known.concat(extras);
  }

  function renderFatal(errors) {
    document.body.innerHTML = [
      "<div style='max-width:900px;margin:40px auto;padding:24px;border-radius:18px;border:1px solid #e1d0bc;background:#fffdf9;font-family:\"Microsoft YaHei UI\",\"PingFang SC\",sans-serif;color:#231913'>",
      "<h1 style='margin-top:0'>题库初始化失败</h1>",
      "<p style='color:#6c5e54;line-height:1.8'>检测到数据结构问题，页面已停止渲染。请先修复以下项：</p>",
      "<ul style='line-height:1.8;color:#9a3f35'>" + errors.map(function (item) { return "<li>" + escapeHtml(item) + "</li>"; }).join("") + "</ul>",
      "</div>"
    ].join("");
  }

  function bindEvents() {
    ui.modeButtons.addEventListener("click", function (event) {
      var button = event.target.closest("[data-mode]");
      if (!button) {
        return;
      }
      switchMode(button.getAttribute("data-mode"));
    });

    ui.sectionFilter.addEventListener("change", function () {
      state.filters.section = ui.sectionFilter.value;
      state.filters.category = "all";
      saveState();
      normalizeCategoryFilter();
      ensureCurrentQuestion({ preferRandom: state.mode === "random", recordHistory: false });
      renderAll();
    });

    ui.categoryFilter.addEventListener("change", function () {
      state.filters.category = ui.categoryFilter.value;
      saveState();
      ensureCurrentQuestion({ preferRandom: state.mode === "random", recordHistory: false });
      renderAll();
    });

    ui.difficultyFilter.addEventListener("change", function () {
      state.filters.difficulty = ui.difficultyFilter.value;
      saveState();
      ensureCurrentQuestion({ preferRandom: state.mode === "random", recordHistory: false });
      renderAll();
    });

    ui.keywordInput.addEventListener("input", function () {
      state.filters.keyword = ui.keywordInput.value;
      saveState();
      ensureCurrentQuestion({ preferRandom: state.mode === "random", recordHistory: false });
      renderAll();
    });

    ui.clearFiltersBtn.addEventListener("click", clearFilters);
    ui.emptyClearFiltersBtn.addEventListener("click", clearFilters);
    ui.randomWithinFilterBtn.addEventListener("click", pickRandomQuestion);
    ui.randomBtn.addEventListener("click", pickRandomQuestion);
    ui.prevBtn.addEventListener("click", function () { stepQuestion(-1); });
    ui.nextBtn.addEventListener("click", function () { stepQuestion(1); });
    ui.toggleIntentBtn.addEventListener("click", function () {
      runtime.showIntent = !runtime.showIntent;
      renderAll();
    });
    ui.toggleFollowUpsBtn.addEventListener("click", function () {
      runtime.showFollowUps = !runtime.showFollowUps;
      renderAll();
    });
    ui.copyQuestionBtn.addEventListener("click", copyCurrentQuestion);
    ui.saveDraftBtn.addEventListener("click", saveCurrentDraft);
    ui.favoriteBtn.addEventListener("click", function () { toggleFavorite(); });
    ui.wrongBtn.addEventListener("click", function () { toggleMark("wrong"); });
    ui.masteredBtn.addEventListener("click", function () { toggleMark("mastered"); });
    ui.switchBrowseBtn.addEventListener("click", function () { switchMode("browse"); });

    ui.categoryStats.addEventListener("click", function (event) {
      var button = event.target.closest("[data-category]");
      if (!button) {
        return;
      }
      state.filters.category = button.getAttribute("data-category");
      saveState();
      ensureCurrentQuestion({ preferRandom: state.mode === "random", recordHistory: false });
      renderAll();
    });

    [ui.favoritesList, ui.wrongList, ui.historyList].forEach(function (container) {
      container.addEventListener("click", function (event) {
        var item = event.target.closest("[data-question-id]");
        if (!item) {
          return;
        }
        focusQuestionFromList(item.getAttribute("data-question-id"), item.getAttribute("data-source"));
      });
    });
  }

  function populateStaticSelect(select, options) {
    clearElement(select);
    options.forEach(function (item) {
      var option = document.createElement("option");
      option.value = item.value;
      option.textContent = item.label;
      select.appendChild(option);
    });
  }

  function normalizeCategoryFilter() {
    var categories = getCategoryUniverse();
    if (state.filters.category !== "all" && categories.indexOf(state.filters.category) === -1) {
      state.filters.category = "all";
      saveState();
    }
  }

  function getCategoryUniverse() {
    var modeSource = getModeSourceQuestions();
    var section = state.filters.section;
    var categories = new Set();
    modeSource.forEach(function (question) {
      if (section !== "all" && question.section !== section) {
        return;
      }
      categories.add(question.category);
    });
    return categoryOrder.filter(function (category) {
      return categories.has(category);
    });
  }

  function getModeSourceQuestions() {
    if (state.mode === "favorites") {
      return bank.filter(function (question) {
        return state.favorites.indexOf(question.id) !== -1;
      });
    }
    if (state.mode === "wrong") {
      return bank.filter(function (question) {
        return state.wrong.indexOf(question.id) !== -1;
      });
    }
    return bank.slice();
  }

  function getVisibleQuestions(options) {
    var config = options || {};
    var keyword = state.filters.keyword.trim().toLowerCase();
    return getModeSourceQuestions().filter(function (question) {
      if (state.filters.section !== "all" && question.section !== state.filters.section) {
        return false;
      }
      if (!config.ignoreCategory && state.filters.category !== "all" && question.category !== state.filters.category) {
        return false;
      }
      if (state.filters.difficulty !== "all" && question.difficulty !== state.filters.difficulty) {
        return false;
      }
      if (!keyword) {
        return true;
      }
      return buildSearchText(question).indexOf(keyword) !== -1;
    });
  }

  function buildSearchText(question) {
    return [question.id, question.prompt]
      .concat(question.tags, question.intent, question.followUps)
      .join(" ")
      .toLowerCase();
  }

  function ensureCurrentQuestion(options) {
    var visible = getVisibleQuestions();
    if (!visible.length) {
      if (state.currentId !== null) {
        state.currentId = null;
        runtime.renderedQuestionId = null;
        saveState();
      }
      return false;
    }

    if (visible.some(function (question) { return question.id === state.currentId; })) {
      return true;
    }

    var nextQuestion = (options && options.preferRandom) ? chooseRandomFrom(visible, null) : visible[0];
    state.currentId = nextQuestion.id;
    runtime.showIntent = false;
    runtime.showFollowUps = false;
    runtime.renderedQuestionId = null;
    if (options && options.recordHistory) {
      pushHistory(nextQuestion.id);
    }
    saveState();
    return true;
  }

  function switchMode(modeId) {
    if (!MODE_META.some(function (mode) { return mode.id === modeId; })) {
      return;
    }
    state.mode = modeId;
    saveState();
    normalizeCategoryFilter();
    if (modeId === "random") {
      pickRandomQuestion();
      return;
    }
    ensureCurrentQuestion({ preferRandom: false, recordHistory: false });
    renderAll();
  }

  function clearFilters() {
    state.filters.section = "all";
    state.filters.category = "all";
    state.filters.difficulty = "all";
    state.filters.keyword = "";
    saveState();
    ensureCurrentQuestion({ preferRandom: state.mode === "random", recordHistory: false });
    renderAll();
  }

  function stepQuestion(direction) {
    var visible = getVisibleQuestions();
    if (!visible.length) {
      return;
    }
    var currentIndex = visible.findIndex(function (question) { return question.id === state.currentId; });
    if (currentIndex === -1) {
      currentIndex = 0;
    }
    var nextIndex = (currentIndex + direction + visible.length) % visible.length;
    selectQuestion(visible[nextIndex].id, true);
  }

  function chooseRandomFrom(questions, currentId) {
    if (!questions.length) {
      return null;
    }
    var pool = questions;
    if (questions.length > 1 && currentId) {
      pool = questions.filter(function (question) { return question.id !== currentId; });
    }
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function pickRandomQuestion() {
    var visible = getVisibleQuestions();
    var next = chooseRandomFrom(visible, state.currentId);
    if (!next) {
      renderAll();
      showToast("当前范围内没有可随机的题目。");
      return;
    }
    selectQuestion(next.id, true);
  }

  function selectQuestion(id, recordHistory) {
    if (!bankById.has(id)) {
      return;
    }
    state.currentId = id;
    runtime.showIntent = false;
    runtime.showFollowUps = false;
    runtime.renderedQuestionId = null;
    if (recordHistory !== false) {
      pushHistory(id);
    }
    saveState();
    renderAll();
  }

  function pushHistory(id) {
    state.history = [id].concat(state.history.filter(function (item) {
      return item !== id;
    })).slice(0, 12);
  }

  function toggleFavorite() {
    var current = getCurrentQuestion();
    if (!current) {
      return;
    }
    toggleInArray(state.favorites, current.id);
    saveState();
    renderAll();
    showToast(state.favorites.indexOf(current.id) !== -1 ? "已加入收藏夹。" : "已从收藏夹移除。");
  }

  function toggleMark(type) {
    var current = getCurrentQuestion();
    if (!current) {
      return;
    }

    var target = type === "wrong" ? state.wrong : state.mastered;
    var opposite = type === "wrong" ? state.mastered : state.wrong;
    var added = toggleInArray(target, current.id);

    if (added) {
      removeFromArray(opposite, current.id);
    }

    saveState();
    normalizeCategoryFilter();
    ensureCurrentQuestion({ preferRandom: false, recordHistory: false });
    renderAll();
    if (type === "wrong") {
      showToast(added ? "已标记为没答稳。" : "已从没答稳列表移除。");
    } else {
      showToast(added ? "已标记为已掌握。" : "已取消已掌握标记。");
    }
  }

  function toggleInArray(list, id) {
    var index = list.indexOf(id);
    if (index === -1) {
      list.unshift(id);
      return true;
    }
    list.splice(index, 1);
    return false;
  }

  function removeFromArray(list, id) {
    var index = list.indexOf(id);
    if (index !== -1) {
      list.splice(index, 1);
    }
  }

  function getCurrentQuestion() {
    if (!state.currentId) {
      return null;
    }
    return bankById.get(state.currentId) || null;
  }

  function saveCurrentDraft() {
    var current = getCurrentQuestion();
    if (!current) {
      return;
    }
    var content = ui.draftInput.value;
    if (content.trim()) {
      state.drafts[current.id] = content;
      showToast("草稿已保存到本地。");
    } else {
      delete state.drafts[current.id];
      showToast("空草稿已清除。");
    }
    saveState();
    renderAll();
  }

  function focusQuestionFromList(id, source) {
    var question = bankById.get(id);
    if (!question) {
      return;
    }

    if (source === "favorites") {
      state.mode = "favorites";
    } else if (source === "wrong") {
      state.mode = "wrong";
    } else {
      state.mode = "browse";
    }

    state.filters.section = "all";
    state.filters.category = "all";
    state.filters.difficulty = "all";
    state.filters.keyword = "";
    pushHistory(id);
    state.currentId = id;
    runtime.showIntent = false;
    runtime.showFollowUps = false;
    runtime.renderedQuestionId = null;
    saveState();
    renderAll();
  }

  function renderAll() {
    renderHeroStats();
    renderModeButtons();
    renderFilters();
    renderCategoryStats();
    renderQuestion();
    renderSummary();
    renderCollections();
  }

  function renderHeroStats() {
    ui.heroIntroCount.textContent = String(bankMeta.total);
    ui.heroUnityCount.textContent = "Unity " + String(bankMeta.bySection.Unity || 0);
    ui.heroCSharpCount.textContent = "CSharp " + String(bankMeta.bySection.CSharp || 0);
    ui.heroTotalCount.textContent = String(bankMeta.total);
  }

  function renderModeButtons() {
    clearElement(ui.modeButtons);
    MODE_META.forEach(function (mode) {
      var button = document.createElement("button");
      button.className = "mode-button" + (state.mode === mode.id ? " active" : "");
      button.type = "button";
      button.setAttribute("data-mode", mode.id);

      var title = document.createElement("strong");
      title.textContent = mode.label;
      var desc = document.createElement("span");
      desc.textContent = mode.desc;

      button.appendChild(title);
      button.appendChild(desc);
      ui.modeButtons.appendChild(button);
    });
  }

  function renderFilters() {
    var categories = [{ value: "all", label: "全部分类" }].concat(getCategoryUniverse().map(function (item) {
      return { value: item, label: item };
    }));

    replaceOptions(ui.categoryFilter, categories, state.filters.category);
    ui.sectionFilter.value = state.filters.section;
    ui.difficultyFilter.value = state.filters.difficulty;
    ui.keywordInput.value = state.filters.keyword;
  }

  function replaceOptions(select, options, selected) {
    clearElement(select);
    options.forEach(function (item) {
      var option = document.createElement("option");
      option.value = item.value;
      option.textContent = item.label;
      if (item.value === selected) {
        option.selected = true;
      }
      select.appendChild(option);
    });
  }

  function renderCategoryStats() {
    clearElement(ui.categoryStats);

    var source = getVisibleQuestions({ ignoreCategory: true });
    if (!source.length) {
      ui.categoryStats.appendChild(createEmptyCard("当前范围没有分类统计。"));
      return;
    }

    categoryOrder.forEach(function (category) {
      var count = source.filter(function (question) {
        return question.category === category;
      }).length;

      if (!count) {
        return;
      }

      var button = document.createElement("button");
      button.className = "stat-item" + (state.filters.category === category ? " active" : "");
      button.type = "button";
      button.setAttribute("data-category", category);

      var head = document.createElement("div");
      head.className = "stat-item-head";

      var name = document.createElement("div");
      name.className = "stat-item-name";
      name.textContent = category;

      var total = document.createElement("div");
      total.className = "stat-item-count";
      total.textContent = count + " 题";

      head.appendChild(name);
      head.appendChild(total);

      var sub = document.createElement("div");
      sub.className = "stat-item-sub";
      sub.textContent = state.filters.category === category ? "当前正在查看这个分类" : "点击切到这个分类";

      button.appendChild(head);
      button.appendChild(sub);
      ui.categoryStats.appendChild(button);
    });

    var allButton = document.createElement("button");
    allButton.className = "stat-item" + (state.filters.category === "all" ? " active" : "");
    allButton.type = "button";
    allButton.setAttribute("data-category", "all");

    var allHead = document.createElement("div");
    allHead.className = "stat-item-head";

    var allName = document.createElement("div");
    allName.className = "stat-item-name";
    allName.textContent = "全部分类";

    var allCount = document.createElement("div");
    allCount.className = "stat-item-count";
    allCount.textContent = source.length + " 题";

    allHead.appendChild(allName);
    allHead.appendChild(allCount);

    var allSub = document.createElement("div");
    allSub.className = "stat-item-sub";
    allSub.textContent = "清除当前分类限制";

    allButton.appendChild(allHead);
    allButton.appendChild(allSub);
    ui.categoryStats.prepend(allButton);
  }

  function renderQuestion() {
    var visible = getVisibleQuestions();
    var current = getCurrentQuestion();

    if (!current || !visible.some(function (question) { return question.id === current.id; })) {
      current = null;
    }

    ui.emptyState.classList.toggle("hidden", Boolean(current));
    setQuestionButtonsEnabled(Boolean(current));

    if (!current) {
      ui.questionIndex.textContent = getModeLabel(state.mode) + " · 当前没有可练习的题";
      ui.questionSection.textContent = "-";
      ui.questionCategory.textContent = "-";
      ui.questionDifficulty.textContent = "-";
      ui.questionPrompt.textContent = "先调整筛选条件，或者切回分类浏览再开始练习。";
      clearElement(ui.questionStatus);
      clearElement(ui.questionTags);
      clearList(ui.intentList);
      clearList(ui.followUpList);
      ui.intentPanel.classList.add("hidden");
      ui.followUpsPanel.classList.add("hidden");
      ui.toggleIntentBtn.textContent = "显示考察点";
      ui.toggleFollowUpsBtn.textContent = "显示追问";
      ui.draftInput.value = "";
      runtime.renderedQuestionId = null;
      return;
    }

    var index = visible.findIndex(function (question) { return question.id === current.id; }) + 1;
    ui.questionIndex.textContent = "第 " + index + " / " + visible.length + " 题 · " + getModeLabel(state.mode);
    ui.questionSection.textContent = current.section;
    ui.questionCategory.textContent = current.category;
    ui.questionDifficulty.textContent = current.difficulty;
    ui.questionPrompt.textContent = current.prompt;

    renderStatus(current.id);
    renderTags(current.tags);
    renderBulletList(ui.intentList, current.intent);
    renderBulletList(ui.followUpList, current.followUps);

    ui.intentPanel.classList.toggle("hidden", !runtime.showIntent);
    ui.followUpsPanel.classList.toggle("hidden", !runtime.showFollowUps);
    ui.toggleIntentBtn.textContent = runtime.showIntent ? "隐藏考察点" : "显示考察点";
    ui.toggleFollowUpsBtn.textContent = runtime.showFollowUps ? "隐藏追问" : "显示追问";

    if (runtime.renderedQuestionId !== current.id) {
      ui.draftInput.value = state.drafts[current.id] || "";
      runtime.renderedQuestionId = current.id;
    }

    ui.favoriteBtn.textContent = state.favorites.indexOf(current.id) !== -1 ? "取消收藏" : "收藏";
    ui.wrongBtn.textContent = state.wrong.indexOf(current.id) !== -1 ? "取消没答稳" : "标记没答稳";
    ui.masteredBtn.textContent = state.mastered.indexOf(current.id) !== -1 ? "取消已掌握" : "标记已掌握";
  }

  function setQuestionButtonsEnabled(enabled) {
    [
      ui.toggleIntentBtn,
      ui.toggleFollowUpsBtn,
      ui.copyQuestionBtn,
      ui.saveDraftBtn,
      ui.favoriteBtn,
      ui.wrongBtn,
      ui.masteredBtn,
      ui.prevBtn,
      ui.nextBtn,
      ui.randomBtn
    ].forEach(function (button) {
      button.disabled = !enabled;
    });
  }

  function renderStatus(questionId) {
    clearElement(ui.questionStatus);

    var statuses = [];
    if (state.favorites.indexOf(questionId) !== -1) {
      statuses.push({ label: "已收藏", className: "favorite" });
    }
    if (state.wrong.indexOf(questionId) !== -1) {
      statuses.push({ label: "没答稳", className: "wrong" });
    }
    if (state.mastered.indexOf(questionId) !== -1) {
      statuses.push({ label: "已掌握", className: "mastered" });
    }

    if (!statuses.length) {
      statuses.push({ label: "未标记", className: "" });
    }

    statuses.forEach(function (item) {
      var tag = document.createElement("span");
      tag.className = "status-tag" + (item.className ? " " + item.className : "");
      tag.textContent = item.label;
      ui.questionStatus.appendChild(tag);
    });
  }

  function renderTags(tags) {
    clearElement(ui.questionTags);
    tags.forEach(function (tagText) {
      var tag = document.createElement("span");
      tag.className = "tag-chip";
      tag.textContent = tagText;
      ui.questionTags.appendChild(tag);
    });
  }

  function renderBulletList(container, items) {
    clearList(container);
    items.forEach(function (item) {
      var li = document.createElement("li");
      li.textContent = item;
      container.appendChild(li);
    });
  }

  function clearList(container) {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  }

  function renderSummary() {
    ui.poolCount.textContent = String(getVisibleQuestions().length);
    ui.favoriteCount.textContent = String(state.favorites.length);
    ui.wrongCount.textContent = String(state.wrong.length);
    ui.masteredCount.textContent = String(state.mastered.length);
  }

  function renderCollections() {
    renderMiniList(ui.favoritesList, state.favorites.slice(0, 8), "还没有收藏题。", "favorites");
    renderMiniList(ui.wrongList, state.wrong.slice(0, 8), "还没有标记没答稳的题。", "wrong");
    renderMiniList(ui.historyList, state.history.slice(0, 8), "还没有练习记录。", "browse");
  }

  function renderMiniList(container, ids, emptyText, source) {
    clearElement(container);

    if (!ids.length) {
      container.appendChild(createEmptyCard(emptyText));
      return;
    }

    ids.forEach(function (id) {
      var question = bankById.get(id);
      if (!question) {
        return;
      }

      var button = document.createElement("button");
      button.className = "list-item";
      button.type = "button";
      button.setAttribute("data-question-id", question.id);
      button.setAttribute("data-source", source);

      var idLine = document.createElement("div");
      idLine.className = "list-item-id";
      idLine.textContent = question.id;

      var title = document.createElement("div");
      title.className = "list-item-title";
      title.textContent = truncateText(question.prompt, 50);

      var meta = document.createElement("div");
      meta.className = "list-item-meta";
      meta.textContent = question.section + " · " + question.difficulty;

      button.appendChild(idLine);
      button.appendChild(title);
      button.appendChild(meta);
      container.appendChild(button);
    });
  }

  function createEmptyCard(text) {
    var card = document.createElement("div");
    card.className = "list-item empty";
    card.textContent = text;
    return card;
  }

  function truncateText(text, limit) {
    if (text.length <= limit) {
      return text;
    }
    return text.slice(0, limit - 1) + "…";
  }

  function getModeLabel(modeId) {
    var match = MODE_META.find(function (mode) { return mode.id === modeId; });
    return match ? match.label : "分类浏览";
  }

  function clearElement(element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }

  function escapeHtml(text) {
    return text
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll("\"", "&quot;")
      .replaceAll("'", "&#39;");
  }

  async function copyCurrentQuestion() {
    var current = getCurrentQuestion();
    if (!current) {
      return;
    }

    var payload = [
      current.id + " | " + current.section + " | " + current.category + " | " + current.difficulty,
      "",
      "题目：",
      current.prompt,
      "",
      "标签：",
      current.tags.join(" / "),
      "",
      "考察点：",
      current.intent.map(function (item, index) { return (index + 1) + ". " + item; }).join("\n"),
      "",
      "可能追问：",
      current.followUps.map(function (item, index) { return (index + 1) + ". " + item; }).join("\n")
    ].join("\n");

    var copied = await copyText(payload);
    if (copied) {
      showToast("题目已复制，可以拿去问外部 AI。");
      return;
    }
    showToast("复制失败，请手动复制题目。");
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (error) {
      console.warn("Clipboard write failed", error);
    }

    try {
      var helper = document.createElement("textarea");
      helper.value = text;
      helper.setAttribute("readonly", "readonly");
      helper.style.position = "fixed";
      helper.style.top = "-9999px";
      helper.style.opacity = "0";
      document.body.appendChild(helper);
      helper.select();
      helper.setSelectionRange(0, helper.value.length);
      var ok = document.execCommand("copy");
      document.body.removeChild(helper);
      return ok;
    } catch (error) {
      console.warn("execCommand copy failed", error);
      return false;
    }
  }

  function showToast(message) {
    ui.toast.textContent = message;
    ui.toast.classList.add("show");
    if (runtime.toastTimer) {
      clearTimeout(runtime.toastTimer);
    }
    runtime.toastTimer = setTimeout(function () {
      ui.toast.classList.remove("show");
    }, 1800);
  }
})();
