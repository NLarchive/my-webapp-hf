/**
 * Task Runner
 * Manages task queue and execution order
 */

import { logger } from '../config/logger.js';

class TaskRunner {
  constructor() {
    this.tasks = [];
    this.isRunning = false;
    this.executedTasks = [];
  }

  /**
   * Add task to queue
   * @param {Object} task - Task definition
   */
  addTask(task) {
    const {
      id,
      name,
      priority = 5,
      execute,
      retries = 3,
      timeout = 30000,
    } = task;

    if (!id || !name || !execute) {
      throw new Error('Task must have id, name, and execute function');
    }

    this.tasks.push({
      id,
      name,
      priority,
      execute,
      retries,
      timeout,
      status: 'pending',
      result: null,
      error: null,
      attempts: 0,
    });

    // Sort by priority (higher = execute first)
    this.tasks.sort((a, b) => b.priority - a.priority);

    logger.debug(`Task added: ${name} (priority: ${priority})`);
  }

  /**
   * Run all tasks in queue
   * @returns {Promise<Array>} Execution results
   */
  async runAll() {
    if (this.isRunning) {
      logger.warn('Tasks already running');
      return [];
    }

    this.isRunning = true;
    const results = [];

    logger.info('Starting task execution', { taskCount: this.tasks.length });

    for (const task of this.tasks) {
      try {
        const result = await this.executeTask(task);
        results.push(result);
      } catch (error) {
        logger.error('Task execution failed', {
          taskId: task.id,
          error: error.message,
        });
      }
    }

    this.isRunning = false;
    logger.info('Task execution completed', { taskCount: results.length });

    return results;
  }

  /**
   * Execute single task with retries
   * @param {Object} task - Task to execute
   * @returns {Promise<Object>} Execution result
   */
  async executeTask(task) {
    let lastError;

    for (let attempt = 1; attempt <= task.retries; attempt++) {
      try {
        task.attempts = attempt;
        task.status = 'running';

        logger.debug(`Executing task: ${task.name} (attempt ${attempt}/${task.retries})`);

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error('Task timeout')),
            task.timeout
          )
        );

        const result = await Promise.race([
          task.execute(),
          timeoutPromise,
        ]);

        task.status = 'completed';
        task.result = result;

        logger.info(`Task completed: ${task.name}`, { attempt });
        this.executedTasks.push({ ...task });

        return task;
      } catch (error) {
        lastError = error;
        logger.warn(`Task attempt ${attempt} failed: ${task.name}`, {
          error: error.message,
        });

        if (attempt < task.retries) {
          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    task.status = 'failed';
    task.error = lastError?.message;

    logger.error(`Task failed after retries: ${task.name}`, {
      error: lastError?.message,
    });

    this.executedTasks.push({ ...task });
    return task;
  }

  /**
   * Clear task queue
   */
  clear() {
    this.tasks = [];
    this.executedTasks = [];
    logger.debug('Task queue cleared');
  }

  /**
   * Get execution history
   * @returns {Array} Executed tasks
   */
  getHistory() {
    return this.executedTasks;
  }

  /**
   * Get task stats
   * @returns {Object} Stats
   */
  getStats() {
    const history = this.executedTasks;
    const completed = history.filter((t) => t.status === 'completed').length;
    const failed = history.filter((t) => t.status === 'failed').length;

    return {
      total: history.length,
      completed,
      failed,
      successRate: history.length > 0 ? (completed / history.length) * 100 : 0,
    };
  }
}

export const taskRunner = new TaskRunner();
