package com.peter.klockapp.features.user.model;

import com.peter.klockapp.features.auth.model.EmailVerificationToken;
import com.peter.klockapp.features.auth.model.PasswordResetToken;
import com.peter.klockapp.features.auth.model.RefreshToken;
import com.peter.klockapp.features.branch.model.Branch;
import com.peter.klockapp.features.clockevent.model.ClockEvent;
import com.peter.klockapp.features.organization.model.Organization;
import com.peter.klockapp.features.session.model.Session;
import com.peter.klockapp.features.shared.model.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.peter.klockapp.features.user.enums.UserRole;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "users")
public class User extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String email;

    private String password;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    private String picture;
    private String pictureId;
    private Instant lockedUntil;
    private String provider;
    private String deviceId = "NOT SET";

    @Column(nullable = false)
    private boolean hasSetDevice = false;

    @Column(length = 15)
    private String phone;

    @Column(nullable = false)
    private boolean mustChangePassword = true;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private UserRole userRole = UserRole.USER;

    @Column(nullable = false)
    private boolean emailVerified = false;

    @Column(nullable = false)
    private boolean isLocked = false;

    @Column(nullable = false)
    private int failedLoginAttempts = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    private Branch branch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id")
    private Organization organization;

    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RefreshToken> refreshTokens = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EmailVerificationToken> emailVerificationTokens = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PasswordResetToken> passwordResetTokens = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Session> sessions = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ClockEvent> clockEvents = new ArrayList<>();

}
