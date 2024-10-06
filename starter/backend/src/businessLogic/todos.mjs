import { TodosAccess } from "../dataLayer/todosAccess.mjs";

export class TodosBusinessLogic {
  constructor() {
    this.todosAccess = new TodosAccess();
  }

  async getTodos(userId) {
    return await this.todosAccess.getTodos(userId);
  }

  async createTodo(userId, todoData) {
    const todo = {
      userId,
      ...todoData
    };
    
    return await this.todosAccess.createTodo(todo);
  }

  async updateTodo(userId, todoId, updateData) {
    return await this.todosAccess.updateTodo(userId, todoId, updateData);
  }

  async deleteTodo(userId, todoId) {
    return await this.todosAccess.deleteTodo(userId, todoId);
  }

  async saveImgUrl(userId, todoId, bucketName) {
    return await this.todosAccess.saveImgUrl(userId, todoId, bucketName);
  }
}