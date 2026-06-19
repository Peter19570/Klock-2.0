package com.peter.klockapp.features.branch.specification;

import com.peter.klockapp.features.branch.filters.BranchFilter;
import com.peter.klockapp.features.branch.model.Branch;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@Service
public class BranchSpecification {

    public Specification<Branch> withFilter(BranchFilter branchFilter){

        Specification<Branch> spec = Specification.allOf();

        if (branchFilter.getDisplayName() != null){
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("displayName")),
                            "%" + branchFilter.getDisplayName().toLowerCase() + "%"));
        }

        if (branchFilter.getBranchStatus() != null){
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.equal(root.get("branchStatus"), branchFilter.getBranchStatus()));
        }

        if (branchFilter.getUserOrgId() != null){
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.equal(root.get("organization").get("id"), branchFilter.getUserOrgId()));
        }

        return spec;
    }
}
