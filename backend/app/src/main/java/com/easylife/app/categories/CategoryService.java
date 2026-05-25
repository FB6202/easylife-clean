package com.easylife.app.categories;

import com.easylife.app.categories.payload.CategoryFilter;
import com.easylife.app.categories.payload.CategoryRequest;
import com.easylife.app.categories.payload.CategoryResponse;
import com.easylife.app.shared.enums.AccessType;
import com.easylife.app.shared.payload.PageResponse;

import java.util.List;

public interface CategoryService {

    CategoryResponse create(CategoryRequest request, Long userId);

    CategoryResponse findById(Long id, Long userId);

    PageResponse<CategoryResponse> findAll(Long userId, CategoryFilter filter, int page, int size);

    List<CategoryResponse> findAllByAccessType(Long userId, AccessType accessType);

    CategoryResponse update(Long id, CategoryRequest request, Long userId);

    void delete(Long id, Long userId);

}
