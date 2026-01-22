import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseStorageService {
  private readonly logger = new Logger(SupabaseStorageService.name);
  private readonly supabase: SupabaseClient;
  private readonly bucketName = 'knowledge-base';

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseServiceKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      this.logger.warn('Supabase credentials not configured. Storage features will be disabled.');
      this.supabase = null as any;
      return;
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
    this.ensureBucketExists();
  }

  private async ensureBucketExists(): Promise<void> {
    if (!this.supabase) return;

    try {
      const { data: buckets, error: listError } = await this.supabase.storage.listBuckets();
      
      if (listError) {
        this.logger.error(`Error listing buckets: ${listError.message}`);
        return;
      }

      const bucketExists = buckets?.some(b => b.name === this.bucketName);
      
      if (!bucketExists) {
        const { error: createError } = await this.supabase.storage.createBucket(this.bucketName, {
          public: true,
        });

        if (createError) {
          this.logger.error(`Error creating bucket: ${createError.message}`);
        } else {
          this.logger.log(`Created bucket: ${this.bucketName}`);
        }
      }
    } catch (error) {
      this.logger.error(`Error ensuring bucket exists: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async uploadFile(fileName: string, fileContent: Buffer, contentType: string): Promise<string> {
    if (!this.supabase) {
      throw new Error('Supabase Storage is not configured');
    }

    const filePath = `${Date.now()}-${fileName}`;

    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .upload(filePath, fileContent, {
        contentType,
        upsert: false,
      });

    if (error) {
      this.logger.error(`Error uploading file: ${error.message}`);
      throw new Error(`Failed to upload file to Supabase Storage: ${error.message}`);
    }

    return filePath;
  }

  getStorageUrl(filePath: string): string {
    if (!this.supabase) {
      throw new Error('Supabase Storage is not configured');
    }

    const { data } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async downloadFile(filePath: string): Promise<string> {
    if (!this.supabase) {
      throw new Error('Supabase Storage is not configured');
    }

    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .download(filePath);

    if (error) {
      this.logger.error(`Error downloading file: ${error.message}`);
      throw new Error(`Failed to download file from Supabase Storage: ${error.message}`);
    }

    return await data.text();
  }

  async deleteFile(filePath: string): Promise<void> {
    if (!this.supabase) {
      throw new Error('Supabase Storage is not configured');
    }

    const { error } = await this.supabase.storage
      .from(this.bucketName)
      .remove([filePath]);

    if (error) {
      this.logger.error(`Error deleting file: ${error.message}`);
      throw new Error(`Failed to delete file from Supabase Storage: ${error.message}`);
    }
  }
}
