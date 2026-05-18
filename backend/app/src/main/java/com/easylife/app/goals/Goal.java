package com.easylife.app.goals;

import com.easylife.app.shared.enums.AccessType;
import com.easylife.app.shared.enums.GoalStatus;
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
@Table(name = "goals")
class Goal {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String title;
    private String description;
    @Column(nullable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String imagePath;
    private Long weekPlanId;

    // smart fields
    private String measurableTarget;      // "10km running", "5kg less weight"
    private Integer targetValue;          // z.B. 100 (pages, km, €...)
    private String targetUnit;            // "km", "kg", "€", "%"
    private Integer currentProgress;      // user or agent
    private LocalDate deadline;           // time-bound

    @Enumerated(EnumType.STRING)
    private GoalStatus status;
    @Enumerated(EnumType.STRING)
    private AccessType accessType;

    @ElementCollection
    @CollectionTable(name = "goal_categories",
            joinColumns = @JoinColumn(name = "goal_id"))
    @Column(name = "category_id")
    private List<Long> categoryIds;
    @Column(nullable = false)
    private Long userId;
    @OneToMany(cascade = CascadeType.ALL, mappedBy = "goal")
    private List<GoalTask> tasks;

}
