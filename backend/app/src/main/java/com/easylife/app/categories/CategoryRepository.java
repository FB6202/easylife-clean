package com.easylife.app.categories;

import com.easylife.app.shared.enums.AccessType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

interface CategoryRepository extends JpaRepository<Category, Long>, JpaSpecificationExecutor<Category> {

    List<Category> findAllByUserId(Long userId);

    List<Category> findAllByUserIdAndAccessType(Long userId, AccessType accessType);

    Optional<Category> findByIdAndUserId(Long id, Long userId);

    boolean existsByNameAndUserId(String name, Long userId);

    boolean existsByIdAndUserId(Long id, Long userId);

    long countByUserIdAndAccessType(Long userId, AccessType accessType);

}
