package com.easylife.app.categories;

import com.easylife.app.categories.api.CategoryApi;
import com.easylife.app.categories.payload.CategoryFilter;
import com.easylife.app.categories.payload.CategoryPreview;
import com.easylife.app.categories.payload.CategoryRequest;
import com.easylife.app.categories.payload.CategoryResponse;
import com.easylife.app.shared.enums.AccessType;
import com.easylife.app.shared.payload.PageResponse;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
class CategoryServiceImpl implements CategoryService, CategoryApi {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Override
    public CategoryResponse create(CategoryRequest request, Long userId) {
        if (categoryRepository.existsByNameAndUserId(request.name(), userId)) {
            throw new IllegalArgumentException("Category with this name already exists");
        }
        Category category = categoryMapper.toEntity(request, userId);
        category.setCreatedAt(LocalDateTime.now());
        return categoryMapper.toResponse(categoryRepository.save(category));
    }

    @Override
    public CategoryResponse findById(Long id, Long userId) {
        return categoryRepository.findByIdAndUserId(id, userId)
                .map(categoryMapper::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Category not found"));
    }

    @Override
    public PageResponse<CategoryResponse> findAll(Long userId, CategoryFilter filter, int page, int size) {
        Specification<Category> spec = CategorySpecification.build(userId, filter);
        Page<Category> result = categoryRepository.findAll(spec, PageRequest.of(page, size));
        return new PageResponse<>(
                result.getContent().stream().map(categoryMapper::toResponse).toList(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages()
        );
    }

    @Override
    public List<CategoryResponse> findAllByAccessType(Long userId, AccessType accessType) {
        return categoryRepository.findAllByUserIdAndAccessType(userId, accessType)
                .stream()
                .map(categoryMapper::toResponse)
                .toList();
    }

    @Override
    public CategoryResponse update(Long id, CategoryRequest request, Long userId) {
        Category category = categoryRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException("Category not found"));
        categoryMapper.update(category, request);
        category.setUpdatedAt(LocalDateTime.now());
        return categoryMapper.toResponse(categoryRepository.save(category));
    }

    @Override
    public void delete(Long id, Long userId) {
        Category category = categoryRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException("Category not found"));
        categoryRepository.delete(category);
    }

    @Override
    public boolean existsByIdAndUserId(Long categoryId, Long userId) {
        return categoryRepository.existsByIdAndUserId(categoryId, userId);
    }

    @Override
    public List<Long> findAllIdsByUserId(Long userId) {
        return categoryRepository.findAllByUserId(userId)
                .stream()
                .map(Category::getId)
                .toList();
    }

    @Override
    public long countPublicByUserId(Long userId) {
        return categoryRepository.countByUserIdAndAccessType(userId, AccessType.PUBLIC);
    }

    @Override
    public List<CategoryPreview> findPreviewsByIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) return List.of();
        return categoryRepository.findAllById(ids)
                .stream()
                .map(c -> new CategoryPreview(c.getId(), c.getName(), c.getIcon(), c.getColor()))
                .toList();
    }

}
