// Основной конроллер
var tasksController = (function () {
  var New = function (id, title, description) {
    this.id = id;
    this.title = title;
    this.description = description;
  };

  var Inprogress = function (id, title, description) {
    this.id = id;
    this.title = title;
    this.description = description;
  };

  var Done = function (id, element, oldType) {
    this.id = id;
    this.element = element;
    this.oldType = oldType;
  };

  // Записывает данные в localStorage
  var setDataOnLocalStorage = function (dataObj) {
    localStorage.setItem('data', JSON.stringify(dataObj));
  }

  // Получаем данные из localStorage или создаем новые
  var getDataIsLocalStorage = function () {
    var oldData = localStorage.getItem('data');

    if (oldData) {
      return JSON.parse(oldData);
    } else {
      return data = {
        allItems: {
          new: [],
          inprogress: [],
          done: []
        },
        totals: {
          new: 0,
          inprogress: 0,
          done: 0
        },
        currentCat: 'new'
      };
    }
  };

  var data = getDataIsLocalStorage();

  return {
    getItem: function (type, id) {
      var ids, index, el;
      ids = data.allItems[type].map(function (current) {
        return current.id;
      });

      index = ids.indexOf(id);

      if (index !== -1) {
        el = data.allItems[type].filter(function (element) {
          if (element.id === index) {
            return element;
          }
        });

        if (type === 'done') {
          return el[0].element;
        } else {
          return el[0];
        }
      }
    },

    // Добавляет задачу
    addItem: function (type, tit, des) {
        var newItem, id;

        // Генеруем уникальный ID
        if (data.allItems[type].length > 0) {
          id = data.allItems[type][data.allItems[type].length - 1].id + 1;
        } else {
          id = 0;
        }

        if (type === 'new') {
          newItem = new New(id, tit, des);
        } else if(type === 'inprogress') {
          newItem = new Inprogress(id, tit, des);
        }

        data.allItems[type].push(newItem);
        data.totals[type] = data.allItems[type].length;
        setDataOnLocalStorage(data);

        return newItem;
    },

    // Редактирует задачу
    editItem: function (type, id, tit, des) {
      var ids, index;
      ids = data.allItems[type].map(function (current) {
        return current.id;
      });

      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].map(function (element) {
          if (element.id === index) {
            if (type === 'done') {
              element.element.title = tit;
              element.element.description = des;
            }
            element.title = tit;
            element.description = des;
          }
          return element;
        });

        setDataOnLocalStorage(data);
      }
    },

    // Удаляет задачу
    deleteItem: function (type, id) {
      var ids, index;
      ids = data.allItems[type].map(function (current) {
        return current.id;
      });

      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
        data.totals[type] = data.allItems[type].length;
        setDataOnLocalStorage(data);
      }
    },

    // Устанавливает текущую категорию для задач
    setCategory: function (name) {
        data.currentCat = name;
        setDataOnLocalStorage(data);
    },

    setDoneItem: function (type, idElem) {
      var newItem, newId, ids, index, curElement;

      // Генеруем уникальный ID
      if (data.allItems['done'].length > 0) {
        newId = data.allItems['done'][data.allItems['done'].length - 1].id + 1;
      } else {
        newId = 0;
      }

      ids = data.allItems[type].map(function (current) {
        return current.id;
      });

      index = ids.indexOf(idElem);

      if (index !== -1) {
        curElement = data.allItems[type].splice(index, 1);


        newItem = new Done(newId, curElement[0], type);
        data.allItems['done'].push(newItem);
        data.totals[type] = data.allItems[type].length;
        data.totals['done'] = data.allItems['done'].length;
        setDataOnLocalStorage(data);
      }
    },

    unsetDoneItem: function (type, idDone) {
      var ids, index, elem;
      ids = data.allItems[type].map(function (current) {
        return current.id;
      });

      index = ids.indexOf(idDone);

      if (index !== -1) {
        elem = data.allItems[type].splice(index, 1);
        elem = elem[0];
        data.allItems[elem.oldType].push(elem.element);
        data.totals[type] = data.allItems[type].length;
        data.totals[elem.oldType] = data.allItems[elem.oldType].length;
        setDataOnLocalStorage(data);
      }
    },

    // Возвращает все данные из локального хранилища
    getData: function () {
      return data;
    },

    testing: function () {
      console.log(data);
    },

    clearData: function () {
      localStorage.clear();
    }
  };
})();

