package com.easylife.app.storage;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "aws.s3")
public record S3Properties(
        String bucketName,
        String region,
        String accessKey,       // nur dev
        String secretKey,       // nur dev
        long uploadUrlExpirationMinutes,
        long downloadUrlExpirationMinutes
) {}
