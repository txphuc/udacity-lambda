import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { createLogger } from '../utils/logger.mjs'
import { v4 as uuidv4 } from 'uuid'
import AWSXRay from 'aws-xray-sdk-core'

export class TodosAccess {
  constructor(
    documentClient = AWSXRay.captureAWSv3Client(new DynamoDB()),
    todosTable = process.env.TODOS_TABLE
  ) {
    this.documentClient = documentClient
    this.todosTable = todosTable
    this.dynamoDbClient = DynamoDBDocument.from(this.documentClient)
    this.logger = createLogger('TodosAccess')
  }

  async getTodos(userId) {
    this.logger.info(`Getting all todo items for userID: ${userId}`)

    const params = {
      TableName: this.todosTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }
    try {
      const result = await this.dynamoDbClient.query(params)
      return result.Items
    } catch (error) {
      this.logger.error(`Error fetching todo items for userID: ${userId}`, {
        error
      })
      throw new Error('Error fetching todo items')
    }
  }

  async createTodo(todo) {
    const todoId = uuidv4()
    const newTodo = {
      ...todo,
      todoId,
      createdAt: new Date().toISOString()
    }

    this.logger.info(`Creating a new todo item with ID: ${todoId}`)

    const params = {
      TableName: this.todosTable,
      Item: newTodo
    }

    try {
      await this.dynamoDbClient.put(params)
      return newTodo
    } catch (error) {
      this.logger.error(`Error creating a todo item with ID: ${todoId}`, {
        error
      })
      throw new Error('Error creating todo item')
    }
  }

  async updateTodo(userId, todoId, updateData) {
    this.logger.info(
      `Updating todo item with ID: ${todoId} for userID: ${userId}`
    )

    const params = {
      TableName: this.todosTable,
      Key: {
        userId,
        todoId
      },
      UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
      ExpressionAttributeNames: {
        '#name': 'name'
      },
      ExpressionAttributeValues: {
        ':name': updateData.name,
        ':dueDate': updateData.dueDate,
        ':done': updateData.done
      },
      ReturnValues: 'ALL_NEW'
    }

    try {
      const result = await this.dynamoDbClient.update(params)
      return result.Attributes
    } catch (error) {
      this.logger.error(
        `Error updating todo item with ID: ${todoId} for userID: ${userId}`,
        { error }
      )
      throw new Error('Error updating todo item')
    }
  }

  async deleteTodo(userId, todoId) {
    this.logger.info(
      `Deleting todo item with ID: ${todoId} for userID: ${userId}`
    )

    const params = {
      TableName: this.todosTable,
      Key: {
        userId,
        todoId
      }
    }

    try {
      await this.dynamoDbClient.delete(params)
    } catch (error) {
      this.logger.error(
        `Error deleting todo item with ID: ${todoId} for userID: ${userId}`,
        { error }
      )
      throw new Error('Error deleting todo item')
    }
  }

  async saveImgUrl(userId, todoId, bucketName) {
    this.logger.info(
      `Updating image URL for todo item with ID: ${todoId} for userID: ${userId}`
    )

    const params = {
      TableName: this.todosTable,
      Key: { userId, todoId },
      ConditionExpression: 'attribute_exists(todoId)',
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': `https://${bucketName}.s3.amazonaws.com/${todoId}`
      }
    }

    try {
      await this.dynamoDbClient.update(params)
    } catch (error) {
      this.logger.error(
        `Error updating image URL for todo item with ID: ${todoId} for userID: ${userId}`,
        { error }
      )
      throw new Error('Error updating image URL')
    }
  }
}
