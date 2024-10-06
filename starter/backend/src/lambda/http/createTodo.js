import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { getUserId } from '../utils.mjs'
import { TodosBusinessLogic } from '../../businessLogic/todos.mjs'

const todosBusinessLogic = new TodosBusinessLogic();

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event) => {
    const newTodo = JSON.parse(event.body)
    const userId = getUserId(event)
    const todo = await todosBusinessLogic.createTodo(userId, newTodo)
    const response = { item: todo };
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify(response)
    }
  })