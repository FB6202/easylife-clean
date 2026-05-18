package com.easylife.app.users;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "users")
class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true)
    private String username;
    @Column(nullable = false, unique = true)
    private String email;
    @Column(nullable = false, unique = true)
    private String keycloakId;
    @Column(nullable = false)
    private Boolean locked;
    @Column(nullable = false)
    private Boolean emailVerified;
    private LocalDateTime createdAt;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "profile_id")
    private Profile profile;
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "settings_id")
    private Settings settings;

}
