package com.peter.klockapp.features.shared.dto;

import com.peter.klockapp.features.user.model.User;
import org.jspecify.annotations.NonNull;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

public record CustomUserPrincipal(User user) implements UserDetails {
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singleton(
                new SimpleGrantedAuthority("ROLE_" + user.getUserRole().name())
        );
    }

    @Override
    public @NonNull String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        return user.getEmail();
    }
}
