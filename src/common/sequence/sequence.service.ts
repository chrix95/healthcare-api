import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class SequenceService {
  constructor(@InjectModel('Counter') private counterModel: Model<any>) {}

  async getNextSequence(name: string): Promise<number> {
    const result = await this.counterModel
      .findOneAndUpdate(
        { _id: name },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true },
      )
      .exec();
    return result.sequence_value;
  }

  async updateSequence(name: string, value: number): Promise<void> {
    await this.counterModel
      .updateOne(
        { _id: name as any },
        { $set: { sequence_value: value } },
        { upsert: true }
      );
  }
}
