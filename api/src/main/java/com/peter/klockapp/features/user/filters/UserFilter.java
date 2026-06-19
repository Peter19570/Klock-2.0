package com.peter.klockapp.features.user.filters;

import com.peter.klockapp.features.user.enums.UserRole;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Builder
public class UserFilter {

    private String email;
    private String name;
    private UserRole userRole;
    private UUID branchId;
    private UUID orgId;
    private String phone;
    private Instant minCreatedAt;
    private Instant maxCreatedAt;
}
