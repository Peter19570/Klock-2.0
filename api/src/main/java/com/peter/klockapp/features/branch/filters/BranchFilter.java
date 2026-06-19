package com.peter.klockapp.features.branch.filters;

import com.peter.klockapp.features.branch.enums.BranchStatus;
import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class BranchFilter {

    private String displayName;
    private BranchStatus branchStatus;
    private UUID userOrgId;
}
