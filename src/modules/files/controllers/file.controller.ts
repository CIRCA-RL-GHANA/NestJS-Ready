import {
  Controller,
  Post,
  Delete,
  UseInterceptors,
  UploadedFile,
  Param,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FileService } from '../services/file.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../users/entities/user.entity';

@ApiTags('Files')
@Controller('files')
@UseGuards(JwtAuthGuard)
export class FileController {
  constructor(private fileService: FileService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  @ApiOperation({ summary: 'Upload a file' })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder: string,
    @CurrentUser() user: User,
  ) {
    return this.fileService.uploadFile(file, folder || 'attachments', user.id);
  }

  @Delete(':fileKey')
  @ApiOperation({ summary: 'Delete a file' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  async deleteFile(@Param('fileKey') fileKey: string, @CurrentUser() user: User) {
    // Verify file ownership before deleting
    const file = await this.fileService.getFileMetadata(fileKey);
    if (file.userId !== user.id) {
      throw new ForbiddenException('You do not have permission to delete this file');
    }
    await this.fileService.deleteFile(fileKey);
    return { success: true, message: 'File deleted successfully' };
  }
}
