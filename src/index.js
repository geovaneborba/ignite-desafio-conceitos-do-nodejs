const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userExists = users.find((user) => user.username === username);
  
  if (!userExists) {
    return response.status(404).json({ error: "User not exists!" });
  }

  request.user = userExists;

  return next();
}

app.post("/users", (request, response) => {
  // Complete aqui
  const { name, username } = request.body;

  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: "User already exists!" });
  }

  const user = {
    id: uuidv4(), // precisa ser um uuid
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request

  return response.json(user.todos)
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(), // precisa ser um uuid
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  }

  user.todos.push(todo)

  return response.status(201).json(todo)
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body
  const { id } = request.params

  const findTodoById = user.todos.find(todo => todo.id === id)

  if(!findTodoById) {
    return response.status(404).json({ error: 'Todo not found!' })
  }

  findTodoById.title = title
  findTodoById.deadline = deadline

  return response.status(200).json(findTodoById)
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const findTodoById = user.todos.find(todo => todo.id === id)

  if(!findTodoById) {
    return response.status(404).json({ error: 'Todo not found!' })
  }

  findTodoById.done = true
  
  return response.status(200).json(findTodoById)
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const findIndexTodoById = user.todos.findIndex(todo => todo.id === id)

  if(findIndexTodoById === -1) {
    return response.status(404).json({ error: 'Todo not found!' })
  }

  user.todos.splice(findIndexTodoById, 1)

  return response.status(204).send()
});

module.exports = app;
