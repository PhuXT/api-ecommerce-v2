import {
  Document,
  PaginateModel,
  PaginateOptions,
  PaginateResult,
  AggregatePaginateModel,
  FilterQuery,
  UpdateQuery,
} from 'mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ModelNotFoundException } from '../modules/exceptions/model-not-found.exception';
import { EventEmitter } from 'events';

export class BaseRepository<T extends Document> extends EventEmitter {
  protected primaryKey = '_id';

  constructor(
    protected readonly model: PaginateModel<T>,
    protected readonly aggModel?: AggregatePaginateModel<any>,
  ) {
    super();
    this.model = model;
    this.aggModel = aggModel;
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  async create(entity: object): Promise<T> {
    return new this.model(entity).save();
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  async createOrUpdate(entity: object): Promise<T> {
    let model = await this.findOne({
      [this.primaryKey]: entity[this.primaryKey],
    });

    if (model === null) {
      model = await new this.model(entity).save();
    } else {
      await model.set(entity).save();
    }

    return model;
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  async findById(
    id: string,
    // eslint-disable-next-line @typescript-eslint/ban-types
    options: {} = {},
    populates: string[] = [],
  ): Promise<T> {
    const model = await this.model
      .findById(id, null, { ...options, lean: true })
      .exec();

    if (model && populates.length) {
      for (const path of populates) {
        await model.populate([path]);
      }
    }

    if (!model) {
      throw new NotFoundException(`Not found id: ${id}`);
    }
    return model;
  }

  async findOne(
    params: { [key: string]: any } = {},
    options: { [key: string]: any } = {},
    populates: string[] = [],
  ): Promise<T> {
    const model = await this.model.findOne(
      params as any,
      {},
      { ...options, lean: true },
    );

    if (model && populates.length) {
      for (const path of populates) {
        await model.populate([path]);
      }
    }

    return model;
  }

  async find(
    // eslint-disable-next-line @typescript-eslint/ban-types
    params: object = {},
    // eslint-disable-next-line @typescript-eslint/ban-types
    options: {} = {},
    populates: string[] = [],
    sort: { [key: string]: any } = {},
  ): Promise<T[]> {
    const models = await this.model
      .find(params, null, { ...options, lean: true })
      .sort(sort)
      .exec();

    if (populates.length) {
      for (const path of populates) {
        for (const model of models) {
          await model.populate([path]);
        }
      }
    }

    return models;
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  async findOneOrFail(params: object): Promise<T> {
    const model: T = await this.findOne(params);

    if (model === null) {
      throw new ModelNotFoundException(
        `Model [${
          this.getModel().collection.name
        }] not found for query ${JSON.stringify(params)}`,
      );
    }

    return model;
  }

  async findOrFail(id: string): Promise<T> {
    try {
      return await this.findById(id);
    } catch (e) {
      if (e.name !== undefined && e.name === 'CastError') {
        throw new BadRequestException(e.message);
      }

      throw e;
    }
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  async paginate(
    query: object,
    options: PaginateOptions,
  ): Promise<PaginateResult<T>> {
    return this.model.paginate(query, {
      ...options,
      lean: true,
      leanWithId: false,
    });
  }

  async findAll(
    // eslint-disable-next-line @typescript-eslint/ban-types
    filter: {} = {},
    // eslint-disable-next-line @typescript-eslint/ban-types
    options: {} = {},
    limit = 0,
    sort: { [key: string]: any } = {},
  ): Promise<Array<T>> {
    const query = this.model
      .find(filter, null, { ...options, lean: true })
      .limit(limit)
      .sort(sort);
    return query.exec();
  }

  getModel(): PaginateModel<T> {
    return this.model;
  }

  getAggModel(): AggregatePaginateModel<T> {
    return this.aggModel;
  }
  // eslint-disable-next-line @typescript-eslint/ban-types
  async removeAll(filter: {} = {}) {
    return this.model.deleteMany(filter).exec();
  }

  async removeById(id: string) {
    return this.model.findByIdAndDelete(id).exec();
  }

  //   async updateById(id: any, doc: any, options?): Promise<T> {
  //     return this.updateOne({ [this.primaryKey]: id }, doc, options);
  //   }

  //   async updateOne(conditions: any, doc: any, options?): Promise<T> {
  //     return this.model
  //       .findOneAndUpdate(conditions, doc, { new: true, ...options })
  //       .exec();
  //   }

  async updateOne(
    entityFilterQuery: FilterQuery<T>,
    updateEntitydata: UpdateQuery<unknown>,
  ): Promise<T | null> {
    return this.model.findByIdAndUpdate(entityFilterQuery, updateEntitydata, {
      new: true,
    });
  }

  //   async updateMany(
  //     conditions: any,
  //     doc: any,
  //     options?: Record<string, any>,
  //   ): Promise<T> {
  //     return this.model
  //       .updateMany(conditions, doc, { new: true, ...options })
  //       .exec();
  //   }

  async insertMany(doc: any) {
    return this.model.insertMany(doc);
  }

  async count(filter: any = {}) {
    return this.model.countDocuments(filter);
  }
}
