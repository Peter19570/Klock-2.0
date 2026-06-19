package com.peter.klockapp.features.clockevent.mapper;

import com.peter.klockapp.features.clockevent.dto.request.ClockInRequest;
import com.peter.klockapp.features.clockevent.dto.response.ClockEventResponse;
import com.peter.klockapp.features.clockevent.model.ClockEvent;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ClockEventMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    ClockEvent toEntity(ClockInRequest request);

    @Mapping(target = "branchName", source = "branch.displayName")
    ClockEventResponse toDto(ClockEvent clockEvent);

}
