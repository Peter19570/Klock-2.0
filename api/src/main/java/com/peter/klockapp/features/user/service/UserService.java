package com.peter.klockapp.features.user.service;

import com.peter.klockapp.features.audit.dto.AuditRequest;
import com.peter.klockapp.features.audit.enums.AuditAction;
import com.peter.klockapp.features.auth.dto.request.AccountDeletionRequest;
import com.peter.klockapp.features.auth.exceptions.AlreadyExistException;
import com.peter.klockapp.features.auth.exceptions.NotFoundException;
import com.peter.klockapp.features.auth.exceptions.ValidationException;
import com.peter.klockapp.features.auth.repo.EmailVerificationTokenRepo;
import com.peter.klockapp.features.auth.repo.PasswordResetTokenRepo;
import com.peter.klockapp.features.auth.repo.RefreshTokenRepo;
import com.peter.klockapp.features.auth.service.notification.EmailService;
import com.peter.klockapp.features.auth.service.notification.OtpService;
import com.peter.klockapp.features.branch.model.Branch;
import com.peter.klockapp.features.branch.repo.BranchRepo;
import com.peter.klockapp.features.branch.service.BranchService;
import com.peter.klockapp.features.organization.model.Organization;
import com.peter.klockapp.features.organization.service.OrganizationService;
import com.peter.klockapp.features.shared.dto.CustomUserPrincipal;
import com.peter.klockapp.features.shared.dto.PageResponse;
import com.peter.klockapp.features.storage.service.CloudinaryService;
import com.peter.klockapp.features.user.dto.request.*;
import com.peter.klockapp.features.user.dto.response.UserDetailedResponse;
import com.peter.klockapp.features.user.dto.response.UserResponse;
import com.peter.klockapp.features.user.enums.UserRole;
import com.peter.klockapp.features.user.filters.UserFilter;
import com.peter.klockapp.features.user.mapper.UserMapper;
import com.peter.klockapp.features.user.model.User;
import com.peter.klockapp.features.user.repo.UserRepo;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.peter.klockapp.features.user.specification.UserSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class UserService {

    private final UserRepo userRepo;
    private final UserMapper userMapper;
    private final OtpService otpService;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenRepo refreshTokenRepo;
    private final UserSpecification userSpecification;
    private final EmailVerificationTokenRepo emailVerificationTokenRepo;
    private final PasswordResetTokenRepo passwordResetTokenRepo;
    private final ApplicationEventPublisher eventPublisher;
    private final CloudinaryService cloudinaryService;
    private final BranchRepo branchRepo;

    @Transactional(readOnly = true)
    public User fetchCurrentUser(CustomUserPrincipal principal){
        return userRepo.findByIdAndOrganizationIdAndDeletedAtIsNull(principal.id(), principal.orgId())
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    public UserResponse create(AdminCreateUserRequest request, CustomUserPrincipal principal){
        if (userRepo.existsByEmail(request.email())) {
            throw new AlreadyExistException("Email already registered");
        }

        if ((UserRole.ADMIN.equals(request.userRole())
                || UserRole.SUPER_ADMIN.equals(request.userRole()))
                && request.phone() == null) {
            throw new IllegalStateException("Admins and Super Admins must have phone entered");
        }

        User currentUser = fetchCurrentUser(principal);
        Organization organization = currentUser.getOrganization();
        Branch branch = branchRepo.findByOrganizationIdAndIdAndDeletedAtIsNull(organization.getId(), request.branchId())
                .orElseThrow(() -> new NotFoundException("Branch not found"));

        User newUser = userMapper.toEntity(request);
        newUser.setPassword(passwordEncoder.encode(request.firstName().toLowerCase() + "@123"));
        newUser.setOrganization(organization);
        newUser.setBranch(branch);

        eventPublisher.publishEvent(new AuditRequest(currentUser, AuditAction.USER_CREATED,
                Map.of("message", "New user created")));

        return userMapper.toDto(userRepo.save(newUser));
    }

    @Transactional(readOnly = true)
    public UserDetailedResponse findById(CustomUserPrincipal principal, UUID id){
        User user = userRepo.findByIdAndOrganizationIdAndDeletedAtIsNull(id, principal.orgId())
                .orElseThrow(() -> new NotFoundException("User not found"));
        return userMapper.toDetailedDto(user);
    }

    @Transactional(readOnly = true)
    public UserDetailedResponse getCurrentUser(CustomUserPrincipal principal){
        return userMapper.toDetailedDto(fetchCurrentUser(principal));
    }

    @Transactional(readOnly = true)
    public PageResponse<UserResponse> findAll(Pageable pageable, UserFilter userFilter, CustomUserPrincipal principal){
        User currentUser = fetchCurrentUser(principal);

        UserRole role = currentUser.getUserRole();

        switch (role){
            case ADMIN -> {
                userFilter.setBranchId(currentUser.getBranch().getId());
                userFilter.setOrgId(currentUser.getOrganization().getId());
            }

            case SUPER_ADMIN -> {
                userFilter.setOrgId(currentUser.getOrganization().getId());
            }
        }

        Page<User> userPage = userRepo.findAll(userSpecification.withFilter(userFilter), pageable);
        return PageResponse.from(userPage.map(userMapper::toDto));
    }

    public UserResponse update(UserUpdateRequest request, UUID userId, CustomUserPrincipal principal){
        User user = userRepo.findByIdAndOrganizationIdAndDeletedAtIsNull(userId, principal.orgId())
                .orElseThrow(() -> new NotFoundException("User not found"));

        boolean isAdminOrSuperAdmin = UserRole.ADMIN.equals(request.userRole())
                || UserRole.SUPER_ADMIN.equals(request.userRole());

        if (isAdminOrSuperAdmin && (request.phone() == null)) {
            throw new IllegalStateException("Admins and Super Admins must have phone not null");
        }

        if (UserRole.ADMIN.equals(request.userRole()) && request.branchId() == null) {
            throw new IllegalStateException("Admins must be assigned a branch");
        }

        if (request.branchId() != null){
            Branch branch = branchRepo.findByOrganizationIdAndIdAndDeletedAtIsNull(
                    user.getOrganization().getId(), request.branchId())
                    .orElseThrow(() -> new NotFoundException("Branch not found"));

            user.setBranch(branch);
        }

        List<String> roles = principal.authorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        boolean isAdmin = roles.contains("ROLE_ADMIN");
        boolean isChangingBranchOrRole = request.branchId() != null || request.userRole() != null;

        if (isAdmin && isChangingBranchOrRole) {
            throw new IllegalStateException("Admins cannot change user role or branch");
        }

        userMapper.updateEntityFromRequest(request, user);
        return userMapper.toDto(user);
    }

    public void delete(CustomUserPrincipal principal, UUID userId){
        userRepo.deleteByIdAndOrganizationId(
                userId, principal.orgId());
    }

    public User syncUser(GoogleIdToken.Payload payload){
        User existingUser =  userRepo.findByEmail(payload.getEmail()).orElseGet(() -> {
            User user = userMapper.toEntityFromGoogle(payload);

            eventPublisher.publishEvent(new AuditRequest(user, AuditAction.REGISTER,
                    Map.of("message", "User created account with Google login")));

            return userRepo.save(user);
        });

        if (existingUser.getFirstName() == null){
            existingUser.setFirstName(payload.get("given_name").toString());
            existingUser.setLastName(payload.get("family_name").toString());
            existingUser.setPicture(payload.get("picture").toString());
            existingUser.setEmailVerified(true);

            String provider = existingUser.getProvider();

            if (provider == null) {
                existingUser.setProvider("GOOGLE");
            } else if (!provider.contains("GOOGLE")) {
                existingUser.setProvider(provider + ",GOOGLE");
            }

            userRepo.save(existingUser);
        }

        eventPublisher.publishEvent(new AuditRequest(existingUser, AuditAction.LOGIN,
                Map.of("message", "Google login success")));

        return existingUser;
    }

    @Transactional(readOnly = true)
    public void createDeletionRequest(CustomUserPrincipal principal) {
        User currentUser = fetchCurrentUser(principal);

        String code = otpService.generateOtp(currentUser.getEmail());
        emailService.sendAccountDeletionCode(currentUser, code);
    }

    public void confirmDeletionRequest(CustomUserPrincipal principal, AccountDeletionRequest request) {
        User currentUser = fetchCurrentUser(principal);

        if (currentUser.getPassword() != null) {
            if (!passwordEncoder.matches(request.password(), currentUser.getPassword())) {
                throw new BadCredentialsException("Invalid password provided for account deletion.");
            }
        }

        if (!otpService.validateOtp(currentUser.getEmail(), request.otp()
                .replaceAll("\\s+", ""))) {
            throw new ValidationException("Invalid or expired deletion code.");
        }

        currentUser.setDeletedAt(Instant.now());
        refreshTokenRepo.deleteById(currentUser.getId());
        passwordResetTokenRepo.deleteById(currentUser.getId());
        emailVerificationTokenRepo.deleteById(currentUser.getId());
        userRepo.save(currentUser);

        eventPublisher.publishEvent(new AuditRequest(currentUser, AuditAction.ACCOUNT_SOFT_DELETED,
                Map.of("message", "User has been soft deleted")));
    }

    public void updateDeviceId(UserDeviceIdRequest request, CustomUserPrincipal principal){
        User user = fetchCurrentUser(principal);

        user.setDeviceId(request.deviceId());
        user.setHasSetDevice(true);
    }

    public void resetDeviceIdToDefault(UUID userId, CustomUserPrincipal principal){
        User user = userRepo.findByIdAndOrganizationIdAndDeletedAtIsNull(userId, principal.orgId())
                .orElseThrow(() -> new NotFoundException("User not found"));

        user.setDeviceId("NOT SET");
        user.setHasSetDevice(false);
    }

    public void updateUserAvatar(UserUpdateAvatarRequest request){
        User user = userRepo.findByIdAndOrganizationIdAndDeletedAtIsNull(request.userId(), request.orgId())
                .orElseThrow(() -> new NotFoundException("User not found"));

        user.setPicture(request.secureId());
        user.setPictureId(request.publicId());
    }

    public void deleteUserAvatar(CustomUserPrincipal principal) throws IOException {
        User user = fetchCurrentUser(principal);

        if (user.getPictureId() != null){
            cloudinaryService.deletePhotoFromCloud(user.getPictureId());
        }

        user.setPicture(null);
        user.setPictureId(null);
    }

    public void changePasswordOnLogin(UserChangePassword request, CustomUserPrincipal principal){
        User user = fetchCurrentUser(principal);

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        user.setMustChangePassword(false);
    }
}
