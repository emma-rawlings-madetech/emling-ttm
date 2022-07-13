package com.emling.ttm

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.CommandLineRunner
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.AuthorityUtils
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component


@Component
class DatabaseLoader(
    @Autowired
    private val systemRepository: TabletopSystemRepository,
    @Autowired
    private val userRepository: UserRepository
) : CommandLineRunner {
    override fun run(vararg args: String?) {
        val greg: User = this.userRepository.save(User("greg", "turnquist", arrayOf("ROLE_AUTHOR")))!!
        val oliver: User = this.userRepository.save(User("oliver", "gierke", arrayOf("ROLE_AUTHOR")))!!

        SecurityContextHolder.getContext().authentication = UsernamePasswordAuthenticationToken(
            "greg", "doesn't matter",
            AuthorityUtils.createAuthorityList("ROLE_AUTHOR")
        )

        systemRepository.save(TabletopSystem("Demo Fantasy System", "Demo Fantasy System (desc)", greg))
        systemRepository.save(TabletopSystem("Demo SciFi System", "Demo SciFi System (desc)", greg))
        systemRepository.save(TabletopSystem("Demo GrimDark System", "Demo GrimDark System (desc)", greg))

        SecurityContextHolder.getContext().authentication = UsernamePasswordAuthenticationToken(
            "oliver", "doesn't matter",
            AuthorityUtils.createAuthorityList("ROLE_AUTHOR")
        )

        systemRepository.save(TabletopSystem("Demo Cyberpunk System", "Demo Cyberpunk System (desc)", oliver))
        systemRepository.save(TabletopSystem("Demo Low-Fantasy System", "Demo Low-Fantasy System (desc)", oliver))

        SecurityContextHolder.clearContext()
    }
}