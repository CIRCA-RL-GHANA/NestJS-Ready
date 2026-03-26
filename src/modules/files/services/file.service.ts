import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { AINlpService } from '../../ai/services/ai-nlp.service';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

export interface FileUploadResponse {
  fileId: string;
  key: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: Date;
}

@Injectable()
export class FileService {
  private s3: S3Client;
  private bucket = process.env.AWS_S3_BUCKET || 'orionstack-files';
  private readonly logger = new Logger(FileService.name);

  constructor(private readonly aiNlp: AINlpService) {
    this.s3 = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
      },
    });
  }

  /**
   * Upload file to S3
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string,
    userId: string,
  ): Promise<FileUploadResponse> {
    this.validateFile(file, folder);

    const fileKey = `${folder}/${userId}/${Date.now()}-${uuidv4()}`;

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          'original-filename': file.originalname,
          'uploaded-by': userId,
        },
        ACL: 'private',
      });

      await this.s3.send(command);

      const url = await this.getSignedUrl(fileKey);

      this.logger.log(`File uploaded: ${fileKey}`);

      return {
        fileId: uuidv4(),
        key: fileKey,
        url,
        size: file.size,
        type: file.mimetype,
        uploadedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Upload failed: ${error.message}`);
      throw new BadRequestException(`Upload failed: ${error.message}`);
    }
  }

  /**
   * Get pre-signed URL for public access
   */
  async getSignedUrl(fileKey: string, expiresIn = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: fileKey,
      });

      return await getSignedUrl(this.s3, command, { expiresIn });
    } catch (error) {
      this.logger.error(`Failed to generate signed URL: ${error.message}`);
      throw new BadRequestException('Failed to generate download URL');
    }
  }

  /**
   * Delete file from S3
   */
  async deleteFile(fileKey: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: fileKey,
      });

      await this.s3.send(command);
      this.logger.log(`File deleted: ${fileKey}`);
    } catch (error) {
      this.logger.error(`Delete failed: ${error.message}`);
      throw new BadRequestException(`Delete failed: ${error.message}`);
    }
  }

  /**
   * Validate file type and size
   */
  private validateFile(file: Express.Multer.File, folder: string): void {
    const allowedTypes: Record<string, string[]> = {
      avatars: ['image/jpeg', 'image/png', 'image/webp'],
      documents: ['application/pdf', 'application/msword'],
      receipts: ['image/jpeg', 'image/png'],
      attachments: ['image/jpeg', 'image/png', 'video/mp4', 'application/pdf'],
    };

    const maxSizes: Record<string, number> = {
      avatars: 5 * 1024 * 1024,
      documents: 20 * 1024 * 1024,
      receipts: 10 * 1024 * 1024,
      attachments: 50 * 1024 * 1024,
    };

    const allowed = allowedTypes[folder] || [];
    if (!this.isAllowedType(file.mimetype, allowed)) {
      throw new BadRequestException(
        `File type ${file.mimetype} not allowed for ${folder}`,
      );
    }

    const maxSize = maxSizes[folder] || 50 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException(
        `File size exceeds ${maxSize / 1024 / 1024}MB limit`,
      );
    }
  }

  private isAllowedType(mimeType: string, allowed: string[]): boolean {
    return allowed.some((type) => {
      if (type.endsWith('/*')) {
        return mimeType.startsWith(type.slice(0, -2));
      }
      return mimeType === type;
    });
  }

  /**
   * AI: Classify a filename using NLP to suggest the best storage folder.
   * Returns folder name: 'documents', 'receipts', 'avatars', or 'attachments'.
   */
  async classifyFileAI(filename: string): Promise<{ folder: string; keywords: string[] }> {
    try {
      const kw = await this.aiNlp.extractKeywords(filename);
      const lower = filename.toLowerCase();
      let folder = 'attachments';
      if (/avatar|profile|photo|picture/.test(lower)) folder = 'avatars';
      else if (/receipt|invoice|payment|bill/.test(lower)) folder = 'receipts';
      else if (/doc|contract|agreement|report|pdf/.test(lower)) folder = 'documents';
      return { folder, keywords: kw.keywords };
    } catch {
      return { folder: 'attachments', keywords: [] };
    }
  }
}
