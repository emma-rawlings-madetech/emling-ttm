package com.emling.ttm

import org.springframework.data.repository.Repository
import org.springframework.data.rest.core.annotation.RepositoryRestResource

// Ensure user repository is not exposed to REST; for security.
@RepositoryRestResource(exported = false)
interface  UserRepository : Repository<User, Long> {
    fun save(user: User?): User?
    fun findByName(name: String?): User?
}