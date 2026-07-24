package com.peter.klockapp.features.auth.config.security;

import com.peter.klockapp.features.auth.config.jwt.JwtFilter;
import com.peter.klockapp.features.auth.constants.CorsConstants;
import com.peter.klockapp.features.auth.constants.SecurityConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(
            HttpSecurity httpSecurity,
            @Qualifier("corsConfigurationSource") CorsConfigurationSource configurationSource) throws Exception{
        return httpSecurity
                .cors(cors -> cors.configurationSource(configurationSource))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, CorsConstants.PATTERN).permitAll()
                        .requestMatchers(SecurityConstants.PUBLIC_URLS).permitAll()
                        .requestMatchers(SecurityConstants.SWAGGER_URLS).permitAll()
                        .requestMatchers(SecurityConstants.WEBHOOK_URLS).permitAll()
                        .requestMatchers(SecurityConstants.WEBSOCKET_URLS).permitAll()
                        .anyRequest().authenticated())
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration) throws Exception{
        return configuration.getAuthenticationManager();
    }
}

