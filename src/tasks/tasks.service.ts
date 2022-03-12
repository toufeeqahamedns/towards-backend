import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus } from './task-status.enum';
import { v4 as uuid } from 'uuid';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTaskFilterDto } from './dto/get-task-filter.dto';
import { TaskRepository } from './task.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { User } from 'src/auth/user.entity';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(TaskRepository)
        private taskRepository: TaskRepository
    ) { }

    async getTasks(filterDto: GetTaskFilterDto, user: User): Promise<Task[]> {
        return this.taskRepository.getTasks(filterDto, user);
    }

    async getTaskById(id: string, user: User): Promise<Task> {
        const found = await this.taskRepository.findOne({ where: { id, user } });

        if (!found) {
            throw new NotFoundException(`Task with ID "${id}" not found`);
        }
        return found;
    }

    createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
        return this.taskRepository.createTask(createTaskDto, user);
    }

    async updateTaskStatus(id: string, status: TaskStatus, user: User): Promise<Task> {
        const task = await this.getTaskById(id, user);
        task.status = status;
        await this.taskRepository.save(task);
        return task
    }

    async deleteTask(id: string, user: User): Promise<void> {
        const result = await this.taskRepository.delete({id, user});

        if (result.affected === 0) {
            throw new NotFoundException(`Task with ID "${id}" not found`);
        }
    }
}
