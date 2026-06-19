package com.peter.klockapp.features.session.specification;

import com.peter.klockapp.features.session.filters.SessionFilter;
import com.peter.klockapp.features.session.model.Session;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@Service
public class SessionSpecification {

    public Specification<Session> withFilter(SessionFilter sessionFilter){

        Specification<Session> spec = Specification.allOf();

        if (sessionFilter.getMinWorkDate() != null) {
            spec = spec.and((root, query, cb) ->
                    cb.greaterThanOrEqualTo(root.get("workDate"), sessionFilter.getMinWorkDate())
            );
        }

        if (sessionFilter.getMaxWorkDate() != null) {
            spec = spec.and((root, query, cb) ->
                    cb.lessThanOrEqualTo(root.get("workDate"), sessionFilter.getMaxWorkDate())
            );
        }

        if (sessionFilter.getArrivalStatus() != null){
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.equal(root.get("arrivalStatus"), sessionFilter.getArrivalStatus()));
        }

        if (sessionFilter.getStatus() != null){
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.equal(root.get("status"), sessionFilter.getStatus()));
        }

        if (sessionFilter.getUserId() != null){
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.equal(root.get("user").get("id"), sessionFilter.getUserId()));
        }

        if (sessionFilter.getBranchId() != null){
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.equal(root.get("user").get("branch").get("id"), sessionFilter.getBranchId()));
        }

        if (sessionFilter.getOrganizationId() != null){
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.equal(root.get("user").get("organization")
                            .get("id"), sessionFilter.getOrganizationId()));
        }

        if (sessionFilter.getSessionUser() != null) {
            String searchTerm = "%" + sessionFilter.getSessionUser().toLowerCase() + "%";

            spec = spec.and((root, query, cb) ->
                    cb.like(
                            cb.concat(
                                    cb.concat(cb.lower(cb.coalesce(root.get("user").get("firstName"), "")), " "),
                                    cb.lower(cb.coalesce(root.get("user").get("lastName"), ""))
                            ),
                            searchTerm
                    )
            );
        }

        return spec;
    }
}
