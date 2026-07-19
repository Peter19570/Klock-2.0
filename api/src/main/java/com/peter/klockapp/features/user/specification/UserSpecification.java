package com.peter.klockapp.features.user.specification;

import com.peter.klockapp.features.user.filters.UserFilter;
import com.peter.klockapp.features.user.model.User;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@Service
public class UserSpecification {

    public Specification<User> withFilter(UserFilter userFilter){

        Specification<User> spec = Specification.allOf();

        if (userFilter.getEmail() != null){
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.equal(root.get("email"), userFilter.getEmail()));
        }

        if (userFilter.getName() != null) {
            String searchTerm = "%" + userFilter.getName().toLowerCase() + "%";

            spec = spec.and((root, query, cb) ->
                    cb.like(
                            cb.concat(
                                    cb.concat(cb.lower(cb.coalesce(root.get("firstName"), "")), " "),
                                    cb.lower(cb.coalesce(root.get("lastName"), ""))
                            ),
                            searchTerm
                    )
            );
        }

        if (userFilter.getUserRole() != null){
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.equal(root.get("userRole"), userFilter.getUserRole()));
        }

        if (userFilter.getBranchId() != null){
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.equal(root.get("branch").get("id"), userFilter.getBranchId()));
        }

        if (userFilter.getPhone() != null){
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.like(root.get("phone"), "%" + userFilter.getPhone() + "%"));
        }

        if (userFilter.getOrgId() != null){
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.equal(root.get("organization").get("id"), userFilter.getOrgId()));
        }

        if (userFilter.getMinCreatedAt() != null) {
            spec = spec.and((root, query, cb) ->
                    cb.greaterThanOrEqualTo(root.get("createdAt"), userFilter.getMinCreatedAt())
            );
        }

        if (userFilter.getMaxCreatedAt() != null) {
            spec = spec.and((root, query, cb) ->
                    cb.lessThanOrEqualTo(root.get("createdAt"), userFilter.getMaxCreatedAt())
            );
        }

        return spec;
    }
}
