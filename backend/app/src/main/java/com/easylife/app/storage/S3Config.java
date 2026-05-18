package com.easylife.app.storage;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

@Configuration
@EnableConfigurationProperties(S3Properties.class)
class S3Config {

    private final S3Properties s3Properties;

    S3Config(S3Properties s3Properties) {
        this.s3Properties = s3Properties;
    }

    @Bean
    @Profile("staging | prod")
    S3Client s3ClientIam() {
        return S3Client.builder()
                .region(Region.of(s3Properties.region()))
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();
    }

    @Bean
    @Profile("staging | prod")
    S3Presigner s3PresignerIam() {
        return S3Presigner.builder()
                .region(Region.of(s3Properties.region()))
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();
    }

    @Bean
    @Profile("dev")
    S3Client s3ClientDev() {
        return S3Client.builder()
                .region(Region.of(s3Properties.region()))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(
                                s3Properties.accessKey(),
                                s3Properties.secretKey()
                        )
                ))
                .build();
    }

    @Bean
    @Profile("dev")
    S3Presigner s3PresignerDev() {
        return S3Presigner.builder()
                .region(Region.of(s3Properties.region()))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(
                                s3Properties.accessKey(),
                                s3Properties.secretKey()
                        )
                ))
                .build();
    }
}
