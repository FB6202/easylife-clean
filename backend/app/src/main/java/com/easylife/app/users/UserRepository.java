package com.easylife.app.users;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    Optional<User> findByKeycloakId(String keycloakId);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    @Query("""
            SELECT u FROM User u JOIN u.profile p
            WHERE u.id <> :excludeId
            AND (
                LOWER(u.username)    LIKE LOWER(CONCAT('%', :query, '%')) OR
                LOWER(p.firstname)   LIKE LOWER(CONCAT('%', :query, '%')) OR
                LOWER(p.lastname)    LIKE LOWER(CONCAT('%', :query, '%'))
            )
            """)
    List<User> searchByQuery(@Param("query") String query, @Param("excludeId") Long excludeId);

}
