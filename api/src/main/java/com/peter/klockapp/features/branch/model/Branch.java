package com.peter.klockapp.features.branch.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.peter.klockapp.features.branch.enums.BranchStatus;
import com.peter.klockapp.features.clockevent.model.ClockEvent;
import com.peter.klockapp.features.organization.model.Organization;
import com.peter.klockapp.features.session.model.Session;
import com.peter.klockapp.features.shared.model.BaseEntity;
import com.peter.klockapp.features.user.model.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "branches")
public class Branch extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String displayName;

    @Column(nullable = false)
    private String slug;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(nullable = false)
    private String geofenceName;

    @Column(nullable = false)
    private Double radius;

    @Column(nullable = false)
    private LocalTime shiftStart;

    @Column(nullable = false)
    private LocalTime shiftEnd;

    @Column(length = 100)
    private String support;

    @Column(nullable = false)
    private Long geofenceExitTimeoutMinutes = 1L;

    @Enumerated(EnumType.STRING)
    private BranchStatus branchStatus = BranchStatus.UNLOCKED;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id")
    private Organization organization;

    @OneToMany(mappedBy = "branch", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Session> sessions = new ArrayList<>();

    @OneToMany(mappedBy = "branch", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<User> users = new ArrayList<>();

    @OneToMany(mappedBy = "branch", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ClockEvent> clockEvents = new ArrayList<>();
}
