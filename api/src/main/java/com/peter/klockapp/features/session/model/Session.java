package com.peter.klockapp.features.session.model;

import com.peter.klockapp.features.branch.model.Branch;
import com.peter.klockapp.features.clockevent.model.ClockEvent;
import com.peter.klockapp.features.organization.model.Organization;
import com.peter.klockapp.features.session.enums.SessionArrivalStatus;
import com.peter.klockapp.features.session.enums.SessionStatus;
import com.peter.klockapp.features.shared.model.BaseEntity;
import com.peter.klockapp.features.user.model.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.BatchSize;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "sessions")
public class Session extends BaseEntity {

    @Column(nullable = false)
    private LocalDate workDate = LocalDate.now();

    @Enumerated(EnumType.STRING)
    private SessionArrivalStatus arrivalStatus = SessionArrivalStatus.ON_TIME;

    @Enumerated(EnumType.STRING)
    private SessionStatus status = SessionStatus.ACTIVE;

    private Double totalDistanceCovered = 0.0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id")
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    private Branch branch;

    @BatchSize(size = 100)
    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ClockEvent> clockEvents = new ArrayList<>();

}
