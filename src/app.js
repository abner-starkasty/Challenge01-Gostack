const express = require("express");
const cors = require("cors");

const { v4: uuid, validate: isUuid } = require('uuid');

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function logRequests(request, response, next) {
  const { method, url } = request

  const logLabel = `[${method.toUpperCase()}] ${url}`

  console.time(logLabel)

  next()
  console.timeEnd(logLabel)
}

function validateRepoId(request, response, next) {
  const { id } = request.params

  if (!isUuid(id)) {
    return response.status(400).json({ error: 'Invalid project ID.'})
  }

  return next()
}

app.use(logRequests)

app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body

  const repository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0
  }

  repositories.push(repository);

  return response.json(repository)
});

app.put("/repositories/:id", validateRepoId, (request, response) => {
  const { title, url, techs } = request.body
  const { id } = request.params

  const repoIndex = repositories.findIndex(repo => repo.id === id)

  if (repoIndex < 0) {
    return response.status(400).json({ error: 'Repository not found!'})
  }

  const repoUpdated = {
    ...repositories[repoIndex],
    ...(title ? { title }: {}),
    ...(url ? { url }: {}),
    ...(techs ? { techs }: {})
  }

  repositories[repoIndex] = repoUpdated

  return response.json(repoUpdated)
});

app.delete("/repositories/:id", validateRepoId, (request, response) => {
  const { id } = request.params

  const repoIndex = repositories.findIndex(repo => repo.id === id)

  if (repoIndex < 0) {
    return response.status(400).json({ error: 'Repository not found!'})
  }

  repositories.splice(repoIndex, 1)

  return response.status(204).send()
});

app.post("/repositories/:id/like", validateRepoId, (request, response) => {
  const { id } = request.params

  const repoIndex = repositories.findIndex(repo => repo.id === id)

  if (repoIndex < 0) {
    return response.status(400).json({ error: 'Repository not found!'})
  }

  repositories[repoIndex].likes++

  return response.json(repositories[repoIndex])
});

module.exports = app;
