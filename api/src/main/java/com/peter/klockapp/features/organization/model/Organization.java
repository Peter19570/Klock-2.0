package com.peter.klockapp.features.organization.model;

import com.peter.klockapp.features.branch.model.Branch;
import com.peter.klockapp.features.clockevent.model.ClockEvent;
import com.peter.klockapp.features.session.model.Session;
import com.peter.klockapp.features.shared.model.BaseEntity;
import com.peter.klockapp.features.user.model.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "organizations")
public class Organization extends BaseEntity {

    @Column(length = 120, nullable = false)
    private String displayName;

    @Column(length = 300)
    private String description;

    @OneToMany(mappedBy = "organization", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<User> users = new ArrayList<>();

    @OneToMany(mappedBy = "organization", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Branch> branches = new ArrayList<>();

    @OneToMany(mappedBy = "organization", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Session> sessions = new ArrayList<>();

    @OneToMany(mappedBy = "organization", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ClockEvent> clockEvents = new ArrayList<>();
}
