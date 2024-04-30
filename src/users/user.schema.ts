import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '../database/abstract.schema';

@Schema({ versionKey: false, toJSON: { virtuals: true } })
export class User extends AbstractDocument {
  @Prop({ required: true, unique: true })
  wallet: string;

  @Prop({ required: false })
  referrer?: string;

  @Prop({ required: true })
  timestamp?: string;

  @Prop({ required: true })
  signature?: string;

  @Prop({ required: false, default: false })
  isClaimed?: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
