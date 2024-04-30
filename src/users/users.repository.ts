import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model, Connection, FilterQuery } from 'mongoose';
import { AbstractRepository } from '../database/abstract.repository';
import { User } from './user.schema';

@Injectable()
export class UsersRepository extends AbstractRepository<User> {
  protected readonly logger = new Logger(UsersRepository.name);

  constructor(
    @InjectModel(User.name) userModel: Model<User>,
    @InjectConnection() connection: Connection,
  ) {
    super(userModel, connection);
  }

  async count(query: FilterQuery<User>) {
    return this.model.countDocuments(query);
  }
}
