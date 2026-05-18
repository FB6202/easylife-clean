package com.easylife.app.categories;

import com.easylife.app.categories.payload.CategoryRequest;
import com.easylife.app.categories.payload.CategoryResponse;
import com.easylife.app.shared.enums.AccessType;

import java.util.List;

public interface CategoryService {

    CategoryResponse create(CategoryRequest request, Long userId);

    CategoryResponse findById(Long id, Long userId);

    List<CategoryResponse> findAll(Long userId);

    List<CategoryResponse> findAllByAccessType(Long userId, AccessType accessType);

    CategoryResponse update(Long id, CategoryRequest request, Long userId);

    void delete(Long id, Long userId);

}
