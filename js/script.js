'use strict';

class Todo {
  constructor(form, input, todoList, todoCompleted, todoContainer) {
    this.form = document.querySelector(form);
    this.input = document.querySelector(input);
    this.todoList = document.querySelector(todoList);
    this.todoCompleted = document.querySelector(todoCompleted);
    this.todoContainer = document.querySelector(todoContainer);
    this.todoData = new Map(JSON.parse(localStorage.getItem('todoList')));
  }

  addToStorage() {
    localStorage.setItem('todoList', JSON.stringify([...this.todoData]));
  }

  generateKey() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  getElem(elem) {
    return elem.closest('li');
  }

  animateAdd(elem, completed) {
    elem.style.transform = `scaleX(0)`;
    if (completed) {
      this.todoCompleted.append(elem);
    } else {
      this.todoList.append(elem);
    }
    let width = 0;
    let animateID;
    const animate = () => {
      elem.style.transform = `scaleX(${width / 100})`;
      width ++;
      if(width < 100) {
        requestAnimationFrame(animate);
      }
    }
    animateID = requestAnimationFrame(animate);
  }

  animateDelete(elem) {
    let width = 100;
    let animateID;
    const animate = () => {
      elem.style.transform = `scaleX(${width / 100})`;
      width --;
      if(width <= 0) {
        cancelAnimationFrame(animateID);
        elem.remove();
      }
      requestAnimationFrame(animate);
    }
    animateID = requestAnimationFrame(animate);
  }

  deleteItem(elem) {
    const parent = this.getElem(elem);
    const todoKey = parent.dataset.key;
    this.todoData.delete(todoKey);
    this.addToStorage();
    this.animateDelete(parent);
  }

  completedItem(elem) {
    const parent = this.getElem(elem);
    const todoKey = this.getElem(elem).dataset.key;
    this.todoData.get(todoKey).completed = !this.todoData.get(todoKey).completed;
    console.log(this.todoData.get(todoKey));
    this.createItem(this.todoData.get(todoKey));
    this.animateDelete(parent);
  }

  editItem(elem) {
    const parent = this.getElem(elem);
    console.log('parent: ', parent);
    const todoKey = parent.dataset.key;
    const todoText = parent.querySelector('span');
    if (!todoText.isContentEditable) {
      todoText.contentEditable = true;
      todoText.style.cssText = 'color: blue;';
      parent.style.cssText = 'background-color: #ddd;';
      elem.style.cssText = 'background-image: url(../img/uncheck.png);';
    } else {
      todoText.contentEditable = false;
      todoText.style.cssText = '';
      parent.style.cssText = '';
      elem.style.cssText = '';
      this.todoData.get(todoKey).value = todoText.textContent;
      this.addToStorage();
    }
  }

  handler() {
    this.todoContainer.addEventListener('click', (event) => {
      const target = event.target.closest('button');
      if (target) {
        if (target.classList.contains('todo-edit')) this.editItem(target);
        if (target.classList.contains('todo-remove')) this.deleteItem(target);
        if (target.classList.contains('todo-complete')) this.completedItem(target);
      }
    });
  }

  render() {
    this.todoList.textContent = '';
    this.todoCompleted.textContent = '';
    this.todoData.forEach(this.createItem, this);
    this.addToStorage();
  }

  createItem(todo) {
    const li = document.createElement('li');
    li.classList.add('todo-item');
    li.dataset.key = todo.key;
    li.insertAdjacentHTML('beforeend', `
      <span class="text-todo">${todo.value}</span>
				<div class="todo-buttons">
					<button class="todo-edit"></button>
					<button class="todo-remove"></button>
					<button class="todo-complete"></button>
				</div>
    `);
    this.addToStorage();
    this.animateAdd(li, todo.completed);
  }

  addTodo(event) {
    event.preventDefault();
    if (this.input.value.trim()) {
      const newTodo = {
        value: this.input.value,
        completed: false,
        key: this.generateKey(),
      };
      this.todoData.set(newTodo.key, newTodo);
      this.createItem(newTodo);
      this.input.value = '';
    } else {
      this.input.placeholder = 'Как ты будешь выполнять пустое дело, бездельник?';
      this.input.style.cssText = 'background-color: tomato';
      setTimeout(() => {
        this.input.placeholder = 'Какие планы?';
        this.input.style.cssText = '';
      }, 2000);
    }
  }

  init() {
    this.form.addEventListener('submit', this.addTodo.bind(this));
    this.render();
    this.handler();
  }
}

const todo = new Todo('.todo-control', '.header-input', '.todo-list', '.todo-completed', '.todo-container');

todo.init();
