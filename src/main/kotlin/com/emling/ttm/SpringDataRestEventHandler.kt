package com.emling.ttm

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.rest.core.annotation.HandleBeforeCreate
import org.springframework.data.rest.core.annotation.HandleBeforeSave
import org.springframework.data.rest.core.annotation.RepositoryEventHandler
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component


@Component
@RepositoryEventHandler(TabletopSystem::class)
class SpringDataRestEventHandler constructor(
    @Autowired
    private val userRepository: UserRepository
) {
    @HandleBeforeCreate
    @HandleBeforeSave
    fun applyUserInformationUsingSecurityContext(tabletopSystem: TabletopSystem) {
        val name = SecurityContextHolder.getContext().authentication.name
        var author: User? = this.userRepository.findByName(name)
        // TODO author allowed null for demo purposes only
        if (author == null) {
            val newAuthor = User()
            newAuthor.setName(name)
            newAuthor.setRoles(arrayOf("ROLE_AUTHOR"))
            author = this.userRepository.save(newAuthor)!!
        }
        tabletopSystem.setAuthor(author)
    }
}