package com.peter.klockapp.features.user.mapper;

import com.peter.klockapp.features.user.dto.request.AdminCreateUserRequest;
import com.peter.klockapp.features.user.dto.request.UserUpdateRequest;
import com.peter.klockapp.features.user.dto.response.UserDetailedResponse;
import com.peter.klockapp.features.user.dto.response.UserResponse;
import com.peter.klockapp.features.user.model.User;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "email", expression = "java(payload.getEmail())")
    @Mapping(target = "firstName", expression = "java(payload.get(\"given_name\").toString())")
    @Mapping(target = "lastName", expression = "java(payload.get(\"family_name\").toString())")
    @Mapping(target = "picture", expression = "java(payload.get(\"picture\").toString())")
    @Mapping(target = "provider", expression = "java(\"GOOGLE\")")
    User toEntityFromGoogle(GoogleIdToken.Payload payload);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "provider", constant = "LOCAL")
    User toEntity(AdminCreateUserRequest request);

    @Mapping(target = "assignedBranch", source = "user.branch.displayName")
    UserResponse toDto(User user);

    @Mapping(target = "assignedBranch", source = "user.branch.displayName")
    @Mapping(target = "joinedOrganization", source = "user.organization.displayName")
    UserDetailedResponse toDetailedDto(User user);

    @Mapping(target = "branch", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromRequest(UserUpdateRequest request, @MappingTarget User user);
}
