import express from 'express'
import { router } from './router'
import helmet from 'helmet'

export class App {
  public server: express.Application

  constructor () {
    this.server = express()
    this.middleware()
    this.router()
  }

  private middleware (): void {
    this.server.use(helmet())
    this.server.use(express.json())
  }

  private router (): void {
    this.server.use(helmet())
    this.server.use(router)
  }
}
