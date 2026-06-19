package com.peter.klockapp.features.organization.repo;

import com.peter.klockapp.features.organization.model.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface OrganizationRepo extends JpaRepository<Organization, UUID> {
}
