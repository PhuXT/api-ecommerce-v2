export function getUrlDatabase(databaseUser, databasePassword, databaseName) {
  return `mongodb+srv://${databaseUser}:${databasePassword}@cluster0.48m1h.mongodb.net/${databaseName}?retryWrites=true&w=majority`;
}
