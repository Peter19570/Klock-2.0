package com.peter.klockapp.features.session.mapper;

import com.peter.klockapp.features.clockevent.mapper.ClockEventMapper;
import com.peter.klockapp.features.session.dto.response.SessionResponse;
import com.peter.klockapp.features.session.model.Session;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(
        componentModel = "spring",
        uses = { ClockEventMapper.class },
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface SessionMapper {

    @Mapping(
            target = "sessionUser",
            expression = "java(session.getUser().getFirstName() + \" \" + session.getUser().getLastName())"
    )
    SessionResponse toDto(Session session);

    List<SessionResponse> toListDto(List<Session> sessions);
}
