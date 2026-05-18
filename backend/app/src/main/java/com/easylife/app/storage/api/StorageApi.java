package com.easylife.app.storage.api;

public interface StorageApi {

    String generateUploadUrl(String key, String contentType);

    String generateDownloadUrl(String key);

    void delete(String key);

    String buildKey(String username, String entityType, Long entityId, String fileName);

}
