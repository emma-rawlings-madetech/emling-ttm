package com.emling.ttm

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.rest.core.annotation.HandleAfterCreate
import org.springframework.data.rest.core.annotation.HandleAfterDelete
import org.springframework.data.rest.core.annotation.HandleAfterSave
import org.springframework.data.rest.core.annotation.RepositoryEventHandler
import org.springframework.hateoas.server.EntityLinks
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Component


@Component
@RepositoryEventHandler(TabletopSystem::class)
class EventHandler constructor(
    @Autowired
    private val websocket: SimpMessagingTemplate,
    @Autowired
    private val entityLinks: EntityLinks
) {
    @HandleAfterCreate
    fun newTabletopSystem(tabletopSystem: TabletopSystem) {
        websocket.convertAndSend(
            "$MESSAGE_PREFIX/newTabletopSystem", getPath(tabletopSystem)!!
        )
    }

    @HandleAfterDelete
    fun deleteTabletopSystem(tabletopSystem: TabletopSystem) {
        websocket.convertAndSend(
            "$MESSAGE_PREFIX/deleteTabletopSystem", getPath(tabletopSystem)!!
        )
    }

    @HandleAfterSave
    fun updateTabletopSystem(tabletopSystem: TabletopSystem) {
        websocket.convertAndSend(
            "$MESSAGE_PREFIX/updateTabletopSystem", getPath(tabletopSystem)!!
        )
    }

    /**
     * Take an [TabletopSystem] and get the URI using Spring Data REST's [EntityLinks].
     *
     * @param tabletopSystem
     */
    private fun getPath(tabletopSystem: TabletopSystem): String? {
        return entityLinks.linkForItemResource(
            tabletopSystem.javaClass,
            tabletopSystem.getId()!!
        ).toUri().path
    }
}