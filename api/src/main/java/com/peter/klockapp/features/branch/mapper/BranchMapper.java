package com.peter.klockapp.features.branch.mapper;

import com.peter.klockapp.features.branch.dto.request.BranchRequest;
import com.peter.klockapp.features.branch.dto.response.BranchDetailedResponse;
import com.peter.klockapp.features.branch.dto.response.BranchResponse;
import com.peter.klockapp.features.branch.dto.response.BranchUserResponse;
import com.peter.klockapp.features.branch.model.Branch;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface BranchMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "slug", expression = "java(request.displayName().toLowerCase().replace(\" \", \"-\"))")
    Branch toEntity(BranchRequest request);

    BranchResponse toDto(Branch branch);

    @Mapping(target = "organizationId", source = "branch.organization.id")
    @Mapping(target = "totalEmployees", source = "employees")
    @Mapping(target = "totalAdmins", source = "admins")
    @Mapping(target = "currentActiveCount", source = "activeNow")
    @Mapping(target = "avgDistance", source = "avgDistance")
    @Mapping(target = "displayAvg", source = "displayAvg")
    @Mapping(target = "status", source = "status")
    BranchDetailedResponse toDetailedDto(
            Branch branch,
            long activeNow,
            long employees,
            long admins,
            Double avgDistance,
            double displayAvg,
            String status
    );

    BranchUserResponse toDetailedUserDto(Branch branch);

    @Mapping(target = "slug", expression = "java(request.displayName().toLowerCase().replace(\" \", \"-\"))")
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromRequest(BranchRequest request, @MappingTarget Branch branch);
}
