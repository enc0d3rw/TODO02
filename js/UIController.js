// Конроллер генерует HTML
window.UIController = (function () {
  // HTML элементы
  var DOMstrings = {
    addBtn: '.btn-add',
    editBtn: '.btn-edit',
    modal: '.fixed-overlay',
    taskModalTitle: '.task-modal-title',
    taskModalSubmit: '.task-modal-submit',
    taskModalClose: '.modal-btn-close',
    taskTitle: '#task-title',
    taskDescription: '#task-description',
    list: '.list',
    listItem: '.list-item',
    listItemDescription: '.list-item-description',
    newCount: '.new-count',
    inProgressCount: '.in-progress-count',
    doneCount: '.done-count',
    categoriesNew: '.categories-new',
    categoriesInProgress: '.categories-in-progress',
    categoriesDone: '.categories-done'
  };

  // Очищает все поля
  var clearFields = function () {
    var fields, fieldsArr;
    fields = document.querySelectorAll(DOMstrings.taskTitle + ', ' + DOMstrings.taskDescription);

    fieldsArr = Array.prototype.slice.call(fields);

    fieldsArr.forEach(function (current) {
      current.value = '';
    });
  };

  // Генерирует HTML элемент
  var renderListItem = function (obj, type) {
    var html, newHtml, htmlStatic;

    htmlStatic = '<div class="list-item-title-box"><button class="btn-done" type="button" name="done" value="done"></button><p class="list-item-title">%title%</p><div class="list-btn"><button class="btn-edit" type="button" name="btn-edit" value="edit">Edit</button><button class="btn-remove" type="button" name="btn-remove" value="remove">Delete</button></div></div><p class="list-item-description hidden">%description%</p></li>';

    if (type === 'new') {
      html = '<li class="list-item status-new" id="new-%id%">' + htmlStatic;
    } else if (type === 'inprogress') {
      html = '<li class="list-item status-inprogress" id="inprogress-%id%">' + htmlStatic;
    } else if (type === 'done') {
      html = '<li class="list-item status-done" id="done-%id%">' + htmlStatic;
    }

    newHtml = html.replace('%id%', obj.id);
    newHtml = newHtml.replace('%title%', obj.title);
    newHtml = newHtml.replace('%description%', obj.description);

    document.querySelector(DOMstrings.list).insertAdjacentHTML('afterbegin', newHtml);
  };

  return {
    // Рисует все задачи в выбранной категории
    renderItems: function (dataArr, type) {
      document.querySelector(DOMstrings.list).innerHTML = '';
      dataArr.forEach(function (element) {
        renderListItem(element, type);
      });
    },

    // Показывает модальное окно,
    // type - тип модального окна, add - добавить, edit - редактировать
    showModal: function (type, id) {
      var title, submitBtn, editId;

      if (id === undefined) {
        id = '';
      }

      document.querySelector(DOMstrings.modal).classList.remove('hidden');
      title = document.querySelector(DOMstrings.taskModalTitle);
      submitBtn = document.querySelector(DOMstrings.taskModalSubmit);

      if (type === 'add') {
        title.textContent = 'Add task';
        submitBtn.textContent = 'Add';
        submitBtn.name = 'add';
      } else if (type === 'edit') {
        title.textContent = 'Edit task';
        submitBtn.textContent = 'Save';
        submitBtn.name = 'save';
        submitBtn.value = id;
      }
    },

    // Очищает поля формы и закрывает модальное окно
    closeModal: function () {
      clearFields();
      document.querySelector(DOMstrings.modal).classList.add('hidden');
    },

    // Получаем отправленные данные
    getInput: function () {
      return {
        title: document.querySelector(DOMstrings.taskTitle).value,
        description: document.querySelector(DOMstrings.taskDescription).value
      };
    },

    // Проверяет поле title
    validInput: function (tit) {
      if (tit.length > 0 && tit.length < 155) {
        return true;
      }
      return false;
    },

    // Устанавилент данные в поля, для дальнешего редактирования
    setInput: function (obj) {
      document.querySelector(DOMstrings.taskTitle).value = obj.title;
      document.querySelector(DOMstrings.taskDescription).value = obj.description;
    },

    // Выводит только что добавленный элемент в HTML
    addListItem: function (obj, type) {
      renderListItem(obj, type);
    },

    // Обновляет кол-во задач в категориях
    updateCount: function (obj) {
      document.querySelector(DOMstrings.newCount).textContent = obj.new;
      document.querySelector(DOMstrings.inProgressCount).textContent = obj.inprogress;
      document.querySelector(DOMstrings.doneCount).textContent = obj.done;
    },

    // Удаляет задачу
    deleteListItem: function (selectorId) {
      var el = document.getElementById(selectorId);
      el.parentNode.removeChild(el);
    },

    // Показывает описание
    showHideDescription: function (current) {
      var descriptionStatus, currentDescription;

      currentDescription = current.querySelector(DOMstrings.listItemDescription);

      if (currentDescription) {
        descriptionStatus = currentDescription.classList.contains('hidden');
        if (descriptionStatus) {
          currentDescription.classList.remove('hidden');
        } else {
          currentDescription.classList.add('hidden');
        }
      }
    },

    // Возвращает массив DOM элементов
    getDOMstrings: function () {
      return DOMstrings;
    }
  };
})();
