package com.easylife.app.todos;

import com.easylife.app.shared.enums.AccessType;
import com.easylife.app.shared.enums.Priority;
import com.easylife.app.shared.enums.TodoStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "todos")
class Todo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String title;
    private String description;
    private LocalDate dueDate;
    @Column(nullable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long weekPlanId;

    @Enumerated(EnumType.STRING)
    private Priority priority;
    @Enumerated(EnumType.STRING)
    private TodoStatus status;
    @Enumerated(EnumType.STRING)
    private AccessType accessType;

    @Column(nullable = false)
    private Long userId;
    @ElementCollection
    @CollectionTable(name = "todo_categories",
            joinColumns = @JoinColumn(name = "todo_id"))
    @Column(name = "category_id")
    private List<Long> categoryIds;

}