// Конроллер генерует HTML
var UIController = (function () {
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

// Контроллер
var controller = (function (tasksCtrl, UICtrl) {
  // Инициализация слушателей
  var setupEventListeners = function () {
    var DOM = UICtrl.getDOMstrings();

    document.querySelector(DOM.addBtn).addEventListener('click', function () {
      UICtrl.showModal('add');
    });

    document.querySelector(DOM.taskModalSubmit).addEventListener('click', ctrlAddItem);

    document.querySelector(DOM.taskModalClose).addEventListener('click', function () {
      UICtrl.closeModal();
    });
    document.addEventListener('keydown', function (event) {
      if (event.keyCode === 27) {
        UICtrl.closeModal();
      }
    });

    document.querySelector(DOM.list).addEventListener('click', ctrlSetDoneItem);
    document.querySelector(DOM.list).addEventListener('click', ctrlUnsetDoneItem);
    document.querySelector(DOM.list).addEventListener('click', showDescription);

    document.querySelector(DOM.categoriesNew).addEventListener('click', function () {
      ctrlSetCategory('new');
    });
    document.querySelector(DOM.categoriesInProgress).addEventListener('click', function () {
      ctrlSetCategory('inprogress');
    });
    document.querySelector(DOM.categoriesDone).addEventListener('click', function () {
      ctrlSetCategory('done');
    });

    document.querySelector(DOM.list).addEventListener('click', showEditModal);
    document.querySelector(DOM.taskModalSubmit).addEventListener('click', ctrlEditItem);
    document.querySelector(DOM.list).addEventListener('click', ctrlDeleteItem);
  };

  // Устанавливает категорию в которую будут показываться и добавляться задачи
  var ctrlSetCategory = function (catName) {
    var category = '';
    switch (catName) {
      case 'new': category = catName; break;
      case 'inprogress': category = catName; break;
      case 'done': category = catName; break;
    }
    if (category !== '') {
      tasksCtrl.setCategory(category);
      ctrlRenderTasks();
    }
  };

  var ctrlUpdateCount = function () {
    var data, totals;
    data = tasksCtrl.getData();
    totals = data.totals;

    UICtrl.updateCount(totals);
  }

  var ctrlRenderTasks = function () {
    var data, category, categoryDone, doneId, newElem, i;
    categoryDone = [];
    doneId = [];

    data = tasksCtrl.getData();
    category = data.currentCat;

    if (category === 'done') {
      if (data.allItems['done'].length > 0) {
        for (i = 0; i < data.allItems['done'].length; i++) {
          categoryDone.push(data.allItems['done'][i].element);
          doneId.push(data.allItems['done'][i].id)
        }

        for (i = 0; i < categoryDone.length; i++) {
          categoryDone[i].id = doneId[i];
        }

        UICtrl.renderItems(categoryDone, 'done');
      }


      /*
      categoryDone = data.allItems['done'].map(function (current) {
        return current.element;
      });

      doneId = data.allItems['done'].map(function (current) {
        return current.id;
      });
      */


    } else {
      UICtrl.renderItems(data.allItems[category], category);
    }
    ctrlUpdateCount();

  };

  // Показывает или скрывает описание
  var showDescription = function (event) {
    var element, findItem, item;

    findItem = 'list-item';
    element = event.target.classList.contains(findItem);

      if (element) {
        item = event.target;
      } else {
        element = event.target.parentNode.classList.contains(findItem);
        if (element) {
          item = event.target.parentNode;
        } else {
          element = event.target.parentNode.parentNode.classList.contains(findItem);
          if (element) {
            item = event.target.parentNode.parentNode;
          } else {
            item = '';
          }
        }
      }

    if (item) {
      UICtrl.showHideDescription(item);
    }
  };

  // Добавляем элемент
  var ctrlAddItem = function (event) {
    var input, type, newItem, data, doneCategory, validInput;
    event.preventDefault();

    if (event.target.name === 'add') {
      data = tasksCtrl.getData();
      input = UICtrl.getInput();
      type = data.currentCat;
      if (type === 'done') {
        type = 'new';
        doneCategory = true;
      }

      validInput = UICtrl.validInput(input.title)
      if (validInput) {
        if (input.description.length === 0) {
          input.description = 'No description';
        }

        newItem = tasksCtrl.addItem(type, input.title, input.description);
        if (!doneCategory) {
          UICtrl.addListItem(newItem, type);
        }
        UICtrl.closeModal();
        ctrlUpdateCount();
      }
    }
  };

  // setDoneItem: function (type, id)
  var ctrlSetDoneItem = function (event) {
    var item, itemId, itemStatus, doneBtn, isDoneBtn;

    doneBtn = event.target;

    if (doneBtn.value === 'done') {
      item = event.target.parentNode.parentNode;
      itemId = item.id;
      itemStatus = item.classList.contains('status-done');


      if (itemId && !itemStatus) {
        splitId = itemId.split('-');
        type = splitId[0];
        id = parseInt(splitId[1]);

        tasksCtrl.setDoneItem(type, id);
        ctrlRenderTasks();
        ctrlUpdateCount();
      }
    }
  };

  //
  var ctrlUnsetDoneItem = function (event) {
    var item, itemId, itemStatus, doneBtn, isDoneBtn;

    doneBtn = event.target;

    if (doneBtn.value === 'done') {
      item = event.target.parentNode.parentNode;
      itemId = item.id;
      itemStatus = item.classList.contains('status-done');


      if (itemId && itemStatus) {
        splitId = itemId.split('-');
        type = splitId[0];
        id = parseInt(splitId[1]);

        tasksCtrl.unsetDoneItem(type, id);
        ctrlRenderTasks();
        ctrlUpdateCount();
      }
    }
  }

  // Показывает окно с данными для редактирования
  var showEditModal = function (event) {
    var editBtn, itemId, splitId, type, id, currentData;

    editBtn = event.target;
    if (editBtn.value === 'edit') {
      itemId = event.target.parentNode.parentNode.parentNode.id;

      if (itemId) {
        splitId = itemId.split('-');
        type = splitId[0];
        id = parseInt(splitId[1]);

        currentData = tasksCtrl.getItem(type, id);
        UICtrl.setInput(currentData);
        UICtrl.showModal('edit', itemId);
      }
    }
  };

  // Редактирует задачу
  var ctrlEditItem = function (event) {
    var itemId, type, id, input, validInput;

    if (event.target.name === 'save') {
      itemId = event.target.value;
      if (itemId) {
        splitId = itemId.split('-');
        type = splitId[0];
        id = parseInt(splitId[1]);
        input = UICtrl.getInput();

        validInput = UICtrl.validInput(input.title);
        if (validInput) {
          if (input.description.length === 0) {
            input.description = 'No description';
          }
          tasksCtrl.editItem(type, id, input.title, input.description);
          ctrlRenderTasks();
          UICtrl.closeModal();
        }
      }
    }
  };

  // Удаляет элемент
  var ctrlDeleteItem = function (event) {
    var deleteBtn, itemId, splitId, type, id;

    deleteBtn = event.target;

    if (deleteBtn.value === 'remove') {
      itemId = event.target.parentNode.parentNode.parentNode.id;

      if (itemId) {
        splitId = itemId.split('-');
        type = splitId[0];
        id = parseInt(splitId[1]);

        tasksCtrl.deleteItem(type, id);
        UICtrl.deleteListItem(itemId);
        ctrlUpdateCount();
      }
    }
  };

  return {
    init: function () {
      console.log('Application has started');
      setupEventListeners();
      ctrlRenderTasks();
    }
  };

})(tasksController, UIController);

controller.init();
