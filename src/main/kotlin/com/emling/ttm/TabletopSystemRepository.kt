package com.emling.ttm

import org.springframework.data.repository.PagingAndSortingRepository
import org.springframework.data.repository.query.Param
import org.springframework.security.access.prepost.PreAuthorize

// TODO only authors can see systems right now - should be anyone can see public systems, only system's author can see their own private systems
@PreAuthorize("hasRole('ROLE_AUTHOR')")
interface TabletopSystemRepository : PagingAndSortingRepository<TabletopSystem, Long> {
    @PreAuthorize("#tabletopSystem?.author == null or #tabletopSystem?.author?.name == authentication?.name")
    override fun <S : TabletopSystem> save(@Param("tabletopSystem") entity: S): S

    @PreAuthorize("@tabletopSystemRepository.findById(#id)?.author?.name == authentication?.name")
    override fun deleteById(@Param("id") id: Long)

    @PreAuthorize("#tabletopSystem?.author?.name == authentication?.name")
    override fun delete(@Param("tabletopSystem") entity: TabletopSystem)
}