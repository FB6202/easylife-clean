package com.easylife.app.categories.api;

import java.util.List;

public interface CategoryApi {

    boolean existsByIdAndUserId(Long categoryId, Long userId);

    List<Long> findAllIdsByUserId(Long userId);

    long countPublicByUserId(Long userId);

}
