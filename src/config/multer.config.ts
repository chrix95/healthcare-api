import { memoryStorage } from 'multer';
import { BadRequestException } from '@nestjs/common';

export const multerOptions = {
  storage: memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(csv)$/)) {
      return cb(new BadRequestException('Only CSV files allowed'), false);
    }
    cb(null, true);
  },
  limits: {
    fileSize: 1024 * 1024 * 10 // 10MB
  }
};