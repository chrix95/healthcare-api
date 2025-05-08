import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SequenceService } from './sequence.service';
import { Counter, CounterSchema } from './counter.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Counter', schema: CounterSchema }]),
  ],
  providers: [SequenceService],
  exports: [SequenceService],
})
export class SequenceModule {}
