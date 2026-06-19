package com.peter.klockapp.features.organization.mapper;

import com.peter.klockapp.features.organization.dto.request.OrganizationRequest;
import com.peter.klockapp.features.organization.dto.request.OrganizationUpdateRequest;
import com.peter.klockapp.features.organization.dto.response.OrganizationDetailedResponse;
import com.peter.klockapp.features.organization.dto.response.OrganizationResponse;
import com.peter.klockapp.features.organization.model.Organization;
import com.peter.klockapp.features.shared.util.SnowflakeIdHelper;
import org.mapstruct.*;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        imports = {SnowflakeIdHelper.class}
)
public interface OrganizationMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    Organization toEntity(OrganizationRequest request);

    OrganizationResponse.OrganizationInfo toDto(Organization organization);

    OrganizationDetailedResponse toDetailedDto(Organization organization);

    // Mind u, u ain't suppose to send the display name if you're not updating it.
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromRequest(OrganizationUpdateRequest request, @MappingTarget Organization organization);
}
