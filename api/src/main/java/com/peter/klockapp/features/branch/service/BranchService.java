package com.peter.klockapp.features.branch.service;

import com.peter.klockapp.features.audit.dto.AuditRequest;
import com.peter.klockapp.features.audit.enums.AuditAction;
import com.peter.klockapp.features.auth.exceptions.NotFoundException;
import com.peter.klockapp.features.branch.dto.request.BranchRequest;
import com.peter.klockapp.features.branch.dto.response.BranchDetailedResponse;
import com.peter.klockapp.features.branch.dto.response.BranchResponse;
import com.peter.klockapp.features.branch.dto.response.BranchUserResponse;
import com.peter.klockapp.features.branch.enums.BranchStatus;
import com.peter.klockapp.features.branch.filters.BranchFilter;
import com.peter.klockapp.features.branch.mapper.BranchMapper;
import com.peter.klockapp.features.branch.model.Branch;
import com.peter.klockapp.features.branch.repo.BranchRepo;
import com.peter.klockapp.features.branch.specification.BranchSpecification;
import com.peter.klockapp.features.clockevent.model.ClockEvent;
import com.peter.klockapp.features.clockevent.repo.ClockEventRepo;
import com.peter.klockapp.features.organization.model.Organization;
import com.peter.klockapp.features.organization.repo.OrganizationRepo;
import com.peter.klockapp.features.shared.util.LocationUtility;
import com.peter.klockapp.features.user.enums.UserRole;
import com.peter.klockapp.features.user.model.User;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.BadRequestException;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class BranchService {

    private final BranchRepo branchRepo;
    private final BranchMapper branchMapper;
    private final ClockEventRepo clockEventRepo;
    private final OrganizationRepo organizationRepo;
    private final BranchSpecification branchSpecification;
    private final ApplicationEventPublisher eventPublisher;
    private final SimpMessagingTemplate simpMessagingTemplate;

    public BranchResponse createBranch(User currentUser, BranchRequest request){
        Organization organization = organizationRepo.findById(currentUser.getOrganization().getId())
                .orElseThrow(() -> new NotFoundException("Organization not found"));

        Branch branch = branchMapper.toEntity(request);
        branch.setOrganization(organization);

        eventPublisher.publishEvent(new AuditRequest(currentUser, AuditAction.BRANCH_CREATED,
                Map.of("message", "New branch ("+ branch.getDisplayName() +") created successfully")));

        return branchMapper.toDto(branchRepo.save(branch));
    }

    @Transactional(readOnly = true)
    public BranchDetailedResponse getDetailedBranch(User currentUser, UUID branchId){
        UUID branchUUID;

        if (currentUser.getUserRole().equals(UserRole.SUPER_ADMIN)) {
            branchUUID = branchId;
        } else {
            branchUUID = currentUser.getBranch().getId();
        }

        Branch branch = branchRepo
                .findByOrganizationIdAndId(currentUser.getOrganization().getId(), branchUUID)
                .orElseThrow(() -> new NotFoundException("Branch not found"));

        long activeNow = branchRepo.countActiveUsersByBranchId(
                branch.getId(), currentUser.getOrganization().getId());

        long employees = branchRepo.countUsersByBranchIdAndRole(branch.getId(),
                branch.getOrganization().getId(), UserRole.USER);

        long admins = branchRepo.countUsersByBranchIdAndRole(branch.getId(),
                branch.getOrganization().getId(), UserRole.ADMIN);

        Double avgDistance = clockEventRepo
                .getAverageClockInDistanceForBranch(
                        branch.getId(), currentUser.getOrganization().getId());

        double displayAvg = (avgDistance != null) ? avgDistance : 0.0;
        String status = (displayAvg <= branch.getRadius()) ? "STABLE" : "DRIFTING";

        return branchMapper.toDetailedDto(
                branch, activeNow, employees, admins,
                avgDistance, displayAvg, status
        );
    }

    public BranchUserResponse getDetailedBranchForUser(User user){
        ClockEvent clockEvent = clockEventRepo.findBySessionUserIdAndUserOrganizationIdAndClockOutTimeIsNull(
                user.getId(), user.getOrganization().getId())
                .orElseThrow(() -> new NotFoundException("Branch details are only available after clock-in."));

        Branch branch = branchRepo.findByOrganizationIdAndId(
                user.getOrganization().getId(), clockEvent.getBranch().getId())
                .orElseThrow(() -> new NotFoundException("Branch not found"));

        return branchMapper.toDetailedUserDto(branch);
    }

    @Transactional(readOnly = true)
    public Page<BranchResponse> getBranches(Pageable pageable, BranchFilter branchFilter){
        Page<Branch> branchPage = branchRepo
                .findAll(branchSpecification.withFilter(branchFilter), pageable);
        return branchPage.map(branchMapper::toDto);
    }

    public BranchResponse updateBranch(User currentUser, UUID branchId, BranchRequest request){

        Branch branch = branchRepo
                .findByOrganizationIdAndId(currentUser.getOrganization().getId(), branchId)
                .orElseThrow(() -> new NotFoundException("Branch not found"));

        boolean isSuper = currentUser.getUserRole().equals(UserRole.SUPER_ADMIN);

        if (branch.getBranchStatus() == BranchStatus.LOCKED && !isSuper) {
            throw new AuthorizationDeniedException("This branch configuration is locked by Super Admin");
        }

        branchMapper.updateEntityFromRequest(request, branch);

        eventPublisher.publishEvent(new AuditRequest(currentUser, AuditAction.BRANCH_INFO_UPDATED,
                Map.of("message", "Branch ("+ branch.getDisplayName() +") information updated")));

        String destination = String.format("/topic/branches/%s/updates", branchId);
        BranchUserResponse event = branchMapper.toDetailedUserDto(branch);
        simpMessagingTemplate.convertAndSend(destination, event);

        return branchMapper.toDto(branch);
    }

    public void deleteBranch(User currentUser, UUID branchId){
        Branch branch = branchRepo.findByOrganizationIdAndId(currentUser.getOrganization().getId(), branchId)
                .orElseThrow(() -> new NotFoundException("Branch not found"));

        eventPublisher.publishEvent(new AuditRequest(currentUser, AuditAction.BRANCH_DELETED,
                Map.of("message", "Branch (" + branch.getDisplayName() + ") deleted successfully")));

        branchRepo.deleteById(branch.getId());
    }

    public Branch getTargetBranch(double latitude, double longitude, User currentUser) throws BadRequestException {
        return branchRepo.findAllByOrganizationId(currentUser.getOrganization().getId()).stream()
                .filter(branch -> LocationUtility.isWithinRadius(
                        latitude, longitude,
                        branch.getLatitude(), branch.getLongitude(),
                        branch.getRadius()))
                .findFirst()
                .orElseThrow(() -> new BadRequestException(
                        "You are not within the perimeter of any registered branch."));
    }

}
