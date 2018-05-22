// Контроллер
var controller = (function (tasksCtrl, UICtrl) {
  // Инициализация слушателей
  var setupEventListeners = function () {
    var DOM = UICtrl.getSelectors();

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

    document.querySelector(DOM.list).addEventListener('mousedown', function () {
      var draggable, listItems;
      draggable = document.querySelectorAll(DOM.listItem);

      listItems = Array.prototype.slice.call(draggable);

      listItems.forEach(function (current) {
        current.addEventListener('dragstart', function (event) {
          event.dataTransfer.setData('itemID', event.target.id);
        });
      });
    });

    document.querySelector(DOM.categories).addEventListener('dragover', function (event) {
      event.preventDefault();
    });
    document.querySelector(DOM.categories).addEventListener('drop', ctrlChangeItemCategory);
  };

  // Меняет категорию задачи при помощи Drag and Drop
  var ctrlChangeItemCategory = function (event) {
    var itemID, category, carvedItem;
    event.preventDefault();

    category = event.target.id;
    itemID = event.dataTransfer.getData('itemID');

    if (itemID && category) {
      splitId = itemID.split('-');
      type = splitId[0];
      id = parseInt(splitId[1]);

      if (type && type !== category && category === 'done') {
        tasksCtrl.setDoneItem(type, id);
      } else if (type && type !== category) {
        carvedItem = tasksCtrl.cutItem(type, id);
        if (carvedItem) {
          tasksCtrl.addItem(category, carvedItem.title, carvedItem.description);
        }
      }

      ctrlRenderTasks();
      ctrlupdateCounters();
    }
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

  var ctrlupdateCounters = function () {
    var data, totals;
    data = tasksCtrl.getData();
    totals = data.totals;

    UICtrl.updateCounters(totals);
  }

  // Рендерит задачи из localStorage
  var ctrlRenderTasks = function () {
    var data, category, categoryDone, doneId, doneElem;

    data = tasksCtrl.getData();
    category = data.currentCat;

    if (category === 'done') {
      var Done = function (id, title, description) {
        this.id = id;
        this.title = title;
        this.description = description;
      };

      newElem = data.allItems['done'].map(function (current) {
        var newObj = new Done(current.id, current.element.title, current.element.description);
        return newObj;
      });

      UICtrl.renderItems(newElem, 'done');
    } else {
      UICtrl.renderItems(data.allItems[category], category);
    }

    ctrlupdateCounters();
  };

  // Показывает или скрывает описание задачи
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
      UICtrl.toggleDescription(item);
    }
  };

  // Добавляем задачу
  var ctrlAddItem = function (event) {
    var input, type, newItem, data, doneCategory, validateInput;
    event.preventDefault();

    if (event.target.name === 'add') {
      data = tasksCtrl.getData();
      input = UICtrl.getInput();
      type = data.currentCat;
      if (type === 'done') {
        type = 'new';
        doneCategory = true;
      }

      validateInput = UICtrl.validateInput(input.title)
      if (validateInput) {
        if (input.description.length === 0) {
          input.description = 'No description';
        }

        newItem = tasksCtrl.addItem(type, input.title, input.description);
        if (!doneCategory) {
          UICtrl.addListItem(newItem, type);
        }
        UICtrl.closeModal();
        ctrlupdateCounters();
      }
    }
  };

  // Устанавливает задачу как DONE
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
        ctrlupdateCounters();
      }
    }
  };

  // Возвращает задачу из DONE обратно в ту категорию где она была
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
        ctrlupdateCounters();
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
    var itemId, type, id, input, validateInput;

    if (event.target.name === 'save') {
      itemId = event.target.value;
      if (itemId) {
        splitId = itemId.split('-');
        type = splitId[0];
        id = parseInt(splitId[1]);
        input = UICtrl.getInput();

        validateInput = UICtrl.validateInput(input.title);
        if (validateInput) {
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
        ctrlupdateCounters();
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

})(window.tasksController, window.UIController);

controller.init();
