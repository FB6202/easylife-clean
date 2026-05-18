package com.easylife.app.journal;

import com.easylife.app.shared.enums.MoodLevel;
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
@Table(name = "journal_entries")
class JournalEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String title;

    private String wentWell;
    private String wentBad;
    private String learnings;
    private String gratitude;

    @Column(nullable = false)
    private LocalDate entryDate;
    @Column(nullable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Column(nullable = false)
    private Long userId;
    @ElementCollection
    @CollectionTable(name = "journal_categories",
            joinColumns = @JoinColumn(name = "journal_entry_id"))
    @Column(name = "category_id")
    private List<Long> categoryIds;
    @Enumerated(EnumType.STRING)
    private MoodLevel mood;
    @Column(name = "week_plan_id")
    private Long weekPlanId;

}
