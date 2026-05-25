package com.easylife.app.categories.api;

import com.easylife.app.categories.payload.CategoryPreview;

import java.util.List;

public interface CategoryApi {

    boolean existsByIdAndUserId(Long categoryId, Long userId);

    List<Long> findAllIdsByUserId(Long userId);

    long countPublicByUserId(Long userId);

    List<CategoryPreview> findPreviewsByIds(List<Long> ids);

}
