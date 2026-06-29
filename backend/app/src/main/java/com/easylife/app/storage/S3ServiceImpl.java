package com.easylife.app.storage;

import com.easylife.app.storage.api.StorageApi;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
class S3ServiceImpl implements StorageApi {

    private final S3Presigner s3Presigner;
    private final S3Client s3Client;
    private final S3Properties s3Properties;

    @Override
    public String generateUploadUrl(String key, String contentType) {
        PutObjectPresignRequest request = PutObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(s3Properties.uploadUrlExpirationMinutes()))
                .putObjectRequest(r -> r
                        .bucket(s3Properties.bucketName())
                        .key(key)
                        .contentType(contentType))
                .build();
        return s3Presigner.presignPutObject(request).url().toString();
    }

    @Override
    public String generateDownloadUrl(String key) {
        if (key == null) return null;
        GetObjectPresignRequest request = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(s3Properties.downloadUrlExpirationMinutes()))
                .getObjectRequest(r -> r
                        .bucket(s3Properties.bucketName())
                        .key(key))
                .build();
        return s3Presigner.presignGetObject(request).url().toString();
    }

    @Override
    public void delete(String key) {
        if (key == null) return;
        s3Client.deleteObject(r -> r
                .bucket(s3Properties.bucketName())
                .key(key));
    }

    @Override
    public String buildKey(String username, String entityType, String fileName) {
        String uuid = UUID.randomUUID().toString().substring(0, 8);
        String sanitizedFileName = fileName.replaceAll(
                S3Constants.ALLOWED_FILENAME_CHARS,
                S3Constants.REPLACEMENT_CHAR
        );
        return username + "/" + entityType + "/" + uuid + "_" + sanitizedFileName;
    }

}
