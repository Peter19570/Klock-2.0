package com.peter.klockapp.features.organization.service;

import com.peter.klockapp.features.auth.dto.response.AuthResponse;
import com.peter.klockapp.features.auth.exceptions.NotFoundException;
import com.peter.klockapp.features.auth.service.AuthService;
import com.peter.klockapp.features.organization.dto.request.OrganizationRequest;
import com.peter.klockapp.features.organization.dto.request.OrganizationUpdateRequest;
import com.peter.klockapp.features.organization.dto.response.OrganizationDetailedResponse;
import com.peter.klockapp.features.organization.dto.response.OrganizationResponse;
import com.peter.klockapp.features.organization.mapper.OrganizationMapper;
import com.peter.klockapp.features.organization.model.Organization;
import com.peter.klockapp.features.organization.repo.OrganizationRepo;
import com.peter.klockapp.features.shared.dto.CustomUserPrincipal;
import com.peter.klockapp.features.user.model.User;
import com.peter.klockapp.features.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class OrganizationService {

    private final OrganizationRepo organizationRepo;
    private final OrganizationMapper organizationMapper;
    private final AuthService authService;
    private final UserService userService;
    
    public OrganizationResponse createOrg(OrganizationRequest request){
        Organization organization = organizationRepo.save(organizationMapper.toEntity(request));
        AuthResponse authResponse = authService.register(request.registerRequest(), organization);
        return new OrganizationResponse(organizationMapper.toDto(organization), authResponse);
    }

    @Transactional(readOnly = true)
    public OrganizationDetailedResponse getDetailedOrg(CustomUserPrincipal principal){
        User currentUser = userService.fetchCurrentUser(principal);
        Organization organization = currentUser.getOrganization();
        return organizationMapper.toDetailedDto(organization);
    }

    public OrganizationDetailedResponse updateOrg(OrganizationUpdateRequest request, CustomUserPrincipal principal){
        User currentUser = userService.fetchCurrentUser(principal);
        Organization organization = currentUser.getOrganization();
        organizationMapper.updateEntityFromRequest(request, organization);
        return organizationMapper.toDetailedDto(organization);
    }

    public void deleteOrg(CustomUserPrincipal principal){
        organizationRepo.deleteById(principal.orgId());
    }
}
