const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const foundUser = users.find(user => user.username === request.body.username);
  
  if (foundUser) {
    return response.status(400).json({error: 'this username already exists'});
  }
  
  next();
}

app.use(checksExistsUserAccount)

app.post('/users', (request, response) => {
  const newUser = {
    id: uuidv4(),
    name: request.body.name,
    username: request.body.username,
    todos: []
  };
  
  users.push(newUser)
  
  return response.json(newUser).status(201);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const user = users.find(user => user.username === request.headers.username);
  
  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const user = users.find(user => user.username === request.headers.username);
  
  const newTodo = {
    id: uuidv4(),
    title: request.body.title,
    deadline: request.body.deadline,
    done: false,
    created_at: new Date(),
  }
  
  user.todos.push(newTodo);
  
  return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const user = users.find(user => user.username === request.headers.username);
  
  const todoIndex = user.todos.findIndex(todo => todo.id === request.params.id);
  
  if (todoIndex === -1) {
    return response.status(404).json({error: 'todo not found'});
  }
  
  user.todos[todoIndex].title = request.body.title;
  user.todos[todoIndex].deadline = request.body.deadline;
  
  return response.json(user.todos[todoIndex]);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const user = users.find(user => user.username === request.headers.username);

  const todoIndex = user.todos.findIndex(todo => todo.id === request.params.id);

  if (todoIndex === -1) {
    return response.status(404).json({error: 'todo not found'});
  }

  user.todos[todoIndex].done = true;

  return response.json(user.todos[todoIndex]);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const user = users.find(user => user.username === request.headers.username);

  const todoIndex = user.todos.findIndex(todo => todo.id === request.params.id);

  if (todoIndex === -1) {
    return response.status(404).json({error: 'todo not found'});
  }

  user.todos.splice(todoIndex);

  return response.status(204).send();
});

module.exports = app;