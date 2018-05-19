// Основной конроллер
window.tasksController = (function () {
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
    // Возврощает нужный элемент из массива с данными
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

    // Устанавливает элемент как DONE
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

    // Убирает элемент из DONE
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

    // Методы для разработки
    testing: function () {
      console.log(data);
    },

    clearData: function () {
      localStorage.clear();
    }
  };
})();
