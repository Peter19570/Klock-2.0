package com.peter.klockapp.features.auth.mapper;

import com.peter.klockapp.features.auth.dto.request.RegisterRequest;
import com.peter.klockapp.features.user.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AuthMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "provider", constant = "LOCAL")
    @Mapping(target = "firstName", source = "request.userCreateRequest.firstName")
    @Mapping(target = "lastName", source = "request.userCreateRequest.lastName")
    @Mapping(target = "deviceId", source = "request.userCreateRequest.deviceId")
    @Mapping(target = "phone", source = "request.userCreateRequest.phone")
    User toEntityFromAuth(RegisterRequest request);
}
