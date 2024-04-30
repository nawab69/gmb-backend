import { Logger, NotFoundException } from '@nestjs/common';
import {
  FilterQuery,
  Model,
  Types,
  UpdateQuery,
  SaveOptions,
  Connection,
  QueryOptions,
  ProjectionType,
  AggregateOptions,
  MongooseBaseQueryOptionKeys,
} from 'mongoose';
import { AbstractDocument } from './abstract.schema';
import { DeleteOptions, FindOptions } from 'mongodb';

export abstract class AbstractRepository<TDocument extends AbstractDocument> {
  protected abstract readonly logger: Logger;

  constructor(
    protected readonly model: Model<TDocument>,
    private readonly connection: Connection,
  ) {}

  async create(
    document: Omit<TDocument, '_id'>,
    options?: SaveOptions,
  ): Promise<TDocument> {
    const createdDocument = new this.model({
      ...document,
      _id: new Types.ObjectId(),
    });
    return (
      await createdDocument.save(options)
    ).toJSON() as unknown as TDocument;
  }

  async findOne(
    filterQuery: FilterQuery<TDocument>,
    projections: ProjectionType<TDocument> = {},
    options?: QueryOptions<FindOptions>,
  ): Promise<TDocument> {
    const document = await this.model.findOne(filterQuery, projections, {
      lean: true,
      ...options,
    });
    return document;
  }

  async findById(
    id: string,
    options?: QueryOptions<FindOptions>,
    projections: ProjectionType<TDocument> = {},
  ): Promise<TDocument> {
    const document = await this.model.findById(id, projections, {
      lean: true,
      ...options,
    });
    return document;
  }

  async findByIdAndUpdate(
    id: any,
    update: UpdateQuery<TDocument>,
    options?: SaveOptions,
  ) {
    const document = await this.model.findByIdAndUpdate(id, update, {
      lean: true,
      new: false,
      ...options,
    });
    return document;
  }

  async findOneAndUpdate(
    filterQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
    options?: SaveOptions,
  ) {
    const document = await this.model.findOneAndUpdate(filterQuery, update, {
      lean: true,
      new: true,
      ...options,
    });

    return document;
  }

  async findOneAndDelete(
    filterQuery: FilterQuery<TDocument>,
    options?: SaveOptions,
  ) {
    const document = await this.model.findOneAndDelete(filterQuery, {
      lean: true,
      ...options,
    });
    return document;
  }

  async upsert(
    filterQuery: FilterQuery<TDocument>,
    document: Partial<TDocument>,
  ) {
    return this.model.findOneAndUpdate(filterQuery, document, {
      lean: true,
      upsert: true,
      new: true,
    });
  }

  find(
    filterQuery: FilterQuery<TDocument>,
    options?: QueryOptions<FindOptions>,
  ) {
    return this.model.find(filterQuery, {}, { lean: true, ...options });
  }

  async deleteMany(
    filterQuery: FilterQuery<TDocument>,
    options?: DeleteOptions &
      Pick<QueryOptions<TDocument>, MongooseBaseQueryOptionKeys>,
  ) {
    return this.model.deleteMany(filterQuery, {
      lean: true,
      ...options,
    });
  }

  async insertMany(documents: Omit<TDocument, '_id'>[]) {
    return this.model.insertMany(
      documents.map((document) => ({
        ...document,
        _id: new Types.ObjectId(),
      })),
    );
  }

  async startTransaction() {
    const session = await this.connection.startSession();
    session.startTransaction();
    return session;
  }

  async aggregate(pipeline: any[], options?: AggregateOptions) {
    return this.model.aggregate(pipeline, options);
  }

  async updateMany(...args: any) {
    return this.model.updateMany(...args);
  }
}
