package com.easylife.app.categories;

import com.easylife.app.categories.payload.CategoryRequest;
import com.easylife.app.categories.payload.CategoryResponse;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
class CategoryMapper {

    public CategoryResponse toResponse(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getDescription(),
                category.getColor(),
                category.getIcon(),
                category.getAccessType(),
                category.getCreatedAt()
        );
    }

    public Category toEntity(CategoryRequest request, Long userId) {
        return Category.builder()
                .name(request.name())
                .description(request.description())
                .color(request.color())
                .icon(request.icon())
                .accessType(request.accessType())
                .createdAt(LocalDateTime.now())
                .userId(userId)
                .build();
    }

    public void update(Category category, CategoryRequest request) {
        category.setName(request.name());
        category.setDescription(request.description());
        category.setColor(request.color());
        category.setIcon(request.icon());
        category.setAccessType(request.accessType());
    }

}
