package com.peter.klockapp.features.shared.dto;

import com.peter.klockapp.features.user.model.User;
import org.jspecify.annotations.Nullable;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public record CustomUserPrincipal(
        UUID id,
        UUID orgId,
        String email,
        String password,
        Collection<? extends GrantedAuthority> authorities

) implements UserDetails{

    public CustomUserPrincipal(User user){
        this(
                user.getId(),
                user.getOrganization().getId(),
                user.getEmail(),
                user.getPassword(),
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getUserRole().name()))
        );
    }

    public CustomUserPrincipal(
            UUID id,
            UUID orgId,
            String email,
            Collection<? extends GrantedAuthority> authorities) {
        this(id, orgId, email, null, authorities);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return this.authorities;
    }

    @Override
    public @Nullable String getPassword() {
        return this.password;
    }

    @Override
    public String getUsername() {
        return this.email;
    }
}
