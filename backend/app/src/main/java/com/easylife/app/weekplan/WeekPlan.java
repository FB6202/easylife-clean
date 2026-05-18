package com.easylife.app.weekplan;

import com.easylife.app.shared.enums.WeekPlanStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "week_plans")
class WeekPlan {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;
    private String intention;
    private String reflection;

    @Column(nullable = false)
    private LocalDate startDate;
    @Column(nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Column(nullable = false)
    private Long userId;
    @ElementCollection
    @CollectionTable(name = "week_plan_categories",
            joinColumns = @JoinColumn(name = "week_plan_id"))
    @Column(name = "category_id")
    private List<Long> categoryIds;
    @Enumerated(EnumType.STRING)
    private WeekPlanStatus status;
    @OneToMany(mappedBy = "weekPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WeekPlanItem> items = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

}
