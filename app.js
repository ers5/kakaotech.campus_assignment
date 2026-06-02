// Todo 데이터를 저장하는 배열입니다.
const todoItems = [];

// 로컬스토리지에 사용할 키 이름입니다.
const TODO_STORAGE_KEY = "todoItems";

// 현재 선택된 필터 상태를 관리합니다.
let currentFilterType = "all";

// 현재 보고 있는 날짜를 관리합니다.
let selectedDate = normalizeDate(new Date());

const WEEKDAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

// 주요 DOM 요소를 한 곳에서 관리합니다.
const todoInputElement = document.getElementById("todoInput");
const addTodoButtonElement = document.getElementById("addTodoButton");
const inputMessageElement = document.getElementById("inputMessage");
const todoListElement = document.getElementById("todoList");
const filterButtonElements = document.querySelectorAll(".filter-button");
const previousWeekButtonElement = document.getElementById("previousWeekButton");
const nextWeekButtonElement = document.getElementById("nextWeekButton");
const selectedDateTextElement = document.getElementById("selectedDateText");
const weekDateListElement = document.getElementById("weekDateList");

// Todo 배열을 로컬스토리지에 저장합니다.
function saveTodoItemsToLocalStorage() {
  const serializedTodoItems = JSON.stringify(todoItems);
  localStorage.setItem(TODO_STORAGE_KEY, serializedTodoItems);
}

// 로컬스토리지에서 Todo 배열을 불러와 메모리에 복원합니다.
function loadTodoItemsFromLocalStorage() {
  const storedTodoItems = localStorage.getItem(TODO_STORAGE_KEY);

  if (!storedTodoItems) {
    return;
  }

  try {
    const parsedTodoItems = JSON.parse(storedTodoItems);

    // 복원 데이터가 배열일 때만 기존 배열에 반영합니다.
    if (Array.isArray(parsedTodoItems)) {
      parsedTodoItems.forEach((todoItem) => {
        if (
          typeof todoItem.id === "number" &&
          typeof todoItem.text === "string" &&
          typeof todoItem.completed === "boolean" &&
          typeof todoItem.dateKey === "string"
        ) {
          todoItems.push(todoItem);
        }
      });
    }
  } catch (error) {
    // JSON 파싱 실패 시 앱 동작은 유지하고 저장 데이터만 무시합니다.
    console.error("로컬스토리지 Todo 데이터 파싱 중 오류가 발생했습니다.", error);
  }
}

