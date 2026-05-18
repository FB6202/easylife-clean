package com.easylife.app.documents;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

interface DocumentRepository extends JpaRepository<Document, Long>, JpaSpecificationExecutor<Document> {

    Optional<Document> findByIdAndUserId(Long id, Long userId);

}
