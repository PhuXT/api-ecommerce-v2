import mongoose from 'mongoose';
import { USER_ROLE_ENUM, USER_STATUS_ENUM } from './enum/users.enum';
import * as mongoosePaginate from 'mongoose-paginate-v2';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');

const Schema = mongoose.Schema;
const UsersModelName = 'Users';

const UsersSchema = new Schema(
  {
    userName: { type: String, required: true },
    email: { type: String, unique: true },
    password: { type: String, require: true },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    role: { type: String, enum: USER_ROLE_ENUM, default: USER_ROLE_ENUM.USER },
    status: {
      type: String,
      enum: USER_STATUS_ENUM,
      default: USER_STATUS_ENUM.INACTIVE,
    },
  },
  { timestamps: true },
);

UsersSchema.plugin(mongoosePaginate);
UsersSchema.plugin(mongooseAggregatePaginate);

export { UsersSchema, UsersModelName };
