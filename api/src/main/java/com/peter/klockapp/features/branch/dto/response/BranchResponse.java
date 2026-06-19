package com.peter.klockapp.features.branch.dto.response;

import com.peter.klockapp.features.branch.enums.BranchStatus;

import java.util.UUID;

public record BranchResponse(
        UUID id,
        String displayName,
        String slug,
        double latitude,
        double longitude,
        BranchStatus branchStatus,
        int currentActiveCount
) {
}