// 날짜를 Todo 비교용 키(YYYY-MM-DD)로 변환합니다.
function formatDateKey(dateValue) {
  const year = dateValue.getFullYear();
  const month = String(dateValue.getMonth() + 1).padStart(2, "0");
  const day = String(dateValue.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// 날짜 값을 자정 기준으로 정규화합니다.
function normalizeDate(dateValue) {
  const normalizedDate = new Date(dateValue);
  normalizedDate.setHours(0, 0, 0, 0);
  return normalizedDate;
}

// 선택 날짜 표시 문자열(YYYY년 M월 D일)을 만듭니다.
function formatDisplayDate(dateValue) {
  const year = dateValue.getFullYear();
  const month = dateValue.getMonth() + 1;
  const day = dateValue.getDate();
  return `${year}년 ${month}월 ${day}일`;
}

// 화면 상단의 날짜 텍스트를 업데이트합니다.
function updateSelectedDateText() {
  selectedDateTextElement.textContent = `${formatDisplayDate(selectedDate)} 선택됨`;
}

// 선택 날짜가 속한 주의 월요일 날짜를 반환합니다.
function getWeekStartDate(dateValue) {
  const weekStartDate = normalizeDate(dateValue);
  const dayOfWeek = weekStartDate.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  weekStartDate.setDate(weekStartDate.getDate() + mondayOffset);
  return weekStartDate;
}

// 선택 주간의 월요일부터 일요일까지 날짜 배열을 반환합니다.
function getWeekDates(dateValue) {
  const weekStartDate = getWeekStartDate(dateValue);

  return Array.from({ length: 7 }, (_, dayIndex) => {
    const weekDate = new Date(weekStartDate);
    weekDate.setDate(weekStartDate.getDate() + dayIndex);
    return weekDate;
  });
}

// 특정 날짜에 등록된 Todo 개수를 반환합니다.
function getTodoCountForDate(dateValue) {
  const dateKey = formatDateKey(dateValue);
  return todoItems.filter((todoItem) => todoItem.dateKey === dateKey).length;
}

// 선택 주간의 날짜 버튼 목록을 렌더링합니다.
function renderWeekDateList() {
  weekDateListElement.innerHTML = "";

  const todayKey = formatDateKey(new Date());
  const selectedDateKey = formatDateKey(selectedDate);
  const weekDates = getWeekDates(selectedDate);

  weekDates.forEach((weekDate, dayIndex) => {
    const weekDateKey = formatDateKey(weekDate);
    const isSelectedDate = weekDateKey === selectedDateKey;
    const isToday = weekDateKey === todayKey;
    const todoCount = getTodoCountForDate(weekDate);

    const weekDateItemElement = document.createElement("div");
    weekDateItemElement.className = "week-date-item";
    weekDateItemElement.setAttribute("role", "listitem");

    const weekDateButtonElement = document.createElement("button");
    weekDateButtonElement.className = "week-date-button";
    weekDateButtonElement.type = "button";
    weekDateButtonElement.setAttribute("aria-pressed", String(isSelectedDate));
    weekDateButtonElement.setAttribute(
      "aria-label",
      `${formatDisplayDate(weekDate)} ${WEEKDAY_LABELS[dayIndex]}요일, Todo ${todoCount}개`
    );

    if (isSelectedDate) {
      weekDateButtonElement.classList.add("selected");
    }

    if (isToday) {
      weekDateButtonElement.classList.add("today");
    }

    const weekdayElement = document.createElement("span");
    weekdayElement.className = "week-date-weekday";
    weekdayElement.textContent = WEEKDAY_LABELS[dayIndex];

    const dateElement = document.createElement("span");
    dateElement.className = "week-date-day";
    dateElement.textContent = String(weekDate.getDate());

    const countElement = document.createElement("span");
    countElement.className = "week-date-count";
    countElement.textContent = `${todoCount}개`;

    weekDateButtonElement.append(weekdayElement, dateElement, countElement);
    weekDateButtonElement.addEventListener("click", () => {
      selectedDate = normalizeDate(weekDate);
      renderTodoList();
    });

    weekDateItemElement.appendChild(weekDateButtonElement);
    weekDateListElement.appendChild(weekDateItemElement);
  });
}

// Todo를 새로 생성합니다.
function addTodoItem() {
  const inputValue = todoInputElement.value.trim();

  // 입력값이 비어 있으면 생성하지 않고 안내 문구를 보여줍니다.
  if (!inputValue) {
    inputMessageElement.textContent = "할 일을 입력한 뒤 추가해 주세요.";
    return;
  }

  const newTodoItem = {
    id: Date.now(),
    text: inputValue,
    completed: false,
    dateKey: formatDateKey(selectedDate),
  };

  todoItems.push(newTodoItem);
  saveTodoItemsToLocalStorage();
  todoInputElement.value = "";
  inputMessageElement.textContent = "";
  renderTodoList();
}

// 특정 Todo의 완료 상태를 토글합니다.
function toggleTodoCompletion(todoId) {
  const targetTodoItem = todoItems.find((todoItem) => todoItem.id === todoId);

  if (!targetTodoItem) {
    return;
  }

  targetTodoItem.completed = !targetTodoItem.completed;
  saveTodoItemsToLocalStorage();
  renderTodoList();
}

// 특정 Todo의 텍스트를 수정합니다.
function editTodoItem(todoId) {
  const targetTodoItem = todoItems.find((todoItem) => todoItem.id === todoId);

  if (!targetTodoItem) {
    return;
  }

  const editedText = prompt("수정할 내용을 입력하세요.", targetTodoItem.text);

  // 취소를 누르거나 공백만 입력한 경우는 변경하지 않습니다.
  if (editedText === null) {
    return;
  }

  const trimmedEditedText = editedText.trim();

  if (!trimmedEditedText) {
    inputMessageElement.textContent = "수정 내용은 비워둘 수 없어요.";
    return;
  }

  targetTodoItem.text = trimmedEditedText;
  saveTodoItemsToLocalStorage();
  inputMessageElement.textContent = "";
  renderTodoList();
}

// 특정 Todo를 삭제합니다.
function deleteTodoItem(todoId) {
  const targetTodoIndex = todoItems.findIndex((todoItem) => todoItem.id === todoId);

  if (targetTodoIndex === -1) {
    return;
  }

  todoItems.splice(targetTodoIndex, 1);
  saveTodoItemsToLocalStorage();
  renderTodoList();
}

// 선택된 날짜의 Todo만 반환합니다.
function getTodosForSelectedDate() {
  const selectedDateKey = formatDateKey(selectedDate);
  return todoItems.filter((todoItem) => todoItem.dateKey === selectedDateKey);
}

// 선택된 날짜의 Todo 중에서 필터 상태에 맞는 목록을 반환합니다.
function getFilteredTodoItems() {
  const todoItemsForSelectedDate = getTodosForSelectedDate();

  if (currentFilterType === "active") {
    return todoItemsForSelectedDate.filter((todoItem) => !todoItem.completed);
  }

  if (currentFilterType === "completed") {
    return todoItemsForSelectedDate.filter((todoItem) => todoItem.completed);
  }

  return todoItemsForSelectedDate;
}

// 필터 버튼의 활성 상태를 시각적으로 업데이트합니다.
function updateFilterButtonStyles() {
  filterButtonElements.forEach((filterButtonElement) => {
    const isActiveFilter = filterButtonElement.dataset.filter === currentFilterType;
    filterButtonElement.classList.toggle("active", isActiveFilter);
  });
}

// 날짜를 주 단위로 이동합니다.
function moveSelectedWeek(weekOffset) {
  const movedDate = new Date(selectedDate);
  movedDate.setDate(movedDate.getDate() + weekOffset * 7);
  selectedDate = normalizeDate(movedDate);
  renderTodoList();
}

// 현재 Todo 배열을 화면에 렌더링합니다.
function renderTodoList() {
  todoListElement.innerHTML = "";
  updateSelectedDateText();
  renderWeekDateList();

  const filteredTodoItems = getFilteredTodoItems();

  filteredTodoItems.forEach((todoItem) => {
    const todoListItemElement = document.createElement("li");
    todoListItemElement.className = "todo-item";

    if (todoItem.completed) {
      todoListItemElement.classList.add("completed");
    }

    const todoTextElement = document.createElement("p");
    todoTextElement.className = "todo-text";
    todoTextElement.textContent = todoItem.text;

    const todoActionsElement = document.createElement("div");
    todoActionsElement.className = "todo-actions";

    const editButtonElement = document.createElement("button");
    editButtonElement.className = "action-button";
    editButtonElement.type = "button";
    editButtonElement.textContent = "수정";
    editButtonElement.addEventListener("click", () => editTodoItem(todoItem.id));

    const completeButtonElement = document.createElement("button");
    completeButtonElement.className = "action-button";
    completeButtonElement.type = "button";
    completeButtonElement.textContent = todoItem.completed ? "완료 해제" : "완료";
    completeButtonElement.addEventListener("click", () => toggleTodoCompletion(todoItem.id));

    const deleteButtonElement = document.createElement("button");
    deleteButtonElement.className = "action-button delete";
    deleteButtonElement.type = "button";
    deleteButtonElement.textContent = "삭제";
    deleteButtonElement.addEventListener("click", () => deleteTodoItem(todoItem.id));

    todoActionsElement.append(editButtonElement, completeButtonElement, deleteButtonElement);
    todoListItemElement.append(todoTextElement, todoActionsElement);
    todoListElement.appendChild(todoListItemElement);
  });

  updateFilterButtonStyles();
}

// 추가 버튼 클릭 시 Todo를 생성합니다.
addTodoButtonElement.addEventListener("click", addTodoItem);

// 엔터 키 입력 시 Todo를 생성합니다.
todoInputElement.addEventListener("keydown", (keyboardEvent) => {
  if (keyboardEvent.key === "Enter") {
    addTodoItem();
  }
});

// 필터 버튼 클릭 시 필터를 변경하고 목록을 다시 렌더링합니다.
filterButtonElements.forEach((filterButtonElement) => {
  filterButtonElement.addEventListener("click", () => {
    currentFilterType = filterButtonElement.dataset.filter;
    renderTodoList();
  });
});

// 주간 이동 버튼 클릭 시 선택 날짜가 속한 주차를 변경합니다.
previousWeekButtonElement.addEventListener("click", () => moveSelectedWeek(-1));
nextWeekButtonElement.addEventListener("click", () => moveSelectedWeek(1));

// 초기 렌더링 전에 로컬스토리지 데이터를 복원합니다.
loadTodoItemsFromLocalStorage();

// 초기 렌더링 시 날짜와 필터 상태를 맞춰줍니다.
renderTodoList();
