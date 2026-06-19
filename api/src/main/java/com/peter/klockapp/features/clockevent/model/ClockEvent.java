package com.peter.klockapp.features.clockevent.model;

import com.peter.klockapp.features.branch.model.Branch;
import com.peter.klockapp.features.clockevent.enums.ClockOutType;
import com.peter.klockapp.features.organization.model.Organization;
import com.peter.klockapp.features.session.model.Session;
import com.peter.klockapp.features.shared.model.BaseEntity;
import com.peter.klockapp.features.user.model.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "clock_events")
public class ClockEvent extends BaseEntity {

    @Column(nullable = false)
    private Instant clockInTime;

    private Instant clockOutTime;
    private Double latitude;
    private Double longitude;
    private Boolean isDelaySync = false;
    private Double clockInOutDistance;
    private Double clockInDistanceFromBranch;
    private Boolean departedEarly;

    @Enumerated(EnumType.STRING)
    private ClockOutType clockOutType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    private Branch branch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id")
    private Session session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id")
    private Organization organization;
}
